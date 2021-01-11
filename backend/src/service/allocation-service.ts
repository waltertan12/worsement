import { Allocation } from '../model';

export const flattenAllocations = (allocations: Allocation[]): Allocation[] => {
    const total = allocations.reduce((aggregate, { ratio }) => (aggregate += ratio), 0);

    return allocations.reduce((aggregate, { name, equity, ratio }) => {
        if (typeof equity === 'string') {
            aggregate.push({
                name,
                equity,
                ratio: ratio / total,
            });

            return aggregate;
        }

        flattenAllocations(equity).forEach(({ ratio: childRatio, equity, name: childName }) =>
            aggregate.push({
                equity,
                name: childName || name,
                ratio: (ratio * childRatio) / total,
            }),
        );

        return aggregate;
    }, [] as Allocation[]);
};
