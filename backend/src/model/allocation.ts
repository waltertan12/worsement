// export interface Allocation {
//     equity: string | Allocation[];
//     ratio: number;
//
//     name?: string;
// }

// export interface Allocation {
//     asset: Allocation[]|string;
//     name: string;
//     ratio: number;
// }

interface BaseAllocation {
    asset: BaseAllocation[] | string;
    name?: string;
    ratio: number;
}

interface AllocationClass extends BaseAllocation {
    asset: Allocation[];
    name: string;
    ratio: number;
}
interface AllocationAsset extends BaseAllocation {
    asset: string;
    ratio: number;
    name?: never;
}

export type Allocation = AllocationAsset | AllocationClass;
