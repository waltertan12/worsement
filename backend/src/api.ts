import express, { Application, NextFunction, Request, Response } from 'express';
import { applyMiddleware } from './api-middleware';
import { registerRoutes as registerAllocationRoutes } from './controller/allocation-controller';
import { registerRoutes as registerPortfolioRoutes } from './controller/portfolio-controller';

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
    registerAllocationRoutes(app);

    // 404
    app.use((request: Request, response: Response, next: NextFunction) =>
        response
            .status(404)
            .json({
                errors: [
                    {
                        detail: 'Endpoint not found',
                    },
                ],
            })
            .end(),
    );

    app.listen(PORT, () => console.log(`Started application on port ${PORT}`));

    return app;
};

// TODO: OAuth
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
