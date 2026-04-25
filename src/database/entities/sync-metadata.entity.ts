import { Entity, Column, PrimaryColumn } from "typeorm";
@Entity()
export class SyncMetadata {
  @PrimaryColumn()
  id: string;

  @Column()
  last_batch_sync_at: Date;

  @Column()
  last_hcm_version: string;

  @Column()
  sync_status: string;
}