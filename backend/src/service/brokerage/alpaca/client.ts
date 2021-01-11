// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import Alpaca from '@alpacahq/alpaca-trade-api';
import { Brokerage, BrokerageOptions } from '../../brokerage/types';
import {
    Account as AlpacaAccount,
    Asset,
    Order as AlpacaOrder,
    Position as AlpacaPosition,
    Quote as AlpacaQuote,
    OrderType,
    Side,
    TimeInForce,
} from './types';
import { Account, Order, Position, Quote, makeQuote } from '../../../model';
import WebSocket from 'ws';
import axios from 'axios';

const mapAlpacaOrder = ({
    symbol,
    created_at,
    filled_at,
    type,
    time_in_force,
    qty,
    filled_qty,
    side,
    status,
}: AlpacaOrder): Order => ({
    symbol,
    createdAt: new Date(created_at),
    filledAt: filled_at ? new Date(filled_at) : null,
    type,
    timeInForce: time_in_force,
    quantity: Number(qty),
    filledQuantity: Number(filled_qty),
    status,
    side,
});

const getBaseUrl = (isTest?: boolean): string =>
    !!isTest ? 'https://paper-api.alpaca.markets/v2' : 'https://api.alpaca.markets/v2';

export class AlpacaBrokerage implements Brokerage {
    cancelOrders = (options: BrokerageOptions) => async (): Promise<Order[]> => {
        try {
            return [];
        } catch (e) {
            console.error(e);
            throw new Error(`Error canceling orders`);
        }
    };

    createOrder(options: BrokerageOptions) {
        return async (data: Partial<Order> | null): Promise<Order | null> => {
            try {
                if (!data) {
                    return null;
                }

                return null;
                // return mapAlpacaOrder(
                //     await this.alpaca.createOrder({
                //         symbol: data.symbol,
                //         qty: data.quantity,
                //         side: data.side as Side,
                //         type: data.type as OrderType,
                //         time_in_force: data.timeInForce as TimeInForce,
                //     }),
                // );
            } catch (e) {
                return null;
            }
        };
    }

    getAccount(options: BrokerageOptions) {
        return async (): Promise<Account | null> => {
            try {
                const res = await axios.get(`${getBaseUrl(options.isTest)}/account`, {
                    headers: {
                        Authorization: `Bearer ${options.token}`,
                        'Content-Type': 'application/json',
                    },
                });
                const account = res.data;

                return {
                    cash: Number(account.cash),
                    buyingPower: Number(account.buying_power),
                    multiplier: Number(account.multiplier),
                    equity: Number(account.equity),
                };
            } catch (e) {
                console.error(e);
                return null;
            }
        };
    }

    getAsset(options: BrokerageOptions) {
        return async (symbol: string): Promise<Asset | null> => {
            try {
                const res = await axios.get(`${getBaseUrl(options.isTest)}/asset/${symbol}`, {
                    headers: {
                        Authorization: `Bearer ${options.token}`,
                        'Content-Type': 'application/json',
                    },
                });
                const asset = res.data;

                return asset;
            } catch (e) {
                return null;
            }
        };
    }

    getOrders(options: BrokerageOptions) {
        return async (status?: string): Promise<Order[]> => {
            try {
                // return ((await this.alpaca.getOrders({ status })) as AlpacaOrder[]).map(mapAlpacaOrder);
                return [];
            } catch (e) {
                return [];
            }
        };
    }

    getPositions(options: BrokerageOptions) {
        return async (): Promise<Position[]> => {
            try {
                /*
                const positions = (await this.alpaca.getPositions()) as AlpacaPosition[];

                return positions.map(
                    ({ exchange, asset_class: assetClass, qty, market_value, current_price, symbol }): Position => ({
                        exchange,
                        assetClass,
                        quantity: Number(qty),
                        marketValue: Number(market_value),
                        currentPrice: Number(current_price),
                        symbol,
                    }),
                );
                 */
                return [];
            } catch (e) {
                return [];
            }
        };
    }

    getQuote(options: BrokerageOptions) {
        return async (symbol: string): Promise<Quote | null> => {
            try {
                /*
                const quote = (await this.alpaca.lastQuote(symbol)) as AlpacaQuote;

                return makeQuote(
                    quote.symbol,
                    quote.last.askprice,
                    quote.last.asksize,
                    quote.last.bidprice,
                    quote.last.bidsize,
                    quote.last.timestamp,
                );
                 */
                return null;
            } catch (e) {
                return null;
            }
        };
    }
}

interface OrderEvent {
    event: string;
    timestamp?: string;
    order: AlpacaOrder;
}

interface AccountEvent {
    event: string;
    timestamp?: string;
    account: AlpacaAccount;
}

/*
const tradeSocket = alpaca.trade_ws;
export const connect = (stream: 'trade' | 'data', callback?: () => void): void => {
    if (stream === 'trade') {
        tradeSocket.connect();
        tradeSocket.onConnect(() => {
            tradeSocket.subscribe(['account_updates', 'trade_updates']);
            if (callback) {
                callback();
            }
        });
        return;
    }
};

export const isConnected = (): boolean => false;

export const onOrderUpdate = (callback: (type: string, order: Order, timestamp?: string) => void): void =>
    tradeSocket.onOrderUpdate((event: OrderEvent): void =>
        callback(event.event, mapAlpacaOrder(event.order), event.timestamp),
    );

export const onAccountUpdate = (callback: (type: string, order: Account, timestamp?: string) => void): void =>
    tradeSocket.onAccountUpdate((event: AccountEvent): void => {
        const account: Account = {
            cash: Number(event.account.cash),
            buyingPower: Number(event.account.buying_power),
            multiplier: Number(event.account.multiplier),
            equity: Number(event.account.equity),
        };
        callback(event.event, account, event.timestamp);
    });

export const alpacaWebsocket: WebSocket = alpaca.trade_ws;
 */
export const alpacaClient = new AlpacaBrokerage();
