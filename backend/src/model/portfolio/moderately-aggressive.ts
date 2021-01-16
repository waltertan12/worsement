import { Portfolio } from '../portfolio';

export const ModeratelyAggressive: Portfolio = {
    id: 'moderately-aggressive',
    allocations: [
        {
            // type: 'class',
            name: 'Large Cap',
            asset: [
                {
                    // type: 'asset',
                    asset: 'VTI',
                    ratio: 0.2,
                },
                {
                    // type: 'asset',
                    asset: 'VOO',
                    ratio: 0,
                },
                {
                    // type: 'asset',
                    asset: 'SCHX',
                    ratio: 0.4,
                },
                {
                    // type: 'asset',
                    asset: 'VV',
                    ratio: 0.4,
                },
            ],
            ratio: 0.45,
        },
        {
            // type: 'class',
            name: 'Small Cap',
            asset: [
                {
                    // type: 'asset',
                    asset: 'VB',
                    ratio: 0.5,
                },
                {
                    // type: 'asset',
                    asset: 'SCHA',
                    ratio: 0.5,
                },
            ],
            ratio: 0.15,
        },
        {
            // type: 'class',
            name: 'International',
            asset: [
                {
                    // type: 'asset',
                    asset: 'VXUS',
                    ratio: 1,
                },
            ],
            ratio: 0.2,
        },
        {
            // type: 'class',
            name: 'Fixed Income',
            asset: [
                {
                    // type: 'asset',
                    asset: 'BND',
                    ratio: 1,
                },
            ],
            ratio: 0.15,
        },
    ],
};
