import { Module } from '@nestjs/common';
import { HolidaysService } from './holidays.service';
import { HolidaysController } from './holidays.controller';
import { PublicHolidaysController } from './public-holidays.controller';
import { PublicNoticesController } from './public-notices.controller';

@Module({
  controllers: [HolidaysController, PublicHolidaysController, PublicNoticesController],
  providers: [HolidaysService],
  exports: [HolidaysService],
})
export class HolidaysModule {}
