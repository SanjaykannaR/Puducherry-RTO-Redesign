// ── Prisma Seed Script — RTO Portal Demo Data ──
// Run: npx prisma db seed
// Idempotent: uses upsert so re-runs are safe.

require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');
const bcrypt = require('bcryptjs');

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./prisma/dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding RTO portal database...');

  const hash = await bcrypt.hash('Admin@123', 10);
  const citizenHash = await bcrypt.hash('Citizen@123', 10);

  // ── Users (find-or-create by email, handle mobile conflicts) ──
  async function findOrCreateUser(email, mobile, data) {
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      try {
        user = await prisma.user.create({ data: { email, mobile, ...data } });
      } catch (e) {
        if (e.code === 'P2002') {
          // Mobile taken — find by mobile and link
          user = await prisma.user.findUnique({ where: { mobile } });
        }
        if (!user) throw e;
      }
    }
    return user;
  }

  const admin = await findOrCreateUser('admin@rto.gov.in', '9876543210', { passwordHash: hash, name: 'RTO Admin', role: 'ADMIN' });
  const citizen1 = await findOrCreateUser('ramesh@example.com', '9876543211', { passwordHash: citizenHash, name: 'Ramesh Kumar', role: 'CITIZEN' });
  const citizen2 = await findOrCreateUser('priya@example.com', '9876543212', { passwordHash: citizenHash, name: 'Priya Sharma', role: 'CITIZEN' });
  const citizen3 = await findOrCreateUser('arjun@example.com', '9876543213', { passwordHash: citizenHash, name: 'Arjun Patel', role: 'CITIZEN' });
  console.log('  Users: 1 admin + 3 citizens (upserted)');

  // ── Vehicles ──
  for (const v of [
    {
      registrationNo: 'PY-01-2024-0001', chassisNo: 'CH001', engineNo: 'EN001',
      make: 'Hero', model: 'Splendor Plus', variant: 'Self Start', manufactureYear: 2023,
      fuelType: 'Petrol', color: 'Black', ownerName: 'Ramesh Kumar',
      ownerAddress: '123 MG Road, Puducherry', insuranceUpto: new Date('2025-12-31'),
      puccUpto: new Date('2025-06-30'), taxPaidUpto: new Date('2025-12-31'),
      fitnessUpto: new Date('2026-12-31'), status: 'ACTIVE', ownerId: citizen1.id,
    },
    {
      registrationNo: 'PY-01-2024-0002', chassisNo: 'CH002', engineNo: 'EN002',
      make: 'Maruti Suzuki', model: 'Swift', variant: 'VXi', manufactureYear: 2022,
      fuelType: 'Petrol', color: 'White', ownerName: 'Priya Sharma',
      ownerAddress: '456 Nehru Street, Puducherry', insuranceUpto: new Date('2025-08-15'),
      puccUpto: new Date('2025-03-20'), taxPaidUpto: new Date('2025-08-15'),
      fitnessUpto: new Date('2026-08-15'), status: 'ACTIVE', ownerId: citizen2.id,
    },
    {
      registrationNo: 'PY-01-2023-0003', chassisNo: 'CH003', engineNo: 'EN003',
      make: 'Honda', model: 'Activa 6G', variant: 'Standard', manufactureYear: 2023,
      fuelType: 'Petrol', color: 'Red', ownerName: 'Arjun Patel',
      ownerAddress: '789 Gandhi Salai, Puducherry', insuranceUpto: new Date('2025-11-30'),
      puccUpto: new Date('2025-05-15'), taxPaidUpto: new Date('2025-11-30'),
      fitnessUpto: new Date('2026-11-30'), status: 'ACTIVE', ownerId: citizen3.id,
    },
    {
      registrationNo: 'PY-01-2024-0004', chassisNo: 'CH004', engineNo: 'EN004',
      make: 'Tata', model: 'Nexon', variant: 'XZ+', manufactureYear: 2024,
      fuelType: 'Diesel', color: 'Blue', ownerName: 'Ramesh Kumar',
      ownerAddress: '123 MG Road, Puducherry', insuranceUpto: new Date('2026-01-15'),
      puccUpto: new Date('2025-07-20'), taxPaidUpto: new Date('2026-01-15'),
      fitnessUpto: new Date('2027-01-15'), status: 'ACTIVE', ownerId: citizen1.id,
    },
  ]) {
    await prisma.vehicle.upsert({
      where: { registrationNo: v.registrationNo },
      update: {},
      create: v,
    });
  }
  console.log('  Vehicles: 4 (upserted)');

  // ── Licenses ──
  for (const l of [
    { licenseNo: 'PY-LL-2024-0001', type: 'MCWG', name: 'Ramesh Kumar', dob: new Date('1990-05-15'), bloodGroup: 'O+', address: '123 MG Road, Puducherry', issueDate: new Date('2024-01-15'), expiryDate: new Date('2044-01-14'), status: 'ACTIVE', holderId: citizen1.id },
    { licenseNo: 'PY-LL-2024-0002', type: 'LMV', name: 'Priya Sharma', dob: new Date('1992-08-20'), bloodGroup: 'A+', address: '456 Nehru Street, Puducherry', issueDate: new Date('2024-03-10'), expiryDate: new Date('2044-03-09'), status: 'ACTIVE', holderId: citizen2.id },
    { licenseNo: 'PY-LL-2023-0003', type: 'MCWG+LMV', name: 'Arjun Patel', dob: new Date('1988-11-25'), bloodGroup: 'B+', address: '789 Gandhi Salai, Puducherry', issueDate: new Date('2023-07-01'), expiryDate: new Date('2043-06-30'), status: 'ACTIVE', holderId: citizen3.id },
  ]) {
    await prisma.license.upsert({
      where: { licenseNo: l.licenseNo },
      update: {},
      create: l,
    });
  }
  console.log('  Licenses: 3 (upserted)');

  // ── Applications (skip if already seeded — no unique field besides id) ──
  const appCount = await prisma.application.count();
  if (appCount === 0) {
    const statuses = ['DRAFT', 'PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];
    const types = ['LEARNERS_LICENSE', 'DRIVING_LICENSE', 'VEHICLE_REGISTRATION', 'LICENSE_RENEWAL', 'DUPLICATE_RC'];
    const citizens = [citizen1, citizen2, citizen3];
    for (let i = 0; i < 5; i++) {
      await prisma.application.create({
        data: {
          type: types[i], status: statuses[i],
          formData: JSON.stringify({ applicant: citizens[i % 3].name, service: types[i] }),
          applicantId: citizens[i % 3].id,
        },
      });
    }
    console.log('  Applications: 5 (DRAFT → REJECTED)');
  } else {
    console.log(`  Applications: skipped (${appCount} already exist)`);
  }

  // ── Appointments (skip if any exist) ──
  const apptCount = await prisma.appointment.count();
  if (apptCount === 0) {
    await prisma.appointment.create({ data: { date: new Date('2026-07-20'), timeSlot: '10:00-11:00', purpose: 'License Renewal', status: 'SCHEDULED', applicantId: citizen1.id } });
    await prisma.appointment.create({ data: { date: new Date('2026-07-22'), timeSlot: '14:00-15:00', purpose: 'Vehicle Fitness', status: 'SCHEDULED', applicantId: citizen2.id } });
    await prisma.appointment.create({ data: { date: new Date('2026-07-25'), timeSlot: '11:00-12:00', purpose: 'License Test', status: 'SCHEDULED', applicantId: citizen3.id } });
    console.log('  Appointments: 3');
  } else {
    console.log(`  Appointments: skipped (${apptCount} already exist)`);
  }

  // ── Payments (upsert by transactionId) ──
  await prisma.payment.upsert({
    where: { transactionId: 'TXN-2024-0001' },
    update: {},
    create: { amount: 250, transactionId: 'TXN-2024-0001', status: 'COMPLETED', paidAt: new Date(), userId: citizen1.id },
  });
  await prisma.payment.upsert({
    where: { transactionId: 'TXN-2024-0002' },
    update: {},
    create: { amount: 1500, transactionId: 'TXN-2024-0002', status: 'PENDING', userId: citizen2.id },
  });
  console.log('  Payments: 2 (upserted)');

  // ── Notifications (skip if any exist) ──
  const notifCount = await prisma.notification.count();
  if (notifCount === 0) {
    await prisma.notification.create({ data: { title: 'Application Received', message: 'Your learners license application has been received.', type: 'INFO', isRead: true, userId: citizen1.id } });
    await prisma.notification.create({ data: { title: 'Payment Reminder', message: 'Payment of ₹1500 is pending for your vehicle registration.', type: 'WARNING', isRead: false, userId: citizen2.id } });
    await prisma.notification.create({ data: { title: 'License Approved', message: 'Your driving license application has been approved.', type: 'SUCCESS', isRead: false, userId: citizen3.id } });
    await prisma.notification.create({ data: { title: 'Appointment Confirmed', message: 'Your appointment for license renewal is confirmed for 20 Jul 2026.', type: 'INFO', isRead: false, userId: citizen1.id } });
    console.log('  Notifications: 4');
  } else {
    console.log(`  Notifications: skipped (${notifCount} already exist)`);
  }

  console.log('\nSeeding complete!');
}

main()
  .catch((e) => { console.error('Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
