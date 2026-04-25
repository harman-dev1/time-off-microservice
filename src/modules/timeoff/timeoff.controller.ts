import { Controller, Post, Body } from "@nestjs/common";
import { TimeOffService } from './timeoff.service';

@Controller('/api/v1/timeoff')
export class TimeOffController {
  constructor(private service: TimeOffService) {}

  @Post('request')
  create(@Body() dto) {
    return this.service.createRequest(dto);
  }
}