import { Allocation, Order, OrderRequest, Position, Quote } from '../../model';
import { Brokerage } from '../brokerage';

export interface StrategyResult {
    orders: Partial<Order>[];
    positions: Position[];
    executed: boolean;
}

export interface Strategy {
    id: string;
    description: string;
    execute: (portfolio: Allocation[], brokerage: Brokerage, dryRun?: boolean) => Promise<StrategyResult>;
}

export interface Balancer {
    (
        cash: number,
        allocations: Allocation[],
        quotes: Quote[],
        positions: Position[],
        orders: OrderRequest[],
    ): OrderRequest[];
}
