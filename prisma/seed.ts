import { PrismaClient } from '../generated/prisma/index.js';
import { auth } from '../src/lib/auth.js';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  const adminName = process.env.ADMIN_NAME || 'Admin User';

  console.log('🌱 Starting database seed...');

  // Check if admin user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingUser) {
    console.log(`✅ Admin user already exists: ${adminEmail}`);
    console.log(`   User ID: ${existingUser.id}`);

    // Update role to admin if not already set
    if (existingUser.role !== 'admin') {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: 'admin' },
      });
      console.log(`   Updated role to admin`);
    }

    return;
  }

  // Create new admin user using better-auth API
  console.log(`📝 Creating admin user: ${adminEmail}`);

  try {
    const result = await auth.api.createUser({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: adminName,
        role: 'admin',
      },
    });

    console.log('✅ Admin user created successfully!');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   User ID: ${result.user.id}`);
    console.log(
      '\n⚠️  IMPORTANT: Change the admin password after first login!'
    );
  } catch (error) {
    console.error('❌ Failed to create admin user:');
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
