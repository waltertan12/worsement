import {
    Buy,
    Day,
    Allocation,
    Market,
    Order,
    OrderRequest,
    OrderType,
    Position,
    Side,
    TimeInForce,
    Quote,
} from '../../model';

export const getRatios = (
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

export const getPriceMap = (quotes: Quote[]): Map<string, number> => {
    const timestamps = new Map<string, number>();
    return quotes.reduce((priceMap, quote) => {
        const { symbol, askPrice, timestamp } = quote;
        const previousTimestamp = timestamps.get(symbol);
        // Take the latest quote
        if (!previousTimestamp || previousTimestamp < timestamp) {
            if (previousTimestamp) {
                console.warn(`Received duplicate quote for ${symbol}`);
            }

            priceMap.set(symbol, askPrice);
        }

        return priceMap;
    }, new Map<string, number>());
};
