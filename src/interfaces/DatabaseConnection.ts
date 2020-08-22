export interface DatabaseConnection {
  destroy(): void;
  on(event: ConnectionEvent, handler: Function): void;
  query(
    query: string,
    values: any[],
    callback: (err: Error | null, rows: any[]) => void
  ): void;
  end(callback: (err: Error | null) => void): void;
  isDisconnected: boolean;
}
export type ConnectionEvent = 'error' | null;
