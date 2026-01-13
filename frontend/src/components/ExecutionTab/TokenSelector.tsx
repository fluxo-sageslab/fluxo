import React, { useState } from 'react';
import { TOKEN_LIST, type Token } from '@/lib/tokenList';
import { Search, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface TokenSelectorProps {
    selectedToken: Token;
    onSelectToken: (token: Token) => void;
    excludeToken?: Token | null;
    tokens: Token[]; // Accept dynamic list
}

export const TokenSelector: React.FC<TokenSelectorProps> = ({
    selectedToken,
    onSelectToken,
    excludeToken,
    tokens = TOKEN_LIST, // Default to static list if not provided
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredTokens = tokens.filter((token) => {
        const matchesSearch =
            token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            token.name.toLowerCase().includes(searchQuery.toLowerCase());

        const notExcluded = !excludeToken || token.address !== excludeToken.address;

        return matchesSearch && notExcluded;
    });

    const handleSelect = (token: Token) => {
        onSelectToken(token);
        setIsOpen(false);
        setSearchQuery('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 h-14 rounded-xl border-border/50 bg-background/50 hover:bg-background/80 min-w-[120px]">
                    {selectedToken.logoURI ? (
                        <img src={selectedToken.logoURI} alt={selectedToken.symbol} className="w-6 h-6 rounded-full" />
                    ) : (
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                            {selectedToken.symbol[0]}
                        </div>
                    )}
                    <span className="font-bold text-lg">{selectedToken.symbol}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md card-glass border-primary/20">
                <DialogHeader>
                    <DialogTitle>Select Token</DialogTitle>
                </DialogHeader>
                <div className="p-4 space-y-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or symbol"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-background/50"
                        />
                    </div>

                    <ScrollArea className="h-[300px] pr-4">
                        <div className="grid gap-2">
                            {filteredTokens.map((token) => (
                                <div
                                    key={token.address}
                                    onClick={() => handleSelect(token)}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-primary/10 cursor-pointer transition-colors"
                                >
                                    {token.logoURI ? (
                                        <img src={token.logoURI} alt={token.symbol} className="w-8 h-8 rounded-full" />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                                            {token.symbol[0]}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="font-bold">{token.symbol}</div>
                                        <div className="text-xs text-muted-foreground">{token.name}</div>
                                    </div>
                                    {/* Balance could be added here if we passed it down */}
                                </div>
                            ))}
                            {filteredTokens.length === 0 && (
                                <div className="text-center py-8 text-muted-foreground">
                                    No tokens found
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
};
