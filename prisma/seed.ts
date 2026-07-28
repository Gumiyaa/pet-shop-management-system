import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@petshop.com" },
    update: {},
    create: { name: "Admin", email: "admin@petshop.com", password: adminPassword, role: "ADMIN" },
  });

  const cashierPassword = await bcrypt.hash("cashier123", 12);
  const cashier = await prisma.user.upsert({
    where: { email: "cashier@petshop.com" },
    update: {},
    create: { name: "Cashier", email: "cashier@petshop.com", password: cashierPassword, role: "CASHIER" },
  });

  console.log("✅ Users created:", admin.email, cashier.email);

  const categories = await Promise.all([
    prisma.category.upsert({ where: { name: "Dog Food" }, update: {}, create: { name: "Dog Food", description: "Premium dog food brands" } }),
    prisma.category.upsert({ where: { name: "Cat Food" }, update: {}, create: { name: "Cat Food", description: "Premium cat food brands" } }),
    prisma.category.upsert({ where: { name: "Toys" }, update: {}, create: { name: "Toys", description: "Pet toys and entertainment" } }),
    prisma.category.upsert({ where: { name: "Accessories" }, update: {}, create: { name: "Accessories", description: "Collars, leashes, and more" } }),
    prisma.category.upsert({ where: { name: "Grooming" }, update: {}, create: { name: "Grooming", description: "Shampoo, brushes, grooming tools" } }),
    prisma.category.upsert({ where: { name: "Health" }, update: {}, create: { name: "Health", description: "Supplements and medications" } }),
  ]);

  console.log("✅ Categories created:", categories.length);

  const suppliers = await Promise.all([
    prisma.supplier.upsert({ where: { id: "sup-1" }, update: {}, create: { id: "sup-1", name: "PetCo Distributors", email: "contact@petco-dist.com", phone: "0901234567", address: "123 Supply Road, District 1" } }),
    prisma.supplier.upsert({ where: { id: "sup-2" }, update: {}, create: { id: "sup-2", name: "AnimalCare Inc", email: "orders@animalcare.com", phone: "0907654321", address: "456 Industry Blvd, District 2" } }),
    prisma.supplier.upsert({ where: { id: "sup-3" }, update: {}, create: { id: "sup-3", name: "HappyPaws Supply", email: "info@happypaws.com", phone: "0909876543", address: "789 Pet Lane, District 3" } }),
  ]);

  console.log("✅ Suppliers created:", suppliers.length);

  const productData = [
    { name: "Premium Dog Food 5kg", description: "High-quality dry dog food with chicken", price: 850000, cost: 600000, stock: 50, minStock: 10, barcode: "DOG-FD-001", categoryId: categories[0].id, supplierId: suppliers[0].id },
    { name: "Puppy Training Treats", description: "Soft treats for puppy training", price: 120000, cost: 60000, stock: 100, minStock: 20, barcode: "DOG-FD-002", categoryId: categories[0].id, supplierId: suppliers[0].id },
    { name: "Grain-Free Cat Food 3kg", description: "Premium grain-free cat food with tuna", price: 680000, cost: 450000, stock: 35, minStock: 10, barcode: "CAT-FD-001", categoryId: categories[1].id, supplierId: suppliers[1].id },
    { name: "Kitten Milk Formula", description: "Essential nutrition for kittens", price: 250000, cost: 150000, stock: 40, minStock: 10, barcode: "CAT-FD-002", categoryId: categories[1].id, supplierId: suppliers[1].id },
    { name: "Squeaky Ball Set", description: "Set of 3 colorful squeaky balls", price: 150000, cost: 60000, stock: 80, minStock: 15, barcode: "TOY-001", categoryId: categories[2].id, supplierId: suppliers[2].id },
    { name: "Rope Tug Toy", description: "Durable rope tug toy for dogs", price: 95000, cost: 40000, stock: 60, minStock: 15, barcode: "TOY-002", categoryId: categories[2].id, supplierId: suppliers[2].id },
    { name: "Leather Dog Collar (M)", description: "Genuine leather collar, medium size", price: 250000, cost: 120000, stock: 30, minStock: 8, barcode: "ACC-001", categoryId: categories[3].id, supplierId: suppliers[0].id },
    { name: "Retractable Dog Leash", description: "10-meter retractable leash for large dogs", price: 350000, cost: 180000, stock: 25, minStock: 8, barcode: "ACC-002", categoryId: categories[3].id, supplierId: suppliers[0].id },
    { name: "Cat Scratching Post", description: "Natural sisal scratching post with platform", price: 450000, cost: 250000, stock: 3, minStock: 5, barcode: "ACC-003", categoryId: categories[3].id, supplierId: suppliers[2].id },
    { name: "Pet Shampoo (Oatmeal)", description: "Gentle oatmeal shampoo for sensitive skin", price: 180000, cost: 90000, stock: 45, minStock: 12, barcode: "GRM-001", categoryId: categories[4].id, supplierId: suppliers[1].id },
    { name: "Professional Grooming Kit", description: "Complete grooming set with scissors and comb", price: 550000, cost: 300000, stock: 15, minStock: 5, barcode: "GRM-002", categoryId: categories[4].id, supplierId: suppliers[1].id },
    { name: "Joint Health Supplements (Dogs)", description: "Glucosamine supplements for joint health", price: 320000, cost: 180000, stock: 20, minStock: 8, barcode: "HLT-001", categoryId: categories[5].id, supplierId: suppliers[1].id },
    { name: "Cat Deworming Tablets", description: "Broad-spectrum dewormer for cats", price: 280000, cost: 140000, stock: 4, minStock: 10, barcode: "HLT-002", categoryId: categories[5].id, supplierId: suppliers[1].id },
  ];

  for (const p of productData) {
    await prisma.product.upsert({ where: { barcode: p.barcode }, update: {}, create: p });
  }

  console.log("✅ Products created:", productData.length);

  await prisma.store.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", name: "Happy Paws Pet Shop", address: "123 Pet Street, Animal District, Ho Chi Minh City", phone: "0901234567", email: "info@happypaws.com", taxRate: 8, currency: "VND" },
  });

  console.log("✅ Store settings created");
  console.log("🎉 Seed complete!");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });