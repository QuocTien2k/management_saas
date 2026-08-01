import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { TaskGateway } from './task.gateway';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dqt.developer',
      signOptions: { expiresIn: '15m' },
    }),
    NotificationModule,
  ],
  controllers: [TaskController],
  providers: [TaskService, TaskGateway],
  exports: [TaskService],
})
export class TaskModule {}
