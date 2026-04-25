import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { TimeOffRequest } from '../../database/entities/timeoff-request.entity';
import { EmployeeBalance } from '../../database/entities/employee-balance.entity';
import { Ledger } from "src/database/entities/ledger.entity";


@Injectable()
export class ManagerService {
  constructor(
    @InjectRepository(TimeOffRequest)
    private requestRepo: Repository<TimeOffRequest>,

    @InjectRepository(EmployeeBalance)
    private balanceRepo: Repository<EmployeeBalance>,

    @InjectRepository(Ledger)   // 👈 ADD HERE
    private ledgerRepo: Repository<Ledger>,
  ) { }

  async approveRequest(requestId: string) {
  // 1. Fetch request
  const request = await this.requestRepo.findOneBy({
    request_id: requestId,
  });

  if (!request) {
    throw new HttpException(
      'REQUEST_NOT_FOUND',
      HttpStatus.NOT_FOUND,
    );
  }

  if (request.status !== 'PENDING') {
    throw new HttpException(
      'INVALID_STATE',
      HttpStatus.BAD_REQUEST,
    );
  }

  // 🔥 NEW: Safety balance check (IMPORTANT FIX)
  const balance = await this.balanceRepo.findOneBy({
    employee_id: request.employee_id,
  });

  if (!balance) {
    throw new HttpException(
      'BALANCE_NOT_FOUND',
      HttpStatus.NOT_FOUND,
    );
  }

  if (balance.available_balance < request.requested_days) {
    throw new HttpException(
      'INSUFFICIENT_BALANCE',
      HttpStatus.CONFLICT,
    );
  }

  // 2. Simulate HCM call
  const hcmResponse = this.mockHcmDeduct(request.requested_days);

  if (hcmResponse.status === 200) {
    // APPROVED
    request.status = 'APPROVED';
    request.updated_at = new Date();

    await this.requestRepo.save(request);

    await this.ledgerRepo.save({
      ledger_id: Date.now().toString(),
      employee_id: request.employee_id,
      change_type: 'COMMIT',
      change_value: -request.requested_days,
      source: 'HCM',
      timestamp: new Date(),
    });

    return {
      message: 'Request approved successfully',
      request_id: requestId,
      status: 'APPROVED',
    };
  }

  // ❌ REJECTED FLOW
  balance.available_balance += request.requested_days;
  await this.balanceRepo.save(balance);

  request.status = 'REJECTED';
  request.updated_at = new Date();
  await this.requestRepo.save(request);

  await this.ledgerRepo.save({
    ledger_id: Date.now().toString(),
    employee_id: request.employee_id,
    change_type: 'ROLLBACK',
    change_value: request.requested_days,
    source: 'READYON',
    timestamp: new Date(),
  });

  return {
    message: 'Request rejected by HCM',
    request_id: requestId,
    status: 'REJECTED',
  };
}

  // 🔥 Mock HCM logic
  mockHcmDeduct(days: number) {
    if (days > 10) {
      return { status: 400 };
    }
    return { status: 200 };
  }
}