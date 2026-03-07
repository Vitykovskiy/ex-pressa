import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { TelegrafModule } from 'nestjs-telegraf';
import { AuthModule, AuthGuard } from '@modules/auth';
import { RolesGuard } from '@modules/auth/roles.guard';
import { CartModule } from '@modules/cart';
import { CatalogModule } from '@modules/catalog';
import { OrdersModule } from '@modules/orders';
import { UsersModule } from '@modules/users';
import { SeedModule } from '@modules/seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // .env.test (если есть) перекрывает значения из .env для тестовой БД
      envFilePath:
        process.env.NODE_ENV === 'test' ? ['.env.test', '.env'] : ['.env'],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: Number(config.get<string>('DB_PORT', '5432')),
        username: config.get<string>('DB_USER', 'postgres'),
        password: config.get<string>('DB_PASS', 'postgres'),
        database: config.get<string>('DB_NAME', 'ex-pressa'),
        autoLoadEntities: true,
        synchronize: true,
      }),
    }),
    TelegrafModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const token = config.get<string>('TELEGRAM_BOT_TOKEN', '');
        if (!token) {
          throw new Error('TELEGRAM_BOT_TOKEN отсутствует в .env');
        }
        return { token };
      },
    }),
    UsersModule,
    AuthModule,
    CatalogModule,
    CartModule,
    OrdersModule,
    SeedModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
