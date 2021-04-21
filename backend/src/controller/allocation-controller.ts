import { Application, NextFunction, Request, Response } from 'express';
import { Allocation } from '../entity/allocation';
import { asyncRequestHandler } from './util';
import { getRepository, getTreeRepository } from 'typeorm';
import { Portfolio } from '../entity/portfolio';

const listAllocations = (app: Application) =>
    app.get(
        '/portfolios/:portfolioId([0-9]+)/allocations',
        asyncRequestHandler(async (request: Request, response: Response, next: NextFunction) => {
            const allocationRepository = getRepository(Allocation);
            const portfolioId = Number(request.params.portfolioId);

            const allocations = await allocationRepository.find({
                where: {
                    portfolio: portfolioId,
                },
            });

            return response.status(200).json({
                data: allocations.map((allocation) => ({
                    type: 'allocation',
                    ...allocation,
                })),
            });
        }),
    );
const createAllocation = (app: Application) =>
    app.post(
        '/portfolios/:portfolioId([0-9]+)/allocations',
        asyncRequestHandler(async (request: Request, response: Response, next: NextFunction) => {
            const allocationRepository = getRepository(Allocation);
            const portfolioRepository = getRepository(Portfolio);

            const portfolioId = Number(request.params.portfolioId);
            const portfolio = await portfolioRepository.findOne(Number(portfolioId));
            if (!portfolio) {
                return response.status(404).json({
                    errors: [
                        {
                            detail: 'Portfolio does not exist',
                        },
                    ],
                });
            }

            const { description, equity, ratio, parentId } = request.body;
            const errors = [];
            if (ratio && Number(ratio) < 0) {
                errors.push({
                    detail: 'Ratio cannot be less than zero',
                });
            }

            if (parentId && !(await allocationRepository.findOne(Number(parentId)))) {
                errors.push({
                    detail: 'Parent allocation does not exist',
                });
            }

            if (errors.length) {
                return response.status(422).json({ errors });
            }

            const allocation = new Allocation();
            allocation.ratio = Math.abs(Number(ratio));
            allocation.equity = equity ? String(equity) : undefined;
            allocation.parentId = parentId ? Number(parentId) : undefined;
            allocation.portfolio = portfolio;
            allocation.description = description ?? undefined;

            await allocationRepository.save(allocation);

            const { portfolio: _, ...rest } = await allocationRepository.save(allocation);

            return response.status(201).json({
                data: {
                    type: 'allocation',
                    ...rest,
                },
                included: [
                    {
                        type: 'portfolio',
                        ...portfolio,
                    },
                ],
            });
        }),
    );

const retrieveAllocation = (app: Application) =>
    app.get(
        '/portfolios/:portfolioId([0-9]+)/allocations/:allocationId([0-9]+)',
        asyncRequestHandler(async (request: Request, response: Response, next: NextFunction) => {
            const allocationRepository = getRepository(Allocation);

            const portfolioId = Number(request.params.portfolioId);
            const allocationId = Number(request.params.allocationId);
            const fetchPortfolio = request.query.fetchPortfolio === 'true';
            const fetchChildren = request.query.fetchChildren === 'true';

            const relations = [fetchPortfolio && 'portfolio', fetchChildren && 'children'].filter(
                (relation: boolean | string): relation is string => typeof relation === 'string',
            );

            const allocation = await allocationRepository.findOne({
                where: {
                    portfolio: portfolioId,
                    id: allocationId,
                },
                relations,
            });

            if (!allocation) {
                return response.status(404).json({
                    errors: [
                        {
                            detail: 'Allocation not found',
                        },
                    ],
                });
            }

            const { portfolio, children = [], ...rest } = allocation;

            return response.status(200).json({
                data: {
                    type: 'allocation',
                    ...rest,
                },
                included: [
                    ...[portfolio]
                        .filter((entity) => !!entity)
                        .map((entity) => ({
                            type: 'portfolio',
                            ...entity,
                        })),
                    ...children.map((entity) => ({
                        type: 'allocation',
                        ...entity,
                    })),
                ],
            });
        }),
    );

const updateAllocation = (app: Application) =>
    app.put(
        '/portfolios/:portfolioId([0-9]+)/allocations/:allocationId',
        asyncRequestHandler(async (request: Request, response: Response, next: NextFunction) => {
            // TODO
            return response
                .status(404)
                .json({ errors: [{ detail: 'Endpoint not found' }] })
                .end();
        }),
    );

const deleteAllocation = (app: Application) =>
    app.delete(
        '/portfolios/:portfolioId([0-9]+)/allocations/:allocationId',
        asyncRequestHandler(async (request: Request, response: Response, next: NextFunction) => {
            // TODO
            return response.status(204).end();
        }),
    );

export const registerRoutes = (app: Application): Application => {
    listAllocations(app);
    createAllocation(app);
    retrieveAllocation(app);
    updateAllocation(app);
    deleteAllocation(app);

    return app;
};
