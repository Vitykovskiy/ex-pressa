import { InitDataParsed } from '@tma.js/init-data-node';

export type TelegramInitDataVerifyResult =
  | { ok: true; data: InitDataParsed }
  | { ok: false; error: string };

export interface SessionPayload {
  sub: number;
  tgId?: string;
}

export function isSessionPayload(value: unknown): value is SessionPayload {
  return (
    !!value &&
    typeof value === 'object' &&
    typeof value['sub'] === 'number' &&
    (!value['tgId'] || typeof value['tgId'] === 'number')
  );
}
