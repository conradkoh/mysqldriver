import { DatabaseConnection } from './DatabaseConnection';
export interface DatabaseConfig {
  createConnection: () => DatabaseConnection;
}
