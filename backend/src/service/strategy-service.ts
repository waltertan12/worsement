import { Strategy, longBuyOnlyStrategy } from './strategy';

export const getStrategy = (strategyId: string): Strategy | null => {
    if (strategyId === 'long-buy-only') {
        return longBuyOnlyStrategy;
    }

    return null;
};

export const getStrategies = (): Strategy[] => [longBuyOnlyStrategy];
