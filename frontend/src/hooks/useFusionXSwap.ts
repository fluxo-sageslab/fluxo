import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { FusionXSwapHelper, createSwapHelper, handleSwapError } from '@/lib/fusionXSwapHelper';

// FusionX V2 Router (Mantle Mainnet)
const CONTRACT_ADDRESS = '0x3626a53afe81D2028C10e4C83b635d5eBf2ffe07';

declare global {
    interface Window {
        ethereum?: any;
    }
}

export const useFusionXSwap = () => {
    const [swapHelper, setSwapHelper] = useState<FusionXSwapHelper | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initialize SDK
    useEffect(() => {
        const initSwapHelper = async () => {
            try {
                if (!window.ethereum) {
                    // If no wallet, we can't really do much for swapping, but could define read-only provider
                    return;
                }

                const provider = new ethers.providers.Web3Provider(window.ethereum);
                // Check if connected
                const accounts = await provider.listAccounts();

                if (accounts.length > 0) {
                    const helper = await createSwapHelper({
                        contractAddress: CONTRACT_ADDRESS,
                        provider,
                        chainId: 5000 // Mantle Mainnet
                    });

                    setSwapHelper(helper);
                    setIsConnected(true);
                }
            } catch (err: any) {
                setError(err.message);
                console.error('Failed to initialize swap helper:', err);
            }
        };

        initSwapHelper();
    }, []);

    // Connect wallet
    const connectWallet = useCallback(async () => {
        try {
            if (!window.ethereum) {
                throw new Error('MetaMask not installed');
            }

            await window.ethereum.request({ method: 'eth_requestAccounts' });

            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const helper = await createSwapHelper({
                contractAddress: CONTRACT_ADDRESS,
                provider,
                chainId: 5000 // Mantle Mainnet
            });

            setSwapHelper(helper);
            setIsConnected(true);
            setError(null);
        } catch (err: any) {
            setError(err.message);
            throw err;
        }
    }, []);

    return {
        swapHelper,
        isConnected,
        error,
        connectWallet,
    };
};
