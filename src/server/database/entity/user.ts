import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 10, unique: true })
  username: string;

  @Column({ type: "varchar", length: 50, unique: true })
  email: string;

  @Column({ type: "varchar", length: 25 })
  password: string;

  @Column({ type: "date", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @Column({
    type: "date",
    default: () => "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;
}
