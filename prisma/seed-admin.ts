import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@elearn.com';
  const adminPassword = 'adminpassword123';

  // Check if admin exists
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log('Admin user already exists!');
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      fullName: 'مدير المنصة',
      phone: '01000000000',
      role: 'ADMIN',
      wallet: {
        create: { balance: 0 },
      },
      isVerified: true
    }
  });

  console.log('Admin account created successfully!');
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
