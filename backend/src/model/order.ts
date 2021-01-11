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
