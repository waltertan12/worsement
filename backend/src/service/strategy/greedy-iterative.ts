import { Buy, Day, Allocation, Market, OrderRequest, OrderType, Position, Side, TimeInForce, Quote } from '../../model';
import { Balancer } from './types';

interface Diff {
    asset: string;
    idealRatio: number;
    actualRatio: number;
    diff: number;
}

const getOrderKey = (
    symbol: string,
    side: Side = Buy,
    timeInForce: TimeInForce = Day,
    type: OrderType = Market,
): string => `${symbol}-${side}-${type}-${timeInForce}`;

/**
 * @param Position[]          A list of positions currently held
 * @param Map<string, number> A map of current asset prices keyed by symbol
 * @param OrderRequest[]      A list of orders to be placed
 * @return Map<string, number> A map of ratios keyed by an asset symbol
 */
const getRatios = (
    positions: Position[],
    currentPrices: Map<string, number>,
    orders: Map<string, OrderRequest>,
): Map<string, number> => {
    let orderValue = 0;
    orders.forEach((order) => {
        orderValue += order.quantity * (currentPrices.get(order.symbol) ?? 0);
    });
    const totalMarketValue =
        positions.reduce((total: number, position: Position) => total + position.marketValue, 0) + orderValue;

    const marketValues = new Map<string, number>();
    positions.forEach(({ symbol, marketValue }) =>
        marketValues.set(symbol, (marketValues.get(symbol) || 0) + marketValue),
    );
    orders.forEach(({ symbol, quantity }) => {
        marketValues.set(symbol, (marketValues.get(symbol) || 0) + (currentPrices.get(symbol) ?? 0) * quantity);
    });
    const ratios = new Map<string, number>();
    marketValues.forEach((marketValue, symbol) => {
        ratios.set(symbol, marketValue / totalMarketValue);
    });

    return ratios;
};

const findRatioForAllocation = (allocation: Allocation, ratios: Map<string, number>): number => {
    const { asset } = allocation;
    if (Array.isArray(asset)) {
        return asset.reduce(
            (currentRatio, childAllocation) => currentRatio + findRatioForAllocation(childAllocation, ratios),
            0,
        );
    }

    if (!ratios.has(asset)) {
        return 0;
    }

    return ratios.get(asset) ?? 0;
};

const findDiffs = (
    allocations: Allocation[],
    positions: Position[],
    currentPrices: Map<string, number>,
    orders: Map<string, OrderRequest>,
): Diff[] => {
    const total = allocations.reduce((sum, allocation) => sum + allocation.ratio, 0);
    const ratios = getRatios(positions, currentPrices, orders);
    return allocations.map((allocation) => {
        const { name, asset, ratio } = allocation;
        const idealRatio = ratio / total;
        const actualRatio = findRatioForAllocation(allocation, ratios);
        return {
            asset: typeof asset === 'string' ? asset : name ?? '',
            idealRatio,
            actualRatio,
            diff: idealRatio - actualRatio,
        };
    });
};

const getAssetPriorities = (
    allocations: Allocation[],
    positions: Position[],
    currentPrices: Map<string, number>,
    orders: Map<string, OrderRequest>,
): string[] => {
    if (allocations.length === 0) {
        return [];
    }

    return findDiffs(allocations, positions, currentPrices, orders)
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

            // TODO: Only ignore equities if the account is taxable
            // Ignore equities that are balanced or achieve balance by being sold
            if (diff <= 0 && !Array.isArray(allocation.asset)) {
                return equities;
            }

            if (Array.isArray(allocation.asset)) {
                return equities.concat(getAssetPriorities(allocation.asset, positions, currentPrices, orders));
            }

            return equities.concat([allocation.asset]);
        }, []);
};

/**
 * Greedy algorithm that balances by buying or selling the most inbalanced assets
 *
 * Pros:
 *  - Pretty good at balancing
 * Cons:
 *  - O(n) where n is the amount of cash...
 *  - It should probably only be used if the available cash is 10,000 or less
 */
export const greedyIterative: Balancer = (
    cash: number,
    allocations: Allocation[],
    quotes: Quote[],
    positions: Position[],
    orders: OrderRequest[],
): OrderRequest[] => {
    console.time('greedy.iterative');
    const currentPrices = quotes.reduce((priceMap, quote) => {
        priceMap.set(quote.symbol, quote.askPrice);
        return priceMap;
    }, new Map<string, number>());
    const newOrderRequests = orders.reduce((map, order) => {
        map.set(order.symbol, {
            ...order,
            quantity:
                (map.get(getOrderKey(order.symbol, order.side, order.timeInForce, order.type))?.quantity ?? 0) +
                order.quantity,
        });
        return map;
    }, new Map<string, OrderRequest>());

    let i = 0;
    // Let's cap the iterations just in case...
    while (i < 10 ** 8) {
        const assets = getAssetPriorities(allocations, positions, currentPrices, newOrderRequests);

        let cost = 0;
        for (let k = 0; k < assets.length; k += 1) {
            const symbol = assets[k];
            // Add a 0.5% price buffer
            const price = (currentPrices.get(symbol) || 0) * 1.005;
            if (typeof price !== 'number' || price <= 0) {
                continue;
            }

            const step = 1;
            // // Optimization to limit number of iterations
            // const limits = [
            //     [100_000_000, 1_000],
            //     [10_000_000, 100],
            //     [1_000_000, 10],
            //     [100_000, 5],
            //     [10_000, 2],
            // ];
            // for (let l = 0; l < limits.length; l += 1) {
            //     // TODO: Check the actual cash diff
            //     const [cashRequirement, nextStep] = limits[l];
            //     if (cash < cashRequirement) {
            //         continue;
            //     }

            //     if (cash - (price * nextStep) <= 0) {
            //         continue;
            //     }

            //     step = nextStep;
            //     break;
            // }

            if (cash - price * step <= 0) {
                continue;
            }

            cost = price * step;

            const orderKey = getOrderKey(symbol);
            const newOrderRequest = newOrderRequests.get(orderKey);
            const newQuantity = step + (newOrderRequest?.quantity ?? 0);
            newOrderRequests.set(orderKey, {
                symbol,
                type: Market,
                timeInForce: Day,
                quantity: newQuantity,
                side: Buy,
            });

            break;
        }

        if (cost === 0) {
            console.log({
                strategy: 'greedy.iterative',
                action: 'No more purchases possible',
                cash,
                iterations: i,
                orders: newOrderRequests,
                diffs: findDiffs(allocations, positions, currentPrices, newOrderRequests),
            });
            break;
        } else {
            cash -= cost;
        }

        i += 1;
    }

    console.timeEnd('greedy.iterative');

    return Array.from(newOrderRequests.values());
};
