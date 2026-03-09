import { parse, validate } from '@tma.js/init-data-node';
import type { TelegramInitDataVerifyResult } from './types';

export function parseBoolean(value?: string | null): boolean {
  if (!value) {
    return false;
  }

  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase().trim());
}

export function verifyTelegramInitData(
  initData: string,
  botToken: string,
  maxAgeSeconds = 60 * 60,
): TelegramInitDataVerifyResult {
  if (!initData) {
    return { ok: false, error: 'initData пустой' };
  }

  if (!botToken) {
    return { ok: false, error: 'botToken пустой' };
  }

  try {
    validate(initData, botToken, { expiresIn: maxAgeSeconds });

    const data = parse(initData);

    return { ok: true, data };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : 'initData некорректный',
    };
  }
}

export function extractTelegramInitData(
  authHeader?: string,
  bodyInitData?: unknown,
): string {
  if (typeof authHeader === 'string' && authHeader.startsWith('tma ')) {
    const initData = authHeader.slice(4).trim();
    if (initData) {
      return initData;
    }
  }

  if (typeof bodyInitData === 'string') {
    return bodyInitData.trim();
  }

  return '';
}
