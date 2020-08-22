export interface IConnection {
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
