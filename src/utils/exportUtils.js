import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatRupiah, formatNumber, calculateKloterMetrics, angkaKeTerbilang } from './calculations';

/**
 * Format date to YYYY-MM-DD
 */
const getTodayDateStr = () => {
  const d = new Date();
  return d.toISOString().split('T')[0];
};

const formatWorksheet = (worksheet, widths) => {
  worksheet['!cols'] = widths.map((wch) => ({ wch }));
  worksheet['!autofilter'] = {
    ref: worksheet['!ref'],
  };
};

const applyNumberFormats = (worksheet, formats) => {
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  const columns = {};
  for (let col = range.s.c; col <= range.e.c; col += 1) {
    const headerCell = worksheet[XLSX.utils.encode_cell({ r: range.s.r, c: col })];
    if (headerCell?.v) columns[headerCell.v] = col;
  }
  Object.entries(formats).forEach(([header, format]) => {
    const col = columns[header];
    if (col === undefined) return;
    for (let row = range.s.r + 1; row <= range.e.r; row += 1) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: row, c: col })];
      if (cell) cell.z = format;
    }
  });
};


/**
 * EXPORT MANAJEMEN KLOTER (EXCEL)
 * @param {Array} kloters - Array of kloter objects
 * @param {string} targetId - 'all' or specific kloter ID
 * @param {number} activeHargaPerOns - snapshot active price
 */
export function exportKloterToExcel(
  kloters,
  targetId = 'all',
  activeHargaPerOns = 7500,
  additionalData = {}
) {
  const wb = XLSX.utils.book_new();
  const selectedKloters = targetId === 'all'
    ? kloters
    : kloters.filter((k) => k.id === targetId);

  if (selectedKloters.length === 0) {
    alert('Tidak ada data kloter untuk di-export!');
    return;
  }

  const { users = [], auditLogs = [] } = additionalData;

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
      'Mortality (%)': calc.mortalityRate / 100,
      'Total Pakan (Kg)': calc.totalPakanKg,
      'Ayam Terpanen (Ekor)': calc.totalEkorDipanen,
      'Ayam Terjual (Ekor)': calc.totalEkorTerjual,
      'Stok Siap Dijual (Ekor)': calc.stokSiapJual,
      'Total Biaya Pengeluaran (Rp)': calc.totalPengeluaran,
      'Total Pendapatan Penjualan (Rp)': calc.totalPemasukan,
      'Estimasi / Real Laba Rugi (Rp)': calc.netProfit,
    };
  });

  const wsRekap = XLSX.utils.json_to_sheet(rekapRows);
  formatWorksheet(wsRekap, [6, 16, 30, 20, 14, 16, 16, 20, 20, 20, 20, 16, 16, 22, 22, 22, 25, 26, 26]);
  applyNumberFormats(wsRekap, {
    'DOC Awal (Ekor)': '#,##0',
    'Harga DOC/Ekor (Rp)': '"Rp" #,##0',
    'Total Modal DOC (Rp)': '"Rp" #,##0',
    'Total Kematian (Ekor)': '#,##0',
    'Ayam Hidup (Ekor)': '#,##0',
    'Mortality (%)': '0.00%',
    'Total Pakan (Kg)': '#,##0.00',
    'Ayam Terpanen (Ekor)': '#,##0',
    'Ayam Terjual (Ekor)': '#,##0',
    'Stok Siap Dijual (Ekor)': '#,##0',
    'Total Biaya Pengeluaran (Rp)': '"Rp" #,##0',
    'Total Pendapatan Penjualan (Rp)': '"Rp" #,##0',
    'Estimasi / Real Laba Rugi (Rp)': '"Rp" #,##0',
  });
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

  const wsExp = XLSX.utils.json_to_sheet(
    pengeluaranRows.length > 0
      ? pengeluaranRows
      : [
          {
            'ID Kloter': '',
            'Nama Kloter': '',
            'ID Transaksi': '',
            'Tanggal': '',
            'Kategori': '',
            'Keterangan Rincian': '',
            'Jumlah Pakan (Kg)': 0,
            'Biaya (Rp)': 0,
            'Dicatat Oleh': '',
          },
        ]
  );
  formatWorksheet(wsExp, [16, 28, 18, 14, 18, 32, 20, 18, 18]);
  applyNumberFormats(wsExp, { 'Jumlah Pakan (Kg)': '#,##0.00', 'Biaya (Rp)': '"Rp" #,##0' });
  XLSX.utils.book_append_sheet(wb, wsExp, 'Rincian Pengeluaran');

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

  const wsDth = XLSX.utils.json_to_sheet(
    kematianRows.length > 0
      ? kematianRows
      : [
          {
            'ID Kloter': '',
            'Nama Kloter': '',
            'ID Catatan': '',
            'Tanggal': '',
            'Jumlah Ekor Mati': 0,
            'Penyebab / Indikasi': '',
            'Dicatat Oleh': '',
          },
        ]
  );
  formatWorksheet(wsDth, [16, 28, 18, 14, 20, 28, 18]);
  applyNumberFormats(wsDth, { 'Jumlah Ekor Mati': '#,##0' });
  XLSX.utils.book_append_sheet(wb, wsDth, 'Catatan Kematian');

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

  const wsPanen = XLSX.utils.json_to_sheet(
    panenRows.length > 0
      ? panenRows
      : [
          {
            'ID Kloter': '',
            'Nama Kloter': '',
            'ID Panen': '',
            'Tanggal Panen': '',
            'Jumlah Ekor Panen': 0,
            'Catatan Operasional': '',
            'Dicatat Oleh': '',
          },
        ]
  );
  formatWorksheet(wsPanen, [16, 28, 16, 16, 20, 32, 18]);
  applyNumberFormats(wsPanen, { 'Jumlah Ekor Panen': '#,##0' });
  XLSX.utils.book_append_sheet(wb, wsPanen, 'Catatan Panen');

  // SHEET 5: DETAIL PENJUALAN
  const penjualanRows = [];
  selectedKloters.forEach((k) => {
    (k.penjualanList || []).forEach((sl) => {
      penjualanRows.push({
        'ID Kloter': k.id,
        'Nama Kloter': k.namaKloter,
        'ID Penjualan': sl.id,
        'No Struk / Nota': sl.noStruk || sl.id,
        'Tanggal': sl.tanggal,
        'Pembeli': sl.pembeli,
        'Ekor Terjual': sl.jumlahEkor || 1,
        'Berat (Gram)': sl.beratGram,
        'Harga / Ons (Rp)': sl.hargaPerOnsSnapshot,
        'Total Pendapatan (Rp)': sl.totalHarga,
        'Metode Pembayaran': sl.metodePembayaran,
        'Catatan Nota': sl.catatanNota || '-',
        'Dicatat Oleh': sl.dicatatOleh || '-',
      });
    });
  });

  const wsSl = XLSX.utils.json_to_sheet(
    penjualanRows.length > 0
      ? penjualanRows
      : [
          {
            'ID Kloter': '',
            'Nama Kloter': '',
            'ID Penjualan': '',
            'No Struk / Nota': '',
            'Tanggal': '',
            'Pembeli': '',
            'Ekor Terjual': 0,
            'Berat (Gram)': 0,
            'Berat (Kg)': 0,
            'Berat (Ons)': 0,
            'Harga / Ons (Rp)': 0,
            'Total Pendapatan (Rp)': 0,
            'Metode Pembayaran': '',
            'Catatan Nota': '',
            'Dicatat Oleh': '',
          },
        ]
  );
  formatWorksheet(wsSl, [16, 28, 18, 18, 14, 24, 14, 16, 14, 14, 20, 22, 26, 32, 18]);
  applyNumberFormats(wsSl, {
    'Ekor Terjual': '#,##0',
    'Berat (Gram)': '#,##0',
    'Berat (Kg)': '#,##0.00',
    'Berat (Ons)': '#,##0.0',
    'Harga / Ons (Rp)': '"Rp" #,##0',
    'Total Pendapatan (Rp)': '"Rp" #,##0',
  });
  XLSX.utils.book_append_sheet(wb, wsSl, 'Detail Penjualan');

  // SHEET 6: MASTER USER & AKUN (BACKUP RECOVERY)
  if (Array.isArray(users) && users.length > 0) {
    const userRows = users.map((u) => ({
      'ID User': u.id,
      'Nama Lengkap': u.nama,
      'Username / Email': u.username,
      'Role Level': u.role,
      'Label Role': u.labelRole || u.role,
      'Status Akun': u.status,
      'Terakhir Login': u.lastLogin || '-',
    }));
    const wsUsers = XLSX.utils.json_to_sheet(userRows);
    formatWorksheet(wsUsers, [16, 24, 30, 16, 20, 14, 22]);
    XLSX.utils.book_append_sheet(wb, wsUsers, 'Master User Akun');
  }

  // SHEET 7: LOG AUDIT AKTIVITAS SISTEM (BACKUP AUDIT)
  if (Array.isArray(auditLogs) && auditLogs.length > 0) {
    const logRows = auditLogs.map((l) => ({
      'ID Log': l.id,
      'Waktu Timestamp': l.timestamp,
      'User Pelaksana': l.user,
      'Modul': l.modul,
      'Aksi': l.aksi,
      'Deskripsi Detail': l.deskripsi,
    }));
    const wsLogs = XLSX.utils.json_to_sheet(logRows);
    formatWorksheet(wsLogs, [16, 22, 28, 20, 24, 45]);
    XLSX.utils.book_append_sheet(wb, wsLogs, 'Log Audit Sistem');
  }

  const fileName = targetId === 'all'
    ? `BACKUP_MASTER_SEMUA_KLOTER_${getTodayDateStr()}.xlsx`
    : `BACKUP_KLOTER_${targetId}_${getTodayDateStr()}.xlsx`;

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

/**
 * EXPORT STRUK PENJUALAN (PDF)
 * Generates a thermal-style receipt for a single sales transaction
 * @param {Object} penjualan - The sales transaction object
 * @param {Object} kloter - The kloter object
 */
export function exportStrukPDF(penjualan, kloter) {
  // Use a smaller thermal-receipt format: e.g., 80mm width.
  // Standard 80mm thermal paper width is about 80x200 mm.
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [80, 200] });
  let currentY = 10;
  
  // Center alignment helper
  const centerText = (text, y, size, font = 'normal') => {
    doc.setFontSize(size);
    doc.setFont('helvetica', font);
    const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const textOffset = (80 - textWidth) / 2;
    doc.text(text, textOffset, y);
  };
  
  const rightText = (text, y, size, font = 'normal') => {
    doc.setFontSize(size);
    doc.setFont('helvetica', font);
    const textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    doc.text(text, 75 - textWidth, y);
  };
  
  const leftText = (text, y, size, font = 'normal') => {
    doc.setFontSize(size);
    doc.setFont('helvetica', font);
    doc.text(text, 5, y);
  };

  const drawLine = (y) => {
    doc.setLineDashPattern([1, 1], 0);
    doc.line(5, y, 75, y);
    doc.setLineDashPattern([], 0);
  };

  // HEADER
  centerText('STRUK PENJUALAN', currentY, 14, 'bold');
  currentY += 5;
  centerText('Bukti Pembelian Ayam', currentY, 9, 'normal');
  currentY += 4;
  drawLine(currentY);
  currentY += 5;

  // INFO
  leftText('No. Struk', currentY, 9);
  rightText(penjualan.noStruk || penjualan.id.slice(-6), currentY, 9);
  currentY += 5;
  
  // We don't have exact time in the mock, so we use date and current time for "dicetak" later.
  leftText('Tanggal', currentY, 9);
  const dateObj = new Date(penjualan.tanggal);
  const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  rightText(dateStr, currentY, 9);
  currentY += 5;

  leftText('Petugas', currentY, 9);
  rightText(penjualan.dicatatOleh || 'Admin', currentY, 9);
  currentY += 4;
  drawLine(currentY);
  currentY += 5;

  // KEPADA (Left: KEPADA, Right: Buyer Name & Category)
  leftText('KEPADA', currentY, 8, 'bold');
  rightText(penjualan.pembeli, currentY, 10, 'bold');
  currentY += 4.5;
  rightText(penjualan.kategoriPembeli || 'Pembeli Toko', currentY, 8, 'normal');
  currentY += 4;
  drawLine(currentY);
  currentY += 5;

  // RINCIAN
  leftText('RINCIAN', currentY, 8, 'bold');
  currentY += 5;
  leftText('Ayam Broiler', currentY, 11, 'bold');
  currentY += 5;

  leftText('Jumlah', currentY, 9);
  rightText(`${penjualan.jumlahEkor || 0} ekor`, currentY, 9, 'bold');
  currentY += 5;

  leftText('Berat timbangan', currentY, 9);
  rightText(`${penjualan.beratGram} gram`, currentY, 9);
  currentY += 5;

  const kg = (penjualan.beratGram / 1000).toFixed(2);
  const ons = (penjualan.beratGram / 100).toFixed(1);
  leftText('Setara', currentY, 9);
  rightText(`${kg} Kg / ${ons} ons`, currentY, 9);
  currentY += 5;

  leftText('Harga per ons', currentY, 9);
  rightText(formatRupiah(penjualan.hargaPerOnsSnapshot), currentY, 9);
  currentY += 4;
  
  doc.setLineWidth(0.5);
  doc.line(5, currentY, 75, currentY);
  currentY += 6;

  // TOTAL
  leftText('TOTAL', currentY, 12, 'bold');
  rightText(formatRupiah(penjualan.totalHarga), currentY, 14, 'bold');
  currentY += 6;

  // Terbilang Text (Matching contoh-struk-penjualan.pdf)
  const terbilangStr = `Terbilang: ${angkaKeTerbilang(penjualan.totalHarga)}`;
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(51, 65, 85);
  const lines = doc.splitTextToSize(terbilangStr, 70);
  doc.text(lines, 5, currentY);
  currentY += lines.length * 4 + 2;

  doc.setLineWidth(0.5);
  doc.line(5, currentY, 75, currentY);
  currentY += 6;

  // FOOTER
  centerText('Terima kasih', currentY, 11, 'bold');
  currentY += 5;
  centerText('Simpan struk ini sebagai bukti pembelian.', currentY, 8);
  currentY += 6;
  
  const printTime = new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
  centerText(`Dicetak ${printTime}`, currentY, 7);

  // Save the document
  const fileName = `Struk_${penjualan.noStruk || penjualan.id}_${penjualan.pembeli.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}




/**
 * EXPORT LAPORAN PER KLOTER (PDF) WITH COVER PAGE (Design_cover.pdf Template Reference)
 * 4-page elegant report: Cover · Executive Summary · Analytics + Top Buyers · Transaction Detail
 */
export function exportKloterReportWithCoverPDF(kloter, bulanFilter = 'all', tahunFilter = 'all', activeHargaPerOns = 7500) {
  if (!kloter) return;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const calc = calculateKloterMetrics(kloter, activeHargaPerOns);

  const monthNames = [
    '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const bulanLabel = bulanFilter !== 'all' ? monthNames[Number(bulanFilter)] || 'Semua Bulan' : 'Semua Bulan';
  const tahunLabel = tahunFilter !== 'all'
    ? String(tahunFilter)
    : new Date(kloter.tanggalBeliDoc || Date.now()).getFullYear().toString();
  const todayFormatted = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const todayShort = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // ─── Filtered transaction lists ──────────────────────────────────
  const matchesFilter = (dateStr) => {
    if (!dateStr) return true;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return true;
    if (tahunFilter !== 'all' && d.getFullYear().toString() !== tahunFilter.toString()) return false;
    if (bulanFilter !== 'all' && (d.getMonth() + 1).toString() !== bulanFilter.toString()) return false;
    return true;
  };
  const filteredPenjualan = (kloter.penjualanList || []).filter((s) => matchesFilter(s.tanggal));
  const filteredPengeluaran = (kloter.pengeluaranList || []).filter((e) => matchesFilter(e.tanggal));

  // ─── Buyer analytics ────────────────────────────────────────────
  const buyerMap = {};
  filteredPenjualan.forEach((s) => {
    const k = s.pembeli || 'Unknown';
    if (!buyerMap[k]) buyerMap[k] = { nama: k, totalNilai: 0, totalEkor: 0, freq: 0 };
    buyerMap[k].totalNilai += Number(s.totalHarga) || 0;
    buyerMap[k].totalEkor += Number(s.jumlahEkor) || 0;
    buyerMap[k].freq += 1;
  });
  const buyerArr = Object.values(buyerMap);
  const top5ByValue = [...buyerArr].sort((a, b) => b.totalNilai - a.totalNilai).slice(0, 5);
  const top3ByFreq = [...buyerArr].sort((a, b) => b.freq - a.freq).slice(0, 3);

  // ─── Estimasi hari habis stok ────────────────────────────────────
  const penjualanDenganEkor = (kloter.penjualanList || []).filter((s) => Number(s.jumlahEkor) > 0);
  const rataEkorPerHari = penjualanDenganEkor.length > 0 ? calc.totalEkorTerjual / penjualanDenganEkor.length : 0;
  const estimasiHari = rataEkorPerHari > 0 ? Math.ceil(Math.max(0, calc.stokSiapJual) / rataEkorPerHari) : null;

  // ─── Inline helpers ──────────────────────────────────────────────

  /** Section header: bold navy title + thin underline */
  const sectionHeader = (title, y) => {
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 46, 74);
    doc.text(title.toUpperCase(), 14, y);
    doc.setDrawColor(26, 46, 74);
    doc.setLineWidth(0.35);
    doc.line(14, y + 1.5, 196, y + 1.5);
  };

  /** KPI card: label (small), value (large), optional subtext */
  const kpiBox = (label, value, sub, x, y, w, h) => {
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(x, y, w, h, 2, 2, 'FD');
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(label, x + w / 2, y + 5.5, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 46, 74);
    doc.text(String(value), x + w / 2, y + 12, { align: 'center' });
    if (sub) {
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text(String(sub), x + w / 2, y + 17, { align: 'center' });
    }
  };

  /** Navy header banner */
  const pageHeader = (title, subtitle) => {
    doc.setFillColor(26, 46, 74);
    doc.rect(0, 0, 210, 22, 'F');
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(title, 14, 10);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 175, 210);
    doc.text(subtitle, 14, 17);
  };

  /** Generate donut chart as canvas PNG data URL */
  const makeDonutPng = (segments, size = 280) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const total = segments.reduce((s, d) => s + d.value, 0);
    const cx = size / 2;
    const cy = size / 2;
    const outerR = size * 0.42;
    const innerR = size * 0.23;
    if (total === 0) {
      ctx.beginPath();
      ctx.arc(cx, cy, (outerR + innerR) / 2, 0, Math.PI * 2);
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = outerR - innerR;
      ctx.stroke();
    } else {
      let angle = -Math.PI / 2;
      segments.forEach((seg) => {
        if (seg.value <= 0) return;
        const sweep = (seg.value / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle));
        ctx.arc(cx, cy, outerR, angle, angle + sweep);
        ctx.arc(cx, cy, innerR, angle + sweep, angle, true);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();
        angle += sweep;
      });
    }
    // White center hole
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    return canvas.toDataURL('image/png');
  };

  // =========================================================
  // PAGE 1: COVER - clean editorial layout, no baked-in background image
  // =========================================================
  doc.setFillColor(247, 250, 252);
  doc.rect(0, 0, 210, 297, 'F');

  // Oversized accent block and diagonal rhythm create a strong cover silhouette.
  doc.setFillColor(14, 165, 233);
  doc.rect(0, 0, 13, 297, 'F');
  doc.setFillColor(224, 242, 254);
  doc.triangle(128, 0, 210, 0, 210, 170, 'F');
  doc.setDrawColor(56, 189, 248);
  doc.setLineWidth(0.6);
  doc.line(142, 0, 210, 68);
  doc.line(154, 0, 210, 56);
  doc.line(166, 0, 210, 44);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(3, 105, 161);
  doc.text('BROILER OPERATIONS', 24, 28);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('PERFORMANCE REPORT / INTERNAL USE', 24, 35);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(29);
  doc.setTextColor(15, 23, 42);
  doc.text('LAPORAN', 24, 82);
  doc.setTextColor(2, 132, 199);
  doc.text('KLOTER', 24, 112);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text('Ringkasan populasi, performa, transaksi, dan profitabilitas', 24, 126);
  doc.text('peternakan ayam broiler berbasis data operasional.', 24, 133);

  const coverName = doc.splitTextToSize(String(kloter.namaKloter || 'Tanpa Nama Kloter'), 112);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(15, 23, 42);
  doc.text(coverName, 24, 164, { lineHeightFactor: 1.2 });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`${kloter.id}  /  ${kloter.kandang || 'Kandang tidak diisi'}`, 24, 164 + coverName.length * 7);

  const dateDisplay = bulanFilter !== 'all' ? `${bulanLabel} ${tahunLabel}` : todayFormatted;
  const coverMeta = [
    ['PERIODE', dateDisplay],
    ['DOC AWAL', `${formatNumber(calc.docAwal)} ekor`],
    ['STATUS', calc.autoStatus],
  ];
  const metaY = 226;
  coverMeta.forEach(([label, value], index) => {
    const x = 24 + index * 57;
    doc.setDrawColor(186, 230, 253);
    doc.setLineWidth(0.3);
    doc.line(x, metaY, x + 48, metaY);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(3, 105, 161);
    doc.text(label, x, metaY + 8);
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(String(value), x, metaY + 16);
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text(`DICETAK ${todayShort}`, 24, 277);
  doc.setTextColor(3, 105, 161);
  doc.text('PENDATAAN AYAM', 196, 277, { align: 'right' });


  // =========================================================
  // PAGE 2: EXECUTIVE SUMMARY
  // =========================================================
  doc.addPage();
  pageHeader(
    `LAPORAN KLOTER: ${kloter.namaKloter.toUpperCase()}`,
    `${kloter.id}  \u00b7  Kandang: ${kloter.kandang || '-'}  \u00b7  Periode: ${bulanLabel} ${tahunLabel}`,
  );

  let y2 = 30;

  // Ringkasan Populasi — donut chart + legend
  sectionHeader('Ringkasan Populasi', y2);
  y2 += 6;

  const donutSegments = [
    { value: calc.totalEkorTerjual, color: '#1A2E4A' },
    { value: Math.max(0, calc.stokSiapJual), color: '#4A6FA5' },
    { value: Math.max(0, calc.sisaAyamHidup), color: '#94A3B8' },
    { value: calc.totalKematian, color: '#CBD5E1' },
  ];
  const donutPng = makeDonutPng(donutSegments);
  const CHART_SIZE = 55;
  doc.addImage(donutPng, 'PNG', 14, y2, CHART_SIZE, CHART_SIZE);

  // Center label
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(26, 46, 74);
  doc.text(formatNumber(calc.docAwal), 14 + CHART_SIZE / 2, y2 + CHART_SIZE / 2 - 1, { align: 'center' });
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('ekor total', 14 + CHART_SIZE / 2, y2 + CHART_SIZE / 2 + 4, { align: 'center' });

  // Legend
  const legendItems = [
    { label: 'Terjual', value: calc.totalEkorTerjual, color: [26, 46, 74] },
    { label: 'Stok Panen', value: Math.max(0, calc.stokSiapJual), color: [74, 111, 165] },
    { label: 'Sisa Hidup', value: Math.max(0, calc.sisaAyamHidup), color: [148, 163, 184] },
    { label: 'Kematian', value: calc.totalKematian, color: [203, 213, 225] },
  ];
  legendItems.forEach((item, i) => {
    const ly = y2 + 3 + i * 12;
    doc.setFillColor(...item.color);
    doc.rect(75, ly, 4.5, 4.5, 'F');
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(item.label, 83, ly + 3.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(26, 46, 74);
    doc.text(`${formatNumber(item.value)} ekor`, 136, ly + 3.5, { align: 'right' });
    const pct = calc.docAwal > 0 ? ((item.value / calc.docAwal) * 100).toFixed(1) : '0.0';
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(`${pct}%`, 151, ly + 3.5);
  });

  // 2 KPI cards on the right
  kpiBox('DOC Awal', `${formatNumber(calc.docAwal)} ekor`, 'Populasi masuk', 157, y2, 39, 26);
  kpiBox('Usia Ayam', `${calc.usiaAyamHari} Hari`, 'Sejak masuk DOC', 157, y2 + 28, 39, 26);

  y2 += CHART_SIZE + 10;

  // Kinerja Finansial
  sectionHeader('Kinerja Finansial', y2);
  y2 += 6;
  const FW = 58;
  kpiBox('Total Modal & Pengeluaran', formatRupiah(calc.totalModal), null, 14, y2, FW, 26);
  kpiBox('Total Omset Penjualan', formatRupiah(calc.totalPemasukan), null, 14 + FW + 2, y2, FW, 26);
  kpiBox('Net Profit / Rugi', formatRupiah(calc.netProfit), `ROI: ${formatNumber(calc.roi, 2)}%`, 14 + (FW + 2) * 2, y2, FW, 26);
  y2 += 30;

  // Indikator Teknis
  sectionHeader('Indikator Teknis', y2);
  y2 += 6;
  const IW = 43;
  kpiBox('FCR Pakan', calc.fcr > 0 ? formatNumber(calc.fcr, 2) : '-', 'Feed Conversion Ratio', 14, y2, IW, 28);
  kpiBox('Mortality Rate', `${formatNumber(calc.mortalityRate, 2)}%`, `${calc.totalKematian} ekor mati`, 14 + IW + 2, y2, IW, 28);
  kpiBox(
    'Est. Habis Terjual',
    estimasiHari !== null ? `${estimasiHari} Hari` : '-',
    rataEkorPerHari > 0 ? `~${Math.round(rataEkorPerHari)} ekor/hari` : 'Belum ada data',
    14 + (IW + 2) * 2, y2, IW, 28,
  );
  kpiBox('Status Kloter', calc.autoStatus, calc.statusLabel, 14 + (IW + 2) * 3, y2, IW, 28);
  y2 += 32;

  // Ringkasan Transaksi
  sectionHeader('Ringkasan Transaksi Periode', y2);
  y2 += 6;
  const TW = 44;
  const totalPenjualanEkor = filteredPenjualan.reduce((s, x) => s + (Number(x.jumlahEkor) || 0), 0);
  const totalPengeluaranRp = filteredPengeluaran.reduce((s, x) => s + (Number(x.jumlahRp) || 0), 0);
  kpiBox('Penjualan', `${filteredPenjualan.length} Nota`, `${formatNumber(totalPenjualanEkor)} ekor terjual`, 14, y2, TW, 28);
  kpiBox('Pengeluaran', `${filteredPengeluaran.length} Item`, formatRupiah(totalPengeluaranRp), 14 + TW + 2, y2, TW, 28);
  kpiBox('Panen', `${(kloter.panenList || []).length} Sesi`, `${formatNumber(calc.totalEkorDipanen)} ekor dipanen`, 14 + (TW + 2) * 2, y2, TW, 28);
  kpiBox('Tanggal Masuk DOC', kloter.tanggalBeliDoc || '-', `Awal: ${formatNumber(calc.docAwal)} ekor`, 14 + (TW + 2) * 3, y2, TW, 28);

  // =========================================================
  // PAGE 3: ANALITIK PENJUALAN
  // =========================================================
  doc.addPage();
  pageHeader(
    'ANALITIK PENJUALAN',
    `${kloter.namaKloter.toUpperCase()}  \u00b7  ${kloter.id}  \u00b7  Periode: ${bulanLabel} ${tahunLabel}`,
  );

  let y3 = 30;

  // Top 5 by value
  sectionHeader('Top 5 Pembeli \u2014 Nilai Terbesar', y3);
  y3 += 4;
  autoTable(doc, {
    startY: y3,
    head: [['No', 'Nama Pembeli', 'Total Ekor', 'Total Nilai (Rp)', 'Frekuensi']],
    body: top5ByValue.length > 0
      ? top5ByValue.map((b, i) => [
          i + 1, b.nama,
          `${formatNumber(b.totalEkor)} ekor`,
          formatRupiah(b.totalNilai),
          `${b.freq}\u00d7 transaksi`,
        ])
      : [['-', 'Belum ada data penjualan pada periode ini.', '-', '-', '-']],
    theme: 'plain',
    headStyles: { fillColor: [26, 46, 74], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold', cellPadding: 3 },
    bodyStyles: { fontSize: 8, cellPadding: 3, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 65, fontStyle: 'bold' },
      2: { cellWidth: 32 },
      3: { cellWidth: 50, fontStyle: 'bold' },
      4: { cellWidth: 33 },
    },
    margin: { left: 14, right: 14 },
  });
  y3 = doc.lastAutoTable.finalY + 12;

  // Top 3 by frequency
  sectionHeader('Top 3 Pembeli \u2014 Paling Sering', y3);
  y3 += 4;
  autoTable(doc, {
    startY: y3,
    head: [['No', 'Nama Pembeli', 'Frekuensi Beli', 'Total Nilai (Rp)', 'Total Ekor']],
    body: top3ByFreq.length > 0
      ? top3ByFreq.map((b, i) => [
          i + 1, b.nama,
          `${b.freq}\u00d7 transaksi`,
          formatRupiah(b.totalNilai),
          `${formatNumber(b.totalEkor)} ekor`,
        ])
      : [['-', 'Belum ada data penjualan pada periode ini.', '-', '-', '-']],
    theme: 'plain',
    headStyles: { fillColor: [74, 111, 165], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold', cellPadding: 3 },
    bodyStyles: { fontSize: 8, cellPadding: 3, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 12 },
      1: { cellWidth: 65, fontStyle: 'bold' },
      2: { cellWidth: 38 },
      3: { cellWidth: 50, fontStyle: 'bold' },
      4: { cellWidth: 27 },
    },
    margin: { left: 14, right: 14 },
  });

  // =========================================================
  // PAGE 4: RINCIAN TRANSAKSI
  // =========================================================
  doc.addPage();
  pageHeader(
    'RINCIAN TRANSAKSI',
    `${kloter.namaKloter.toUpperCase()}  \u00b7  ${kloter.id}  \u00b7  Periode: ${bulanLabel} ${tahunLabel}`,
  );

  let y4 = 30;

  // Penjualan
  sectionHeader(`Rincian Penjualan (${filteredPenjualan.length} transaksi)`, y4);
  y4 += 4;
  autoTable(doc, {
    startY: y4,
    head: [['No', 'Tanggal', 'Pembeli', 'Ekor', 'Berat', 'Harga/Ons', 'Total']],
    body: filteredPenjualan.length > 0
      ? filteredPenjualan.map((s, i) => [
          i + 1, s.tanggal, s.pembeli,
          `${formatNumber(s.jumlahEkor || 0)} ekor`,
          `${((s.beratGram || 0) / 1000).toFixed(2)} kg`,
          formatRupiah(s.hargaPerOnsSnapshot),
          formatRupiah(s.totalHarga),
        ])
      : [['-', '-', 'Belum ada transaksi penjualan di periode ini.', '-', '-', '-', '-']],
    theme: 'plain',
    headStyles: { fillColor: [26, 46, 74], textColor: [255, 255, 255], fontSize: 7.5, fontStyle: 'bold', cellPadding: 2.5 },
    bodyStyles: { fontSize: 7.5, cellPadding: 2.5, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 22 },
      2: { cellWidth: 52, fontStyle: 'bold' },
      3: { cellWidth: 20 },
      4: { cellWidth: 22 },
      5: { cellWidth: 30 },
      6: { cellWidth: 30, fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });
  y4 = doc.lastAutoTable.finalY + 10;

  if (y4 > 220) {
    doc.addPage();
    y4 = 20;
  }

  // Pengeluaran
  sectionHeader(`Rincian Pengeluaran (${filteredPengeluaran.length} item)`, y4);
  y4 += 4;
  autoTable(doc, {
    startY: y4,
    head: [['No', 'Tanggal', 'Kategori', 'Keterangan', 'Volume', 'Biaya (Rp)']],
    body: filteredPengeluaran.length > 0
      ? filteredPengeluaran.map((e, i) => [
          i + 1, e.tanggal, e.kategori, e.keterangan || '-',
          e.jumlahKg ? `${formatNumber(e.jumlahKg)} kg` : '-',
          formatRupiah(e.jumlahRp),
        ])
      : [['-', '-', 'Belum ada pengeluaran di periode ini.', '-', '-', '-']],
    theme: 'plain',
    headStyles: { fillColor: [74, 111, 165], textColor: [255, 255, 255], fontSize: 7.5, fontStyle: 'bold', cellPadding: 2.5 },
    bodyStyles: { fontSize: 7.5, cellPadding: 2.5, textColor: [51, 65, 85] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    columnStyles: {
      0: { cellWidth: 10 },
      1: { cellWidth: 22 },
      2: { cellWidth: 28 },
      3: { cellWidth: 70 },
      4: { cellWidth: 20 },
      5: { cellWidth: 36, fontStyle: 'bold' },
    },
    margin: { left: 14, right: 14 },
  });

  // ── Footer di semua halaman (kecuali cover halaman 1) ─────────────
  const totalPages = doc.getNumberOfPages();
  for (let pg = 2; pg <= totalPages; pg++) {
    doc.setPage(pg);
    const pageH = 297;
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.25);
    doc.line(14, pageH - 11, 196, pageH - 11);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text(
      `Sistem Pendataan Ayam Broiler  \u00b7  ${kloter.namaKloter}  \u00b7  Dicetak: ${todayShort}`,
      14,
      pageH - 6,
    );
    doc.text(`${pg - 1} / ${totalPages - 1}`, 196, pageH - 6, { align: 'right' });
  }

  const fileName = `Laporan_${kloter.namaKloter.replace(/\s+/g, '_')}_${bulanLabel}_${tahunLabel}.pdf`;
  doc.save(fileName);
}

