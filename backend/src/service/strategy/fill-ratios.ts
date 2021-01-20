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

export const fillRatios: Balancer = (
    cash: number,
    allocations: Allocation[],
    quotes: Quote[],
    positions: Position[],
    orders: OrderRequest[],
): OrderRequest[] => {
    console.time('fill-ratios');
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

    // TODO: implement

    console.timeEnd('fill-ratios');

    return [];
};
