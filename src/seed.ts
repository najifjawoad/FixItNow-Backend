import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma";

async function main() {
  console.log("Seeding FixItNow database...");

  // 1. Create Admin User
  const adminPassword = await bcrypt.hash("12345", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin123@gmail.com" },
    update: { password: adminPassword },
    create: {
      name: "Platform Admin",
      email: "admin123@gmail.com",
      password: adminPassword,
      phone: "+1 800-555-0100",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("Admin created:", admin.email);

  // 2. Create Customer User
  const customerPassword = await bcrypt.hash("password123", 10);
  const customer = await prisma.user.upsert({
    where: { email: "customer@fixitnow.com" },
    update: {},
    create: {
      name: "John Customer",
      email: "customer@fixitnow.com",
      password: customerPassword,
      phone: "+1 555-0199",
      role: "CUSTOMER",
      status: "ACTIVE",
    },
  });
  console.log("Customer created:", customer.email);

  // 3. Create Technician 1 User & Profile
  const techPassword = await bcrypt.hash("password123", 10);
  const techUser1 = await prisma.user.upsert({
    where: { email: "tech@fixitnow.com" },
    update: {},
    create: {
      name: "Alexander Wright",
      email: "tech@fixitnow.com",
      password: techPassword,
      phone: "+1 555-0288",
      role: "TECHNICIAN",
      status: "ACTIVE",
    },
  });

  const techProfile1 = await prisma.technicianProfile.upsert({
    where: { userId: techUser1.id },
    update: {},
    create: {
      userId: techUser1.id,
      bio: "Licensed Master Electrician & HVAC Specialist with over 8 years of residential and commercial service experience.",
      experienceYears: 8,
      skills: ["Electrical", "HVAC", "Wiring", "Circuit Repair", "Panel Upgrade"],
      avgRating: 4.9,
      verified: true,
    },
  });
  console.log("Technician 1 created:", techUser1.email);

  // 4. Create Technician 2 User & Profile
  const techUser2 = await prisma.user.upsert({
    where: { email: "tech2@fixitnow.com" },
    update: {},
    create: {
      name: "Sarah Jenkins",
      email: "tech2@fixitnow.com",
      password: techPassword,
      phone: "+1 555-0377",
      role: "TECHNICIAN",
      status: "ACTIVE",
    },
  });

  const techProfile2 = await prisma.technicianProfile.upsert({
    where: { userId: techUser2.id },
    update: {},
    create: {
      userId: techUser2.id,
      bio: "Expert Plumbing & Piping Specialist specializing in emergency leak repair, drain clearing, and fixture installation.",
      experienceYears: 6,
      skills: ["Plumbing", "Pipe Repair", "Drain Clearing", "Fixture Install", "Water Heater"],
      avgRating: 4.8,
      verified: true,
    },
  });
  console.log("Technician 2 created:", techUser2.email);

  // 5. Create Categories
  const catElectrical = await prisma.category.upsert({
    where: { name: "Electrical Services" },
    update: {},
    create: {
      name: "Electrical Services",
      description: "Wiring, circuit breaker repair, lighting installation, and safety inspections.",
    },
  });

  const catPlumbing = await prisma.category.upsert({
    where: { name: "Plumbing & Piping" },
    update: {},
    create: {
      name: "Plumbing & Piping",
      description: "Leak repair, drain unblocking, faucet installation, and pipe maintenance.",
    },
  });

  const catHvac = await prisma.category.upsert({
    where: { name: "HVAC & AC Service" },
    update: {},
    create: {
      name: "HVAC & AC Service",
      description: "Air conditioner repair, duct cleaning, heating system maintenance.",
    },
  });

  const catCarpentry = await prisma.category.upsert({
    where: { name: "Carpentry & Repairs" },
    update: {},
    create: {
      name: "Carpentry & Repairs",
      description: "Furniture assembly, door lock repair, shelving, and handyman fixes.",
    },
  });
  console.log("Categories created.");

  // 6. Create Services
  const srv1 = await prisma.service.create({
    data: {
      technicianId: techProfile1.id,
      categoryId: catElectrical.id,
      title: "Electrical Circuit Breaker & Panel Upgrade",
      description: "Full diagnostic of electrical panel, breaker replacement, and safety grounding certification.",
      price: 120.0,
      durationMinutes: 90,
    },
  });

  const srv2 = await prisma.service.create({
    data: {
      technicianId: techProfile1.id,
      categoryId: catElectrical.id,
      title: "Emergency Wiring & Outlet Repair",
      description: "Troubleshooting short circuits, repairing sparky wall outlets, and fixture re-wiring.",
      price: 85.0,
      durationMinutes: 60,
    },
  });

  const srv3 = await prisma.service.create({
    data: {
      technicianId: techProfile1.id,
      categoryId: catHvac.id,
      title: "AC Unit Deep Cleaning & Coolant Inspection",
      description: "Filter replacement, coil washing, refrigerant level check, and thermostat calibration.",
      price: 95.0,
      durationMinutes: 75,
    },
  });

  const srv4 = await prisma.service.create({
    data: {
      technicianId: techProfile2.id,
      categoryId: catPlumbing.id,
      title: "Emergency Pipe Leak Repair & Sealing",
      description: "Immediate response for bursting pipes, high-pressure sealing, and joint replacement.",
      price: 110.0,
      durationMinutes: 60,
    },
  });

  const srv5 = await prisma.service.create({
    data: {
      technicianId: techProfile2.id,
      categoryId: catPlumbing.id,
      title: "Kitchen Faucet & Drain Unblocking",
      description: "Clogged sink restoration, faucet replacement, garbage disposal maintenance.",
      price: 75.0,
      durationMinutes: 45,
    },
  });

  console.log("Services created.");

  // 7. Create Availability Slots
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(0, 0, 0, 0);

  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 3);
  nextWeek.setHours(0, 0, 0, 0);

  await prisma.availability.createMany({
    data: [
      { technicianId: techProfile1.id, date: tomorrow, startTime: "09:00", endTime: "12:00" },
      { technicianId: techProfile1.id, date: tomorrow, startTime: "13:00", endTime: "16:00" },
      { technicianId: techProfile1.id, date: dayAfter, startTime: "10:00", endTime: "13:00" },
      { technicianId: techProfile1.id, date: nextWeek, startTime: "14:00", endTime: "17:00" },
      { technicianId: techProfile2.id, date: tomorrow, startTime: "08:30", endTime: "11:30" },
      { technicianId: techProfile2.id, date: tomorrow, startTime: "14:00", endTime: "17:00" },
      { technicianId: techProfile2.id, date: dayAfter, startTime: "09:00", endTime: "12:00" },
    ],
  });

  console.log("Availability slots created.");
  console.log("Database successfully seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
