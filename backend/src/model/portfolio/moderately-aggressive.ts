import { Portfolio } from '../portfolio';

export const ModeratelyAggressive: Portfolio = {
    id: 'moderately-aggressive',
    allocations: [
        {
            name: 'Large Cap',
            equity: [
                {
                    equity: 'VTI',
                    ratio: 0,
                },
                {
                    equity: 'VOO',
                    ratio: 0,
                },
                {
                    equity: 'SCHX',
                    ratio: 0.5,
                },
                {
                    equity: 'VV',
                    ratio: 0.5,
                },
            ],
            ratio: 0.45,
        },
        {
            name: 'Small Cap',
            equity: [
                {
                    equity: 'VB',
                    ratio: 0.5,
                },
                {
                    equity: 'SCHA',
                    ratio: 0.5,
                },
            ],
            ratio: 0.15,
        },
        {
            name: 'International',
            equity: [
                {
                    equity: 'VXUS',
                    ratio: 1,
                },
            ],
            ratio: 0.2,
        },
        {
            name: 'Fixed Income',
            equity: [
                {
                    equity: 'BND',
                    ratio: 1,
                },
            ],
            ratio: 0.15,
        },
    ],
};
