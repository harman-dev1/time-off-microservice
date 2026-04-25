import { Entity, Column, PrimaryColumn } from "typeorm";
@Entity()
export class TimeOffRequest {
  @PrimaryColumn()
  request_id: string;

  @Column()
  employee_id: string;

  @Column()
  requested_days: number;

  @Column()
  status: string;

  @Column()
  created_at: Date;

  @Column()
  updated_at: Date;
}