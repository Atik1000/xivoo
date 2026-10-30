import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CatalogController } from './catalog.controller';
import { CouponsController } from './coupons.controller';
import { OrdersController } from './orders.controller';
import { StatsController } from './stats.controller';
import { StoreService } from './store.service';

@Module({
  controllers: [AuthController, CatalogController, CouponsController, OrdersController, StatsController],
  providers: [StoreService, AuthService],
})
export class AppModule {}
