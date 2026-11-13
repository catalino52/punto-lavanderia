const { SnakeNamingStrategy } = require('typeorm-naming-strategies');
const { DataSource } = require('typeorm');
const path = require('path');
require('dotenv').config();

module.exports = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [path.join(__dirname, 'src', 'modules', '**', 'entities', '*.entity.{ts,js}')],
  // The historical migrations in src/database/migrations describe the original
  // schema and conflict with the current application's UUID/auth entities.
  // Keep this fresh-database baseline in its own chain.
  migrations: [path.join(__dirname, 'src', 'initial-migrations', '*.{ts,js}')],
  migrationsTableName: 'migrations',
  synchronize: false,
  ssl: process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false' }
    : false,
  logging: true,
  namingStrategy: new SnakeNamingStrategy()
}); 
