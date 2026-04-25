import { Controller, Post, Param } from '@nestjs/common';
import { ManagerService } from './manager.service';

@Controller('api/v1/manager')
export class ManagerController {
  constructor(private readonly managerService: ManagerService) {}

  @Post('approve/:request_id')
  approve(@Param('request_id') requestId: string) {
    return this.managerService.approveRequest(requestId);
  }
}