import { describe, expect, test } from '@jest/globals';
import { Quote } from '.././../../model';
import { getPriceMap } from '../ratio';

interface PriceMapExpectation {
    symbol: string;
    price: number;
}

describe('getPriceMap', () => {
    test.each([
        [
            [
                {
                    symbol: 'first',
                    askPrice: 1_000,
                    askSize: 1,
                    bidPrice: 1_000,
                    bidSize: 1,
                    bidAskSpread: 0,
                    timestamp: 10,
                },
            ],
            [
                {
                    symbol: 'first',
                    price: 1_000,
                },
            ],
        ],
        [
            [
                {
                    symbol: 'first',
                    askPrice: 1_000,
                    askSize: 1,
                    bidPrice: 2,
                    bidSize: 1,
                    bidAskSpread: 0,
                    timestamp: 10,
                },
                {
                    symbol: 'second',
                    askPrice: 9.23,
                    askSize: 1,
                    bidPrice: 23,
                    bidSize: 1,
                    bidAskSpread: 0,
                    timestamp: 10,
                },
            ],
            [
                {
                    symbol: 'first',
                    price: 1_000,
                },
                {
                    symbol: 'second',
                    price: 9.23,
                },
            ],
        ],
        [
            [
                {
                    symbol: 'first',
                    askPrice: 1_000,
                    askSize: 1,
                    bidPrice: 2,
                    bidSize: 1,
                    bidAskSpread: 0,
                    timestamp: 10,
                },
                {
                    symbol: 'first',
                    askPrice: 9.23,
                    askSize: 1,
                    bidPrice: 23,
                    bidSize: 1,
                    bidAskSpread: 0,
                    timestamp: 12,
                },
            ],
            [
                {
                    symbol: 'first',
                    price: 9.23,
                },
            ],
        ],
    ])('getPriceMap()', (quotes: Quote[], expectations: PriceMapExpectation[]) => {
        const prices = getPriceMap(quotes);
        expect(prices.size).toEqual(expectations.length);
        expectations.forEach(({ symbol, price }) => expect(prices.get(symbol)).toEqual(price));
    });
});
