import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { FusionXSwapHelper } from '@/lib/fusionXSwapHelper';
import type { Token } from '@/lib/tokenList';
import { useTokenApproval } from '@/hooks/useTokenApproval';

interface ApprovalButtonProps {
    swapHelper: FusionXSwapHelper | null;
    token: Token;
    amount: string;
}

export const ApprovalButton: React.FC<ApprovalButtonProps> = ({
    swapHelper,
    token,
    amount,
}) => {
    const { isApproved, checkingApproval, approve, isApproving } = useTokenApproval(
        swapHelper,
        token,
        amount
    );

    if (!swapHelper || checkingApproval || isApproved) {
        return null;
    }

    const handleApprove = async () => {
        try {
            await approve();
        } catch (error) {
            console.error('Approval failed:', error);
        }
    };

    return (
        <Button
            onClick={handleApprove}
            disabled={isApproving}
            className="w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 font-bold uppercase tracking-wider"
        >
            {isApproving ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Approving {token.symbol}...
                </>
            ) : (
                `Approve ${token.symbol}`
            )}
        </Button>
    );
};
