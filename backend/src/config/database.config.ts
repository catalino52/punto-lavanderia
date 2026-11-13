import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Database configuration
export const config: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [__dirname + '/../modules/**/entities/*.entity{.ts,.js}'],
  synchronize: false,
  ssl: process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
    : false,
  logging: process.env.NODE_ENV === 'development',
}; 
