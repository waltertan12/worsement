import { Portfolio, ModeratelyAggressive } from '../model';

export const getPortfolio = (portfolioId: string | number): Portfolio | null => {
    if (portfolioId === ModeratelyAggressive.id) {
        return ModeratelyAggressive;
    }

    return null;
};

export const getPortfolios = (): Portfolio[] => [ModeratelyAggressive];
