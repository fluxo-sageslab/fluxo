import React, { useState, useEffect } from 'react';
import { useFusionXSwap } from '@/hooks/useFusionXSwap';
import { usePortfolio } from '@/hooks/useFluxo'; // Use standard hook
import { SwapInterface } from './SwapInterface';
import { TransactionStatus } from './TransactionStatus';
import { TransactionStatus as TxStatus } from '@/types/swap.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Wallet, AlertTriangle } from 'lucide-react';
import { TOKEN_LIST } from '@/lib/tokenList';

export const ExecutionTab: React.FC = () => {
    const { swapHelper, isConnected, error: swapError, connectWallet } = useFusionXSwap();
    const { data: portfolioData } = usePortfolio(); // Use hook
    const [txStatus, setTxStatus] = useState<TxStatus>(TxStatus.IDLE);
    const [txHash, setTxHash] = useState<string | null>(null);
    const [customTokenList, setCustomTokenList] = useState<any[]>(TOKEN_LIST);

    // Sync Portfolio tokens to Swap List
    useEffect(() => {
        if (!portfolioData) return;

        let rawAssets: any[] = [];
        // Robust parsing similar to Portfolio Page
        if (Array.isArray(portfolioData)) {
            rawAssets = portfolioData;
        } else if (typeof portfolioData === 'object' && portfolioData !== null) {
            const potentialAssets = (portfolioData as any).assets || (portfolioData as any).result || (portfolioData as any).data;
            if (Array.isArray(potentialAssets)) {
                rawAssets = potentialAssets;
            }
        }

        if (rawAssets.length > 0) {
            const portfolioTokens = rawAssets.map((asset: any) => ({
                address: asset.token_address || asset.address,
                symbol: asset.token_symbol || asset.symbol,
                name: asset.token_symbol || asset.symbol,
                decimals: 18,
                logoURI: '',
                isNative: false
            })).filter(t => t.address && t.symbol);

            // Merge avoiding duplicates
            const validNewTokens = portfolioTokens.filter((pt: any) =>
                !TOKEN_LIST.some(t => t.address.toLowerCase() === pt.address.toLowerCase())
            );

            if (validNewTokens.length > 0) {
                setCustomTokenList(prev => {
                    // Check against CURRENT state to strictly avoid dups if run multiple times
                    const newUnique = validNewTokens.filter((nt: any) =>
                        !prev.some(p => p.address.toLowerCase() === nt.address.toLowerCase())
                    );
                    return newUnique.length > 0 ? [...prev, ...newUnique] : prev;
                });
            }
        }
    }, [portfolioData]);

    if (swapError) {
        return (
            <Card className="border-destructive/20 bg-destructive/5">
                <CardContent className="flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <AlertTriangle className="h-12 w-12 text-destructive" />
                    <h3 className="text-lg font-bold text-destructive">Connection Error</h3>
                    <p className="text-sm text-muted-foreground">{swapError}</p>
                    <Button onClick={connectWallet} variant="outline" className="border-destructive/20 hover:bg-destructive/10">
                        Retry Connection
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!isConnected) {
        return (
            <Card className="card-glass border-primary/20">
                <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                        <div className="relative h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
                            <Wallet className="h-10 w-10 text-primary" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-black uppercase tracking-tight">Connect Wallet</h2>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            Connect your wallet to start trading on Fluxo.
                        </p>
                    </div>

                    <Button
                        onClick={connectWallet}
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider px-8"
                    >
                        Access Execution Layer
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="max-w-xl mx-auto">
            <Card className="card-glass border-primary/10 shadow-2xl overflow-visible">
                <CardContent className="p-6">
                    <SwapInterface
                        swapHelper={swapHelper!}
                        customTokenList={customTokenList}
                        onTransactionStart={(hash) => {
                            setTxStatus(TxStatus.SWAP_PENDING);
                            setTxHash(hash);
                        }}
                        onTransactionSuccess={(hash) => {
                            setTxStatus(TxStatus.SWAP_CONFIRMED);
                            setTxHash(hash);
                        }}
                        onTransactionError={() => {
                            setTxStatus(TxStatus.FAILED);
                        }}
                    />
                </CardContent>
            </Card>

            <TransactionStatus
                status={txStatus}
                txHash={txHash}
                onClose={() => setTxStatus(TxStatus.IDLE)}
            />
        </div>
    );
};
