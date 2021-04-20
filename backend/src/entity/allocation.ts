import { Column, Entity, Index, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Portfolio } from './portfolio';

@Entity()
export class Allocation {
    @PrimaryGeneratedColumn({ unsigned: true })
    id: number;

    @ManyToOne(() => Portfolio, (portfolio) => portfolio.allocations)
    portfolio: Portfolio;

    @Column({ unsigned: true, nullable: true })
    parentId?: number;

    @Column({ nullable: true })
    equity?: string;

    @Column({ nullable: true })
    description: string;

    @Column('real')
    ratio: number;

    @Column('timestamp with time zone', { nullable: false, default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column('timestamp with time zone', {
        nullable: false,
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP',
    })
    updatedAt: Date;
}
