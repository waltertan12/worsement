import { Account, Order, Position, Quote } from '../../model';

export interface Brokerage {
    createOrder: (options: BrokerageOptions) => (order: Partial<Order> | null) => Promise<Order | null>;
    getAccount: (options: BrokerageOptions) => () => Promise<Account | null>;
    getOrders: (options: BrokerageOptions) => (status?: string) => Promise<Order[]>;
    getPositions: (options: BrokerageOptions) => () => Promise<Position[]>;
    getQuote: (options: BrokerageOptions) => (symbol: string) => Promise<Quote | null>;
}

export interface BrokerageOptions {
    token: string;
    isTest?: boolean;
}
