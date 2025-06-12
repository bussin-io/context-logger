export interface LogMethod {
  (message: string): void;
  (message: string, meta: object): void;
  (error: Error | unknown): void;
  (error: Error | unknown, meta: object): void;
}
