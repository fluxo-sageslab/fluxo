'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Sparkles, Shield, Eye, Key } from 'lucide-react';

export default function SovereignShieldPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 animate-fade-in">
            <Card className="max-w-3xl w-full border-primary/30 bg-background/95 backdrop-blur-xl card-glass relative overflow-hidden">
                {/* Frosted Glass Overlay Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
                <div className="absolute inset-0 pattern-grid opacity-5 pointer-events-none" />

                <CardContent className="relative z-10 p-8 md:p-12 space-y-8">
                    {/* Icon & Status */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                            <div className="relative h-20 w-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center">
                                <Lock className="h-10 w-10 text-primary" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                                The <span className="text-primary">Sovereign Shield</span>
                            </h1>
                            <p className="text-lg text-muted-foreground font-medium">
                                Your Alpha, Under Lock & Key.
                            </p>
                        </div>

                        <Badge className="bg-primary/10 text-primary border-primary/30 px-4 py-1.5">
                            <Sparkles className="h-3 w-3 mr-1.5" />
                            Status: In the Lab
                        </Badge>
                    </div>

                    {/* The Problem Section */}
                    <div className="space-y-3 p-6 rounded-2xl bg-muted/30 border border-border/50">
                        <h2 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            The Problem
                        </h2>
                        <p className="text-sm leading-relaxed text-foreground/90">
                            In 2025, privacy coins surged by <span className="font-bold text-primary">71%</span> because
                            the world realized that transparency is a vulnerability. In DeFi, your strategy is
                            currently <span className="font-bold">public property</span>.
                        </p>
                    </div>

                    {/* The Solution Section */}
                    <div className="space-y-3 p-6 rounded-2xl bg-primary/5 border border-primary/30">
                        <h2 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            The Solution
                        </h2>
                        <p className="text-sm leading-relaxed text-foreground/90">
                            We are currently integrating our <span className="font-bold text-primary">Sovereign Layer</span>.
                            This isn't just an update; it's a <span className="font-bold">total isolation</span> of
                            your strategic intent.
                        </p>
                    </div>

                    {/* What's Coming Section */}
                    <div className="space-y-4">
                        <h2 className="text-sm font-black uppercase tracking-widest text-primary flex items-center gap-2">
                            <Key className="h-4 w-4" />
                            What's Coming in Phase 2
                        </h2>

                        <div className="space-y-3">
                            <div className="flex gap-3 p-4 rounded-xl bg-background/50 border border-border/50 list-item-glass">
                                <div className="shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-sm">Private Trade Simulations</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Model complex rebalances and swaps without the mempool seeing your "Buy" or "Sell" intent.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 p-4 rounded-xl bg-background/50 border border-border/50 list-item-glass">
                                <div className="shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-sm">x402 Encrypted Delivery</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Your alerts won't just be secure; they will be invisible. End-to-end encryption
                                        from the Mantle ledger to your private device.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-3 p-4 rounded-xl bg-background/50 border border-border/50 list-item-glass">
                                <div className="shrink-0 h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                                    <div className="h-2 w-2 rounded-full bg-primary" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-bold text-sm">Zero-Trace Intelligence</h3>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                        Research tokens and wallets in a "dark-room" environment where no third-party
                                        (not even Fluxo) can log your queries.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* CTA Button */}
                    <div className="flex flex-col items-center gap-3 pt-4">
                        <a
                            href="https://forms.gle/kwLm9PBNXnU3DXXd6"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full"
                        >
                            <Button
                                size="lg"
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold uppercase tracking-wider shadow-lg shadow-primary/20"
                            >
                                <Lock className="h-4 w-4 mr-2" />
                                Notify Me When Shield is Live
                            </Button>
                        </a>
                        <p className="text-xs text-muted-foreground text-center">
                            Join the waitlist and be the first to access sovereign privacy
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
