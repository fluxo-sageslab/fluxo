'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import {
  MessageSquare,
  TrendingUp,
  Twitter,
  Search,
  Loader2,
  AlertTriangle,
  User,
  Heart,
  Repeat2,
  MessageCircle,
  Hash,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSocialSentiment } from '@/hooks/useFluxo';

interface TrendingTopic {
  text: string;
  score: number;
}

interface RecentTweet {
  platform: string;
  text: string;
  created_at: string;
  author_id: string;
  author_name: string;
  author_followers: number;
  likes: number;
  retweets: number;
  replies: number;
}

export default function SocialPage() {
  const [tokenInput, setTokenInput] = useState('MNT');
  const [activeToken, setActiveToken] = useState('');
  const { sentiment: result, isLoading, error, refetch } = useSocialSentiment();

  const handleAnalyze = async () => {
    if (!tokenInput.trim()) return;
    setActiveToken(tokenInput.toUpperCase());
    await refetch(tokenInput.toUpperCase());
  };

  // Extract narratives data from result
  const narratives = result?.narratives;
  const trendingTopics: TrendingTopic[] = narratives?.trending_topics || [];
  const recentTweets: RecentTweet[] = narratives?.recent_tweets || [];
  const tokenSymbol = result?.token_symbol || activeToken;

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header with Input */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-background via-muted/20 to-primary/5 p-8 md:p-12 shadow-2xl">
        <div className="absolute inset-0 pattern-grid opacity-10" />

        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="px-4 py-1.5 border-primary/40 bg-primary/10 text-primary font-[family-name:var(--font-vt323)] text-xl tracking-widest uppercase">
              SOCIAL INTEL v2.0
            </Badge>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">STREAMING LIVE</span>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none uppercase italic">
              Social <span className="text-primary">Narratives</span>
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-muted-foreground font-medium leading-relaxed opacity-80">
              Real-time social sentiment analysis tracking trending narratives, community discussions, and market sentiment across platforms.
            </p>
          </div>

          {/* Token Input */}
          <div className="flex gap-3 max-w-md">
            <Input
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
              placeholder="Enter token symbol (e.g., USDC, BTC, ETH)"
              className="bg-background/50 border-primary/30 focus:border-primary input-glass"
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <Button
              onClick={handleAnalyze}
              disabled={isLoading || !tokenInput.trim()}
              className="px-6 bg-primary hover:bg-primary/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && !result && (
        <Card className="border-destructive/50 card-glass">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button variant="outline" onClick={handleAnalyze}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <>
          {/* Stats Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/50 bg-background/50 stat-glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  Token Analyzed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black tracking-tight">{tokenSymbol}</div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-background/50 stat-glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black tracking-tight">{trendingTopics.length}</div>
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-background/50 stat-glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Twitter className="h-4 w-4" />
                  Recent Posts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black tracking-tight">{recentTweets.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Trending Topics */}
          <Card className="border-border/50 bg-background/50 card-glass">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                Trending Narratives
              </CardTitle>
              <CardDescription>Top discussions ranked by engagement score</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                {trendingTopics.length > 0 ? (
                  <div className="space-y-4">
                    {trendingTopics.map((topic, index) => (
                      <div key={index} className="p-4 rounded-xl border border-border/50 bg-muted/20 list-item-glass">
                        <div className="flex items-start gap-3">
                          <Badge className="shrink-0 bg-primary/10 text-primary border-primary/20">
                            #{index + 1}
                          </Badge>
                          <div className="flex-1 space-y-2">
                            <p className="text-sm leading-relaxed text-foreground">{topic.text}</p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                <span className="font-bold">Score: {topic.score}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                    <p>No trending topics found</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Recent Tweets */}
          <Card className="border-border/50 bg-background/50 card-glass">
            <CardHeader>
              <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                <Twitter className="h-4 w-4 text-primary" />
                Recent Social Activity
              </CardTitle>
              <CardDescription>Latest posts and discussions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {recentTweets.length > 0 ? (
                  <div className="space-y-4">
                    {recentTweets.map((tweet, index) => (
                      <div key={index} className="p-4 rounded-xl border border-border/50 bg-muted/10 list-item-glass">
                        {/* Author Info */}
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-sm">{tweet.author_name}</p>
                              <Badge variant="secondary" className="text-[9px] h-4">
                                @{tweet.author_id.slice(0, 8)}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {tweet.author_followers.toLocaleString()} followers
                            </p>
                          </div>
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {new Date(tweet.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Tweet Content */}
                        <p className="text-sm leading-relaxed mb-3">{tweet.text}</p>

                        {/* Engagement Stats */}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border/30">
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            <span>{tweet.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Repeat2 className="h-3 w-3" />
                            <span>{tweet.retweets}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>{tweet.replies}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <Twitter className="h-12 w-12 mb-4 opacity-20" />
                    <p>No recent activity found</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!result && !isLoading && !error && (
        <Card className="border-border/50 bg-background/50 card-glass">
          <CardContent className="flex flex-col items-center justify-center py-24">
            <Sparkles className="h-16 w-16 text-primary/30 mb-4" />
            <h3 className="text-xl font-bold mb-2">Ready to Analyze</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Enter a token symbol above and click Analyze to discover social narratives and trending discussions.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
