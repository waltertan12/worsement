import { Allocation, Order, Position } from '../../model';
import { Brokerage } from '../brokerage';
import { Strategy, StrategyResult } from './index';
import { flattenAllocations } from '../../service/allocation-service';

/**
 * Return a map of positions keyed by the symbol
 */
const getAssetMap = (positions: Position[]): Map<string, number> => {
    const assetMap = new Map<string, number>();
    positions.reduce((map, { symbol, quantity }) => {
        const prevQuantity = assetMap.get(symbol) || 0;
        assetMap.set(symbol, prevQuantity + quantity);

        return assetMap;
    }, assetMap);

    return assetMap;
};

export const getActualRatios = (positions: Position[]): Map<string, number> => {
    const totalMarketValue = positions.reduce((total: number, position: Position) => total + position.marketValue, 0);
    const assetMap = new Map<string, number>();
    positions.reduce((map, { symbol, marketValue }) => {
        assetMap.set(symbol, marketValue / totalMarketValue);

        return assetMap;
    }, assetMap);

    return assetMap;
};

const getCurrentAllocation = getActualRatios;

interface AnyObject<T> {
    [key: string]: T;
    [key: number]: T;
}

interface Diff {
    equity: string;
    idealRatio: number;
    ratio: number;
    diff: number;
}
const findCurrentRatio = (allocation: Allocation, ratios: Map<string, number>): number => {
    const { equity } = allocation;
    if (Array.isArray(equity)) {
        return equity.reduce(
            (currentRatio, childAllocation) => currentRatio + findCurrentRatio(childAllocation, ratios),
            0,
        );
    }

    if (!ratios.has(equity)) {
        console.warn(`Could not find ratio for ${equity}`);
        return 0;
    }

    return ratios.get(equity) ?? 0;
};

// const findCurrentValue = (allocation: Allocation, positions: Position[]): number => {
//     const { equity } = allocation;
//     if (Array.isArray(equity)) {
//         return equity.reduce(
//             (currentValue, childAllocation) => currentValue + findCurrentValue(childAllocation, positions),
//             0,
//         );
//     }
//
//     const position = positions.get(equity);
//     if (!position) {
//         console.warn(`Could not find position ${equity}`);
//         return 0;
//     }
//
//     return position.quantity * position.currentPrice;
// };

const findDiffs = (allocations: Allocation[], positions: Position[], parentRatio?: number): Record<string, Diff> => {
    const total = allocations.reduce((sum: number, allocation: Allocation) => sum + allocation.ratio, 0);
    const ratios = getActualRatios(positions);

    let diffs: Record<string, Diff> = {};
    allocations.forEach((allocation) => {
        const { equity, ratio: idealRatio } = allocation;
        if (Array.isArray(equity)) {
            diffs = { ...diffs, ...findDiffs(equity, positions, idealRatio / total) };
            return;
        }

        const ratio = ratios.get(equity) || 0;

        diffs[equity] = {
            equity,
            ratio,
            idealRatio: (idealRatio / total) * (parentRatio ?? 1),
            diff: idealRatio - ratio,
        };
    });

    return diffs;
};

const getEquityPriority = (allocations: Allocation[], positions: Position[]): string[] => {
    const equities: string[] = [];
    if (allocations.length === 0) {
        return equities;
    }

    // Find the biggest diff
    const actualRatios = getActualRatios(positions);
    const diffs = allocations.map((allocation) => {
        const { name, equity, ratio } = allocation;
        const actualRatio = findCurrentRatio(allocation, actualRatios);
        return {
            equity: typeof equity === 'string' ? equity : name ?? '',
            idealRatio: ratio,
            actualRatio,
            diff: ratio - actualRatio,
        };
    });

    // FIXME: Handle ties to be more deterministic
    diffs.sort((a, b) => {
        if (b.diff !== a.diff) {
            return b.diff - a.diff;
        }

        return b.equity > a.equity ? 1 : -1;
    });

    diffs.forEach((diff) => {
        if (diff.diff <= 0) {
            return 0;
        }

        const allocation = allocations.find(
            (allocation) => allocation.name === diff.equity || allocation.equity === diff.equity,
        );

        if (!allocation) {
            return;
        }

        if (Array.isArray(allocation.equity)) {
            getEquityPriority(allocation.equity, positions).forEach((nextEquity) => {
                equities.push(nextEquity);
            });
            return;
        }

        equities.push(allocation.equity);
    });

    return equities;
};

const getNextDiff = (allocations: Allocation[], positions: Position[]): string | null => {
    if (allocations.length === 0) {
        return null;
    }

    // Find the biggest diff
    const actualRatios = getActualRatios(positions);
    const diffs = allocations.map((allocation) => {
        const { name, ratio } = allocation;
        const actualRatio = findCurrentRatio(allocation, actualRatios);
        return {
            equity: name,
            idealRatio: ratio,
            actualRatio,
            diff: ratio - actualRatio,
        };
    });

    // FIXME: Handle ties to be more deterministic
    diffs.sort((a, b) => b.diff - a.diff);

    const biggestDiff = diffs[0] ?? null;
    if (!biggestDiff) {
        return null;
    }

    const allocation = allocations.find(
        (allocation) => allocation.name === biggestDiff.equity || allocation.equity === biggestDiff.equity,
    ) as Allocation;

    if (Array.isArray(allocation.equity)) {
        return getNextDiff(allocation.equity, positions);
    }

    return allocation.equity;
};

export const getDiffs = (allocations: Allocation[], positions: Position[]): Record<string, Diff> => {
    const ratios = getActualRatios(positions);
    const diffFn = (map: AnyObject<Diff>, allocation: Allocation): AnyObject<Diff> => {
        const { equity, ratio: idealRatio } = allocation;
        if (Array.isArray(equity)) {
            return equity.reduce(diffFn, map);
        }

        const ratio = ratios.get(equity) || 0;

        map[equity] = {
            equity,
            idealRatio,
            ratio,
            diff: idealRatio - ratio,
        };

        return map;
    };

    const diffs = allocations.reduce(diffFn, {} as Record<string, Diff>);
    positions.forEach(({ symbol }) => {
        if (diffs.hasOwnProperty(symbol)) {
            return;
        }

        const ratio = ratios.get(symbol) || 0;
        diffs[symbol] = {
            equity: symbol,
            idealRatio: 0,
            ratio,
            diff: -ratio,
        };
    });

    return diffs;
};

export const greedy = (targetPortfolio: Allocation[], positions: Position[]): Order[] => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, prefer-const
    let nextPositions = positions.slice();

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, prefer-const
    let cash = 1000;

    const quotes = {
        VB: 150,
        VTI: 200,
        BND: 100,
        VXUS: 80,
        VOO: 250,
        SCHX: 80,
        SCHA: 50,
    };
    const sortDiffs = (diffA: Diff, diffB: Diff): number => {
        const ratioDiff = diffB.diff - diffA.diff;
        if (ratioDiff !== 0) {
            return ratioDiff;
        }

        if (diffA.equity > diffB.equity) {
            return 1;
        }

        return -1;
    };

    let i = 0;
    while (i < 2) {
        const diffs = getDiffs(targetPortfolio, nextPositions);
        console.log({ diffs: findDiffs(targetPortfolio, nextPositions), method: 'findDiffs' });
        console.log({
            equities: getEquityPriority(targetPortfolio, nextPositions),
        });
        const listDiffs = Object.values(diffs);
        listDiffs.sort(sortDiffs);

        for (let i = 0; i < listDiffs.length; i += 1) {
            const target = listDiffs[i];
            const equity = target.equity;
        }

        // console.log(listDiffs);
        i += 1;
    }
    return [];
};

class LongBuyOnly implements Strategy {
    id = 'long-buy-only';
    description = 'Strategy that only buys but tries to purchase within the constraints of an allocation';

    async execute(targetPortfolio: Allocation[], brokerage: Brokerage, dryRun = false): Promise<StrategyResult> {
        /*
        const orders = await brokerage.getOrders('open');
        if (orders.length) {
            throw new Error('Cannot execute strategy due to pending orders');
        }

        const account = await brokerage.getAccount();
        if (!account) {
            throw new Error('Cannot get account');
        }

        const flattenedAllocations = flattenAllocations(targetPortfolio);

        const availableFunds = account.cash;
        const positions = await brokerage.getPositions();
        const assetMap = getAssetMap(positions);
        assetMap.set('cash', availableFunds);

        console.log(getActualRatios(positions));

        // Get ratio diff
        // Get quotes
        // Create orders

        const nextOrders = (
            await Promise.all(
                flattenedAllocations.map(
                    async ({ equity, ratio }): Promise<Partial<Order> | null> => {
                        const quote = await brokerage.getQuote(equity as string);
                        if (!quote) {
                            console.error(`Cannot get info for ${equity}`);
                            return null;
                        }

                        const { askPrice, bidPrice } = quote;

                        const previousQuantity = assetMap.get(equity as string) || 0;
                        const quantity =
                            Math.floor((availableFunds * ratio) / Math.max(askPrice, bidPrice)) - previousQuantity;

                        if (quantity < 1) {
                            return null;
                        }

                        return {
                            symbol: quote.symbol,
                            quantity,
                            side: 'buy',
                            type: 'market',
                            timeInForce: 'day',
                        };
                    },
                ),
            )
        ).filter(Boolean) as Partial<Order>[];

        if (dryRun) {
            return {
                orders: nextOrders,
                positions: [],
                executed: false,
            };
        }

        const placedOrders = (await Promise.all(
            nextOrders.map(async (order) => await brokerage.createOrder(order)),
        )) as Order[];
         */

        return {
            orders: [], // placedOrders,
            positions: [],
            executed: true,
        };
    }
}

export const longBuyOnlyStrategy = new LongBuyOnly();
