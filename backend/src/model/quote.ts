export interface Quote {
    symbol: string;
    askPrice: number;
    askSize: number;
    bidPrice: number;
    bidSize: number;
    bidAskSpread: number;
    timestamp: number;
}

export const makeQuote = (
    symbol: string,
    askPrice: number,
    askSize: number,
    bidPrice: number,
    bidSize: number,
    timestamp: number,
): Quote => ({
    symbol,
    askPrice,
    askSize,
    bidPrice,
    bidSize,
    bidAskSpread: Math.abs(askPrice - bidPrice),
    timestamp,
});
