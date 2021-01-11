import { Allocation } from '../allocation';

export interface Portfolio {
    id: string | number;
    allocations: Allocation[];
}
