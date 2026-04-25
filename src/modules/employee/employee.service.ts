import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EmployeeBalance } from 'src/database/entities/employee-balance.entity';
import { Ledger } from 'src/database/entities/ledger.entity';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(EmployeeBalance)
    private balanceRepo: Repository<EmployeeBalance>,

    @InjectRepository(Ledger)
    private ledgerRepo: Repository<Ledger>,
  ) {}

  // 📌 Get current balance
  async getBalance(employeeId: string) {
    const balance = await this.balanceRepo.findOneBy({
      employee_id: employeeId,
    });

    if (!balance) {
      return {
        message: 'BALANCE_NOT_FOUND',
      };
    }

    return {
      employee_id: balance.employee_id,
      location_id: balance.location_id,
      available_balance: balance.available_balance,
      last_synced_at: balance.last_synced_at,
    };
  }

  // 📌 Get full ledger history
  async getLedger(employeeId: string) {
    const ledger = await this.ledgerRepo.find({
      where: { employee_id: employeeId },
      order: { timestamp: 'DESC' },
    });

    return {
      employee_id: employeeId,
      entries: ledger,
    };
  }
}