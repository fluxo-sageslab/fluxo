'use client';

import { ExecutionTab } from '@/components/ExecutionTab/ExecutionTab';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, Sparkles } from 'lucide-react';

export default function ExchangePage() {
    return (
        <div className="space-y-6 animate-fade-in pb-12">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-3xl font-bold flex items-center gap-2">
                            <ArrowLeftRight className="h-8 w-8 text-primary" />
                            Execution Layer
                        </h1>
                        <Badge className="bg-primary/10 text-primary border-primary/30 uppercase tracking-widest text-[10px] font-black">
                            Fluxo Core
                        </Badge>
                    </div>
                    <p className="text-muted-foreground">
                        Direct token execution via Fluxo. Zero-trace available in Phase 2.
                    </p>
                </div>
            </div>

            {/* Main Execution Unit */}
            <div className="relative">
                {/* Decorative Background Elements */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[120%] bg-primary/5 blur-[100px] rounded-full pointer-events-none -z-10 opacity-50" />

                <ExecutionTab />

                {/* Footer Info */}
                <div className="mt-8 text-center space-y-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2">
                        <Sparkles className="h-3 w-3 text-primary" />
                        Powered by Fluxo
                    </p>
                    <p className="text-[10px] text-muted-foreground opacity-50 flex items-center justify-center gap-1">
                        Routing via Mantle Mainnet • Contract:
                        <a
                            href="https://mantlescan.xyz/address/0x3626a53afe81d2028c10e4c83b635d5ebf2ffe07"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-primary transition-colors underline decoration-dotted"
                        >
                            0x3626...fe07
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
