import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatRupiah, calculateKloterMetrics } from './calculations';

/**
 * Format date to YYYY-MM-DD
 */
const getTodayDateStr = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

/**
 * EXPORT MANAJEMEN KLOTER (EXCEL)
 * @param {Array} kloters - Array of kloter objects
 * @param {string} targetId - 'all' or specific kloter ID
 * @param {number} activeHargaPerOns - snapshot active price
 */
export function exportKloterToExcel(kloters, targetId = 'all', activeHargaPerOns = 7500) {
  const wb = XLSX.utils.book_new();
  const selectedKloters = targetId === 'all'
    ? kloters
    : kloters.filter((k) => k.id === targetId);

  if (selectedKloters.length === 0) {
    alert('Tidak ada data kloter untuk di-export!');
    return;
  }

  // SHEET 1: REKAPITULASI RINGKASAN KLOTER
  const rekapRows = selectedKloters.map((k, index) => {
    const calc = calculateKloterMetrics(k, activeHargaPerOns);
    return {
      'No': index + 1,
      'ID Kloter': k.id,
      'Nama Kloter': k.namaKloter,
      'Kandang': k.kandang,
      'Status': k.status,
      'Tgl Beli DOC': k.tanggalBeliDoc,
      'DOC Awal (Ekor)': k.docAwal,
      'Harga DOC/Ekor (Rp)': k.hargaDocPerEkor,
      'Total Modal DOC (Rp)': calc.modalDoc,
      'Total Kematian (Ekor)': calc.totalKematian,
      'Ayam Hidup (Ekor)': calc.sisaAyamHidup,
      'Mortilitas (%)': `${calc.mortalityRate.toFixed(2)}%`,
      'Total Pakan (Kg)': calc.totalPakanKg,
      'Ayam Terpanen (Ekor)': calc.totalEkorDipanen,
      'Total Biaya Pengeluaran (Rp)': calc.totalPengeluaran,
      'Total Pendapatan Penjualan (Rp)': calc.totalPemasukan,
      'Estimasi / Real Laba Rugi (Rp)': calc.netProfit,
    };
  });

  const wsRekap = XLSX.utils.json_to_sheet(rekapRows);
  XLSX.utils.book_append_sheet(wb, wsRekap, 'Rekapitulasi Kloter');

  // SHEET 2: DETAIL TRANSAKSI PENGELUARAN
  const pengeluaranRows = [];
  selectedKloters.forEach((k) => {
    (k.pengeluaranList || []).forEach((exp) => {
      pengeluaranRows.push({
        'ID Kloter': k.id,
        'Nama Kloter': k.namaKloter,
        'ID Transaksi': exp.id,
        'Tanggal': exp.tanggal,
        'Kategori': exp.kategori,
        'Keterangan Rincian': exp.keterangan,
        'Jumlah Pakan (Kg)': exp.jumlahKg || 0,
        'Biaya (Rp)': exp.jumlahRp,
        'Dicatat Oleh': exp.dicatatOleh || '-',
      });
    });
  });
  if (pengeluaranRows.length > 0) {
    const wsExp = XLSX.utils.json_to_sheet(pengeluaranRows);
    XLSX.utils.book_append_sheet(wb, wsExp, 'Rincian Pengeluaran');
  }

  // SHEET 3: DETAIL KEMATIAN
  const kematianRows = [];
  selectedKloters.forEach((k) => {
    (k.kematianList || []).forEach((dth) => {
      kematianRows.push({
        'ID Kloter': k.id,
        'Nama Kloter': k.namaKloter,
        'ID Catatan': dth.id,
        'Tanggal': dth.tanggal,
        'Jumlah Ekor Mati': dth.jumlahEkor,
        'Penyebab / Indikasi': dth.penyebab,
        'Dicatat Oleh': dth.dicatatOleh || '-',
      });
    });
  });
  if (kematianRows.length > 0) {
    const wsDth = XLSX.utils.json_to_sheet(kematianRows);
    XLSX.utils.book_append_sheet(wb, wsDth, 'Catatan Kematian');
  }

  // SHEET 4: DETAIL PANEN
  const panenRows = [];
  selectedKloters.forEach((k) => {
    (k.panenList || []).forEach((hv) => {
      panenRows.push({
        'ID Kloter': k.id,
        'Nama Kloter': k.namaKloter,
        'ID Panen': hv.id,
        'Tanggal Panen': hv.tanggal,
        'Jumlah Ekor Panen': hv.jumlahEkor,
        'Catatan Operasional': hv.catatan || '-',
        'Dicatat Oleh': hv.dicatatOleh || '-',
      });
    });
  });
  if (panenRows.length > 0) {
    const wsPanen = XLSX.utils.json_to_sheet(panenRows);
    XLSX.utils.book_append_sheet(wb, wsPanen, 'Catatan Panen');
  }

  // SHEET 5: DETAIL PENJUALAN
  const penjualanRows = [];
  selectedKloters.forEach((k) => {
    (k.penjualanList || []).forEach((sl) => {
      penjualanRows.push({
        'ID Kloter': k.id,
        'Nama Kloter': k.namaKloter,
        'ID Penjualan': sl.id,
        'Tanggal': sl.tanggal,
        'Pembeli': sl.pembeli,
        'Berat (Gram)': sl.beratGram,
        'Berat (Kg)': (sl.beratGram / 1000).toFixed(2),
        'Berat (Ons)': (sl.beratGram / 100).toFixed(1),
        'Harga / Ons (Rp)': sl.hargaPerOnsSnapshot,
        'Total Pendapatan (Rp)': sl.totalHarga,
        'Metode Pembayaran': sl.metodePembayaran,
        'Catatan Nota': sl.catatanNota || '-',
        'Dicatat Oleh': sl.dicatatOleh || '-',
      });
    });
  });
  if (penjualanRows.length > 0) {
    const wsSl = XLSX.utils.json_to_sheet(penjualanRows);
    XLSX.utils.book_append_sheet(wb, wsSl, 'Detail Penjualan');
  }

  const fileName = targetId === 'all'
    ? `Laporan_Lengkap_Semua_Kloter_${getTodayDateStr()}.xlsx`
    : `Laporan_Kloter_${targetId}_${getTodayDateStr()}.xlsx`;

  XLSX.writeFile(wb, fileName);
}

/**
 * EXPORT MANAJEMEN KLOTER (PDF)
 * @param {Array} kloters - Array of kloter objects
 * @param {string} targetId - 'all' or specific kloter ID
 * @param {number} activeHargaPerOns - snapshot active price
 */
export function exportKloterToPDF(kloters, targetId = 'all', activeHargaPerOns = 7500) {
  const selectedKloters = targetId === 'all'
    ? kloters
    : kloters.filter((k) => k.id === targetId);

  if (selectedKloters.length === 0) {
    alert('Tidak ada data kloter untuk di-export!');
    return;
  }

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('LAPORAN MANAJEMEN KLOTER AYAM BROILER', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // slate-600
  const targetLabel = targetId === 'all' ? 'Semua Kloter Broiler' : `Kloter ID: ${targetId}`;
  doc.text(`Cakupan Data: ${targetLabel} | Tanggal Cetak: ${getTodayDateStr()}`, 14, 21);

  let currentY = 26;

  selectedKloters.forEach((k, idx) => {
    const calc = calculateKloterMetrics(k, activeHargaPerOns);

    if (idx > 0 && currentY > 150) {
      doc.addPage();
      currentY = 15;
    }

    // Kloter Banner
    doc.setFillColor(240, 249, 255); // sky-50
    doc.setDrawColor(186, 230, 253); // sky-200
    doc.rect(14, currentY, 269, 14, 'FD');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(3, 105, 161); // sky-700
    doc.text(`${k.namaKloter} (${k.id})`, 18, currentY + 6);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    doc.text(`Status: ${k.status} | Kandang: ${k.kandang} | Tgl DOC: ${k.tanggalBeliDoc}`, 18, currentY + 11);

    currentY += 17;

    // Summary Table
    const summaryData = [
      [
        `DOC Awal: ${k.docAwal.toLocaleString()} ekor`,
        `Harga DOC: ${formatRupiah(k.hargaDocPerEkor)}/ekor`,
        `Modal DOC: ${formatRupiah(calc.modalDoc)}`,
        `Kematian: ${calc.totalKematian} ekor (${calc.mortalityRate.toFixed(2)}%)`,
      ],
      [
        `Sisa Ayam: ${calc.sisaAyamHidup.toLocaleString()} ekor`,
        `Total Pakan: ${calc.totalPakanKg.toLocaleString()} kg`,
        `Ayam Panen: ${calc.totalEkorDipanen.toLocaleString()} ekor`,
        `Total Pengeluaran: ${formatRupiah(calc.totalPengeluaran)}`,
      ],
      [
        `Pendapatan Penjualan: ${formatRupiah(calc.totalPemasukan)}`,
        `Net Laba/Rugi: ${formatRupiah(calc.netProfit)}`,
        `Catatan: ${k.catatanAwal ? k.catatanAwal.slice(0, 40) + '...' : '-'}`,
        '',
      ],
    ];

    autoTable(doc, {
      startY: currentY,
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, textColor: [30, 41, 59] },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { fontStyle: 'bold' },
        2: { fontStyle: 'bold' },
        3: { fontStyle: 'bold' },
      },
      margin: { left: 14, right: 14 },
    });

    currentY = doc.lastAutoTable.finalY + 4;

    // Sub-table: Penjualan & Pengeluaran brief
    if (k.penjualanList && k.penjualanList.length > 0) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text('Rincian Transaksi Penjualan:', 14, currentY);

      currentY += 3;

      const salesBody = k.penjualanList.map((sl) => [
        sl.id,
        sl.tanggal,
        sl.pembeli,
        `${(sl.beratGram / 1000).toFixed(2)} kg (${(sl.beratGram / 100).toFixed(1)} ons)`,
        `${formatRupiah(sl.hargaPerOnsSnapshot)}/ons`,
        formatRupiah(sl.totalHarga),
        sl.metodePembayaran,
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['ID', 'Tanggal', 'Pembeli', 'Berat (Kg/Ons)', 'Harga/Ons', 'Total Harga', 'Metode Pembayaran']],
        body: salesBody,
        theme: 'striped',
HeadStyles: { fillColor: [14, 116, 144], fontSize: 8 }, // cyan-700
        styles: { fontSize: 8, cellPadding: 1.5 },
        margin: { left: 14, right: 14 },
      });

      currentY = doc.lastAutoTable.finalY + 6;
    }
  });

  const fileName = targetId === 'all'
    ? `Laporan_Lengkap_Semua_Kloter_${getTodayDateStr()}.pdf`
    : `Laporan_Kloter_${targetId}_${getTodayDateStr()}.pdf`;

  doc.save(fileName);
}

/**
 * EXPORT DATA PENJUALAN (EXCEL)
 * Exports ALL sales records across all kloters
 * @param {Array} kloters - Array of kloter objects
 */
export function exportPenjualanToExcel(kloters) {
  const wb = XLSX.utils.book_new();

  const allSales = [];
  kloters.forEach((k) => {
    (k.penjualanList || []).forEach((sl) => {
      allSales.push({
        id: sl.id,
        tanggal: sl.tanggal,
        kloterId: k.id,
        namaKloter: k.namaKloter,
        pembeli: sl.pembeli,
        beratGram: sl.beratGram,
        beratKg: Number((sl.beratGram / 1000).toFixed(2)),
        beratOns: Number((sl.beratGram / 100).toFixed(1)),
        hargaPerOnsSnapshot: sl.hargaPerOnsSnapshot,
        totalHarga: sl.totalHarga,
        metodePembayaran: sl.metodePembayaran,
        catatanNota: sl.catatanNota || '-',
        dicatatOleh: sl.dicatatOleh || '-',
      });
    });
  });

  if (allSales.length === 0) {
    alert('Belum ada data transaksi penjualan untuk di-export!');
    return;
  }

  // Sort by date descending
  allSales.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  const totalOmset = allSales.reduce((acc, curr) => acc + (curr.totalHarga || 0), 0);
  const totalBeratGram = allSales.reduce((acc, curr) => acc + (curr.beratGram || 0), 0);

  const excelRows = allSales.map((item, idx) => ({
    'No': idx + 1,
    'ID Transaksi': item.id,
    'Tanggal Transaksi': item.tanggal,
    'ID Kloter': item.kloterId,
    'Nama Kloter': item.namaKloter,
    'Nama Pembeli / Customer': item.pembeli,
    'Total Berat (Gram)': item.beratGram,
    'Total Berat (Kg)': item.beratKg,
    'Total Berat (Ons)': item.beratOns,
    'Harga Snapshot / Ons (Rp)': item.hargaPerOnsSnapshot,
    'Total Pendapatan (Rp)': item.totalHarga,
    'Metode Pembayaran': item.metodePembayaran,
    'Catatan Nota': item.catatanNota,
    'Petugas Catat': item.dicatatOleh,
  }));

  // Summary row
  excelRows.push({
    'No': 'TOTAL',
    'ID Transaksi': `${allSales.length} Transaksi`,
    'Tanggal Transaksi': '-',
    'ID Kloter': '-',
    'Nama Kloter': '-',
    'Nama Pembeli / Customer': '-',
    'Total Berat (Gram)': totalBeratGram,
    'Total Berat (Kg)': (totalBeratGram / 1000).toFixed(2),
    'Total Berat (Ons)': (totalBeratGram / 100).toFixed(1),
    'Harga Snapshot / Ons (Rp)': '-',
    'Total Pendapatan (Rp)': totalOmset,
    'Metode Pembayaran': '-',
    'Catatan Nota': '-',
    'Petugas Catat': '-',
  });

  const ws = XLSX.utils.json_to_sheet(excelRows);
  XLSX.utils.book_append_sheet(wb, ws, 'Data Penjualan All');

  const fileName = `Export_Data_Penjualan_Semua_${getTodayDateStr()}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * EXPORT DATA PENJUALAN (PDF)
 * Exports ALL sales records into a styled PDF document
 * @param {Array} kloters - Array of kloter objects
 */
export function exportPenjualanToPDF(kloters) {
  const allSales = [];
  kloters.forEach((k) => {
    (k.penjualanList || []).forEach((sl) => {
      allSales.push({
        id: sl.id,
        tanggal: sl.tanggal,
        kloterId: k.id,
        namaKloter: k.namaKloter,
        pembeli: sl.pembeli,
        beratGram: sl.beratGram,
        hargaPerOnsSnapshot: sl.hargaPerOnsSnapshot,
        totalHarga: sl.totalHarga,
        metodePembayaran: sl.metodePembayaran,
        catatanNota: sl.catatanNota || '-',
        dicatatOleh: sl.dicatatOleh || '-',
      });
    });
  });

  if (allSales.length === 0) {
    alert('Belum ada data transaksi penjualan untuk di-export!');
    return;
  }

  // Sort date descending
  allSales.sort((a, b) => new Date(b.tanggal) - new Date(a.tanggal));

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

  // Header Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('LAPORAN SELURUH TRANSAKSI PENJUALAN AYAM BROILER', 14, 15);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Total Transaksi: ${allSales.length} Nota | Tanggal Cetak: ${getTodayDateStr()}`, 14, 21);

  // Summary box
  const totalOmset = allSales.reduce((acc, curr) => acc + curr.totalHarga, 0);
  const totalKg = allSales.reduce((acc, curr) => acc + (curr.beratGram / 1000), 0);

  doc.setFillColor(236, 253, 245); // emerald-50
  doc.setDrawColor(167, 243, 208); // emerald-200
  doc.rect(14, 25, 269, 12, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 95, 70); // emerald-800
  doc.text(
    `TOTAL OMSET PENJUALAN: ${formatRupiah(totalOmset)}   |   TOTAL TONASE TERJUAL: ${totalKg.toFixed(2)} Kg (${(totalKg * 10).toFixed(1)} Ons)`,
    18,
    32
  );

  const tableBody = allSales.map((sl, index) => [
    index + 1,
    sl.id,
    sl.tanggal,
    sl.namaKloter,
    sl.pembeli,
    `${(sl.beratGram / 1000).toFixed(2)} kg\n(${(sl.beratGram / 100).toFixed(1)} ons)`,
    `${formatRupiah(sl.hargaPerOnsSnapshot)}`,
    formatRupiah(sl.totalHarga),
    sl.metodePembayaran,
  ]);

  autoTable(doc, {
    startY: 41,
    head: [['No', 'ID Transaksi', 'Tanggal', 'Kloter', 'Pembeli', 'Total Bobot', 'Harga / Ons', 'Total Nilai (Rp)', 'Metode']],
    body: tableBody,
    theme: 'striped',
    headStyles: { fillColor: [5, 150, 105], fontSize: 8.5, fontStyle: 'bold' }, // emerald-600
    styles: { fontSize: 8, cellPadding: 2, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 24, fontStyle: 'bold' },
      2: { cellWidth: 22 },
      3: { cellWidth: 50 },
      4: { cellWidth: 45, fontStyle: 'bold' },
      5: { cellWidth: 28 },
      6: { cellWidth: 25 },
      7: { cellWidth: 35, fontStyle: 'bold' },
      8: { cellWidth: 30 },
    },
    margin: { left: 14, right: 14 },
  });

  const fileName = `Export_Data_Penjualan_Semua_${getTodayDateStr()}.pdf`;
  doc.save(fileName);
}

/**
 * EXPORT LAPORAN BULANAN REKAP KINERJA (PDF)
 * Neat template for monthly performance report
 * @param {Array} kloters - Array of kloter objects
 * @param {number} activeHargaPerOns - snapshot active price
 */
export function exportLaporanBulananToPDF(kloters, activeHargaPerOns = 7500) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const todayStr = getTodayDateStr();

  // Calculate overall metrics
  let totalDocAwal = 0;
  let totalKematianAll = 0;
  let totalPengeluaranAll = 0;
  let totalPemasukanAll = 0;
  let totalBeratGramAll = 0;

  kloters.forEach((k) => {
    const calc = calculateKloterMetrics(k, activeHargaPerOns);
    totalDocAwal += calc.docAwal;
    totalKematianAll += calc.totalKematian;
    totalPengeluaranAll += calc.totalModal;
    totalPemasukanAll += calc.totalPemasukan;

    (k.penjualanList || []).forEach((s) => {
      totalBeratGramAll += s.beratGram || 0;
    });
  });

  const netProfitAll = totalPemasukanAll - totalPengeluaranAll;
  const mortalityRateAll = totalDocAwal > 0 ? (totalKematianAll / totalDocAwal) * 100 : 0;
  const totalKgAll = totalBeratGramAll / 1000;

  // Header Header Box
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 28, 'F');

  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('PETERNAKAN UNGGUL MANDIRI', 14, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(186, 230, 253); // sky-200
  doc.text(`LAPORAN KINERJA BULANAN & AUDIT KLOTER | Periode: ${todayStr.slice(0, 7)}`, 14, 19);

  // Executive Summary Card Boxes
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(14, 34, 182, 38, 3, 3, 'FD');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('EXECUTIVE SUMMARY & KEY PERFORMANCE INDICATOR (KPI)', 18, 42);

  // Row 1 KPI
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);

  doc.text('Total Pendapatan (Omset):', 18, 50);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(5, 150, 105); // emerald-600
  doc.text(formatRupiah(totalPemasukanAll), 18, 55);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Total Modal & Pengeluaran:', 75, 50);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 29, 72); // rose-600
  doc.text(formatRupiah(totalPengeluaranAll), 75, 55);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Net Laba / Rugi Bersih:', 140, 50);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(netProfitAll >= 0 ? 5 : 225, netProfitAll >= 0 ? 150 : 29, netProfitAll >= 0 ? 105 : 72);
  doc.text(formatRupiah(netProfitAll), 140, 55);

  // Row 2 KPI
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Total Populasi DOC:', 18, 62);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${totalDocAwal.toLocaleString()} Ekor`, 18, 67);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Rata-rata Mortality Rate:', 75, 62);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(mortalityRateAll > 2.5 ? 225 : 15, mortalityRateAll > 2.5 ? 29 : 23, mortalityRateAll > 2.5 ? 72 : 42);
  doc.text(`${mortalityRateAll.toFixed(2)} %`, 75, 67);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Total Tonase Penjualan:', 140, 62);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${totalKgAll.toFixed(2)} Kg (${(totalKgAll * 10).toFixed(1)} Ons)`, 140, 67);

  // Section Table per Kloter
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Rincian Perbandingan Performa Per Kloter:', 14, 80);

  const kloterBody = kloters.map((k, i) => {
    const calc = calculateKloterMetrics(k, activeHargaPerOns);
    return [
      i + 1,
      k.id,
      k.namaKloter,
      k.status,
      `${calc.docAwal.toLocaleString()} ekor`,
      `${calc.totalKematian} ekor`,
      `${calc.mortalityRate.toFixed(2)}%`,
      formatRupiah(calc.totalModal),
      formatRupiah(calc.totalPemasukan),
      formatRupiah(calc.netProfit),
    ];
  });

  autoTable(doc, {
    startY: 84,
    head: [['No', 'ID', 'Nama Kloter', 'Status', 'DOC Awal', 'Mati', 'Mortality', 'Total Modal', 'Omset', 'Net Profit']],
    body: kloterBody,
    theme: 'striped',
    headStyles: { fillColor: [3, 105, 161], fontSize: 8, fontStyle: 'bold' }, // sky-700
    styles: { fontSize: 7.5, cellPadding: 2, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 8 },
      1: { cellWidth: 20, fontStyle: 'bold' },
      2: { cellWidth: 45 },
      3: { cellWidth: 18 },
      4: { cellWidth: 20 },
      5: { cellWidth: 15 },
      6: { cellWidth: 16 },
      7: { cellWidth: 24 },
      8: { cellWidth: 24 },
      9: { cellWidth: 25, fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  const finalY = doc.lastAutoTable.finalY + 10;

  // Catatan Audit & Approval Footer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Pengesahan Laporan Bulanan:', 14, finalY);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Laporan ini dihasilkan secara otomatis oleh Sistem Pendataan Ayam Berbasis Kloter.', 14, finalY + 5);

  const signY = finalY + 15;
  doc.text('Dibuat Oleh,', 25, signY);
  doc.text('Disetujui Oleh,', 140, signY);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('( Admin Operasional )', 20, signY + 20);
  doc.text('( Super Admin / Owner )', 135, signY + 20);

  const fileName = `Laporan_Bulanan_Bulanan_${todayStr.slice(0, 7)}.pdf`;
  doc.save(fileName);
}

