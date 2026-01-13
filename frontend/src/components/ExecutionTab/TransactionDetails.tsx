import React from 'react';
import { type SwapQuote } from '@/types/swap.types';
import { type Token } from '@/lib/tokenList';
import { ArrowRight, Info, Fuel } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TransactionDetailsProps {
    quote: SwapQuote;
    slippage: number;
    tokenIn: Token | null;
    tokenOut: Token | null;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({
    quote,
    slippage,
    tokenIn,
    tokenOut,
}) => {
    if (!quote || !tokenIn || !tokenOut) return null;

    return (
        <div className="p-4 rounded-xl border border-border/50 bg-muted/20 space-y-3">
            <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Rate</span>
                <div className="flex items-center gap-2 font-medium">
                    <span>1 {tokenIn.symbol}</span>
                    <span className="text-muted-foreground">=</span>
                    <span>{parseFloat(quote.exchangeRate).toFixed(6)} {tokenOut.symbol}</span>
                </div>
            </div>

            <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                    <span>Price Impact</span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger><Info className="h-3 w-3" /></TooltipTrigger>
                            <TooltipContent>The difference between market price and estimated price due to trade size.</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <span className={`font-medium ${quote.priceImpact > 2 ? 'text-destructive' : 'text-green-500'}`}>
                    {quote.priceImpact ? `< ${quote.priceImpact.toFixed(2)}%` : '< 0.01%'}
                </span>
            </div>

            <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                    <span>Minimum Received</span>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger><Info className="h-3 w-3" /></TooltipTrigger>
                            <TooltipContent>The minimum amount you will receive after slippage ({slippage}%).</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <span className="font-medium">
                    {parseFloat(quote.amountOutFormatted).toFixed(6)} {tokenOut.symbol}
                </span>
            </div>

            {quote.gasEstimate && (
                <div className="flex justify-between items-center text-sm text-muted-foreground pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1">
                        <Fuel className="h-3 w-3" />
                        <span>Network Fee</span>
                    </div>
                    <span>~${(parseFloat(quote.gasEstimate) * 0.000000001 * 2000).toFixed(4)}</span>
                </div>
            )}
        </div>
    );
};
