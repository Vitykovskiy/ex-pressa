import { buildBotWebAppLinks } from './bot-links';

describe('buildBotWebAppLinks', () => {
  it('maps primary and extra tokens to customer, barista, admin web apps', () => {
    expect(
      buildBotWebAppLinks({
        primaryToken: 'customer',
        extraTokens: 'barista,admin',
        customerUrl: 'https://customer.example.com',
        baristaUrl: 'https://barista.example.com',
        adminUrl: 'https://admin.example.com',
      }),
    ).toEqual([
      {
        token: 'customer',
        appUrl: 'https://customer.example.com',
        buttonText: 'Открыть меню',
      },
      {
        token: 'barista',
        appUrl: 'https://barista.example.com',
        buttonText: 'Открыть панель баристы',
      },
      {
        token: 'admin',
        appUrl: 'https://admin.example.com',
        buttonText: 'Открыть панель администратора',
      },
    ]);
  });

  it('deduplicates repeated tokens', () => {
    expect(
      buildBotWebAppLinks({
        primaryToken: 'customer',
        extraTokens: 'customer,barista',
        customerUrl: 'https://customer.example.com',
        baristaUrl: 'https://barista.example.com',
      }),
    ).toEqual([
      {
        token: 'customer',
        appUrl: 'https://customer.example.com',
        buttonText: 'Открыть меню',
      },
      {
        token: 'barista',
        appUrl: 'https://barista.example.com',
        buttonText: 'Открыть панель баристы',
      },
    ]);
  });
});

