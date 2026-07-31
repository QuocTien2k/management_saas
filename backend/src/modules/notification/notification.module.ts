import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { NotificationListener } from './listeners/notification.listener';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dqt.developer',
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    NotificationGateway,
    NotificationListener,
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
