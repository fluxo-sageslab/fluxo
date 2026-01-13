/**
 * FusionX Swap Helper SDK
 * 
 * A comprehensive TypeScript SDK for interacting with the FusionXSwapHelper smart contract.
 * This module abstracts all Web3 complexity and provides type-safe, easy-to-use functions
 * for performing token swaps on the FusionX DEX.
 * 
 * @module fusionXSwapHelper
 * @version 1.0.0
 */

import { ethers } from 'ethers';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Supported blockchain networks
 */
export enum SupportedNetwork {
    MAINNET = 5000, // Mantle Mainnet
    TESTNET = 5001, // Mantle Testnet
}

/**
 * Swap transaction result
 */
export interface SwapResult {
    /** Transaction hash */
    transactionHash: string;
    /** Amount of tokens/ETH received */
    amountOut: string;
    /** Amount of tokens/ETH sent */
    amountIn: string;
    /** Block number where transaction was mined */
    blockNumber: number;
    /** Gas used for the transaction */
    gasUsed: string;
}

/**
 * Quote result for swap estimation
 */
export interface QuoteResult {
    /** Expected output amount in token's smallest unit */
    amountOut: string;
    /** Expected output amount formatted for display */
    amountOutFormatted: string;
    /** Estimated price impact percentage */
    priceImpact?: string;
}

/**
 * Token information
 */
export interface TokenInfo {
    /** Token contract address */
    address: string;
    /** Token symbol (e.g., "DAI") */
    symbol: string;
    /** Token name (e.g., "Dai Stablecoin") */
    name: string;
    /** Number of decimals */
    decimals: number;
}

/**
 * Transaction options
 */
export interface TransactionOptions {
    /** Maximum slippage tolerance (0-100) */
    slippageTolerance?: number;
    /** Transaction deadline in minutes from now */
    deadlineMinutes?: number;
    /** Gas limit override */
    gasLimit?: string;
    /** Gas price override (in gwei) */
    gasPrice?: string;
    /** Custom deadline timestamp (overrides deadlineMinutes) */
    customDeadline?: number;
}

/**
 * SDK Configuration
 */
export interface SwapHelperConfig {
    /** Contract address of FusionXSwapHelper */
    contractAddress: string;
    /** Ethereum provider (e.g., from MetaMask) */
    provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider;
    /** Network chain ID */
    chainId?: number;
}

// ============================================================================
// CONTRACT ABI
// ============================================================================

const SWAP_HELPER_ABI = [
    "function swapExactTokens(address tokenIn, address tokenOut, uint256 amountIn, uint256 minAmountOut, uint256 deadline) external returns (uint256 amountOut)",
    "function swapTokensForExact(address tokenIn, address tokenOut, uint256 amountOut, uint256 maxAmountIn, uint256 deadline) external returns (uint256 amountIn)",
    "function swapExactETHForTokens(address token, uint256 minAmountOut, uint256 deadline) external payable returns (uint256 amountOut)",
    "function swapETHForExactTokens(address token, uint256 amountOut, uint256 deadline) external payable returns (uint256 ethUsed)",
    "function swapExactTokensForETH(address token, uint256 amountIn, uint256 minETHOut, uint256 deadline) external returns (uint256 ethOut)",
    "function swapTokensForExactETH(address token, uint256 ethOut, uint256 maxAmountIn, uint256 deadline) external returns (uint256 amountIn)",
    "function getTokenQuote(address tokenIn, address tokenOut, uint256 amountIn) external view returns (uint256 amountOut)",
    "function getETHToTokenQuote(address token, uint256 ethIn) external view returns (uint256 tokenOut)",
    "function getTokenToETHQuote(address token, uint256 tokenIn) external view returns (uint256 ethOut)",
    "function WETH() external view returns (address)",
    "function router() external view returns (address)",
    "event TokenSwap(address indexed user, address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut)",
    "event ETHSwap(address indexed user, address indexed token, uint256 ethAmount, uint256 tokenAmount, bool ethToToken)"
];

const ERC20_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) external view returns (uint256)",
    "function balanceOf(address account) external view returns (uint256)",
    "function decimals() external view returns (uint8)",
    "function symbol() external view returns (string)",
    "function name() external view returns (string)",
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateMinAmountOut(amountOut: string, slippageTolerance: number): string {
    const slippageMultiplier = (100 - slippageTolerance) / 100;
    const amountBN = ethers.BigNumber.from(amountOut);
    const minAmount = amountBN.mul(Math.floor(slippageMultiplier * 1000)).div(1000);
    return minAmount.toString();
}

function calculateMaxAmountIn(amountIn: string, slippageTolerance: number): string {
    const slippageMultiplier = (100 + slippageTolerance) / 100;
    const amountBN = ethers.BigNumber.from(amountIn);
    const maxAmount = amountBN.mul(Math.ceil(slippageMultiplier * 1000)).div(1000);
    return maxAmount.toString();
}

function calculateDeadline(deadlineMinutes: number): number {
    return Math.floor(Date.now() / 1000) + deadlineMinutes * 60;
}

function formatTokenAmount(amount: string, decimals: number): string {
    return ethers.utils.formatUnits(amount, decimals);
}

function parseTokenAmount(amount: string, decimals: number): string {
    return ethers.utils.parseUnits(amount, decimals).toString();
}

// ============================================================================
// MAIN SDK CLASS
// ============================================================================

export class FusionXSwapHelper {
    private contract: ethers.Contract;
    private provider: ethers.providers.Web3Provider | ethers.providers.JsonRpcProvider;
    private signer: ethers.Signer | null = null;
    private contractAddress: string;

    constructor(config: SwapHelperConfig) {
        this.contractAddress = config.contractAddress;
        this.provider = config.provider;
        this.contract = new ethers.Contract(
            config.contractAddress,
            SWAP_HELPER_ABI,
            config.provider
        );
    }

    async connect(): Promise<void> {
        if (this.provider instanceof ethers.providers.Web3Provider) {
            this.signer = this.provider.getSigner();
            this.contract = this.contract.connect(this.signer);
        } else {
            throw new Error('Cannot connect signer to JsonRpcProvider');
        }
    }

    private ensureConnected(): void {
        if (!this.signer) {
            throw new Error('SDK not connected. Call connect() first.');
        }
    }

    async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);

        const [symbol, name, decimals] = await Promise.all([
            tokenContract.symbol(),
            tokenContract.name(),
            tokenContract.decimals(),
        ]);

        return {
            address: tokenAddress,
            symbol,
            name,
            decimals,
        };
    }

    async getTokenBalance(tokenAddress: string, ownerAddress?: string): Promise<{ raw: string; formatted: string }> {
        const address = ownerAddress || (await this.signer?.getAddress());
        if (!address) throw new Error('No address provided or connected');

        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
        const [balance, decimals] = await Promise.all([
            tokenContract.balanceOf(address),
            tokenContract.decimals(),
        ]);

        return {
            raw: balance.toString(),
            formatted: formatTokenAmount(balance.toString(), decimals),
        };
    }

    async getETHBalance(address?: string): Promise<string> {
        const addr = address || (await this.signer?.getAddress());
        if (!addr) throw new Error('No address provided or connected');
        const balance = await this.provider.getBalance(addr);
        return ethers.utils.formatEther(balance);
    }

    async checkApproval(tokenAddress: string, amount: string): Promise<boolean> {
        this.ensureConnected();
        const ownerAddress = await this.signer!.getAddress();
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
        const decimals = await tokenContract.decimals();
        const amountBN = ethers.utils.parseUnits(amount, decimals);
        const allowance = await tokenContract.allowance(ownerAddress, this.contractAddress);
        return allowance.gte(amountBN);
    }

    async approveToken(tokenAddress: string, amount?: string): Promise<ethers.ContractReceipt> {
        this.ensureConnected();
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, this.signer!);
        let approvalAmount: ethers.BigNumber;

        if (amount) {
            const decimals = await tokenContract.decimals();
            approvalAmount = ethers.utils.parseUnits(amount, decimals);
        } else {
            approvalAmount = ethers.constants.MaxUint256;
        }

        const tx = await tokenContract.approve(this.contractAddress, approvalAmount);
        return await tx.wait();
    }

    // --- QUOTE METHODS ---

    async getTokenToTokenQuote(tokenInAddress: string, tokenOutAddress: string, amountIn: string): Promise<QuoteResult> {
        const tokenIn = await this.getTokenInfo(tokenInAddress);
        const tokenOut = await this.getTokenInfo(tokenOutAddress);
        const amountInParsed = parseTokenAmount(amountIn, tokenIn.decimals);

        const amountOut = await this.contract.getTokenQuote(tokenInAddress, tokenOutAddress, amountInParsed);

        return {
            amountOut: amountOut.toString(),
            amountOutFormatted: formatTokenAmount(amountOut.toString(), tokenOut.decimals),
        };
    }

    async getETHToTokenQuote(tokenAddress: string, ethAmount: string): Promise<QuoteResult> {
        const token = await this.getTokenInfo(tokenAddress);
        const ethAmountParsed = ethers.utils.parseEther(ethAmount);
        const amountOut = await this.contract.getETHToTokenQuote(tokenAddress, ethAmountParsed);

        return {
            amountOut: amountOut.toString(),
            amountOutFormatted: formatTokenAmount(amountOut.toString(), token.decimals),
        };
    }

    async getTokenToETHQuote(tokenAddress: string, tokenAmount: string): Promise<QuoteResult> {
        const token = await this.getTokenInfo(tokenAddress);
        const tokenAmountParsed = parseTokenAmount(tokenAmount, token.decimals);
        const ethOut = await this.contract.getTokenToETHQuote(tokenAddress, tokenAmountParsed);

        return {
            amountOut: ethOut.toString(),
            amountOutFormatted: ethers.utils.formatEther(ethOut),
        };
    }

    // --- SWAP METHODS ---

    async swapExactTokensForTokens(
        tokenInAddress: string,
        tokenOutAddress: string,
        amountIn: string,
        options: TransactionOptions = {}
    ): Promise<SwapResult> {
        this.ensureConnected();

        const { slippageTolerance = 0.5, deadlineMinutes = 20, customDeadline, gasLimit, gasPrice } = options;

        const [tokenIn, tokenOut] = await Promise.all([
            this.getTokenInfo(tokenInAddress),
            this.getTokenInfo(tokenOutAddress),
        ]);

        const amountInParsed = parseTokenAmount(amountIn, tokenIn.decimals);
        const quote = await this.contract.getTokenQuote(tokenInAddress, tokenOutAddress, amountInParsed);
        const minAmountOut = calculateMinAmountOut(quote.toString(), slippageTolerance);
        const deadline = customDeadline || calculateDeadline(deadlineMinutes);

        const txOptions: any = {};
        if (gasLimit) txOptions.gasLimit = gasLimit;
        if (gasPrice) txOptions.gasPrice = ethers.utils.parseUnits(gasPrice, 'gwei');

        const tx = await this.contract.swapExactTokens(
            tokenInAddress,
            tokenOutAddress,
            amountInParsed,
            minAmountOut,
            deadline,
            txOptions
        );

        const receipt = await tx.wait();
        const swapEvent = receipt.events?.find((e: any) => e.event === 'TokenSwap');
        const actualAmountOut = swapEvent?.args?.amountOut?.toString() || minAmountOut;

        return {
            transactionHash: receipt.transactionHash,
            amountIn: amountInParsed,
            amountOut: actualAmountOut,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
        };
    }

    async swapExactETHForTokens(
        tokenAddress: string,
        ethAmount: string,
        options: TransactionOptions = {}
    ): Promise<SwapResult> {
        this.ensureConnected();

        const { slippageTolerance = 0.5, deadlineMinutes = 20, customDeadline, gasLimit, gasPrice } = options;

        const ethAmountParsed = ethers.utils.parseEther(ethAmount);
        const quote = await this.contract.getETHToTokenQuote(tokenAddress, ethAmountParsed);
        const minAmountOut = calculateMinAmountOut(quote.toString(), slippageTolerance);
        const deadline = customDeadline || calculateDeadline(deadlineMinutes);

        const txOptions: any = { value: ethAmountParsed };
        if (gasLimit) txOptions.gasLimit = gasLimit;
        if (gasPrice) txOptions.gasPrice = ethers.utils.parseUnits(gasPrice, 'gwei');

        const tx = await this.contract.swapExactETHForTokens(
            tokenAddress,
            minAmountOut,
            deadline,
            txOptions
        );

        const receipt = await tx.wait();
        const swapEvent = receipt.events?.find((e: any) => e.event === 'ETHSwap');
        const actualAmountOut = swapEvent?.args?.tokenAmount?.toString() || minAmountOut;

        return {
            transactionHash: receipt.transactionHash,
            amountIn: ethAmountParsed.toString(),
            amountOut: actualAmountOut,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
        };
    }

    async swapExactTokensForETH(
        tokenAddress: string,
        tokenAmount: string,
        options: TransactionOptions = {}
    ): Promise<SwapResult> {
        this.ensureConnected();
        const { slippageTolerance = 0.5, deadlineMinutes = 20, customDeadline, gasLimit, gasPrice } = options;

        const token = await this.getTokenInfo(tokenAddress);
        const tokenAmountParsed = parseTokenAmount(tokenAmount, token.decimals);
        const quote = await this.contract.getTokenToETHQuote(tokenAddress, tokenAmountParsed);
        const minETHOut = calculateMinAmountOut(quote.toString(), slippageTolerance);
        const deadline = customDeadline || calculateDeadline(deadlineMinutes);

        const txOptions: any = {};
        if (gasLimit) txOptions.gasLimit = gasLimit;
        if (gasPrice) txOptions.gasPrice = ethers.utils.parseUnits(gasPrice, 'gwei');

        const tx = await this.contract.swapExactTokensForETH(
            tokenAddress,
            tokenAmountParsed,
            minETHOut,
            deadline,
            txOptions
        );

        const receipt = await tx.wait();
        const swapEvent = receipt.events?.find((e: any) => e.event === 'ETHSwap');
        const actualETHOut = swapEvent?.args?.ethAmount?.toString() || minETHOut;

        return {
            transactionHash: receipt.transactionHash,
            amountIn: tokenAmountParsed,
            amountOut: actualETHOut,
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
        };
    }
}

export async function createSwapHelper(config: SwapHelperConfig): Promise<FusionXSwapHelper> {
    const helper = new FusionXSwapHelper(config);
    await helper.connect();
    return helper;
}

export function handleSwapError(error: any): Error {
    // Simple error wrapping as detailed parsing logic was in previous implementation
    // but let's keep basic structure
    let message = error.reason || error.data?.message || error.message || 'Unknown swap error';
    return new Error(message);
}

export default FusionXSwapHelper;
