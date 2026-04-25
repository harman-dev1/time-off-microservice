import { Controller, Get, Post, Body, Param } from '@nestjs/common';

/**
 * SIMPLE MOCK HCM SERVICE
 * ----------------------
 * Lightweight simulation of external HR system
 */

interface DeductRequest {
  employee_id: string;
  days: number;
}

@Controller('/hcm/api/v1')
export class HcmController {
  private mockBalances: Record<string, number> = {
    'emp-1': 10,
    'emp-2': 15,
  };

  /**
   * Get HCM balance
   */
  @Get('balance/:id')
  getBalance(@Param('id') id: string) {
    const balance = this.mockBalances[id];

    if (balance === undefined) {
      return {
        employee_id: id,
        balance: 0,
        message: 'Employee not found in HCM',
      };
    }

    return {
      employee_id: id,
      balance,
    };
  }

  /**
   * Deduct leave in HCM
   */
  @Post('deduct')
  deduct(@Body() body: DeductRequest) {
    const { employee_id, days } = body;

    const current = this.mockBalances[employee_id];

    if (current === undefined) {
      return {
        status: 404,
        success: false,
        message: 'Employee not found',
      };
    }

    if (days > current) {
      return {
        status: 400,
        success: false,
        message: 'Insufficient HCM balance',
      };
    }

    this.mockBalances[employee_id] -= days;

    return {
      status: 200,
      success: true,
      employee_id,
      remaining_balance: this.mockBalances[employee_id],
    };
  }

  /**
   * Health check
   */
  @Get('health')
  health() {
    return {
      status: 'UP',
      service: 'MOCK_HCM',
      timestamp: new Date(),
    };
  }
}
