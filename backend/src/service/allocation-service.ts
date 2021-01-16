import { Allocation } from '../model';

export const flattenAllocations = (allocations: Allocation[]): Allocation[] => {
    const total = allocations.reduce((aggregate, { ratio }) => (aggregate += ratio), 0);

    return allocations.reduce((aggregate, allocation) => {
        const { asset, ratio } = allocation;
        if (typeof asset === 'string') {
            aggregate.push(allocation);

            return aggregate;
        }

        flattenAllocations(asset).forEach((childAllocation) => {
            aggregate.push({
                ...childAllocation,
                ratio: (ratio * childAllocation.ratio) / total,
            });
        });

        return aggregate;
    }, [] as Allocation[]);
};
