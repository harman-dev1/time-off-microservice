import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EmployeeBalance } from 'src/database/entities/employee-balance.entity';
import { Ledger } from 'src/database/entities/ledger.entity';
import { SyncMetadata } from 'src/database/entities/sync-metadata.entity';

@Injectable()
export class SyncService {
  constructor(
    @InjectRepository(EmployeeBalance)
    private balanceRepo: Repository<EmployeeBalance>,

    @InjectRepository(Ledger)
    private ledgerRepo: Repository<Ledger>,

    @InjectRepository(SyncMetadata)
    private syncRepo: Repository<SyncMetadata>,
  ) {}

  // 🔥 MAIN SYNC FUNCTION
  async syncWithHCM() {
    // 1. Fetch data from HCM (mocked for now)
    const hcmData = await this.fetchHcmBalances();

    for (const hcmRecord of hcmData) {
      const local = await this.balanceRepo.findOneBy({
        employee_id: hcmRecord.employee_id,
      });

      // 2. If employee does not exist locally → create it
      if (!local) {
        const newBalance = this.balanceRepo.create({
          employee_id: hcmRecord.employee_id,
          location_id: hcmRecord.location_id,
          available_balance: hcmRecord.balance,
          version: 1,
          last_synced_at: new Date(),
        });

        await this.balanceRepo.save(newBalance);

        await this.writeLedger(
          hcmRecord.employee_id,
          hcmRecord.balance,
        );

        continue;
      }

      // 3. Detect mismatch
      const diff = hcmRecord.balance - local.available_balance;

      if (diff !== 0) {
        local.available_balance = hcmRecord.balance;
        local.last_synced_at = new Date();

        await this.balanceRepo.save(local);

        await this.writeLedger(local.employee_id, diff);
      }
    }

    // 4. Update sync metadata
    await this.syncRepo.save({
      id: 'global-sync',
      last_batch_sync_at: new Date(),
      sync_status: 'SUCCESS',
      last_hcm_version: 'v1',
    });

    return {
      message: 'Sync completed successfully',
      synced_at: new Date(),
    };
  }

  // 🔥 MOCK HCM SYSTEM
  async fetchHcmBalances() {
    return [
      {
        employee_id: 'emp-1',
        location_id: 'l1',
        balance: 20,
      },
      {
        employee_id: 'emp-2',
        location_id: 'l1',
        balance: 15,
      },
    ];
  }

  // 🔥 LEDGER ENTRY FOR SYNC
  async writeLedger(employeeId: string, diff: number) {
    await this.ledgerRepo.save({
      ledger_id: Date.now().toString(),
      employee_id: employeeId,
      change_type: 'SYNC_ADJUSTMENT',
      change_value: diff,
      source: 'HCM',
      timestamp: new Date(),
    });
  }
}