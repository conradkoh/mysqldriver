enum ConnectionStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
}

export class Database {
  private cfg: DatabaseConfig;
  private provider: ConnectionProvider;
  constructor(cfg: DatabaseConfig) {
    this.cfg = cfg;
    this.provider = new ConnectionProvider(cfg);
  }
}

export class ConnectionProvider {
  private cfg: DatabaseConfig;
  private connectionStatus: ConnectionStatus;
  private timeoutDelay = 500;
  private connection: DatabaseConnection;
  constructor(cfg: DatabaseConfig) {
    this.cfg = cfg;
    this.connection = cfg.createConnection();
    this.connection.on('error', this.handleDisconnect.bind(this));
    this.connectionStatus = ConnectionStatus.CONNECTED;
  }
  private handleDisconnect() {
    this.connectionStatus = ConnectionStatus.DISCONNECTED;
    this.connection = this.cfg.createConnection();
    this.connection.on('error', this.handleDisconnect.bind(this));
    this.connectionStatus = ConnectionStatus.CONNECTED;
  }
  async getConnection(): Promise<DatabaseConnection> {
    if (this.connectionStatus == ConnectionStatus.DISCONNECTED) {
      await new Promise((resolve, reject) => {
        setTimeout(() => resolve(), this.timeoutDelay);
      });
      return await this.getConnection();
    }
    return this.connection;
  }
}

export interface DatabaseConfig {
  createConnection: () => DatabaseConnection;
}
export interface DatabaseConnection {
  destroy(): void;
  on(event: ConnectionEvent, handler: Function): void;
  query(
    query: string,
    values: any[],
    callback: (err: Error | null, rows: any[]) => void
  ): void;
  end(callback: (err: Error | null) => void): void;
}

export type ConnectionEvent = 'error' | null;
