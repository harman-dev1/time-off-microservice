import { Entity, Column, PrimaryColumn } from "typeorm";
@Entity()
export class EmployeeBalance {
  @PrimaryColumn()
  employee_id: string;

  @Column()
  location_id: string;

  @Column()
  available_balance: number;

  @Column()
  last_synced_at: Date;

  @Column()
  version: number;
}