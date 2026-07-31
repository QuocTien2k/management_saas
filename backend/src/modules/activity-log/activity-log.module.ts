import { Module } from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';
import { ActivityLogController } from './activity-log.controller';
import { ActivityLogListener } from './listeners/activity-log.listener';

@Module({
  controllers: [ActivityLogController],
  providers: [ActivityLogService, ActivityLogListener],
  exports: [ActivityLogService],
})
export class ActivityLogModule {}
