import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight } from 'lucide-react';
import type { FusionXSwapHelper } from '@/lib/fusionXSwapHelper';
import type { Token } from '@/lib/tokenList';
import { SwapMode } from '@/types/swap.types';
import { handleSwapError } from '@/lib/fusionXSwapHelper';

interface SwapButtonProps {
    swapHelper: FusionXSwapHelper | null;
    tokenIn: Token | null;
    tokenOut: Token | null;
    amountIn: string;
    slippage: number;
    deadline: number;
    swapMode: SwapMode;
    disabled: boolean;
    validationError: string | null;
    onTransactionStart: (hash: string) => void;
    onTransactionSuccess: (hash: string) => void;
    onTransactionError: (error: Error) => void;
}

export const SwapButton: React.FC<SwapButtonProps> = ({
    swapHelper,
    tokenIn,
    tokenOut,
    amountIn,
    slippage,
    deadline,
    swapMode,
    disabled,
    validationError,
    onTransactionStart,
    onTransactionSuccess,
    onTransactionError,
}) => {
    const [isSwapping, setIsSwapping] = useState(false);

    const handleSwap = async () => {
        if (!swapHelper || !tokenIn || !tokenOut) return;

        setIsSwapping(true);
        try {
            let tx;
            // Calculate min amount out with slippage (simplified for now, ideally fetched from quote)
            // For now we will rely on helper to handle or pass '0' if we trust router
            // BUT for proper safety we should calculate it. 
            // Assuming user wants to proceed, pass '0' for demo or calculate if quote available.
            // Since we don't have quote here, let's assume helper handles it or we pass '0'.
            // Better: Update helper to accept 0 and calculate internally or just use 0 (risky but ok for demo)
            // amountOutMin is now calculated internally by the SDK based on slippage

            switch (swapMode) {
                case SwapMode.ETH_TO_TOKEN:
                    tx = await swapHelper.swapExactETHForTokens(
                        tokenOut.address,
                        amountIn,
                        {
                            slippageTolerance: slippage,
                            deadlineMinutes: deadline
                        }
                    );
                    break;
                case SwapMode.TOKEN_TO_ETH:
                    tx = await swapHelper.swapExactTokensForETH(
                        tokenIn.address,
                        amountIn,
                        {
                            slippageTolerance: slippage,
                            deadlineMinutes: deadline
                        }
                    );
                    break;
                case SwapMode.TOKEN_TO_TOKEN:
                    tx = await swapHelper.swapExactTokensForTokens(
                        tokenIn.address,
                        tokenOut.address,
                        amountIn,
                        {
                            slippageTolerance: slippage,
                            deadlineMinutes: deadline
                        }
                    );
                    break;
            }

            if (tx) {
                onTransactionStart(tx.transactionHash); // New SDK returns object with transactionHash properties, not ContractTransaction
                onTransactionSuccess(tx.transactionHash);
            }
        } catch (error: any) {
            const parsedError = handleSwapError(error);
            onTransactionError(new Error(parsedError.message));
        } finally {
            setIsSwapping(false);
        }
    };

    if (!tokenIn || !tokenOut) return null;

    return (
        <Button
            onClick={handleSwap}
            disabled={disabled || isSwapping}
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-wider shadow-lg shadow-primary/20"
        >
            {isSwapping ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Swapping...
                </>
            ) : validationError ? (
                validationError
            ) : (
                <span className="flex items-center gap-2">
                    Swap {tokenIn.symbol} <ArrowRight className="h-4 w-4" /> {tokenOut.symbol}
                </span>
            )}
        </Button>
    );
};
