// Mock dataset for Pendataan Ayam Berbasis Kloter
// Note: Strictly no emojis, detailed Indonesian texts for production feel.

export const initialHargaConfig = {
  hargaPerOnsAktif: 7500,
  berlakuMulai: new Date().toISOString().split('T')[0],
  terakhirDiubahOleh: 'System',
  riwayatHarga: [],
};

export const initialUsers = [
  {
    id: 'USR-001',
    nama: 'Alvin Rifky',
    username: 'alvinrifky81@gmail.com',
    email: 'alvinrifky81@gmail.com',
    password: 'alvin123',
    role: 'super_admin',
    labelRole: 'Super Admin',
    status: 'Aktif',
    isOnline: true,
    lastLogin: 'Belum pernah',
  },
];

export const initialKloters = [];

export const initialAuditLogs = [];

