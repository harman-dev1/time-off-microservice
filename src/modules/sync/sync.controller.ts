import { Controller, Get, Post, Body } from '@nestjs/common';
@Controller('/api/v1/hcm/sync')
export class SyncController {
  @Post('batch')
  batchSync() {
    return { status: 'SYNC_STARTED' };
  }
}