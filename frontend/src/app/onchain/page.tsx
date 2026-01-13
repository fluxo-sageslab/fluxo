'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  Search,
  RefreshCw,
  ExternalLink,
  Layers,
  Loader2,
  AlertTriangle,
  Twitter,
  Globe,
} from 'lucide-react';
import { formatCurrency, formatCompactNumber, cn } from '@/lib/utils';
import { useProtocols } from '@/hooks/useFluxo';

export default function OnchainPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const { protocols, isLoading, error, refetch } = useProtocols();

  // Calculate Total TVL from all protocols
  const totalTvl = protocols.reduce((sum, p) => sum + (p.tvl || 0), 0);

  // Get unique categories
  const categories = ['All', ...Array.from(new Set(protocols.map(p => p.category).filter(Boolean)))].sort();

  // Filter protocols by category and search
  const filteredProtocols = protocols.filter(p => {
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    const matchesSearch = searchQuery === '' ||
      p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Sort by TVL descending
  const sortedProtocols = [...filteredProtocols].sort((a, b) => (b.tvl || 0) - (a.tvl || 0));

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">On-Chain Analytics</h1>
            <p className="text-muted-foreground mt-1">Real-time blockchain data and protocol tracking</p>
          </div>
        </div>
        <Card className="card-glass">
          <CardContent className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading protocol data...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in pb-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">On-Chain Analytics</h1>
            <p className="text-muted-foreground mt-1">Real-time blockchain data and protocol tracking</p>
          </div>
        </div>
        <Card className="border-destructive/50 card-glass">
          <CardContent className="flex flex-col items-center justify-center py-24">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={refetch}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">On-Chain Analytics</h1>
          <p className="text-muted-foreground mt-1">Real-time blockchain data and protocol tracking</p>
        </div>
        <Button onClick={refetch} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-border/50 bg-background/50 stat-glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Total TVL
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight">{formatCurrency(totalTvl)}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all protocols</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-background/50 stat-glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Total Protocols
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight">{protocols.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Active on Mantle</p>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-background/50 stat-glass">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black tracking-tight">{categories.length - 1}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique categories</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-border/50 bg-background/50 card-glass">
        <CardHeader>
          <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
            <Search className="h-4 w-4 text-primary" />
            Filter Protocols
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Search by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-glass"
          />
          <ScrollArea className="w-full">
            <div className="flex gap-2 pb-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant={categoryFilter === category ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer whitespace-nowrap badge-glass',
                    categoryFilter === category && 'bg-primary text-primary-foreground'
                  )}
                  onClick={() => setCategoryFilter(category)}
                >
                  {category}
                </Badge>
              ))}
            </div>
          </ScrollArea>
          <p className="text-xs text-muted-foreground">
            Showing {filteredProtocols.length} of {protocols.length} protocols
          </p>
        </CardContent>
      </Card>

      {/* Protocols List */}
      <Card className="border-border/50 bg-background/50 card-glass">
        <CardHeader>
          <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            Mantle Protocols
          </CardTitle>
          <CardDescription>DeFi protocols ranked by TVL</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            {sortedProtocols.length > 0 ? (
              <div className="space-y-3">
                {sortedProtocols.map((protocol, index) => (
                  <div
                    key={protocol.slug || index}
                    className="p-4 rounded-xl border border-border/50 bg-muted/10 list-item-glass"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="shrink-0">
                            #{index + 1}
                          </Badge>
                          <div>
                            <h3 className="font-bold text-sm">{protocol.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-[9px] h-4">
                                {protocol.category}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                {protocol.chain}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {protocol.url && (
                            <a
                              href={protocol.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <Globe className="h-3 w-3" />
                              Website
                            </a>
                          )}
                          {protocol.twitter && (
                            <a
                              href={protocol.twitter}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <Twitter className="h-3 w-3" />
                              Twitter
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold text-muted-foreground">TVL</p>
                        <p className="text-lg font-black tracking-tight">
                          {formatCurrency(protocol.tvl || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Layers className="h-12 w-12 mb-4 opacity-20" />
                <p>No protocols found</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
