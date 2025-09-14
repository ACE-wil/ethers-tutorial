import { create } from "zustand";

interface HomeStore {
    netWork: any;
    setNetWork: (netWork: any) => void;
    balance: any;
    setBalance: (balance: any) => void;
    feeData: any;
    setFeeData: (feeData: any) => void;
    blockNumber: any;
    setBlockNumber: (blockNumber: any) => void;
    transaction: any;
    setTransaction: (transaction: any) => void;
}

export const useHomeStore = create<HomeStore>((set) => ({
netWork: null,
setNetWork: (netWork: any) => set({ netWork: netWork }),
balance: null,
setBalance: (balance: any) => set({ balance: balance }),
feeData: null,
setFeeData: (feeData: any) => set({ feeData: feeData }),
blockNumber: null,
setBlockNumber: (blockNumber: any) => set({ blockNumber: blockNumber }),    
transaction: null,
setTransaction: (transaction: any) => set({ transaction: transaction }),
}))