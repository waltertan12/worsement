import { EntityRepository, Repository } from 'typeorm';
import { Allocation } from '../entity/allocation';

@EntityRepository(Allocation)
export class AllocationRepository extends Repository<Allocation> {
    public findByIndex(index: number): Promise<Allocation[]> {
        return this.find({ where: { indexId: index }, order: { id: 'ASC' } });
    }
}
