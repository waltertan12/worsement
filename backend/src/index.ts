import { Portfolio, ModeratelyAggressive } from './model';
// Start the API
import './api';

// Start the WebSocket
import './stream';

import { greedyIterative } from './service/strategy/greedy-iterative';
import { fillRatios } from './service/strategy/fill-ratios';
import { getPortfolio } from './service/portfolio-service';

const portfolio = getPortfolio(ModeratelyAggressive.id) as Portfolio;
const quotes = [
    {
        symbol: 'VB',
        askPrice: 205.36,
        askSize: 1,
        bidPrice: 206.36,
        bidSize: 1,
        bidAskSpread: 1,
        timestamp: Math.floor(new Date().getTime() / 1),
    },
    {
        symbol: 'VTI',
        askPrice: 197.06,
        askSize: 1,
        bidPrice: 198.06,
        bidSize: 1,
        bidAskSpread: 1,
        timestamp: Math.floor(new Date().getTime() / 1),
    },
    {
        symbol: 'BND',
        askPrice: 87.35,
        askSize: 1,
        bidPrice: 88.35,
        bidSize: 1,
        bidAskSpread: 1,
        timestamp: Math.floor(new Date().getTime() / 1),
    },
    {
        symbol: 'VXUS',
        askPrice: 61.85,
        askSize: 1,
        bidPrice: 62.85,
        bidSize: 1,
        bidAskSpread: 1,
        timestamp: Math.floor(new Date().getTime() / 1),
    },
    {
        symbol: 'VOO',
        askPrice: 345.37,
        askSize: 1,
        bidPrice: 346.37,
        bidSize: 1,
        bidAskSpread: 1,
        timestamp: Math.floor(new Date().getTime() / 1),
    },
    {
        symbol: 'SCHX',
        askPrice: 91.64,
        askSize: 1,
        bidPrice: 92.64,
        bidSize: 1,
        bidAskSpread: 1,
        timestamp: Math.floor(new Date().getTime() / 1),
    },
    {
        symbol: 'SCHA',
        askPrice: 95.51,
        askSize: 1,
        bidPrice: 96.61,
        bidSize: 1,
        bidAskSpread: 1,
        timestamp: Math.floor(new Date().getTime() / 1),
    },
    {
        symbol: 'VV',
        askPrice: 176.69,
        askSize: 1,
        bidPrice: 177.69,
        bidSize: 1,
        bidAskSpread: 1,
        timestamp: Math.floor(new Date().getTime() / 1),
    },
];
const positions = [
    {
        exchange: 'nyse',
        assetClass: 'some-class',
        quantity: 10,
        marketValue: 197 * 10,
        currentPrice: 197,
        symbol: 'VTI',
    },
];

const cash = 1_000_000;
greedyIterative(cash, portfolio.allocations, quotes, positions, []);
fillRatios(cash, portfolio.allocations, quotes, positions, []);
