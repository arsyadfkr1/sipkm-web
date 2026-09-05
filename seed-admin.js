const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@sipkm.com';
  const password = await bcrypt.hash('admin123', 10);
  
  const existingAdmin = await prisma.user.findUnique({
    where: { email }
  });

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        email,
        password,
        namaLengkap: 'Administrator',
        role: 'admin',
      }
    });
    console.log('✅ Akun Admin berhasil dibuat!');
    console.log(`Email: ${email}`);
    console.log(`Password: admin123`);
  } else {
    console.log('Akun Admin sudah ada!');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
