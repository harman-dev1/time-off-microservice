import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EmployeeBalance } from './database/entities/employee-balance.entity';

async function seedDatabase(balanceRepo) {
  const existing = await balanceRepo.find();

  if (existing.length === 0) {
    await balanceRepo.save({
      employee_id: 'emp-1',
      location_id: 'l1',
      available_balance: 2,
      version: 1,
      last_synced_at: new Date(),
    });

    console.log('✅ Seeded initial employee balance');
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 👉 Get repository from Nest container
  const balanceRepo = app.get(getRepositoryToken(EmployeeBalance));

  // 👉 Seed database
  await seedDatabase(balanceRepo);

  await app.listen(3000);
}
bootstrap();