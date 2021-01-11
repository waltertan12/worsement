import { Request, Response } from 'express';
import { getStrategy, getStrategies } from '../service/strategy-service';

export const index = (req: Request, res: Response): void => res.json({ data: getStrategies() }).status(200).end();
