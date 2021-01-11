export interface Allocation {
    equity: string | Allocation[];
    ratio: number;

    name?: string;
}
