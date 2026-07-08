import { PrismaClient, ProductCategory, ProductSize, Extraingredient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting custom database seed...');

  // 1. Create default categories in the Category model if they don't exist
  console.log('Seeding categories...');
  const pizzaCategory = await prisma.category.upsert({
    where: { slug: 'pizza' },
    update: {},
    create: {
      name: 'Pizza',
      slug: 'pizza',
    },
  });

  const classicCategory = await prisma.category.upsert({
    where: { slug: 'classic' },
    update: {},
    create: {
      name: 'Classic',
      slug: 'classic',
    },
  });

  console.log('Seeded categories:', { pizzaCategory, classicCategory });

  // 2. Create the default Product linked to ProductCategory and categorySlug if it doesn't exist
  console.log('Seeding default products...');
  
  // We use upsert on slug to prevent creating duplicate products during multiple seed runs.
  const defaultProduct = await prisma.product.upsert({
    where: { slug: 'margherita-pizza' },
    update: {},
    create: {
      slug: 'margherita-pizza',
      name: 'Margherita Pizza',
      description: 'Classic Margherita with fresh mozzarella, tomato sauce, basil, and a drizzle of olive oil.',
      image: 'https://res.cloudinary.com/dht3leofo/image/upload/v1716153850/margherita.jpg', // safe placeholder image
      basePrice: 12.99,
      category: ProductCategory.CLASSIC,
      categorySlug: 'classic',
      order: 1,
      sizes: {
        create: [
          { name: ProductSize.SMALL, price: 0 },
          { name: ProductSize.MEDIUM, price: 3.5 },
          { name: ProductSize.LARGE, price: 6.0 },
        ],
      },
      extras: {
        create: [
          { name: Extraingredient.CHEESE, price: 1.5 },
          { name: Extraingredient.MUSHROOMS, price: 1.0 },
        ],
      },
    },
  });

  console.log('Seeded product:', defaultProduct);
  console.log('Database seeding complete!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('Error during database seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
