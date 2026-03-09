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

  const urls = [
    env.customerUrl?.trim(),
    env.baristaUrl?.trim(),
    env.adminUrl?.trim(),
  ].filter(Boolean) as string[];

  const labels = [
    'Открыть меню',
    'Открыть панель баристы',
    'Открыть панель администратора',
  ];

  return tokens.slice(0, urls.length).map((token, index) => ({
    token,
    appUrl: urls[index],
    buttonText: labels[index],
  }));
}

