export interface BotWebAppLink {
  token: string;
  appUrl: string;
  buttonText: string;
}

export interface BotLinkEnv {
  primaryToken?: string;
  extraTokens?: string;
  customerUrl?: string;
  baristaUrl?: string;
  adminUrl?: string;
}

export function resolveWebAppUrls(
  botWebAppUrl?: string,
  webAppUrlList?: string,
): { customerUrl?: string; adminUrl?: string; baristaUrl?: string } {
  const urls = (webAppUrlList ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    customerUrl: botWebAppUrl?.trim() || urls[0],
    adminUrl: urls[1],
    baristaUrl: urls[2],
  };
}

function splitCsv(value?: string): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function buildBotWebAppLinks(env: BotLinkEnv): BotWebAppLink[] {
  const tokens = [env.primaryToken ?? '', ...splitCsv(env.extraTokens)].filter(
    (token, index, items) => Boolean(token) && items.indexOf(token) === index,
  );

  const links: Array<BotWebAppLink | null> = [
    env.customerUrl
      ? {
          token: tokens[0] ?? '',
          appUrl: env.customerUrl.trim(),
          buttonText: 'Открыть меню',
        }
      : null,
    env.baristaUrl
      ? {
          token: tokens[1] ?? '',
          appUrl: env.baristaUrl.trim(),
          buttonText: 'Открыть панель баристы',
        }
      : null,
    env.adminUrl
      ? {
          token: tokens[2] ?? '',
          appUrl: env.adminUrl.trim(),
          buttonText: 'Открыть панель администратора',
        }
      : null,
  ];

  return links.filter((link): link is BotWebAppLink => Boolean(link?.token));
}
