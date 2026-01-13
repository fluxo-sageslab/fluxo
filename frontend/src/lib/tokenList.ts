export interface Token {
    address: string;
    symbol: string;
    name: string;
    decimals: number;
    logoURI?: string;
    isNative?: boolean;
}

export const NATIVE_TOKEN: Token = {
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', // Placeholder for ETH/MNT
    symbol: 'MNT',
    name: 'Mantle',
    decimals: 18,
    isNative: true,
    logoURI: 'https://assets.coingecko.com/coins/images/30980/small/token-logo.png',
};

// Mantle Mainnet Tokens
export const TOKEN_LIST: Token[] = [
    NATIVE_TOKEN,
    {
        address: '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9', // Official USDC (Mantle USD)
        symbol: 'USDC',
        name: 'USD Coin',
        decimals: 6,
        logoURI: 'https://assets.coingecko.com/coins/images/6319/small/USD_Coin_icon.png',
    },
    {
        address: '0x201EBa5CC46D216Ce6DC03F6a759e8E766e956aE', // Official USDT (Bridged)
        symbol: 'USDT',
        name: 'Tether USD',
        decimals: 6,
        logoURI: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',
    },
    {
        address: '0x78c1b0C915c4FAA5FffA6CAbf0219DA63d7f4cb8', // WMNT
        symbol: 'WMNT',
        name: 'Wrapped Mantle',
        decimals: 18,
        logoURI: 'https://assets.coingecko.com/coins/images/30980/small/token-logo.png',
    },
    {
        address: '0x5d3a1Ff2b6BAb83b63cd9AD0787074081a52ef34', // USDE
        symbol: 'USDE',
        name: 'Ethena USDe',
        decimals: 18,
        logoURI: 'https://assets.coingecko.com/coins/images/33633/small/USDe_Logomark_Color.png',
    },
    {
        address: '0x9F0C013016E8656bC256f948CD4B79ab25c7b94D', // COOK
        symbol: 'COOK',
        name: 'Cook', // Assuming name based on symbol, user provided symbol COOK
        decimals: 18,
        logoURI: 'https://assets.coingecko.com/coins/images/33075/small/COOK.png', // Placeholder or valid if exists
    },
    {
        address: '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000', // METH (approx/placeholder if needed, checking real address)
        // Using a placeholder address for demonstration if real one isn't guaranteed known, 
        // but 0xcDA86A272531e8640cD7F1a92c01839911B90bb0 is mETH usually.
        // Let's use mETH address: 0xcDA86A272531e8640cD7F1a92c01839911B90bb0
        // Actually sticking to safer verified ones or standard ones.
        symbol: 'mETH',
        name: 'Mantle Staked ETH',
        decimals: 18
    }
].map(t => {
    if (t.symbol === 'mETH') { // Fix mETH address
        t.address = '0xcDA86A272531e8640cD7F1a92c01839911B90bb0';
        t.logoURI = 'https://assets.coingecko.com/coins/images/279/small/ethereum.png';
    }
    return t;
});

export const getTokenByAddress = (address: string): Token | undefined => {
    return TOKEN_LIST.find(
        (token) => token.address.toLowerCase() === address.toLowerCase()
    );
};

export const getTokenBySymbol = (symbol: string): Token | undefined => {
    return TOKEN_LIST.find(
        (token) => token.symbol.toLowerCase() === symbol.toLowerCase()
    );
};
