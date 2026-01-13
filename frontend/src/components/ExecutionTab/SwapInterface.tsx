import React, { useState, useEffect } from 'react';
import type { FusionXSwapHelper } from '@/lib/fusionXSwapHelper';
import { SwapMode, SwapType } from '@/types/swap.types';
import { TOKEN_LIST, NATIVE_TOKEN } from '@/lib/tokenList';
import { TokenSelector } from './TokenSelector';
import { SwapSettings } from './SwapSettings';
import { TransactionDetails } from './TransactionDetails';
import { ApprovalButton } from './ApprovalButton';
import { SwapButton } from './SwapButton';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useSwapQuote } from '@/hooks/useSwapQuote';
import { ArrowDown } from 'lucide-react';

interface SwapInterfaceProps {
    swapHelper: FusionXSwapHelper | null;
    onTransactionStart: (hash: string) => void;
    onTransactionSuccess: (hash: string) => void;
    onTransactionError: (error: Error) => void;
    customTokenList?: any[];
}

export const SwapInterface: React.FC<SwapInterfaceProps> = ({
    swapHelper,
    onTransactionStart,
    onTransactionSuccess,
    onTransactionError,
    customTokenList = TOKEN_LIST,
}) => {
    // State
    const [tokenIn, setTokenIn] = useState(NATIVE_TOKEN);
    const [tokenOut, setTokenOut] = useState(TOKEN_LIST[1] || TOKEN_LIST[0]); // Default to first non-native token or ETH
    const [amountIn, setAmountIn] = useState('');
    const [slippage, setSlippage] = useState(0.5);
    const [deadline, setDeadline] = useState(20);
    const [swapMode, setSwapMode] = useState<SwapMode>(SwapMode.ETH_TO_TOKEN);

    // Hooks
    const { balance: balanceIn } = useTokenBalance(swapHelper, tokenIn);
    const { quote, isLoading: quoteLoading } = useSwapQuote(
        swapHelper,
        tokenIn,
        tokenOut,
        amountIn,
        swapMode
    );

    // Update swap mode when tokens change
    useEffect(() => {
        if (tokenIn?.isNative && !tokenOut?.isNative) {
            setSwapMode(SwapMode.ETH_TO_TOKEN);
        } else if (!tokenIn?.isNative && tokenOut?.isNative) {
            setSwapMode(SwapMode.TOKEN_TO_ETH);
        } else {
            setSwapMode(SwapMode.TOKEN_TO_TOKEN);
        }
    }, [tokenIn, tokenOut]);

    // Handlers
    const handleSwapTokens = () => {
        const temp = tokenIn;
        setTokenIn(tokenOut);
        setTokenOut(temp);
        setAmountIn('');
    };

    const handleMaxClick = () => {
        setAmountIn(balanceIn);
    };

    const validateAmount = (): string | null => {
        if (!amountIn || parseFloat(amountIn) <= 0) {
            return 'Enter an amount';
        }
        if (parseFloat(amountIn) > parseFloat(balanceIn)) {
            return 'Insufficient balance';
        }
        return null;
    };

    const validationError = validateAmount();

    return (
        <div className="space-y-4">
            {/* Slippage Settings */}
            <SwapSettings
                slippage={slippage}
                deadline={deadline}
                onSlippageChange={setSlippage}
                onDeadlineChange={setDeadline}
            />

            {/* Input Token */}
            <div className="p-4 bg-muted/20 border border-border/50 rounded-xl space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground mb-4">
                    <span>You pay</span>
                    <div className="flex items-center gap-2">
                        <span>Balance: {parseFloat(balanceIn).toFixed(4)}</span>
                        <button
                            onClick={handleMaxClick}
                            className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full hover:bg-primary/20 transition-colors uppercase tracking-wider"
                        >
                            MAX
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <input
                        type="number"
                        value={amountIn}
                        onChange={(e) => setAmountIn(e.target.value)}
                        placeholder="0.0"
                        className="flex-1 text-3xl font-black bg-transparent outline-none placeholder:text-muted-foreground/20 min-w-0"
                    />

                    <TokenSelector
                        selectedToken={tokenIn}
                        onSelectToken={setTokenIn}
                        excludeToken={tokenOut}
                        tokens={customTokenList}
                    />
                </div>
            </div>

            {/* Swap Direction Button */}
            <div className="flex justify-center -my-6 relative z-10">
                <button
                    onClick={handleSwapTokens}
                    className="p-2 bg-background border-4 border-background rounded-xl shadow-lg hover:scale-110 transition-transform"
                >
                    <div className="p-2 bg-muted/50 rounded-lg">
                        <ArrowDown className="h-5 w-5" />
                    </div>
                </button>
            </div>

            {/* Output Token */}
            <div className="p-4 bg-muted/20 border border-border/50 rounded-xl space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                    <span>You receive</span>
                    {quote && (
                        <span className="text-primary">
                            ≈ ${(parseFloat(quote.amountOutFormatted) * 1.05).toFixed(2)} {/* Mock USD price */}
                        </span>
                    )}
                </div>

                <div className="flex gap-3">
                    <div className="flex-1 text-3xl font-black text-foreground">
                        {quoteLoading ? (
                            <span className="text-muted-foreground/20 animate-pulse">0.0</span>
                        ) : quote ? (
                            parseFloat(quote.amountOutFormatted).toFixed(6)
                        ) : parseFloat(amountIn) > 0 ? (
                            <span className="text-destructive text-lg font-bold">No Route</span>
                        ) : (
                            <span className="text-muted-foreground/20">0.0</span>
                        )}
                    </div>

                    <TokenSelector
                        selectedToken={tokenOut}
                        onSelectToken={setTokenOut}
                        excludeToken={tokenIn}
                        tokens={customTokenList}
                    />
                </div>
            </div>

            {/* Transaction Details */}
            {quote && !quoteLoading && (
                <TransactionDetails
                    quote={quote}
                    slippage={slippage}
                    tokenIn={tokenIn}
                    tokenOut={tokenOut}
                />
            )}

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
                {!tokenIn?.isNative && amountIn && parseFloat(amountIn) > 0 && (
                    <ApprovalButton
                        swapHelper={swapHelper}
                        token={tokenIn}
                        amount={amountIn}
                    />
                )}

                <SwapButton
                    swapHelper={swapHelper}
                    tokenIn={tokenIn}
                    tokenOut={tokenOut}
                    amountIn={amountIn}
                    slippage={slippage}
                    deadline={deadline}
                    swapMode={swapMode}
                    disabled={!!validationError || quoteLoading}
                    validationError={validationError}
                    onTransactionStart={onTransactionStart}
                    onTransactionSuccess={onTransactionSuccess}
                    onTransactionError={onTransactionError}
                />
            </div>
        </div>
    );
};
