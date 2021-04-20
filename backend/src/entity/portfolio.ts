import { Entity, Column, Index, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Allocation } from './allocation';

@Entity()
export class Portfolio {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @Index()
    @Column({ unsigned: true, nullable: true })
    userId?: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => Allocation, (allocation) => allocation.portfolio, { onDelete: 'CASCADE' })
    allocations: Allocation[];

    @Column('timestamp with time zone', { nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column('timestamp with time zone', {
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
}
