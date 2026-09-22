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

  // Total Ekor Terjual
  const totalEkorTerjual = (kloter.penjualanList || []).reduce(
    (sum, item) => sum + (Number(item.jumlahEkor) || 0),
    0
  );

  // Total Bobot Penjualan Dalam Kg (Timbangan Gram / 1000)
  const totalBobotPenjualanKg = (kloter.penjualanList || []).reduce(
    (sum, item) => sum + (Number(item.beratGram) || 0) / 1000,
    0
  );

  // Jika belum ada pencatatan panen, penjualan langsung tetap mengurangi stok hidup.
  const sisaAyamHidup = Math.max(
    0,
    docAwal - totalKematian - totalEkorDipanen - (totalEkorDipanen > 0 ? 0 : totalEkorTerjual)
  );

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

  // Stok Hasil Panen Siap Jual = Total Ekor Dipanen - Total Ekor Terjual
  const stokSiapJual = totalEkorDipanen > 0
    ? Math.max(0, totalEkorDipanen - totalEkorTerjual)
    : sisaAyamHidup;

  // Usia Ayam dalam Hari
  const usiaAyamHari = calculateChickenAgeDays(kloter.tanggalBeliDoc);

  // Status Otomatis Kloter
  const autoStatus = getKloterAutoStatus(kloter);

  return {
    docAwal,
    hargaDocPerEkor,
    modalDoc,
    totalKematian,
    totalEkorDipanen,
    totalEkorTerjual,
    stokSiapJual,
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
    usiaAyamHari,
    autoStatus,
    statusLabel: autoStatus === 'Aktif' ? 'Fase Pemeliharaan' : autoStatus === 'Panen' ? 'Fase Panen' : 'Fase Penjualan / Selesai',
  };
}

/**
 * Calculate chicken age in days based on DOC purchase date
 */
export function calculateChickenAgeDays(tanggalBeliDoc) {
  if (!tanggalBeliDoc) return 0;
  const docDate = new Date(tanggalBeliDoc);
  if (isNaN(docDate.getTime())) return 0;

  const today = new Date();
  const start = new Date(docDate.getFullYear(), docDate.getMonth(), docDate.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Determine automatic status phase of a Kloter based on transaction lifecycle
 * - 'Aktif': 0 chickens harvested (Pemeliharaan phase)
 * - 'Panen': Harvest started (> 0 harvested) & active chickens remain (> 0 sisa ayam)
 * - 'Penjualan': All chickens harvested (0 sisa ayam) -> Penjualan / Finished phase
 */
export function getKloterAutoStatus(kloter) {
  if (!kloter) return 'Aktif';
  const docAwal = Number(kloter.docAwal) || 0;
  const totalKematian = (kloter.kematianList || []).reduce((sum, item) => sum + (Number(item.jumlahEkor) || 0), 0);
  const totalEkorDipanen = (kloter.panenList || []).reduce((sum, item) => sum + (Number(item.jumlahEkor) || 0), 0);
  const totalEkorTerjual = (kloter.penjualanList || []).reduce((sum, item) => sum + (Number(item.jumlahEkor) || 0), 0);
  const sisaAyamHidup = Math.max(
    0,
    docAwal - totalKematian - totalEkorDipanen - (totalEkorDipanen > 0 ? 0 : totalEkorTerjual)
  );

  if (totalEkorDipanen === 0) {
    return 'Aktif'; // Fase Pemeliharaan
  } else if (sisaAyamHidup > 0) {
    return 'Panen'; // Fase Panen Berjalan
  } else {
    return 'Penjualan'; // Fase Penjualan (Semua Ayam Selesai Dipanen)
  }
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
 * Convert number to Indonesian terbilang words (e.g. 187500 -> "Seratus delapan puluh tujuh ribu lima ratus rupiah")
 */
export function angkaKeTerbilang(nominal) {
  const num = Math.abs(Math.floor(Number(nominal) || 0));
  if (num === 0) return 'Nol rupiah';

  const satuan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];

  function terbilangHelper(n) {
    if (n < 12) return satuan[n];
    if (n < 20) return terbilangHelper(n - 10) + ' belas';
    if (n < 100) return terbilangHelper(Math.floor(n / 10)) + ' puluh ' + terbilangHelper(n % 10);
    if (n < 200) return 'seratus ' + terbilangHelper(n - 100);
    if (n < 1000) return terbilangHelper(Math.floor(n / 100)) + ' ratus ' + terbilangHelper(n % 100);
    if (n < 2000) return 'seribu ' + terbilangHelper(n - 1000);
    if (n < 1000000) return terbilangHelper(Math.floor(n / 1000)) + ' ribu ' + terbilangHelper(n % 1000);
    if (n < 1000000000) return terbilangHelper(Math.floor(n / 1000000)) + ' juta ' + terbilangHelper(n % 1000000);
    if (n < 1000000000000) return terbilangHelper(Math.floor(n / 1000000000)) + ' milyar ' + terbilangHelper(n % 1000000000);
    return n.toString();
  }

  const result = terbilangHelper(num).replace(/\s+/g, ' ').trim();
  if (!result) return 'Nol rupiah';
  return result.charAt(0).toUpperCase() + result.slice(1) + ' rupiah';
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
