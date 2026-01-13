import { useQuery } from '@tanstack/react-query';
import type { FusionXSwapHelper } from '@/lib/fusionXSwapHelper';
import type { Token } from '@/lib/tokenList';
import { SwapMode } from '@/types/swap.types';

export const useSwapQuote = (
    swapHelper: FusionXSwapHelper | null,
    tokenIn: Token | null,
    tokenOut: Token | null,
    amountIn: string,
    swapMode: SwapMode
) => {
    const { data: quote, isLoading, error } = useQuery({
        queryKey: ['swapQuote', tokenIn?.address, tokenOut?.address, amountIn, swapMode],
        queryFn: async () => {
            if (!swapHelper || !tokenIn || !tokenOut || !amountIn || parseFloat(amountIn) <= 0) {
                return null;
            }

            try {
                let quoteResult;
                switch (swapMode) {
                    case SwapMode.TOKEN_TO_TOKEN:
                        quoteResult = await swapHelper.getTokenToTokenQuote(
                            tokenIn.address,
                            tokenOut.address,
                            amountIn
                        );
                        break;
                    case SwapMode.ETH_TO_TOKEN:
                        quoteResult = await swapHelper.getETHToTokenQuote(tokenOut.address, amountIn);
                        break;
                    case SwapMode.TOKEN_TO_ETH:
                        quoteResult = await swapHelper.getTokenToETHQuote(tokenIn.address, amountIn);
                        break;
                    default:
                        return null;
                }

                if (!quoteResult) return null;

                // Calculate Exchange Rate
                const inVal = parseFloat(amountIn);
                const outVal = parseFloat(quoteResult.amountOutFormatted);
                const rate = inVal > 0 ? (outVal / inVal).toString() : '0';

                // Calculate Minimum Received (assuming 0.5% ref slippage if generic, but here use generic)
                // Note: The hook doesn't know current user slippage preference easily unless passed.
                // We'll calculate a default reference or return the raw and let UI handle it.
                // For now, let's just return 100% of quote as base and let component handle or use 0.5% default for display
                const minReceived = (outVal * 0.995).toString(); // Default 0.5% slippage for display

                return {
                    amountOut: quoteResult.amountOut,
                    amountOutFormatted: quoteResult.amountOutFormatted,
                    priceImpact: parseFloat(quoteResult.priceImpact || '0'),
                    exchangeRate: rate,
                    minimumReceived: minReceived,
                    gasEstimate: undefined, // Could fetch if needed
                    path: []
                };

            } catch (error) {
                console.error('Error fetching quote:', error);
                throw error;
            }
        },
        enabled: !!swapHelper && !!tokenIn && !!tokenOut && !!amountIn && parseFloat(amountIn) > 0,
        refetchInterval: 15000, // Refresh quote every 15 seconds
        staleTime: 10000, // Consider data stale after 10 seconds
    });

    return {
        quote,
        isLoading,
        error,
    };
};
