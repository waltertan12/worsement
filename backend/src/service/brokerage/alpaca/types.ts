export type Side = 'buy' | 'sell';
export type OrderStatus =
    | 'new'
    | 'partially_filled'
    | 'filled'
    | 'done_for_day'
    | 'canceled'
    | 'expired'
    | 'replaced'
    | 'pending_cancel'
    | 'pending_replace'
    | 'accepted'
    | 'pending_new'
    | 'accepted_for_bidding'
    | 'stopped'
    | 'rejected'
    | 'suspended'
    | 'calculated';
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';
export type TimeInForce = 'day' | 'gto' | 'opg' | 'cls' | 'opc' | 'fok';

export interface Order {
    id: string;
    client_order_id: string;
    created_at: string;
    updated_at: string | null;
    submitted_at: string | null;
    filled_at: string | null;
    expired_at: string | null;
    canceled_at: string | null;
    failed_at: string | null;
    replaced_at: string | null;
    replaced_by: string | null;
    replaces: string | null;
    asset_id: string;
    symbol: string;
    qty: number;
    filled_qty: number;
    type: OrderType;
    side: Side;
    time_in_force: TimeInForce;
    limit_price: string | null;
    stop_price: string | null;
    filled_avg_price: string | null;
    status: OrderStatus;
    extended_hours: boolean;
    legs: Order[];
}

export interface Position {
    asset_id: string;
    symbol: string;
    exchange: string;
    asset_class: string;
    avg_entry_price: string;
    qty: number;
    side: 'long';
    market_value: string;
    cost_basis: string;
    unrealized_pl: string;
    unrealized_plpc: string;
    unrealized_intraday_pl: string;
    unrealized_intraday_plpc: string;
    current_price: string;
    lastday_price: string;
    change_today: string;
}

export interface Quote {
    status: string;
    symbol: string;
    last: {
        askprice: number;
        asksize: number;
        askexchange: number;
        bidprice: number;
        bidsize: number;
        bidexchange: number;
        timestamp: number;
    };
}

export type AccountStatus =
    | 'ONBOARDING'
    | 'SUBMISSION_FAILED'
    | 'SUBMITTED'
    | 'ACCOUNT_UPDATED'
    | 'APPROVAL_PENDING'
    | 'ACTIVE'
    | 'REJECTED';

export interface Account {
    id: string;
    account_number: string;
    cash: string;
    status: AccountStatus;
    portfolio_value: string | number;
    pattern_day_trader: boolean;
    trade_suspended_by_user: boolean;
    account_blocked: boolean;
    created_at: string;
    shorting_enabled: string;
    long_market_value: string;
    short_market_value: string;
    equity: string;
    last_equity: string;
    multiplier: string;
    buying_power: string;
    initial_margin: string;
    maintenance_margin: string;
    daytrade_count: string;
    last_maintenance_margin: string;
    daytrading_buying_power: string;
    regt_buying_power: string;
}

export type AssetStatus = 'active' | 'inactive';

export interface Asset {
    id: string;
    class: string;
    exchange: string;
    symbol: string;
    status: AssetStatus;
    tradable: boolean;
    marginable: boolean;
    shortable: boolean;
    easy_to_borrow: boolean;
}
