export interface Order {
    symbol: string;
    createdAt: Date;
    filledAt: Date | null;
    type: string;
    timeInForce: string;
    quantity: number;
    filledQuantity: number;
    status: string;
    side: string;
}

// Time in force
export const Day = 'day';
export const GoodUntilCancelled = 'gtc';
export const OnOpen = 'opg';
export const OnClose = 'cls';
export const ImmediateOrCancel = 'ioc';
export const FillOrClose = 'fok';

// Side
export const Buy = 'buy';
export const Sell = 'sell';

// Type
export const Market = 'market';
export const Limit = 'limit';
export const Stop = 'stop';
export const StopLimit = 'stop_limit';
export const TrailingStop = 'trailing_stop';

export type Side = typeof Buy | typeof Sell;
export type TimeInForce =
    | typeof Day
    | typeof GoodUntilCancelled
    | typeof OnOpen
    | typeof OnClose
    | typeof ImmediateOrCancel
    | typeof FillOrClose;
export type OrderType = typeof Market | typeof Limit | typeof Stop | typeof StopLimit | typeof TrailingStop;

export interface OrderRequest {
    symbol: string;
    type: OrderType;
    timeInForce: TimeInForce;
    quantity: number;
    side: Side;
}
