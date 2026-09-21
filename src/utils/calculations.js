// Utility functions for calculations and formatting in Pendataan Ayam

/**
 * Calculate metrics for a single Kloter batch
 */
export function calculateKloterMetrics(kloter, activeHargaPerOns = 7500) {
  const docAwal = Number(kloter.docAwal) || 0;
  const hargaDocPerEkor = Number(kloter.hargaDocPerEkor) || 0;
  const modalDoc = docAwal * hargaDocPerEkor;

  // Total Kematian
  const totalKematian = (kloter.kematianList || []).reduce(
    (sum, item) => sum + (Number(item.jumlahEkor) || 0),
    0
  );

  // Total Ekor Panen
  const totalEkorDipanen = (kloter.panenList || []).reduce(
    (sum, item) => sum + (Number(item.jumlahEkor) || 0),
    0
  );

  // Total Bobot Penjualan Dalam Kg (Timbangan Gram / 1000)
  const totalBobotPenjualanKg = (kloter.penjualanList || []).reduce(
    (sum, item) => sum + (Number(item.beratGram) || 0) / 1000,
    0
  );

  // Sisa Ayam Hidup = DOC Awal - Total Kematian - Total Ekor Dipanen
  const sisaAyamHidup = Math.max(0, docAwal - totalKematian - totalEkorDipanen);

  // Mortality Rate (%) = (Total Kematian / DOC Awal) * 100
  const mortalityRate = docAwal > 0 ? (totalKematian / docAwal) * 100 : 0;

  // Total Pengeluaran (Pakan, Obat, Listrik, Gaji, Pemeliharaan, Lainnya)
  const totalPengeluaran = (kloter.pengeluaranList || []).reduce(
    (sum, item) => sum + (Number(item.jumlahRp) || 0),
    0
  );

  // Total Pakan Dalam Kg (khusus kategori 'Pakan')
  const totalPakanKg = (kloter.pengeluaranList || [])
    .filter((item) => item.kategori === 'Pakan')
    .reduce((sum, item) => sum + (Number(item.jumlahKg) || 0), 0);

  // FCR = Total Pakan (Kg) / Total Bobot Timbangan Penjualan (Kg)
  const fcr = totalBobotPenjualanKg > 0 ? totalPakanKg / totalBobotPenjualanKg : 0;

  // Total Modal = Modal DOC + Total Pengeluaran Operasional
  const totalModal = modalDoc + totalPengeluaran;

  // Total Penjualan (Revenue) dengan kalkulasi diskon jika ada
  const totalPemasukan = (kloter.penjualanList || []).reduce((sum, item) => {
    if (item.totalHarga !== undefined) {
      return sum + Number(item.totalHarga);
    }
    const gram = Number(item.beratGram) || 0;
    const hargaOnsSnapshot = Number(item.hargaPerOnsSnapshot) || activeHargaPerOns;
    const ons = gram / 100;
    const subtotal = ons * hargaOnsSnapshot;
    const diskon = item.isDiscountActive ? subtotal * (Number(item.diskonPersen || 0) / 100) : 0;
    return sum + (subtotal - diskon);
  }, 0);

  // Net Profit = Total Pemasukan - Total Modal
  const netProfit = totalPemasukan - totalModal;

  // ROI / Margin (%) = (Net Profit / Total Modal) * 100
  const roi = totalModal > 0 ? (netProfit / totalModal) * 100 : 0;

  return {
    docAwal,
    hargaDocPerEkor,
    modalDoc,
    totalKematian,
    totalEkorDipanen,
    totalBobotPanenKg: totalBobotPenjualanKg,
    sisaAyamHidup,
    mortalityRate,
    totalPengeluaran,
    totalPakanKg,
    fcr,
    totalModal,
    totalPemasukan,
    netProfit,
    roi,
  };
}

/**
 * Format currency to Indonesian Rupiah (Rp 1.500.000)
 */
export function formatRupiah(amount) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(num);
}

/**
 * Format standard number with Indonesian locale dots
 */
export function formatNumber(amount, maxDecimals = 0) {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: maxDecimals,
    minimumFractionDigits: maxDecimals,
  }).format(num);
}

/**
 * Calculate Grams to Ons (1 Ons = 100 Grams)
 */
export function gramToOns(gram) {
  const g = Number(gram) || 0;
  return g / 100;
}

/**
 * Calculate total sales price based on gram weight and price per ons
 */
export function calculateSalesPrice(beratGram, hargaPerOns) {
  const ons = gramToOns(beratGram);
  const harga = Number(hargaPerOns) || 0;
  return ons * harga;
}

/**
 * Format Indonesian date string
 */
export function formatDateIndonesian(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
