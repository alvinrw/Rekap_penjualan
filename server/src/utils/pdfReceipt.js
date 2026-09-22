import PDFDocument from 'pdfkit';

/**
 * Konversi angka rupiah ke kalimat Terbilang Bahasa Indonesia
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

export function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(number || 0);
}

export function formatNumber(number, decimals = 0) {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(number || 0);
}

/**
 * Generate PDF Struk Penjualan stream matching the exact design of contoh-struk-penjualan.pdf
 */
export function generateStrukPenjualanPDF(sale, res) {
  const doc = new PDFDocument({
    size: [280, 520], // Struk thermal receipt format
    margins: { top: 20, bottom: 20, left: 16, right: 16 },
  });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `inline; filename="struk-${sale.noStruk || sale.id}.pdf"`
  );

  doc.pipe(res);

  const startX = 16;
  const contentWidth = 248;
  const rightX = startX + contentWidth;

  // Header
  doc.font('Helvetica-Bold').fontSize(16).fillColor('#111827').text('STRUK PENJUALAN', { align: 'center' });
  doc.font('Helvetica').fontSize(10).fillColor('#4B5563').text('Bukti Pembelian Ayam', { align: 'center' });
  doc.moveDown(0.6);

  // Dashed separator
  const drawDashedLine = (y) => {
    doc.save();
    doc.setLineDash([3, 3], 0);
    doc.strokeColor('#9CA3AF');
    doc.lineWidth(0.8);
    doc.moveTo(startX, y).lineTo(rightX, y).stroke();
    doc.restore();
  };

  const drawSolidLine = (y, width = 1) => {
    doc.save();
    doc.strokeColor('#111827');
    doc.lineWidth(width);
    doc.moveTo(startX, y).lineTo(rightX, y).stroke();
    doc.restore();
  };

  let curY = doc.y;
  drawDashedLine(curY);
  curY += 8;

  // Metadata
  const noStrukText = sale.noStruk || sale.id.replace('SL-', '000');
  const tanggalText = sale.tanggal || new Date().toISOString().split('T')[0];
  const jamText = (sale.jam || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })) + ' WIB';
  const petugasText = sale.dicatatOleh || 'Petugas Kasir';

  const metaRows = [
    ['No. Struk', noStrukText],
    ['Tanggal', tanggalText],
    ['Jam', jamText],
    ['Petugas', petugasText],
  ];

  doc.fontSize(9).font('Helvetica');
  metaRows.forEach(([lbl, val]) => {
    doc.fillColor('#4B5563').text(lbl, startX, curY);
    doc.fillColor('#111827').text(val, startX, curY, { align: 'right', width: contentWidth });
    curY += 14;
  });

  curY += 2;
  drawDashedLine(curY);
  curY += 8;

  // KEPADA Section
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#6B7280').text('KEPADA', startX, curY);
  curY += 10;
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#111827').text(sale.pembeli || 'Pelanggan Umum', startX, curY);
  curY += 14;
  doc.fontSize(9).font('Helvetica').fillColor('#6B7280').text(sale.kategoriPembeli || 'Pembeli Toko', startX, curY);
  curY += 14;

  drawDashedLine(curY);
  curY += 8;

  // RINCIAN Section
  doc.fontSize(7.5).font('Helvetica-Bold').fillColor('#6B7280').text('RINCIAN', startX, curY);
  curY += 10;
  doc.fontSize(11).font('Helvetica-Bold').fillColor('#111827').text('Ayam', startX, curY);
  curY += 13;

  const ons = (sale.beratGram || 0) / 100;
  const kg = (sale.beratGram || 0) / 1000;

  const rincianRows = [
    ['Jumlah', `${sale.jumlahEkor || 1} ekor`],
    ['Berat timbangan', `${formatNumber(sale.beratGram || 0)} gram`],
    ['Setara', `${formatNumber(kg, 2)} Kg  /  ${formatNumber(ons, 1)} ons`],
    ['Harga per ons', `${formatRupiah(sale.hargaPerOnsSnapshot || 7500)}`],
  ];

  doc.fontSize(9);
  rincianRows.forEach(([lbl, val], idx) => {
    doc.font('Helvetica').fillColor('#4B5563').text(lbl, startX, curY);
    doc.font(idx === 0 ? 'Helvetica-Bold' : 'Helvetica').fillColor('#111827').text(val, startX, curY, { align: 'right', width: contentWidth });
    curY += 14;
  });

  curY += 4;
  drawSolidLine(curY, 1.2);
  curY += 8;

  // TOTAL Section
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#111827').text('TOTAL', startX, curY + 2);
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#111827').text(formatRupiah(sale.totalHarga || 0), startX, curY, { align: 'right', width: contentWidth });
  curY += 18;

  const terbilangText = `Terbilang: ${angkaKeTerbilang(sale.totalHarga || 0)}`;
  doc.font('Helvetica-Oblique').fontSize(7.5).fillColor('#4B5563').text(terbilangText, startX, curY, { width: contentWidth });
  curY += 18;

  drawSolidLine(curY, 1.2);
  curY += 10;

  // Footer Section
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#111827').text('Terima kasih', startX, curY, { align: 'center', width: contentWidth });
  curY += 13;
  doc.font('Helvetica').fontSize(8).fillColor('#6B7280').text('Simpan struk ini sebagai bukti pembelian.', startX, curY, { align: 'center', width: contentWidth });
  curY += 12;

  const nowStr = new Date().toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' });
  doc.font('Helvetica').fontSize(7).fillColor('#9CA3AF').text(`Dicetak ${nowStr}`, startX, curY, { align: 'center', width: contentWidth });

  doc.end();
}
