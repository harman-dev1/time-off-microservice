import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmployeeBalance } from './database/entities/employee-balance.entity';
import { TimeOffRequest } from './database/entities/timeoff-request.entity';
import { Ledger } from './database/entities/ledger.entity';
import { SyncMetadata } from './database/entities/sync-metadata.entity';

import { TimeOffController } from './modules/timeoff/timeoff.controller';
import { TimeOffService } from './modules/timeoff/timeoff.service';

import { HcmController } from './modules/hcm/hcm.controller';
import { SyncController } from './modules/sync/sync.controller';

import { ManagerController } from './modules/manager/manager.controller';
import { ManagerService } from './modules/manager/manager.service';

import { EmployeeController } from './modules/employee/employee.controller';
import { EmployeeService } from './modules/employee/employee.service';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      autoLoadEntities: true,
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      EmployeeBalance,
      TimeOffRequest,
      Ledger,
      SyncMetadata,
    ]),
  ],

  controllers: [
    TimeOffController,
    HcmController,
    SyncController,
    ManagerController,
    EmployeeController,
  ],

  providers: [
    TimeOffService,
    ManagerService,
    EmployeeService,
  ],
})
export class AppModule {}