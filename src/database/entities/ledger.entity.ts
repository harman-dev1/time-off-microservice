import { Entity, Column, PrimaryColumn } from "typeorm";
@Entity()
export class Ledger {
  @PrimaryColumn()
  ledger_id: string;

  @Column()
  employee_id: string;

  @Column()
  change_type: string;

  @Column()
  change_value: number;

  @Column()
  source: string;

  @Column()
  timestamp: Date;
}