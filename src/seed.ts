import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma";

async function main() {
  console.log("Seeding FixItNow database with Bangladeshi Demo Data...");

  // 1. Admin User
  const adminPassword = await bcrypt.hash("12345", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin123@gmail.com" },
    update: { password: adminPassword },
    create: {
      name: "Platform Admin",
      email: "admin123@gmail.com",
      password: adminPassword,
      phone: "+880 1700-000000",
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log("Admin created:", admin.email);

  // 2. Customer User
  const customerPassword = await bcrypt.hash("password123", 10);
  const customer = await prisma.user.upsert({
    where: { email: "customer@fixitnow.com" },
    update: {},
    create: {
      name: "Tariqul Islam",
      email: "customer@fixitnow.com",
      password: customerPassword,
      phone: "+880 1711-998877",
      role: "CUSTOMER",
      status: "ACTIVE",
    },
  });
  console.log("Customer created:", customer.email);

  // 3. Technician 1: Engr. Tanvir Ahmed (Electrical)
  const techPassword = await bcrypt.hash("password123", 10);
  const techUser1 = await prisma.user.upsert({
    where: { email: "tanvir.electric@gmail.com" },
    update: {},
    create: {
      name: "Engr. Tanvir Ahmed",
      email: "tanvir.electric@gmail.com",
      password: techPassword,
      phone: "+880 1712-345678",
      role: "TECHNICIAN",
      status: "ACTIVE",
    },
  });

  const techProfile1 = await prisma.technicianProfile.upsert({
    where: { userId: techUser1.id },
    update: {},
    create: {
      userId: techUser1.id,
      bio: "Certified Electrical Engineer with 9 years of experience in Dhaka. Specialist in DB box installation, home rewiring, IPS/UPS setup, and emergency short-circuit repair.",
      experienceYears: 9,
      skills: ["Electrical", "IPS & Generator", "Circuit Repair", "DB Box Setup", "Substation"],
      avgRating: 4.9,
      verified: true,
    },
  });

  // 4. Technician 2: Md. Rafiqul Islam (Plumbing)
  const techUser2 = await prisma.user.upsert({
    where: { email: "rafiq.plumbing@gmail.com" },
    update: {},
    create: {
      name: "Md. Rafiqul Islam",
      email: "rafiq.plumbing@gmail.com",
      password: techPassword,
      phone: "+880 1819-876543",
      role: "TECHNICIAN",
      status: "ACTIVE",
    },
  });

  const techProfile2 = await prisma.technicianProfile.upsert({
    where: { userId: techUser2.id },
    update: {},
    create: {
      userId: techUser2.id,
      bio: "Professional plumber serving Gulshan, Banani, and Dhanmondi areas. Expert in sanitary fitting, water pump repair, pipeline leak fixing, and gas line inspection.",
      experienceYears: 7,
      skills: ["Plumbing", "Sanitary Fitting", "Water Pump", "Pipe Leak Repair", "Gas Line"],
      avgRating: 4.8,
      verified: true,
    },
  });

  // 5. Technician 3: Kazi Mahmud Hasan (HVAC / AC)
  const techUser3 = await prisma.user.upsert({
    where: { email: "mahmud.acservice@gmail.com" },
    update: {},
    create: {
      name: "Kazi Mahmud Hasan",
      email: "mahmud.acservice@gmail.com",
      password: techPassword,
      phone: "+880 1911-234567",
      role: "TECHNICIAN",
      status: "ACTIVE",
    },
  });

  const techProfile3 = await prisma.technicianProfile.upsert({
    where: { userId: techUser3.id },
    update: {},
    create: {
      userId: techUser3.id,
      bio: "Certified Inverter AC technician with 8 years of experience. Specialist in jet wash master service, gas refill (R32/R410a), compressor repair, and split AC installation.",
      experienceYears: 8,
      skills: ["HVAC", "AC Master Wash", "Gas Refill", "Compressor Repair", "Inverter AC"],
      avgRating: 4.9,
      verified: true,
    },
  });

  // 6. Technician 4: Naimur Rahman (Carpentry)
  const techUser4 = await prisma.user.upsert({
    where: { email: "naimur.carpenter@gmail.com" },
    update: {},
    create: {
      name: "Naimur Rahman",
      email: "naimur.carpenter@gmail.com",
      password: techPassword,
      phone: "+880 1615-998877",
      role: "TECHNICIAN",
      status: "ACTIVE",
    },
  });

  const techProfile4 = await prisma.technicianProfile.upsert({
    where: { userId: techUser4.id },
    update: {},
    create: {
      userId: techUser4.id,
      bio: "Skilled artisan with 10 years of experience in custom door fitting, modular kitchen cabinet crafting, furniture repair, and door lock installation.",
      experienceYears: 10,
      skills: ["Carpentry", "Kitchen Cabinet", "Door Lock Repair", "Furniture Polish", "Woodwork"],
      avgRating: 5.0,
      verified: true,
    },
  });

  console.log("Technicians created.");

  // 7. Categories
  const catElectrical = await prisma.category.upsert({
    where: { name: "Electrical Services" },
    update: {},
    create: {
      name: "Electrical Services",
      description: "Wiring, circuit breaker repair, DB box installation, and safety grounding inspections.",
    },
  });

  const catPlumbing = await prisma.category.upsert({
    where: { name: "Plumbing & Piping" },
    update: {},
    create: {
      name: "Plumbing & Piping",
      description: "Water pump repair, concealed leak sealing, sanitary fittings, and gas line inspection.",
    },
  });

  const catHvac = await prisma.category.upsert({
    where: { name: "HVAC & AC Service" },
    update: {},
    create: {
      name: "HVAC & AC Service",
      description: "Split & Inverter AC jet wash, refrigerant gas refill, and compressor repair.",
    },
  });

  const catCarpentry = await prisma.category.upsert({
    where: { name: "Carpentry & Handyman" },
    update: {},
    create: {
      name: "Carpentry & Handyman",
      description: "Modular kitchen cabinet crafting, door lock fitting, and custom woodwork polish.",
    },
  });

  console.log("Categories created.");

  // 8. Services
  await prisma.service.createMany({
    data: [
      {
        technicianId: techProfile1.id,
        categoryId: catElectrical.id,
        title: "DB Box Installation & Full House Rewiring",
        description: "Full diagnostic of distribution box, breaker replacement, and safety grounding certification.",
        price: 35.0,
        durationMinutes: 120,
      },
      {
        technicianId: techProfile1.id,
        categoryId: catElectrical.id,
        title: "IPS & Generator Line Connection & Servicing",
        description: "Instant Power Supply (IPS) wiring, battery fluid check, and automatic changeover switch setup.",
        price: 25.0,
        durationMinutes: 90,
      },
      {
        technicianId: techProfile1.id,
        categoryId: catElectrical.id,
        title: "Emergency Short-Circuit Repair & Load Balancing",
        description: "Troubleshooting short circuits, repairing sparky wall sockets, and main line load balancing.",
        price: 18.0,
        durationMinutes: 60,
      },
      {
        technicianId: techProfile2.id,
        categoryId: catPlumbing.id,
        title: "Water Submersible Pump Repair & Pipeline Unblocking",
        description: "Roof tank motor repair, line pressure adjustment, and main underground pipe unblocking.",
        price: 30.0,
        durationMinutes: 90,
      },
      {
        technicianId: techProfile2.id,
        categoryId: catPlumbing.id,
        title: "Sanitary Fitting & Concealed Pipe Leak Sealing",
        description: "Bathroom commode, basin, concealed shower mixer installation, and high-pressure leak sealing.",
        price: 22.0,
        durationMinutes: 75,
      },
      {
        technicianId: techProfile3.id,
        categoryId: catHvac.id,
        title: "Inverter AC Master Jet Wash & Filter Cleaning",
        description: "High-pressure chemical wash of indoor & outdoor units, drain pipe clearing, and airflow optimization.",
        price: 20.0,
        durationMinutes: 60,
      },
      {
        technicianId: techProfile3.id,
        categoryId: catHvac.id,
        title: "AC Gas Refill (R32 / R410a) & Copper Pipe Repair",
        description: "Refrigerant pressure check, flare nut leak sealing, copper pipe insulation, and gas top-up.",
        price: 45.0,
        durationMinutes: 60,
      },
      {
        technicianId: techProfile4.id,
        categoryId: catCarpentry.id,
        title: "Modular Kitchen Cabinet Repair & Lock Fitting",
        description: "Soft-close hinge adjustment, hydraulic stay lift installation, and security lock replacement.",
        price: 20.0,
        durationMinutes: 60,
      },
    ],
  });

  console.log("Services created.");

  // 9. Availability Slots
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);
  dayAfter.setHours(0, 0, 0, 0);

  await prisma.availability.createMany({
    data: [
      { technicianId: techProfile1.id, date: tomorrow, startTime: "09:00", endTime: "12:00" },
      { technicianId: techProfile1.id, date: tomorrow, startTime: "14:00", endTime: "17:00" },
      { technicianId: techProfile2.id, date: tomorrow, startTime: "08:30", endTime: "11:30" },
      { technicianId: techProfile2.id, date: dayAfter, startTime: "10:00", endTime: "13:00" },
      { technicianId: techProfile3.id, date: tomorrow, startTime: "10:00", endTime: "13:00" },
      { technicianId: techProfile3.id, date: dayAfter, startTime: "15:00", endTime: "18:00" },
      { technicianId: techProfile4.id, date: tomorrow, startTime: "11:00", endTime: "14:00" },
    ],
  });

  console.log("Availability slots created.");
  console.log("Database successfully seeded with Bangladeshi demographic data!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
