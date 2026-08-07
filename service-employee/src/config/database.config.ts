import { registerAs } from '@nestjs/config';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

export const databaseConfig = registerAs('database', () => ({
  host: process.env.MYSQL_HOST ?? 'localhost',
  port: Number.parseInt(process.env.MYSQL_PORT ?? '3306', 10),
  username: process.env.MYSQL_USERNAME ?? 'root',
  password: process.env.MYSQL_PASSWORD ?? '',
  database: process.env.MYSQL_DATABASE ?? 'db_employee',
  synchronize: process.env.MYSQL_SYNCHRONIZE === 'true',
  logging: process.env.MYSQL_LOGGING === 'true',
}));

export const dataSourceOptions: DataSourceOptions = {
  type: 'mysql',
  host: process.env.MYSQL_HOST ?? 'localhost',
  port: Number.parseInt(process.env.MYSQL_PORT ?? '3306', 10),
  username: process.env.MYSQL_USERNAME ?? 'root',
  password: process.env.MYSQL_PASSWORD ?? '',
  database: process.env.MYSQL_DATABASE ?? 'db_employee',
  synchronize: process.env.MYSQL_SYNCHRONIZE === 'true',
  logging: process.env.MYSQL_LOGGING === 'true',
  entities: [__dirname + '/../**/persistence/*.entity{.ts,.js}'],
  migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
  migrationsTableName: 'migrations',
};

const AppDataSource = new DataSource(dataSourceOptions);
export default AppDataSource;
