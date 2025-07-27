/**
 * 🌱 DATABASE SEEDING SCRIPT
 * =========================
 * Seeds the database with initial data for development and testing
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@counselflow.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'admin@counselflow.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      status: 'active',
      permissions: ['read', 'write', 'delete', 'admin'],
    },
  });

  // Create sample lawyers
  const lawyer1Password = await bcrypt.hash('lawyer123', 10);
  const lawyer1 = await prisma.user.upsert({
    where: { email: 'john.smith@counselflow.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'john.smith@counselflow.com',
      password: lawyer1Password,
      firstName: 'John',
      lastName: 'Smith',
      role: 'lawyer',
      status: 'active',
      department: 'Corporate Law',
      permissions: ['read', 'write'],
    },
  });

  const lawyer2Password = await bcrypt.hash('lawyer123', 10);
  const lawyer2 = await prisma.user.upsert({
    where: { email: 'emily.davis@counselflow.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'emily.davis@counselflow.com',
      password: lawyer2Password,
      firstName: 'Emily',
      lastName: 'Davis',
      role: 'lawyer',
      status: 'active',
      department: 'Family Law',
      permissions: ['read', 'write'],
    },
  });

  // Create sample clients
  const client1 = await prisma.client.upsert({
    where: { email: 'contact@acmecorp.com' },
    update: {},
    create: {
      id: uuidv4(),
      name: 'Acme Corporation',
      email: 'contact@acmecorp.com',
      phoneNumber: '+1-555-0123',
      address: '123 Business Ave, New York, NY 10001',
      clientType: 'Corporate',
      industry: 'Technology',
      description: 'Leading software development company',
      status: 'ACTIVE',
      assignedLawyerId: lawyer1.id,
      totalAssets: 2500000,
      riskScore: 3,
      lastActivity: new Date(),
    },
  });

  const client2 = await prisma.client.upsert({
    where: { email: 'jane.doe@email.com' },
    update: {},
    create: {
      id: uuidv4(),
      name: 'Jane Doe',
      email: 'jane.doe@email.com',
      phoneNumber: '+1-555-0456',
      address: '456 Residential St, Los Angeles, CA 90210',
      clientType: 'Individual',
      industry: 'Personal',
      description: 'Individual client for personal legal matters',
      status: 'ACTIVE',
      assignedLawyerId: lawyer2.id,
      totalAssets: 450000,
      riskScore: 2,
      lastActivity: new Date(),
    },
  });

  const client3 = await prisma.client.upsert({
    where: { email: 'info@greenenergy.com' },
    update: {},
    create: {
      id: uuidv4(),
      name: 'Green Energy Solutions',
      email: 'info@greenenergy.com',
      phoneNumber: '+1-555-0789',
      address: '789 Industrial Blvd, Austin, TX 78701',
      clientType: 'Corporate',
      industry: 'Energy',
      description: 'Renewable energy solutions provider',
      status: 'PENDING',
      assignedLawyerId: lawyer1.id,
      totalAssets: 1200000,
      riskScore: 4,
      lastActivity: new Date(),
    },
  });

  // Create sample contracts
  const contract1 = await prisma.contract.create({
    data: {
      id: uuidv4(),
      title: 'Software Licensing Agreement',
      description: 'Enterprise software licensing agreement with annual renewal',
      contractType: 'Software License',
      status: 'EXECUTED',
      value: 250000,
      currency: 'USD',
      startDate: '2024-01-15',
      endDate: '2024-12-31',
      clientId: client1.id,
      assignedLawyerId: lawyer1.id,
      riskLevel: 'medium',
      priority: 'high',
      tags: ['software', 'licensing', 'enterprise'],
    },
  });

  const contract2 = await prisma.contract.create({
    data: {
      id: uuidv4(),
      title: 'Real Estate Purchase Agreement',
      description: 'Residential property purchase agreement',
      contractType: 'Real Estate',
      status: 'UNDER_REVIEW',
      value: 750000,
      currency: 'USD',
      startDate: '2024-02-01',
      endDate: '2024-03-15',
      clientId: client2.id,
      assignedLawyerId: lawyer2.id,
      riskLevel: 'low',
      priority: 'medium',
      tags: ['real-estate', 'purchase', 'residential'],
    },
  });

  const contract3 = await prisma.contract.create({
    data: {
      id: uuidv4(),
      title: 'Energy Supply Contract',
      description: 'Long-term renewable energy supply agreement',
      contractType: 'Supply Agreement',
      status: 'DRAFT',
      value: 1500000,
      currency: 'USD',
      startDate: '2024-03-01',
      endDate: '2027-02-28',
      clientId: client3.id,
      assignedLawyerId: lawyer1.id,
      riskLevel: 'high',
      priority: 'urgent',
      tags: ['energy', 'supply', 'renewable', 'long-term'],
    },
  });

  // Create sample matters
  const matter1 = await prisma.matter.create({
    data: {
      id: uuidv4(),
      title: 'Corporate Restructuring',
      description: 'Assistance with corporate restructuring and compliance',
      matterType: 'Corporate',
      status: 'Active',
      priority: 'high',
      clientId: client1.id,
      assignedLawyerId: lawyer1.id,
      startDate: '2024-01-01',
      billingRate: 450.0,
    },
  });

  const matter2 = await prisma.matter.create({
    data: {
      id: uuidv4(),
      title: 'Estate Planning',
      description: 'Comprehensive estate planning services',
      matterType: 'Estate',
      status: 'Active',
      priority: 'medium',
      clientId: client2.id,
      assignedLawyerId: lawyer2.id,
      startDate: '2024-01-15',
      billingRate: 350.0,
    },
  });

  // Create sample tasks
  await prisma.task.createMany({
    data: [
      {
        id: uuidv4(),
        title: 'Review licensing terms',
        description: 'Review and update software licensing terms',
        status: 'Pending',
        priority: 'high',
        dueDate: new Date('2024-02-15'),
        assignedTo: lawyer1.id,
        matterId: matter1.id,
      },
      {
        id: uuidv4(),
        title: 'Prepare will documents',
        description: 'Draft will and testament documents',
        status: 'In Progress',
        priority: 'medium',
        dueDate: new Date('2024-02-10'),
        assignedTo: lawyer2.id,
        matterId: matter2.id,
      },
      {
        id: uuidv4(),
        title: 'Contract review meeting',
        description: 'Schedule meeting to review energy supply contract',
        status: 'Pending',
        priority: 'urgent',
        dueDate: new Date('2024-02-05'),
        assignedTo: lawyer1.id,
      },
    ],
  });

  // Create sample activities
  await prisma.activity.createMany({
    data: [
      {
        id: uuidv4(),
        type: 'contract',
        title: 'Contract Created',
        description: 'Software Licensing Agreement created for Acme Corporation',
        priority: 'medium',
        userId: lawyer1.id,
        relatedId: contract1.id,
        relatedType: 'contract',
      },
      {
        id: uuidv4(),
        type: 'client',
        title: 'New Client Added',
        description: 'Jane Doe added as new individual client',
        priority: 'low',
        userId: lawyer2.id,
        relatedId: client2.id,
        relatedType: 'client',
      },
      {
        id: uuidv4(),
        type: 'matter',
        title: 'Matter Opened',
        description: 'Estate Planning matter opened for Jane Doe',
        priority: 'medium',
        userId: lawyer2.id,
        relatedId: matter2.id,
        relatedType: 'matter',
      },
    ],
  });

  // Create sample time entries
  await prisma.timeEntry.createMany({
    data: [
      {
        id: uuidv4(),
        description: 'Client consultation and initial assessment',
        hours: 2.5,
        rate: 450.0,
        date: new Date('2024-01-15'),
        matterId: matter1.id,
        userId: lawyer1.id,
        billable: true,
      },
      {
        id: uuidv4(),
        description: 'Document review and analysis',
        hours: 1.5,
        rate: 350.0,
        date: new Date('2024-01-16'),
        matterId: matter2.id,
        userId: lawyer2.id,
        billable: true,
      },
      {
        id: uuidv4(),
        description: 'Legal research on estate tax implications',
        hours: 3.0,
        rate: 350.0,
        date: new Date('2024-01-17'),
        matterId: matter2.id,
        userId: lawyer2.id,
        billable: true,
      },
    ],
  });

  console.log('✅ Database seeding completed successfully!');
  console.log(`👤 Admin User: admin@counselflow.com / admin123`);
  console.log(`👨‍💼 Lawyer 1: john.smith@counselflow.com / lawyer123`);
  console.log(`👩‍💼 Lawyer 2: emily.davis@counselflow.com / lawyer123`);
  console.log(`🏢 Created ${await prisma.client.count()} clients`);
  console.log(`📄 Created ${await prisma.contract.count()} contracts`);
  console.log(`⚖️ Created ${await prisma.matter.count()} matters`);
  console.log(`✅ Created ${await prisma.task.count()} tasks`);
}

main()
  .catch(e => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
