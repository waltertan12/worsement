import { describe, expect, test } from '@jest/globals';
import { Buy, Day, Allocation, Market, OrderRequest, Position, Quote } from '.././../../model';
import { greedyIterative } from '../greedy-iterative';

interface BalancerExpectation {
    orders: OrderRequest[];
}

interface BalancerTestCase {
    cash: number;
    allocations: Allocation[];
    positions: Position[];
    quotes: Quote[];
    orders: OrderRequest[];
}

describe('greedyIterative()', () => {
    test.each([
        [
            {
                cash: 1_100,
                allocations: [
                    {
                        asset: 'first',
                        ratio: 10,
                    },
                    {
                        asset: 'second',
                        ratio: 1,
                    },
                ],
                positions: [],
                quotes: [
                    {
                        symbol: 'first',
                        askPrice: 1_000,
                        askSize: 1,
                        bidPrice: 1_000,
                        bidSize: 1,
                        bidAskSpread: 0,
                        timestamp: 0,
                    },
                    {
                        symbol: 'third',
                        askPrice: 1_000,
                        askSize: 1,
                        bidPrice: 1_000,
                        bidSize: 1,
                        bidAskSpread: 0,
                        timestamp: 0,
                    },
                ],
                orders: [],
            },
            {
                orders: [
                    {
                        symbol: 'first',
                        quantity: 1,
                        side: Buy,
                        timeInForce: Day,
                        type: Market,
                    },
                ],
            },
        ],
        [
            {
                cash: 1_100,
                allocations: [
                    {
                        name: 'asset-class-one',
                        asset: [
                            {
                                asset: 'first',
                                ratio: 2,
                            },
                            {
                                asset: 'second',
                                ratio: 1,
                            },
                        ],
                        ratio: 2,
                    },
                    {
                        name: 'asset-class-two',
                        asset: [
                            {
                                asset: 'third',
                                ratio: 1,
                            },
                        ],
                        ratio: 1,
                    },
                ],
                positions: [],
                quotes: [
                    {
                        symbol: 'first',
                        askPrice: 1_000,
                        askSize: 1,
                        bidPrice: 1_000,
                        bidSize: 1,
                        bidAskSpread: 0,
                        timestamp: 0,
                    },
                    {
                        symbol: 'second',
                        askPrice: 1_000,
                        askSize: 1,
                        bidPrice: 1_000,
                        bidSize: 1,
                        bidAskSpread: 0,
                        timestamp: 0,
                    },
                    {
                        symbol: 'third',
                        askPrice: 1_000,
                        askSize: 1,
                        bidPrice: 1_000,
                        bidSize: 1,
                        bidAskSpread: 0,
                        timestamp: 0,
                    },
                ],
                orders: [],
            },
            {
                orders: [
                    {
                        symbol: 'first',
                        quantity: 1,
                        side: Buy,
                        timeInForce: Day,
                        type: Market,
                    },
                ],
            },
        ],
        [
            {
                cash: 2_200,
                allocations: [
                    {
                        name: 'asset-class-one',
                        asset: [
                            {
                                asset: 'first',
                                ratio: 2,
                            },
                            {
                                asset: 'third',
                                ratio: 1,
                            },
                        ],
                        ratio: 1.1,
                    },
                    {
                        name: 'asset-class-two',
                        asset: [
                            {
                                asset: 'second',
                                ratio: 1,
                            },
                        ],
                        ratio: 1,
                    },
                ],
                positions: [],
                quotes: [
                    {
                        symbol: 'first',
                        askPrice: 1_000,
                        askSize: 1,
                        bidPrice: 1_000,
                        bidSize: 1,
                        bidAskSpread: 0,
                        timestamp: 0,
                    },
                    {
                        symbol: 'second',
                        askPrice: 1_000,
                        askSize: 1,
                        bidPrice: 1_000,
                        bidSize: 1,
                        bidAskSpread: 0,
                        timestamp: 0,
                    },
                    {
                        symbol: 'third',
                        askPrice: 1_000,
                        askSize: 1,
                        bidPrice: 1_000,
                        bidSize: 1,
                        bidAskSpread: 0,
                        timestamp: 0,
                    },
                ],
                orders: [],
            },
            {
                orders: [
                    {
                        symbol: 'first',
                        quantity: 1,
                        side: Buy,
                        timeInForce: Day,
                        type: Market,
                    },
                    {
                        symbol: 'second',
                        quantity: 1,
                        side: Buy,
                        timeInForce: Day,
                        type: Market,
                    },
                ],
            },
        ],
        [
            {
                cash: 3_300,
                allocations: [
                    {
                        name: 'asset-class-one',
                        asset: [
                            {
                                asset: 'first',
                                ratio: 1,
                            },
                            {
                                asset: 'third',
                                ratio: 1,
                            },
                        ],
                        ratio: 2,
                    },
                    {
                        name: 'asset-class-two',
                        asset: [
                            {
                                asset: 'second',
                                ratio: 1,
                            },
                        ],
                        ratio: 1,
                    },
                ],
                positions: [],
                quotes: [
                    {
                        symbol: 'first',
                        askPrice: 1_000,
                        askSize: 1,
                        bidPrice: 1_000,
                        bidSize: 1,
                        bidAskSpread: 0,
                        timestamp: 0,
                    },
                    {
                        symbol: 'second',
                        askPrice: 1_000,
                        askSize: 1,
                        bidPrice: 1_000,
                        bidSize: 1,
                        bidAskSpread: 0,
                        timestamp: 0,
                    },
                    {
                        symbol: 'third',
                        askPrice: 1_000,
                        askSize: 1,
                        bidPrice: 1_000,
                        bidSize: 1,
                        bidAskSpread: 0,
                        timestamp: 0,
                    },
                ],
                orders: [],
            },
            {
                orders: [
                    {
                        symbol: 'first',
                        quantity: 1,
                        side: Buy,
                        timeInForce: Day,
                        type: Market,
                    },
                    {
                        symbol: 'second',
                        quantity: 1,
                        side: Buy,
                        timeInForce: Day,
                        type: Market,
                    },
                    {
                        symbol: 'third',
                        quantity: 1,
                        side: Buy,
                        timeInForce: Day,
                        type: Market,
                    },
                ],
            },
        ],
        [
            {
                cash: 100_500,
                allocations: [
                    {
                        name: 'asset-class-one',
                        asset: [
                            {
                                asset: 'a',
                                ratio: 1,
                            },
                            {
                                asset: 'b',
                                ratio: 1,
                            },
                        ],
                        ratio: 0.5,
                    },
                    {
                        name: 'asset-class-two',
                        asset: [
                            {
                                asset: 'c',
                                ratio: 1,
                            },
                        ],
                        ratio: 0.3,
                    },
                    {
                        name: 'asset-class-three',
                        asset: [
                            {
                                asset: 'd',
                                ratio: 1,
                            },
                            {
                                asset: 'e',
                                ratio: 1,
                            },
                        ],
                        ratio: 0.2,
                    },
                ],
                positions: [],
                quotes: [
                    {
                        symbol: 'a',
                        askPrice: 100,
                        askSize: 1,
                        bidPrice: 1_000,
                        bidSize: 1,
                        bidAskSpread: 0,
                        timestamp: 0,
                    },
                    {
                        symbol: 'b',
                        askPrice: 100,
                        askSize: 1,
                        bidPrice: 1_000,
                        bidSize: 1,
                        bidAskSpread: 0,
                        timestamp: 0,
                    },
                    {
                        symbol: 'c',
                        askPrice: 100,
                        askSize: 1,
                        bidPrice: 1_000,
                        bidSize: 1,
                        bidAskSpread: 0,
                        timestamp: 0,
                    },
                    {
                        symbol: 'd',
                        askPrice: 100,
                        askSize: 1,
                        bidPrice: 1_000,
                        bidSize: 1,
                        bidAskSpread: 0,
                        timestamp: 0,
                    },
                    {
                        symbol: 'e',
                        askPrice: 100,
                        askSize: 1,
                        bidPrice: 1_000,
                        bidSize: 1,
                        bidAskSpread: 0,
                        timestamp: 0,
                    },
                ],
                orders: [],
            },
            {
                orders: [
                    {
                        symbol: 'a',
                        quantity: 250,
                        side: Buy,
                        timeInForce: Day,
                        type: Market,
                    },
                    {
                        symbol: 'b',
                        quantity: 250,
                        side: Buy,
                        timeInForce: Day,
                        type: Market,
                    },
                    {
                        symbol: 'c',
                        quantity: 300,
                        side: Buy,
                        timeInForce: Day,
                        type: Market,
                    },
                    {
                        symbol: 'd',
                        quantity: 100,
                        side: Buy,
                        timeInForce: Day,
                        type: Market,
                    },
                    {
                        symbol: 'e',
                        quantity: 100,
                        side: Buy,
                        timeInForce: Day,
                        type: Market,
                    },
                ],
            },
        ],
    ])(
        `greedyIterative() - priority %p`,
        (
            { allocations, cash, orders, positions, quotes }: BalancerTestCase,
            { orders: expectedOrders }: BalancerExpectation,
        ) => {
            const actualOrders = greedyIterative(cash, allocations, quotes, positions, orders);
            // console.log(actualOrders);
            expect(actualOrders).toHaveLength(expectedOrders.length);

            const orderMap = Object.values(actualOrders).reduce((map, order) => {
                map.set(order.symbol, order);
                return map;
            }, new Map<string, OrderRequest>());

            Object.values(expectedOrders).forEach((expectedOrder) => {
                const actualOrder = orderMap.get(expectedOrder.symbol);
                expect(actualOrder).toBeTruthy();
                expect(actualOrder?.symbol).toEqual(expectedOrder.symbol);
                expect(actualOrder?.quantity).toEqual(expectedOrder.quantity);

                expect(actualOrder?.timeInForce).toEqual(expectedOrder.timeInForce);
                expect(actualOrder?.side).toEqual(expectedOrder.side);
                expect(actualOrder?.type).toEqual(expectedOrder.type);
            });
        },
    );

    // TODO: test ratios
    test.each([[1, 0]])('greedyIterative() - ratios %p', (inputs, outputs) => {
        expect(inputs).toEqual(outputs);
    });
});
