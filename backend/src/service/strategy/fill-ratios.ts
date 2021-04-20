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

const findLeafDiffs = (
    allocations: Allocation[],
    positions: Position[],
    currentPrices: Map<string, number>,
    orders: Map<string, OrderRequest>,
    parentRatio?: number,
): Map<string, Diff> => {
    const total = allocations.reduce((sum: number, allocation: Allocation) => sum + allocation.ratio, 0);
    const ratios = getRatios(positions, currentPrices, orders);

    let diffs = new Map<string, Diff>();
    allocations.forEach((allocation) => {
        const { asset, ratio: idealRatio } = allocation;
        if (Array.isArray(asset)) {
            diffs = new Map<string, Diff>([
                ...diffs,
                ...findLeafDiffs(asset, positions, currentPrices, orders, idealRatio / total),
            ]);
            return;
        }

        const ratio = ratios.get(asset) || 0;
        const nextIdealRatio = (idealRatio / total) * (parentRatio ?? 1);

        diffs.set(asset, {
            asset,
            actualRatio: ratio,
            idealRatio: nextIdealRatio,
            diff: nextIdealRatio - ratio,
        });
    });

    return diffs;
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

    return Array.from(findDiffs(allocations, positions, currentPrices, orders).values())
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

export const fillRatios: Balancer = (
    cash: number,
    allocations: Allocation[],
    quotes: Quote[],
    positions: Position[],
    orders: OrderRequest[],
): OrderRequest[] => {
    // console.time('fill-ratios');
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
    while (i < 10_000_000) {
        const assets = getAssetPriorities(allocations, positions, currentPrices, newOrderRequests);
        const diffs = findLeafDiffs(allocations, positions, currentPrices, newOrderRequests);

        let cost = 0;
        assets.forEach((asset) => {
            // Add a price buffer
            const price = (currentPrices.get(asset) || 0) * 1.005;
            if (typeof price !== 'number' || price <= 0) {
                return;
            }

            const assetDiff = diffs.get(asset);
            if (!assetDiff) {
                return;
            }

            const { diff } = assetDiff;
            // TODO: Handle selling assets
            if (diff <= 0 /* || !isTaxSheletered */) {
                return;
            }

            const availableCash = cash * diff;
            const roughQuantity = availableCash / price;
            const transforms = [Math.ceil, Math.floor];
            let quantity = 0;
            for (let j = 0; j < transforms.length; j += 1) {
                const nextQuantity = transforms[j](roughQuantity) || 0;
                if (nextQuantity === 0) {
                    continue;
                }

                if (cash > cost + nextQuantity * price) {
                    quantity = nextQuantity;
                    break;
                }
            }

            if (quantity === 0) {
                return;
            }

            cost += quantity * price;

            const orderKey = getOrderKey(asset);
            const newOrderRequest = newOrderRequests.get(orderKey);
            const newQuantity = quantity + (newOrderRequest?.quantity ?? 0);
            newOrderRequests.set(orderKey, {
                symbol: asset,
                type: Market,
                timeInForce: Day,
                quantity: newQuantity,
                side: Buy,
            });
        });

        // The strategy is complete if we cannot make any purchases
        if (cost === 0) {
            break;
        } else {
            cash -= cost;
        }

        i += 1;
    }

    // console.timeEnd('fill-ratios');

    return Array.from(newOrderRequests.values());
};
