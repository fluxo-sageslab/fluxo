"""
Unit tests for Social Agent
Tests sentiment analysis, narrative detection, and influencer tracking
"""
import pytest
from agents.social_agent import (
    SocialAgent, 
    SentimentLevel, 
    NarrativeSignal, 
    InfluencerSignal
)


class TestSocialAgent:
    """Test suite for Social Agent"""
    
    def test_initialization(self):
        """Test Social Agent initializes correctly"""
        agent = SocialAgent(use_mock=True)
        
        # Check keywords loaded
        assert len(agent.narrative_keywords) > 0, "Should have narrative keywords"
        assert "mantle" in agent.narrative_keywords, "Should track 'mantle'"
        assert "defi" in agent.narrative_keywords, "Should track 'defi'"
        
        # Check influencers loaded
        assert len(agent.tracked_influencers) > 0, "Should have tracked influencers"
        assert "high_tier" in agent.tracked_influencers
        assert "defi_focused" in agent.tracked_influencers
        assert "mantle_ecosystem" in agent.tracked_influencers
        
        # Check data sources defined
        assert "community_channels" in agent.data_sources
        assert "sentiment_platforms" in agent.data_sources
    
    def test_sentiment_level_conversion(self):
        """Test sentiment score to level conversion"""
        agent = SocialAgent(use_mock=True)
        
        assert agent._score_to_level(0.7) == SentimentLevel.VERY_BULLISH
        assert agent._score_to_level(0.4) == SentimentLevel.BULLISH
        assert agent._score_to_level(0.0) == SentimentLevel.NEUTRAL
        assert agent._score_to_level(-0.4) == SentimentLevel.BEARISH
        assert agent._score_to_level(-0.7) == SentimentLevel.VERY_BEARISH
    
    @pytest.mark.asyncio
    async def test_sentiment_analysis_mock(self):
        """Test sentiment analysis with mock data"""
        agent = SocialAgent(use_mock=True)
        
        result = await agent.analyze_sentiment(timeframe="24h")
        
        # Validate structure
        assert hasattr(result, 'score'), "Should have sentiment score"
        assert hasattr(result, 'level'), "Should have sentiment level"
        assert hasattr(result, 'narratives'), "Should have narratives"
        assert hasattr(result, 'influencer_signals'), "Should have influencer signals"
        
        # Validate score range
        assert -1 <= result.score <= 1, "Sentiment score should be -1 to 1"
        
        # Validate narratives
        assert len(result.narratives) > 0, "Should have narratives"
        for narrative in result.narratives:
            assert hasattr(narrative, 'narrative')
            assert hasattr(narrative, 'mentions')
            assert hasattr(narrative, 'sentiment')
            assert hasattr(narrative, 'trending_score')
            assert 0 <= narrative.trending_score <= 100
        
        # Validate influencer signals
        assert len(result.influencer_signals) > 0, "Should have influencer signals"
        for signal in result.influencer_signals:
            assert hasattr(signal, 'account')
            assert hasattr(signal, 'platform')
            assert hasattr(signal, 'impact')
            assert signal.impact in ['bullish', 'bearish', 'neutral']
    
    def test_narrative_signal_creation(self):
        """Test NarrativeSignal model"""
        narrative = NarrativeSignal(
            narrative="L2 adoption accelerating",
            mentions=1250,
            sentiment=0.72,
            trending_score=85.0
        )
        
        assert narrative.narrative == "L2 adoption accelerating"
        assert narrative.mentions == 1250
        assert narrative.sentiment == 0.72
        assert narrative.trending_score == 85.0
        
        # Test to_dict
        data = narrative.to_dict()
        assert 'narrative' in data
        assert 'mentions' in data
        assert 'timestamp' in data
    
    def test_influencer_signal_creation(self):
        """Test InfluencerSignal model"""
        signal = InfluencerSignal(
            account="@CryptoWhale",
            platform="Twitter",
            message="Bullish on Mantle",
            impact="bullish",
            reach=500_000
        )
        
        assert signal.account == "@CryptoWhale"
        assert signal.platform == "Twitter"
        assert signal.impact == "bullish"
        assert signal.reach == 500_000
        
        # Test to_dict
        data = signal.to_dict()
        assert 'account' in data
        assert 'reach' in data
    
    def test_narrative_summary(self):
        """Test narrative summary generation"""
        agent = SocialAgent(use_mock=True)
        
        # Create mock sentiment
        from agents.social_agent import SocialSentiment
        
        narratives = [
            NarrativeSignal("Test narrative 1", 100, 0.5, 80.0),
            NarrativeSignal("Test narrative 2", 200, 0.6, 90.0),
            NarrativeSignal("Test narrative 3", 50, 0.4, 70.0),
        ]
        
        signals = [
            InfluencerSignal("@User1", "Twitter", "msg", "bullish", 1000),
            InfluencerSignal("@User2", "Twitter", "msg", "bearish", 2000),
        ]
        
        sentiment = SocialSentiment(
            score=0.5,
            level=SentimentLevel.BULLISH,
            narratives=narratives,
            influencer_signals=signals
        )
        
        summary = agent.get_narrative_summary(sentiment)
        
        assert 'top_narratives' in summary
        assert len(summary['top_narratives']) <= 3
        assert 'overall_sentiment' in summary
        assert 'bullish_signals' in summary
        assert summary['bullish_signals'] == 1
    
    @pytest.mark.asyncio
    async def test_different_timeframes(self):
        """Test analysis with different timeframes"""
        agent = SocialAgent(use_mock=True)
        
        for timeframe in ["1h", "24h", "7d"]:
            result = await agent.analyze_sentiment(timeframe=timeframe)
            assert result is not None, f"Should work with {timeframe}"
    
    @pytest.mark.asyncio
    async def test_focus_tokens(self):
        """Test analysis with focus tokens"""
        agent = SocialAgent(use_mock=True)
        
        result = await agent.analyze_sentiment(
            timeframe="24h",
            focus_tokens=["mETH", "MNT"]
        )
        
        assert result is not None, "Should work with focus tokens"


class TestSocialAgentIntegration:
    """Integration tests for Social Agent"""
    
    @pytest.mark.asyncio
    async def test_sentiment_to_dict(self):
        """Test sentiment serialization"""
        agent = SocialAgent(use_mock=True)
        
        result = await agent.analyze_sentiment()
        data = result.to_dict()
        
        # Validate JSON structure
        assert 'score' in data
        assert 'level' in data
        assert 'narratives' in data
        assert 'influencer_signals' in data
        assert 'summary' in data
        assert 'timestamp' in data
        
        # Validate nested structures
        assert isinstance(data['narratives'], list)
        assert isinstance(data['influencer_signals'], list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
