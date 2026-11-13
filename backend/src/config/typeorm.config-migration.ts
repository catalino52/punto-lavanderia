import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
const envFilePath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envFilePath });

console.log('Migration Configuration:');
console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`Port: ${process.env.DB_PORT || '5432'}`);
console.log(`Database: ${process.env.DB_DATABASE || 'laundry'}`);
console.log(`Username: ${process.env.DB_USERNAME || 'postgres'}`);

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE || 'laundry',
  entities: [path.join(__dirname, '..', 'modules', '**', 'entities', '*.entity.{ts,js}')],
  migrations: [path.join(__dirname, '..', 'initial-migrations', '*.{ts,js}')],
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: true,
  ssl: process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
    : false,
});

export default dataSource; 
