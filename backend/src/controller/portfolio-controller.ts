import { Application, NextFunction, Request, Response } from 'express';
import { Portfolio } from '../entity/portfolio';
import { asyncRequestHandler } from './util';
import { getRepository } from 'typeorm';

export const registerRoutes = (app: Application): Application => {
    app.get(
        '/portfolios',
        asyncRequestHandler(async (request: Request, response: Response, next: NextFunction) => {
            // const { cursor, limit } = request.params;
            // const portfolioRepository = getRepository(Portfolio);
            // const savedPortfolio = await portfolioRepository.find({ });
            return response
                .status(200)
                .json({
                    data: [],
                    first: null,
                    last: null,
                    next: null,
                    prev: null,
                })
                .end();
        }),
    );
    app.post(
        '/portfolios',
        asyncRequestHandler(async (request: Request, response: Response, next: NextFunction) => {
            const { body } = request;
            // TODO: Validate the request body
            const portfolio = new Portfolio();
            portfolio.name = String(body.name ?? 'Cool new portfolio');
            portfolio.description = String(body.description ?? 'Very in-depth description!!');
            const portfolioRepository = getRepository(Portfolio);
            const savedPortfolio = await portfolioRepository.save(portfolio);

            return response
                .status(201)
                .json({
                    data: savedPortfolio,
                })
                .end();
        }),
    );
    app.get(
        '/portfolios/:portfolioId([0-9]+)',
        asyncRequestHandler(async (request: Request, response: Response) => {
            const fetchAllocations = request.params.fetchAllocations === 'true';
            const portfolioRepository = getRepository(Portfolio);
            const portfolio = await portfolioRepository.findOne(Number(request.params.portfolioId), {
                relations: fetchAllocations ? ['allocations'] : [],
            });

            if (!portfolio) {
                return response
                    .status(404)
                    .json({
                        errors: [
                            {
                                detail: 'Portfolio not found',
                            },
                        ],
                    })
                    .end();
            }

            const { allocations = [], ...rest } = portfolio;

            return response.json({
                data: {
                    type: 'portfolio',
                    ...rest,
                },
                included: allocations.map((allocation) => ({
                    type: 'allocation',
                    ...allocation,
                })),
            });
        }),
    );
    app.delete(
        '/portfolios/:portfolioId([0-9]+)',
        asyncRequestHandler(async (request: Request, response: Response, next: NextFunction) => {
            const portfolioRepository = getRepository(Portfolio);
            await portfolioRepository.delete(Number(request.params.portfolioId));

            return response.status(204).end();
        }),
    );
    app.put(
        '/portfolios/:portfolioId([0-9]+)',
        asyncRequestHandler(async (request: Request, response: Response, next: NextFunction) => {
            const portfolioRepository = getRepository(Portfolio);
            const portfolio = await portfolioRepository.findOne(Number(request.params.portfolioId));
            if (!portfolio) {
                return response.status(404).json({
                    errors: [
                        {
                            detail: 'Portfolio not found',
                        },
                    ],
                });
            }

            const { body } = request;
            portfolio.name = body.name ? String(body.name) : 'Cool new portfolio';
            portfolio.description = body.description ? String(body.description) : 'Very in-depth description!';
            const savedPortfolio = await portfolioRepository.save(portfolio);

            return response.json({
                data: {
                    type: 'portfolio',
                    ...savedPortfolio,
                },
            });
        }),
    );

    return app;
};
