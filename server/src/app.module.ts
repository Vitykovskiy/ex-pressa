import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TelegrafModule } from 'nestjs-telegraf';
import { CustomersModule } from './modules/customers/customers.module';
import { MenuModule } from './modules/menu/menu.module';
import { CartModule } from './modules/cart/cart.module';

const envFileCandidates = [
  join(__dirname, '..', '..', '.env'),
  join(__dirname, '..', '..', '..', '.env'),
  join(process.cwd(), '.env'),
  join(process.cwd(), '..', '.env'),
];

const configEnvFilePath = envFileCandidates.filter(
  (filePath, index, array) => array.indexOf(filePath) === index && existsSync(filePath),
);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: configEnvFilePath.length ? configEnvFilePath : undefined,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: config.get<'sqlite'>('DB_TYPE', 'sqlite'),
        database: config.get<string>('DB_PATH', 'data/db.sqlite'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const token = config.get<string>('TELEGRAM_BOT_TOKEN', '');
        if (!token) {
          throw new Error('TELEGRAM_BOT_TOKEN is missing in .env');
        }
        return { token };
      },
    }),
    CustomersModule,
    MenuModule,
    CartModule,
  ],
})
export class AppModule {}
