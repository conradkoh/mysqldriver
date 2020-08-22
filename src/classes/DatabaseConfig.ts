import { DatabaseConnection } from './DatabaseConnection';
export interface DatabaseConfig {
  database: string;
  createConnection: () => DatabaseConnection;
}
