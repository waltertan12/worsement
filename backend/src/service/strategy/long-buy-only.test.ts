import { getActualRatios, getEquityPriority, greedy } from './long-buy-only';

describe('getActualRatios', () => {
    it('should find the correct ratios', () => {
        const testCases = [
            {
                description: 'no positions',
                positions: [],
                expectedSize: 0,
                expectations: [
                    {
                        symbol: 'idk',
                        ratio: undefined,
                    },
                    {
                        symbol: 'another-symbol',
                        ratio: undefined,
                    },
                ],
            },
            {
                description: 'equal positions',
                positions: [
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
                ],
                expectedSize: 2,
                expectations: [
                    {
                        symbol: 'FAKE-1',
                        ratio: 0.5,
                    },
                    {
                        symbol: 'FAKE-2',
                        ratio: 0.5,
                    },
                ],
            },
        ];

        testCases.forEach(({ description, positions, expectedSize, expectations }) => {
            const actualRatios = getActualRatios(positions);
            expect(actualRatios.size).toEqual(expectedSize);
            expectations.forEach((expectation: { symbol: string; ratio?: number }) => {
                expect(actualRatios.get(expectation.symbol)).toEqual(expectation.ratio);
            });
        });
    });
});

describe('getEquityPriority', () => {
    it('should return a list of equities', () => {
        expect(getEquityPriority([], [])).toEqual([]);
    });
});

describe('greedy', () => {
    it('should return a list of positions', () => {
        expect(greedy(0, [], [], [])).toEqual([]);
    });
});
