import { Allocation, Order, Position, Quote } from '../../model';
import { Brokerage } from '../brokerage';
import { Strategy, StrategyResult } from './index';
// import { flattenAllocations } from '../../service/allocation-service';

interface Diff {
    // an asset or an asset class
    asset: string;
    idealRatio: number;
    ratio: number;
    diff: number;
}

const getPositionMap = (positions: Position[]): Map<string, Position> =>
    positions.reduce((indexedPositions, position) => {
        const previousPosition = indexedPositions.get(position.symbol);
        if (!previousPosition) {
            indexedPositions.set(position.symbol, position);
            return indexedPositions;
        }

        indexedPositions.set(previousPosition.symbol, {
            ...previousPosition,
            quantity: previousPosition.quantity + position.quantity,
        });

        return indexedPositions;
    }, new Map());

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
    const marketValueMap = new Map<string, number>();

    return positions.reduce((assetMap, { symbol, marketValue }) => {
        marketValueMap.set(symbol, (marketValueMap.get(symbol) || 0) + marketValue);
        assetMap.set(symbol, (marketValueMap.get(symbol) || 0) / totalMarketValue);

        return assetMap;
    }, new Map<string, number>());
};

const findCurrentRatio = (allocation: Allocation, ratios: Map<string, number>): number => {
    const { asset } = allocation;
    if (Array.isArray(asset)) {
        return asset.reduce(
            (currentRatio, childAllocation) => currentRatio + findCurrentRatio(childAllocation, ratios),
            0,
        );
    }

    if (!ratios.has(asset)) {
        // console.warn(`Could not find ratio for ${asset}`);
        return 0;
    }

    return ratios.get(asset) ?? 0;
};

const findDiffs = (allocations: Allocation[], positions: Position[], parentRatio?: number): Map<string, Diff> => {
    const total = allocations.reduce((sum: number, allocation: Allocation) => sum + allocation.ratio, 0);
    const ratios = getActualRatios(positions);

    let diffs = new Map<string, Diff>();
    allocations.forEach((allocation) => {
        const { asset, ratio: idealRatio } = allocation;
        if (Array.isArray(asset)) {
            diffs = new Map<string, Diff>([...diffs, ...findDiffs(asset, positions, idealRatio / total)]);
            return;
        }

        const ratio = ratios.get(asset) || 0;
        const nextIdealRatio = (idealRatio / total) * (parentRatio ?? 1);

        diffs.set(asset, {
            asset,
            ratio,
            idealRatio: nextIdealRatio,
            diff: nextIdealRatio - ratio,
        });
    });

    return diffs;
};

export const getEquityPriorityV2 = (allocations: Allocation[], positions: Position[]): string[] => {
    if (allocations.length === 0) {
        return [];
    }

    // Find the biggest diff
    const actualRatios = getActualRatios(positions);
    const diffs = allocations.map((allocation) => {
        const { name, asset, ratio: idealRatio } = allocation;
        const actualRatio = findCurrentRatio(allocation, actualRatios);
        return {
            asset: typeof asset === 'string' ? asset : name ?? '',
            idealRatio,
            actualRatio,
            diff: idealRatio - actualRatio,
        };
    });

    return diffs
        .sort((a, b) => {
            if (b.diff !== a.diff) {
                return b.diff - a.diff;
            }

            return b.asset > a.asset ? 1 : -1;
        })
        .reduce((equities: string[], ratioDiff) => {
            const { asset, diff } = ratioDiff;
            const allocation = allocations.find(
                (allocation) => allocation.asset === asset || allocation.name === asset,
            );
            if (!allocation) {
                return equities;
            }

            // Ignore equities that are balanced or achieve balance by being sold
            if (diff <= 0 && !Array.isArray(allocation.asset)) {
                return equities;
            }

            if (Array.isArray(allocation.asset)) {
                return equities.concat(getEquityPriority(allocation.asset, positions));
            }

            return equities.concat([allocation.asset]);
        }, []);
};

export const getEquityPriority = (allocations: Allocation[], positions: Position[]): string[] => {
    if (allocations.length === 0) {
        return [];
    }

    // Find the biggest diff
    const actualRatios = getActualRatios(positions);
    const diffs = allocations.map((allocation) => {
        const { name, asset, ratio: idealRatio } = allocation;
        const actualRatio = findCurrentRatio(allocation, actualRatios);
        return {
            asset: typeof asset === 'string' ? asset : name ?? '',
            idealRatio,
            actualRatio,
            diff: idealRatio - actualRatio,
        };
    });

    return diffs
        .sort((a, b) => {
            if (b.diff !== a.diff) {
                return b.diff - a.diff;
            }

            return b.asset > a.asset ? 1 : -1;
        })
        .reduce((equities: string[], ratioDiff) => {
            const { asset, diff } = ratioDiff;
            const allocation = allocations.find(
                (allocation) => allocation.asset === asset || allocation.name === asset,
            );
            if (!allocation) {
                return equities;
            }

            // Ignore equities that are balanced or achieve balance by being sold
            if (diff <= 0 && !Array.isArray(allocation.asset)) {
                return equities;
            }

            if (Array.isArray(allocation.asset)) {
                return equities.concat(getEquityPriority(allocation.asset, positions));
            }

            return equities.concat([allocation.asset]);
        }, []);
};

export const greedy = (
    cash: number,
    targetPortfolio: Allocation[],
    positions: Position[],
    quotes: Quote[],
): Order[] => {
    console.time('greedy');
    const nextPositions = new Map<string, Position>();
    const currentPrices = quotes.reduce((priceMap, quote) => {
        priceMap.set(quote.symbol, quote.askPrice);
        return priceMap;
    }, new Map<string, number>());

    let i = 0;
    while (i < 1_000_000) {
        const nextPositionList = positions.concat(Array.from(nextPositions.values()));
        const diffs = findDiffs(targetPortfolio, nextPositionList);

        let cost = 0;
        const priorities = getEquityPriority(targetPortfolio, nextPositionList);
        for (let k = 0; k < priorities.length; k += 1) {
            const asset = priorities[k];
            // Add a 0.5% price buffer
            const price = (currentPrices.get(asset) || 0) * 1.005;
            if (typeof price !== 'number' || price <= 0) {
                continue;
            }

            const assetDiff = diffs.get(asset);
            if (!assetDiff) {
                continue;
            }

            const { diff } = assetDiff;
            if (diff < 0 /* && !isTaxSheltered */) {
                console.log({ message: 'negative diff', diff: assetDiff });
                continue;
            }

            const availableCash = cash * (diff / 2);
            const quantities = [
                Math.ceil(availableCash / price),
                Math.round(availableCash / price),
                Math.floor(availableCash / price),
            ];
            let quantity = 0;
            for (let j = 0; j < quantities.length; j += 1) {
                const nextQuantity = quantities[j] || 0;
                if (nextQuantity === 0) {
                    continue;
                }
                if (cash - nextQuantity * price > 0) {
                    quantity = nextQuantity;
                    break;
                }
            }

            if (quantity === 0) {
                continue;
            }

            cost += quantity * price;

            const nextPosition = nextPositions.get(asset);
            const nextQuantity = quantity + (nextPosition?.quantity ?? 0);
            nextPositions.set(asset, {
                exchange: 'nyse',
                assetClass: 'some-class',
                quantity: nextQuantity,
                marketValue: nextQuantity * price,
                currentPrice: price,
                symbol: asset,
            });
        }

        if (cost === 0) {
            console.log({
                strategy: 'greedy',
                action: 'No more purchases possible',
                cash,
                iterations: i,
                // diff: findDiffs(targetPortfolio, nextPositionList),
                // ratios: getActualRatios(nextPositionList),
                positions: positions.concat(Array.from(nextPositions.values())).reduce((map, position) => {
                    map.set(position.symbol, (map.get(position.symbol) || 0) + position.quantity);
                    return map;
                }, new Map<string, number>()),
            });
            break;
        } else {
            cash -= cost;
        }

        i += 1;
    }
    console.timeEnd('greedy');
    return [];
};

export const greedyV2 = (
    cash: number,
    targetPortfolio: Allocation[],
    positions: Position[],
    quotes: Quote[],
): Order[] => {
    console.time('greedy.v2');
    const nextPositions = new Map<string, Position>();
    const currentPrices = quotes.reduce((priceMap, quote) => {
        priceMap.set(quote.symbol, quote.askPrice);
        return priceMap;
    }, new Map<string, number>());

    let i = 0;
    while (i < 1_000_000) {
        const nextPositionList = positions.concat(Array.from(nextPositions.values()));
        const diffs = findDiffs(targetPortfolio, nextPositionList);

        let cost = 0;
        const priorities = getEquityPriority(targetPortfolio, nextPositionList);
        for (let k = 0; k < priorities.length; k += 1) {
            const asset = priorities[k];
            // Add a 0.5% price buffer
            const price = (currentPrices.get(asset) || 0) * 1.005;
            if (typeof price !== 'number' || price <= 0) {
                continue;
            }

            const assetDiff = diffs.get(asset);
            if (!assetDiff) {
                continue;
            }

            const { diff } = assetDiff;
            if (diff < 0 /* && !isTaxSheltered */) {
                // console.log({ message: 'negative diff', diff: assetDiff });
                continue;
            }

            const availableCash = cash * diff;
            const roughQuantity = availableCash / price;
            const quantities = [
                // Math.ceil(roughQuantity),
                Math.round(roughQuantity),
                Math.floor(roughQuantity),
            ];
            let quantity = 0;
            for (let j = 0; j < quantities.length; j += 1) {
                const nextQuantity = quantities[j] || 0;
                if (nextQuantity === 0) {
                    continue;
                }
                if (cash - nextQuantity * price > 0) {
                    quantity = nextQuantity;
                    break;
                }
            }

            if (quantity === 0) {
                continue;
            }

            cost = quantity * price;
            cash -= cost;

            const nextPosition = nextPositions.get(asset);
            const nextQuantity = quantity + (nextPosition?.quantity ?? 0);
            nextPositions.set(asset, {
                exchange: 'nyse',
                assetClass: 'some-class',
                quantity: nextQuantity,
                marketValue: nextQuantity * price,
                currentPrice: price,
                symbol: asset,
            });
            break;
        }

        if (cost === 0) {
            console.log({
                strategy: 'greedy.v2',
                action: 'No more purchases possible',
                cash,
                iterations: i,
                // diff: findDiffs(targetPortfolio, nextPositionList),
                // ratios: getActualRatios(nextPositionList),
                positions: positions.concat(Array.from(nextPositions.values())).reduce((map, position) => {
                    map.set(position.symbol, (map.get(position.symbol) || 0) + position.quantity);
                    return map;
                }, new Map<string, number>()),
            });
            break;
        }

        i += 1;
    }
    console.timeEnd('greedy.v2');
    return [];
};

export const combo = (cash: number, targetPortfolio: Allocation[], positions: Position[], quotes: Quote[]): Order[] => {
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
