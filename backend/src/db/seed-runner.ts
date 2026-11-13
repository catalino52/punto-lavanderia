import { DataSource } from 'typeorm';
import { config } from '../config/database.config';
import { v4 as uuidv4 } from 'uuid';
import { seedCustomers } from './seeds/customer.seed';

// Add category seed data
const seedCategories = [
  {
    id: uuidv4(),
    name: 'Lavado',
    description: 'Servicios de lavado de prendas'
  },
  {
    id: uuidv4(),
    name: 'Planchado',
    description: 'Servicios de planchado de prendas'
  },
  {
    id: uuidv4(),
    name: 'Especial',
    description: 'Servicios especiales de lavandería'
  }
];

// Update service seed data to include categoryId
const seedServices = [
  {
    id: uuidv4(),
    name: 'Lavado por pieza',
    description: 'Lavado de prendas por unidad.',
    price: 90,
    unit: 'pcs',
    estimatedTime: 24,
    isActive: true,
    categoryId: seedCategories[0].id
  },
  {
    id: uuidv4(),
    name: 'Lavado y secado por kg',
    description: 'Lavado y secado de prendas por kilogramo.',
    price: 60,
    unit: 'kg',
    estimatedTime: 24,
    isActive: true,
    categoryId: seedCategories[0].id
  },
  {
    id: uuidv4(),
    name: 'Lavado en seco',
    description: 'Limpieza especializada de prendas por unidad.',
    price: 250,
    unit: 'pcs',
    estimatedTime: 72,
    isActive: true,
    categoryId: seedCategories[2].id
  },
  {
    id: uuidv4(),
    name: 'Planchado',
    description: 'Planchado de prendas por unidad.',
    price: 50,
    unit: 'pcs',
    estimatedTime: 24,
    isActive: true,
    categoryId: seedCategories[1].id
  },
  {
    id: uuidv4(),
    name: 'Edredón',
    description: 'Lavado de edredones por unidad.',
    price: 450,
    unit: 'pcs',
    estimatedTime: 48,
    isActive: true,
    categoryId: seedCategories[2].id
  },
  {
    id: uuidv4(),
    name: 'Limpieza de zapatos',
    description: 'Limpieza de calzado por par.',
    price: 300,
    unit: 'pair',
    estimatedTime: 48,
    isActive: true,
    categoryId: seedCategories[2].id
  }
];

async function seedDatabase() {
  console.log('Iniciando la carga de datos iniciales...');
  
  // Initialize database connection
  const dataSource = new DataSource({
    ...config,
    synchronize: false,
  } as any);
  
  try {
    await dataSource.initialize();
    console.log('Conexión a la base de datos establecida.');
    
    // Check if service_categories table exists
    const categoriesTable = await dataSource.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'service_categories'
      )`
    );
    
    if (!categoriesTable[0].exists) {
      console.log('La tabla de categorías de servicio no existe; se creará.');
      
      // Create service_categories table if it doesn't exist
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "service_categories" (
          "id" UUID PRIMARY KEY,
          "name" VARCHAR(255) NOT NULL,
          "description" TEXT,
          "created_at" TIMESTAMP DEFAULT NOW(),
          "updated_at" TIMESTAMP DEFAULT NOW()
        )
      `);
      
      console.log('Tabla de categorías de servicio creada.');
    }
    
    // Check if we already have categories
    const existingCategories = await dataSource.query('SELECT COUNT(*) FROM service_categories');
    const categoryCount = parseInt(existingCategories[0].count);
    
    if (categoryCount > 0) {
      console.log(`Se encontraron ${categoryCount} categorías de servicio; se omite la carga inicial.`);
    } else {
      // Insert category seed data
      for (const category of seedCategories) {
        await dataSource.query(
          `INSERT INTO service_categories (id, name, description, created_at, updated_at)
           VALUES ($1, $2, $3, NOW(), NOW())`,
           [category.id, category.name, category.description]
        );
      }
      
      console.log(`Se cargaron ${seedCategories.length} categorías de servicio.`);
    }
    
    // Continue with services table
    // Check if services table exists
    const servicesTable = await dataSource.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'services'
      )`
    );
    
    if (!servicesTable[0].exists) {
      console.log('La tabla de servicios no existe; se creará.');
      
      // Create services table if it doesn't exist
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "services" (
          "id" UUID PRIMARY KEY,
          "name" VARCHAR(255) NOT NULL,
          "description" TEXT,
          "price" DECIMAL(10,2) NOT NULL,
          "unit" VARCHAR(50) NOT NULL DEFAULT 'kg',
          "estimatedTime" INTEGER,
          "is_active" BOOLEAN DEFAULT true,
          "category_id" UUID REFERENCES service_categories(id),
          "created_at" TIMESTAMP DEFAULT NOW(),
          "updated_at" TIMESTAMP DEFAULT NOW()
        )
      `);
      
      console.log('Tabla de servicios creada.');
    }
    
    // Check if we already have services
    const existingServices = await dataSource.query('SELECT COUNT(*) FROM services');
    const serviceCount = parseInt(existingServices[0].count);
    
    if (serviceCount > 0) {
      console.log(`Se encontraron ${serviceCount} servicios; se omite la carga inicial.`);
    } else {
      // Insert seed data
      for (const service of seedServices) {
        await dataSource.query(
          `INSERT INTO services (id, name, description, price, unit, "estimatedTime", "is_active", "category_id", created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())`,
           [service.id, service.name, service.description, service.price, service.unit, service.estimatedTime, service.isActive, service.categoryId]
        );
      }
      
      console.log(`Se cargaron ${seedServices.length} servicios.`);
    }
    
    // Seed customers
    console.log('Verificando y cargando los clientes...');
    // Check if customers table exists
    const customersTable = await dataSource.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'customers'
      )`
    );

    if (!customersTable[0].exists) {
      console.log('La tabla de clientes no existe; se creará.');
      
      // Create customers table if it doesn't exist
      await dataSource.query(`
        CREATE TABLE IF NOT EXISTS "customers" (
          "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          "name" VARCHAR(255) NOT NULL,
          "phone" VARCHAR(20),
          "address" TEXT,
          "email" VARCHAR(255),
          "created_at" TIMESTAMP DEFAULT NOW(),
          "updated_at" TIMESTAMP DEFAULT NOW()
        )
      `);
      
      console.log('Tabla de clientes creada.');
    }

    // Call the customer seed function
    await seedCustomers(dataSource);
    
    // Close the connection
    await dataSource.destroy();
    console.log('Conexión a la base de datos cerrada.');
    
  } catch (error) {
    console.error('Error durante la carga de datos iniciales:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase(); 