import React, { useState } from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SwapSettingsProps {
    slippage: number;
    deadline: number;
    onSlippageChange: (value: number) => void;
    onDeadlineChange: (value: number) => void;
}

export const SwapSettings: React.FC<SwapSettingsProps> = ({
    slippage,
    deadline,
    onSlippageChange,
    onDeadlineChange,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="rounded-xl border border-border/50 bg-background/50 overflow-hidden">
            <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2 text-muted-foreground">
                    <Settings className="h-3 w-3" />
                    Transaction Settings
                </span>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>

            {isOpen && (
                <div className="p-4 pt-0 space-y-4 animate-accordion-down">
                    <div className="space-y-3">
                        <Label className="text-xs font-medium">Slippage Tolerance</Label>
                        <div className="flex gap-2">
                            {[0.1, 0.5, 1.0].map((value) => (
                                <Button
                                    key={value}
                                    variant={slippage === value ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => onSlippageChange(value)}
                                    className="flex-1 text-xs"
                                >
                                    {value}%
                                </Button>
                            ))}
                            <div className="relative w-20">
                                <Input
                                    type="number"
                                    value={slippage}
                                    onChange={(e) => onSlippageChange(parseFloat(e.target.value))}
                                    className="h-9 px-2 text-right pr-6"
                                />
                                <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">%</span>
                            </div>
                        </div>
                        {slippage > 5 && (
                            <p className="text-[10px] text-destructive font-medium">High slippage! You may get a bad rate.</p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-medium">Transaction Deadline</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={deadline}
                                onChange={(e) => onDeadlineChange(parseFloat(e.target.value))}
                                className="w-24 h-9"
                            />
                            <span className="text-xs text-muted-foreground">minutes</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
