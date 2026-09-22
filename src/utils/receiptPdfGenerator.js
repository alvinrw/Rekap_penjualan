import { jsPDF } from 'jspdf';
import { formatRupiah, formatNumber, gramToOns, formatDateIndonesian } from './calculations';

/**
 * Konversi angka ke kalimat Terbilang Bahasa Indonesia
 */
export function angkaKeTerbilang(nilai) {
  const bilangan = [
    '', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima',
    'Enam', 'Tujuh', 'Delapan', 'Sembilan', 'Sepuluh', 'Sebelas'
  ];

  function convert(n) {
    n = Math.floor(n);
    if (n < 12) {
      return bilangan[n];
    } else if (n < 20) {
      return convert(n - 10) + ' Belas';
    } else if (n < 100) {
      return convert(Math.floor(n / 10)) + ' Puluh' + (n % 10 !== 0 ? ' ' + convert(n % 10) : '');
    } else if (n < 200) {
      return 'Seratus' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '');
    } else if (n < 1000) {
      return convert(Math.floor(n / 100)) + ' Ratus' + (n % 100 !== 0 ? ' ' + convert(n % 100) : '');
    } else if (n < 2000) {
      return 'Seribu' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    } else if (n < 1000000) {
      return convert(Math.floor(n / 1000)) + ' Ribu' + (n % 1000 !== 0 ? ' ' + convert(n % 1000) : '');
    } else if (n < 1000000000) {
      return convert(Math.floor(n / 1000000)) + ' Juta' + (n % 1000000 !== 0 ? ' ' + convert(n % 1000000) : '');
    } else if (n < 1000000000000) {
      return convert(Math.floor(n / 1000000000)) + ' Milyar' + (n % 1000000000 !== 0 ? ' ' + convert(n % 1000000000) : '');
    } else {
      return 'Nominal Terlalu Besar';
    }
  }

  if (nilai === 0) return 'Nol rupiah';
  const hasil = convert(nilai).trim();
  return (hasil.charAt(0).toUpperCase() + hasil.slice(1) + ' rupiah').replace(/\s+/g, ' ');
}

/**
 * Generate and download PDF Struk Penjualan exactly matching contoh-struk-penjualan.pdf
 */
export function cetakStrukPenjualanPDF(sale) {
  // Format thermal / receipt: 80mm width x 160mm height
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [80, 160],
  });

  const pageWidth = 80;
  const margin = 6;
  const rightX = pageWidth - margin;
  let y = 10;

  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(20, 24, 33);
  doc.text('STRUK PENJUALAN', pageWidth / 2, y, { align: 'center' });

  y += 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Bukti Pembelian Ayam', pageWidth / 2, y, { align: 'center' });

  // Dashed separator
  const drawDashed = (currY) => {
    doc.setDrawColor(180, 190, 205);
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.setLineWidth(0.3);
    doc.line(margin, currY, rightX, currY);
    doc.setLineDashPattern([], 0); // reset
  };

  const drawSolid = (currY, width = 0.4) => {
    doc.setDrawColor(20, 24, 33);
    doc.setLineWidth(width);
    doc.line(margin, currY, rightX, currY);
  };

  y += 5;
  drawDashed(y);

  // Meta Section
  y += 5;
  const noStruk = sale.noStruk || (sale.id ? sale.id.replace('SL-', '000') : '000123');
  const tgl = sale.tanggal ? formatDateIndonesian(sale.tanggal) : formatDateIndonesian(new Date().toISOString().split('T')[0]);
  const jam = (sale.jam || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })) + ' WIB';
  const petugas = sale.dicatatOleh || 'Petugas Kasir';

  const metaList = [
    ['No. Struk', noStruk],
    ['Tanggal', tgl],
    ['Jam', jam],
    ['Petugas', petugas],
  ];

  doc.setFontSize(7.5);
  metaList.forEach(([label, value]) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(label, margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(20, 24, 33);
    doc.text(value, rightX, y, { align: 'right' });
    y += 4.2;
  });

  y += 1;
  drawDashed(y);

  // KEPADA Section
  y += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(120, 130, 145);
  doc.text('KEPADA', margin, y);

  y += 4.2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(20, 24, 33);
  doc.text(sale.pembeli || 'Pelanggan Umum', margin, y);

  y += 4;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(sale.kategoriPembeli || 'Pembeli Toko', margin, y);

  y += 3;
  drawDashed(y);

  // RINCIAN Section
  y += 4.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(120, 130, 145);
  doc.text('RINCIAN', margin, y);

  y += 4.2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(20, 24, 33);
  doc.text('Ayam', margin, y);

  const ons = gramToOns(sale.beratGram || 0);
  const kg = (sale.beratGram || 0) / 1000;
  const ekor = sale.jumlahEkor || 1;

  const rincianList = [
    ['Jumlah', `${ekor} ekor`],
    ['Berat timbangan', `${formatNumber(sale.beratGram || 0)} gram`],
    ['Setara', `${formatNumber(kg, 2)} Kg  /  ${formatNumber(ons, 1)} ons`],
    ['Harga per ons', `${formatRupiah(sale.hargaPerOnsSnapshot || 7500)}`],
  ];

  y += 4;
  doc.setFontSize(7.5);
  rincianList.forEach(([label, value], idx) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(label, margin, y);
    doc.setFont('helvetica', idx === 0 ? 'bold' : 'normal');
    doc.setTextColor(20, 24, 33);
    doc.text(value, rightX, y, { align: 'right' });
    y += 4.2;
  });

  y += 1.5;
  drawSolid(y, 0.5);

  // TOTAL Section
  y += 5.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(20, 24, 33);
  doc.text('TOTAL', margin, y);

  doc.setFontSize(12);
  doc.text(formatRupiah(sale.totalHarga || 0), rightX, y, { align: 'right' });

  y += 4.5;
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  const terbilangStr = `Terbilang: ${angkaKeTerbilang(sale.totalHarga || 0)}`;
  doc.text(terbilangStr, margin, y, { maxWidth: pageWidth - margin * 2 });

  y += 6;
  drawSolid(y, 0.5);

  // Footer Section
  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(20, 24, 33);
  doc.text('Terima kasih', pageWidth / 2, y, { align: 'center' });

  y += 3.8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Simpan struk ini sebagai bukti pembelian.', pageWidth / 2, y, { align: 'center' });

  y += 3.5;
  doc.setFontSize(6);
  doc.setTextColor(150, 160, 175);
  const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
  doc.text(`Dicetak ${nowStr}`, pageWidth / 2, y, { align: 'center' });

  // Save PDF
  doc.save(`Struk-Penjualan-${noStruk}.pdf`);
}
