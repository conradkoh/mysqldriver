import { DatabaseConfig } from '../interfaces/DatabaseConfig';
import { DatabaseConnection } from '../interfaces/DatabaseConnection';
export class ConnectionProvider {
  private cfg: DatabaseConfig;
  private timeoutDelay = 500;
  private connection: DatabaseConnection;
  constructor(cfg: DatabaseConfig) {
    this.cfg = cfg;
    this.connection = cfg.createConnection();
    this.connection.on('error', this.handleDisconnect.bind(this));
  }
  private handleDisconnect() {
    this.connection = this.cfg.createConnection();
    this.connection.on('error', this.handleDisconnect.bind(this));
  }
  async getConnection(): Promise<DatabaseConnection> {
    if (this.connection.isDisconnected) {
      this.connection = this.cfg.createConnection();
    }
    return this.connection;
  }
}

export type ConnectionEvent = 'error' | null;
