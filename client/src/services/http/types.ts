export interface ApiErrorPayload {
  message?: string;
  errors?: unknown;
  [key: string]: unknown;
}
