const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: { url: 'mysql://root:xzbsgZuSpeUfzqHiJzOvtzJjZKBtoYoj@zephyr.proxy.rlwy.net:44731/railway' }
  }
});

async function main() {
  const newPassword = await bcrypt.hash('Arsyad01!', 10);
  
  await prisma.user.updateMany({
    where: { email: 'arsyadrahman206@gmail.com' },
    data: { password: newPassword }
  });
  
  console.log("Password berhasil di-reset!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
