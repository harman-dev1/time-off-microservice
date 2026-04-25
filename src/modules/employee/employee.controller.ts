import { Controller, Get, Param } from '@nestjs/common';
import { EmployeeService } from './employee.service';

@Controller('/api/v1/employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  // 📌 Get balance
  @Get(':id/balance')
  getBalance(@Param('id') id: string) {
    return this.employeeService.getBalance(id);
  }

  // 📌 Get ledger
  @Get(':id/ledger')
  getLedger(@Param('id') id: string) {
    return this.employeeService.getLedger(id);
  }
}