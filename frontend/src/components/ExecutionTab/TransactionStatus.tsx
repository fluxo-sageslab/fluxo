import React from 'react';
import { TransactionStatus as TxStatus } from '@/types/swap.types';
import { Loader2, CheckCircle, AlertTriangle, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface TransactionStatusProps {
    status: TxStatus;
    txHash: string | null;
    onClose: () => void;
}

export const TransactionStatus: React.FC<TransactionStatusProps> = ({ status, txHash, onClose }) => {
    if (status === TxStatus.IDLE) return null;

    const getStatusContent = () => {
        switch (status) {
            case TxStatus.APPROVAL_PENDING:
                return {
                    icon: <Loader2 className="h-10 w-10 animate-spin text-primary" />,
                    title: 'Approving Token',
                    desc: 'Please confirm the approval in your wallet',
                    color: 'border-primary/50'
                };
            case TxStatus.APPROVAL_CONFIRMED:
                return {
                    icon: <CheckCircle className="h-10 w-10 text-green-500" />,
                    title: 'Approval Confirmed',
                    desc: 'Token enabled for swapping',
                    color: 'border-green-500/50'
                };
            case TxStatus.SWAP_PENDING:
                return {
                    icon: <Loader2 className="h-10 w-10 animate-spin text-primary" />,
                    title: 'Swapping...',
                    desc: 'Transaction submitted to Mantle',
                    color: 'border-primary/50'
                };
            case TxStatus.SWAP_CONFIRMED:
                return {
                    icon: <CheckCircle className="h-10 w-10 text-green-500" />,
                    title: 'Swap Successful',
                    desc: 'tokens received',
                    color: 'border-green-500/50'
                };
            case TxStatus.FAILED:
                return {
                    icon: <AlertTriangle className="h-10 w-10 text-destructive" />,
                    title: 'Transaction Failed',
                    desc: 'Please try again',
                    color: 'border-destructive/50'
                };
            default:
                return null;
        }
    };

    const content = getStatusContent();
    if (!content) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
            <Card className={`w-full max-w-sm p-6 text-center card-glass border-2 ${content.color} relative`}>
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 h-6 w-6 rounded-full"
                    onClick={onClose}
                >
                    <X className="h-4 w-4" />
                </Button>

                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="rounded-full bg-background/50 p-4 shadow-inner ring-1 ring-border/50">
                        {content.icon}
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-xl font-black uppercase tracking-tight">{content.title}</h3>
                        <p className="text-sm text-muted-foreground">{content.desc}</p>
                    </div>

                    {txHash && (
                        <a
                            href={`https://explorer.mantle.xyz/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-xs text-primary hover:underline mt-2"
                        >
                            View on Explorer <ExternalLink className="h-3 w-3" />
                        </a>
                    )}
                </div>
            </Card>
        </div>
    );
};
