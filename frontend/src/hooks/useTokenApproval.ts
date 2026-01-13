import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { FusionXSwapHelper } from '@/lib/fusionXSwapHelper';
import type { Token } from '@/lib/tokenList';

export const useTokenApproval = (
    swapHelper: FusionXSwapHelper | null,
    token: Token | null,
    amount: string
) => {
    const queryClient = useQueryClient();

    // Check approval status
    const { data: isApproved, isLoading: checkingApproval } = useQuery({
        queryKey: ['tokenApproval', token?.address, amount],
        queryFn: async () => {
            if (!swapHelper || !token || !amount || token.isNative) return true;

            try {
                return await swapHelper.checkApproval(token.address, amount);
            } catch (error) {
                console.error('Error checking approval:', error);
                return false;
            }
        },
        enabled: !!swapHelper && !!token && !!amount && !token.isNative,
        refetchInterval: 5000,
    });

    // Approve token
    const approveMutation = useMutation({
        mutationFn: async () => {
            if (!swapHelper || !token) throw new Error('Missing dependencies');

            // Approve max amount for better UX (user only needs to approve once)
            return await swapHelper.approveToken(token.address);
        },
        onSuccess: () => {
            // Invalidate approval check to refetch
            queryClient.invalidateQueries({ queryKey: ['tokenApproval', token?.address] });
        },
    });

    return {
        isApproved: isApproved ?? false,
        checkingApproval,
        approve: approveMutation.mutateAsync,
        isApproving: approveMutation.isPending,
        approvalError: approveMutation.error,
    };
};
