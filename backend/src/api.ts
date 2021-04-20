import express, { Application, NextFunction, Request, Response } from 'express';
import passport from 'passport';
import { alpacaClient } from './service/brokerage';
import { applyMiddleware } from './api-middleware';
import { getPortfolio, getPortfolios } from './service/portfolio-service';
import { getStrategy, getStrategies } from './service/strategy-service';
// import { flattenAllocations } from './service/allocation-service';
// import { ModeratelyAggressive } from './model';
import { registerRoutes as registerPortfolioRoutes } from './controller/portfolio-controller';

// console.log(
//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-ignore
//     flattenAllocations(ModeratelyAggressive.allocations),
// );
// const userTokens = {
//     1: {
//         refreshToken: '',
//         accessToken: '',
//     },
// };

// const asdf = async () => {
//     console.log(await alpacaClient.getAccount({ token: 'dce9369a-57f8-46a2-b4cf-cc2168faf2e1' })());
// };
//
// asdf();

const PORT = process.env.PORTFOLIO_MANAGER_PORT || 3001;

export const startApi = (): Application => {
    const app = applyMiddleware(express());

    app.get('/health', (req, res) =>
        res
            .json({
                data: {
                    up: true,
                },
            })
            .status(200)
            .end(),
    );

    registerPortfolioRoutes(app);

    // 404
    app.use((request: Request, response: Response, next: NextFunction) =>
        response
            .status(404)
            .json({
                errors: [
                    {
                        details: 'Endpoint not found',
                    },
                ],
            })
            .end(),
    );

    app.listen(PORT, () => console.log(`Started application on port ${PORT}`));

    return app;
};

// TODO: OAuth
/*
app.get('/api/account', async (req, res) => {
    res.json({ data: await getAlpacaClient.getAccount() })
        .status(200)
        .end();
});
app.get('/api/positions', async (req, res) => {
    res.json({ data: await getAlpacaClient.getPositions() })
        .status(200)
        .end();
});
app.get('/api/orders', async (req, res) => {
    res.json({ data: await getAlpacaClient.getOrders() })
        .status(200)
        .end();
});

app.post('/api/execute', async (req, res) => {
    const portfolioId = req.body.portfolioId || '';
    const strategyId = req.body.strategyId || '';
    const dryRun = req.body.dryRun !== undefined ? !!req.body.dryRun : true;

    const portfolio = getPortfolio(portfolioId);
    if (!portfolio) {
        return res
            .json({ errors: [`Cannot find portfolio ${req.params.portfolio}`] })
            .status(404)
            .end();
    }

    const strategy = getStrategy(strategyId);
    if (!strategy) {
        return res
            .json({ errors: [`Cannot find strategy ${strategyId}`] })
            .status(404)
            .end();
    }

    return res
        .json({
            data: await strategy.execute(portfolio.allocations, getAlpacaClient, dryRun),
        })
        .status(200)
        .end();
});
*/

// app.get('/api/portfolios/:portfolioId', (req, res) => {
//     const portfolio = getPortfolio(req.params.portfolioId);
//     if (!portfolio) {
//         return res
//             .json({ errors: [`Cannot find portfolio ${req.params.portfolio}`] })
//             .status(404)
//             .end();
//     }
//
//     return res.json({ data: portfolio }).status(200).end();
// });
//
// app.get('/api/portfolios', (req, res) => {
//     return res
//         .json({
//             data: getPortfolios(),
//         })
//         .status(200)
//         .end();
// });
//
// app.get('/api/strategies', (req, res) => {
//     return res.json({ data: getStrategies() }).status(200).end();
// });

// Authentication
// app.get('/auth/alpaca', passport.authenticate('alpaca-oauth2'));
// app.get('/auth/alpaca/callback', passport.authenticate('alpaca-oauth2'), (req, res) =>
//     res.json({ data: 'OK' }).status(200).end(),
// );
//
// app.get('/api/session', (req, res) => res.json(req.session).status(200).end());
//
// let num = 0;
// app.get('/api/test/:num', (req, res) => {
//     const original = num;
//     num = Number(req.params.num) || 0;
//     res.json({ num }).status(200).end();
//     setTimeout(() => {
//         console.log({ original, num });
//     }, 10);
// });
