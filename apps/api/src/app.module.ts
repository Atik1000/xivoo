import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CatalogController } from './catalog.controller';
import { PersistenceService } from './persistence.service';
import { CouponsController } from './coupons.controller';
import { OrdersController } from './orders.controller';
import { StatsController } from './stats.controller';
import { StoreService } from './store.service';

@Module({
  controllers: [AuthController, CatalogController, CouponsController, OrdersController, StatsController],
  providers: [PersistenceService, StoreService, AuthService],
})
export class AppModule {}
