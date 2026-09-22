import prisma from './prisma.js';

async function main() {
  console.log('Seeding initial data into PostgreSQL...');

  // 1. Create or ensure Super Admin user: Alvin Rifky
  const superAdmin = await prisma.user.upsert({
    where: { username: 'alvinrifky81@gmail.com' },
    update: {
      nama: 'Alvin Rifky',
      email: 'alvinrifky81@gmail.com',
      password: 'alvin123',
      role: 'super_admin',
      labelRole: 'Super Admin',
      status: 'Aktif',
    },
    create: {
      id: 'USR-001',
      nama: 'Alvin Rifky',
      username: 'alvinrifky81@gmail.com',
      email: 'alvinrifky81@gmail.com',
      password: 'alvin123',
      role: 'super_admin',
      labelRole: 'Super Admin',
      status: 'Aktif',
      isOnline: true,
      lastLogin: new Date().toISOString().replace('T', ' ').slice(0, 19),
    },
  });

  console.log('Super Admin User verified:', superAdmin.nama, `(${superAdmin.username})`);

  // 2. Default Harga Config
  const hargaConfig = await prisma.hargaConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      hargaPerOnsAktif: 7500,
      berlakuMulai: new Date().toISOString().split('T')[0],
      terakhirDiubahOleh: 'Alvin Rifky (Super Admin)',
    },
  });

  // 3. Initial Kloter
  const kloter1 = await prisma.kloter.upsert({
    where: { id: 'KLT-2026-01' },
    update: {},
    create: {
      id: 'KLT-2026-01',
      namaKloter: 'Kloter Broiler Alpha - Kandang Utama 01',
      kandang: 'Kandang Utama 01',
      tanggalBeliDoc: '2026-09-01',
      docAwal: 5000,
      hargaDocPerEkor: 8200,
      status: 'Aktif',
      catatanAwal: 'Strain bibit Cobb 500 dari PT Charoen Pokphand.',
    },
  });

  console.log('Sample Kloter verified:', kloter1.namaKloter);
  console.log('Seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
