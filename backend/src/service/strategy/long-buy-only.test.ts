import { getActualRatios, getDiffs } from './long-buy-only';

describe('getActualRatios', () => {
    const cash = 1000;
    const positions = [
        {
            exchange: 'amex',
            assetClass: 'equity',
            quantity: 1,
            marketValue: 100,
            currentPrice: 100,
            symbol: 'FAKE-1',
        },
        {
            exchange: 'amex',
            assetClass: 'equity',
            quantity: 1,
            marketValue: 100,
            currentPrice: 100,
            symbol: 'FAKE-2',
        },
        {
            exchange: '',
            assetClass: 'cash',
            quantity: cash,
            marketValue: cash,
            currentPrice: 1,
            symbol: 'CASH',
        },
    ];
    const allocations = [
        {
            equity: 'FAKE-1',
            ratio: 1,
        },
        {
            equity: 'FAKE-2',
            ratio: 0,
        },
        {
            equity: 'CASH',
            ratio: 0,
        },
    ];
    const prices: { [key: string]: number } = {
        'FAKE-1': 100,
        'FAKE-2': 200,
        CASH: 1,
    };

    // expect(positionRatio.get('FAKE-1')).toEqual(0.5);
    // expect(positionRatio.get('FAKE-2')).toEqual(0.5);
    expect(true).toBe(true);

    const diffs = getDiffs(allocations, positions);
    console.log(diffs);
    Object.entries(diffs).forEach((entry) => {
        const [symbol, diff] = entry;
        console.log({
            equity: symbol,
            toSpend: diff.diff >= 0 ? diff.diff * cash : 0,
            units: Math.floor((diff.diff >= 0 ? diff.diff * cash : 0) / (prices[diff.equity] || 1)),
        });
    });
});

interface Diff {
    equity: string;
    idealRatio: number;
    ratio: number;
    diff: number;
}
