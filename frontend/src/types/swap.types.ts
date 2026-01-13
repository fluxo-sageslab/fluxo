export enum SwapMode {
    TOKEN_TO_TOKEN = 'TOKEN_TO_TOKEN',
    ETH_TO_TOKEN = 'ETH_TO_TOKEN',
    TOKEN_TO_ETH = 'TOKEN_TO_ETH',
}

export enum SwapType {
    EXACT_INPUT = 'EXACT_INPUT',
    EXACT_OUTPUT = 'EXACT_OUTPUT',
}

export interface SwapState {
    tokenIn: any | null; // Typed loosely here, strict in usage
    tokenOut: any | null;
    amountIn: string;
    amountOut: string;
    slippage: number;
    deadline: number;
    swapMode: SwapMode;
    swapType: SwapType;
}

export interface SwapQuote {
    amountOut: string;
    amountOutFormatted: string;
    priceImpact: number;
    exchangeRate: string;
    minimumReceived: string;
    gasEstimate?: string;
    path?: string[];
}

export enum TransactionStatus {
    IDLE = 'IDLE',
    APPROVAL_PENDING = 'APPROVAL_PENDING',
    APPROVAL_CONFIRMED = 'APPROVAL_CONFIRMED',
    SWAP_PENDING = 'SWAP_PENDING',
    SWAP_CONFIRMED = 'SWAP_CONFIRMED',
    FAILED = 'FAILED',
}
