import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { EmployeeBalance } from 'src/database/entities/employee-balance.entity';
import { TimeOffRequest } from 'src/database/entities/timeoff-request.entity';
import { Ledger } from 'src/database/entities/ledger.entity';

@Injectable()
export class TimeOffService {
  private idempotency = new Map<string, any>();

  constructor(
    @InjectRepository(EmployeeBalance)
    private balanceRepo: Repository<EmployeeBalance>,

    @InjectRepository(TimeOffRequest)
    private reqRepo: Repository<TimeOffRequest>,

    @InjectRepository(Ledger)
    private ledgerRepo: Repository<Ledger>,
  ) {}

  async createRequest(dto: {
    request_id: string;
    employee_id: string;
    requested_days: number;
  }) {
    // 1. Idempotency check
    if (this.idempotency.has(dto.request_id)) {
      return this.idempotency.get(dto.request_id);
    }

    // 2. Fetch balance
    const balance = await this.balanceRepo.findOneBy({
      employee_id: dto.employee_id,
    });

    if (!balance) {
      throw new HttpException('BALANCE_NOT_FOUND', HttpStatus.NOT_FOUND);
    }

    // 3. Validate balance BEFORE mutation (IMPORTANT FIX)
    if (balance.available_balance < dto.requested_days) {
      throw new HttpException(
        'INSUFFICIENT_BALANCE',
        HttpStatus.CONFLICT,
      );
    }

    // 4. Create request FIRST (safer ordering)
    const request = this.reqRepo.create({
      request_id: dto.request_id,
      employee_id: dto.employee_id,
      requested_days: dto.requested_days,
      status: 'PENDING',
      created_at: new Date(),
      updated_at: new Date(),
    });

    await this.reqRepo.save(request);

    // 5. Reserve balance
    balance.available_balance -= dto.requested_days;
    await this.balanceRepo.save(balance);

    // 6. Ledger entry (RESERVE)
    await this.ledgerRepo.save({
      ledger_id: Date.now().toString(),
      employee_id: dto.employee_id,
      change_type: 'RESERVE',
      change_value: -dto.requested_days,
      source: 'READYON',
      timestamp: new Date(),
    });

    // 7. Response
    const response = {
      request_id: dto.request_id,
      status: 'PENDING',
    };

    this.idempotency.set(dto.request_id, response);

    return response;
  }
}