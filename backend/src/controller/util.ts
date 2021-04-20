import { Request, Response, Handler, NextFunction } from 'express';

export const asyncRequestHandler = (handler: Handler) => async (
    request: Request,
    response: Response,
    next: NextFunction,
) => {
    try {
        return await handler(request, response, next);
    } catch (error) {
        console.error({ error });
        return response
            .status(500)
            .json({
                errors: [
                    {
                        detail: 'Something went wrong',
                    },
                ],
            })
            .end();
    }
};
