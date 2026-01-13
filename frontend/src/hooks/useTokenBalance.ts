import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { FusionXSwapHelper } from '@/lib/fusionXSwapHelper';
import type { Token } from '@/lib/tokenList';

export const useTokenBalance = (
    swapHelper: FusionXSwapHelper | null,
    token: Token | null,
    userAddress?: string
) => {
    const { data: balance, isLoading, refetch } = useQuery({
        queryKey: ['tokenBalance', token?.address, userAddress],
        queryFn: async () => {
            if (!swapHelper || !token) return null;

            if (token.isNative) {
                return await swapHelper.getETHBalance(userAddress);
            } else {
                const result = await swapHelper.getTokenBalance(token.address, userAddress);
                return result.formatted;
            }
        },
        enabled: !!swapHelper && !!token,
        refetchInterval: 10000, // Refetch every 10 seconds
    });

    return {
        balance: balance || '0',
        isLoading,
        refetch,
    };
};
