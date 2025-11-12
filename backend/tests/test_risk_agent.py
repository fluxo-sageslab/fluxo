"""
Unit tests for Risk Agent
Tests risk calculation logic, scoring, and recommendations
"""
import pytest
from agents.risk_agent import RiskAgent, PortfolioAsset, RiskLevel


class TestRiskAgent:
    """Test suite for Risk Agent"""
    
    def test_initialization(self):
        """Test Risk Agent initializes with correct weights and thresholds"""
        agent = RiskAgent()
        
        # Check weights sum to 1.0
        total_weight = sum(agent.weights.values())
        assert abs(total_weight - 1.0) < 0.01, "Weights should sum to 1.0"
        
        # Check all weights are positive
        for weight_name, weight_value in agent.weights.items():
            assert weight_value > 0, f"{weight_name} weight should be positive"
        
        # Check protocol tiers exist
        assert len(agent.protocol_tiers) > 0, "Should have protocol tiers"
        assert "merchant_moe" in agent.protocol_tiers, "Should include Merchant Moe"
        assert "fusionx" in agent.protocol_tiers, "Should include FusionX"
    
    def test_concentration_calculation(self):
        """Test Herfindahl Index concentration calculation"""
        agent = RiskAgent()
        
        # Test Case 1: Single asset (100% concentration)
        single_asset = [
            PortfolioAsset(
                token_symbol="ETH",
                token_address="0x123",
                balance=1.0,
                usd_value=3000,
                percentage_of_portfolio=100
            )
        ]
        concentration = agent._calculate_concentration(single_asset)
        assert concentration == 100, "100% in one asset should be max concentration"
        
        # Test Case 2: Perfectly diversified (4 equal assets)
        diversified = [
            PortfolioAsset(
                token_symbol=f"TOKEN{i}",
                token_address=f"0x{i}",
                balance=1.0,
                usd_value=2500,
                percentage_of_portfolio=25
            )
            for i in range(4)
        ]
        concentration = agent._calculate_concentration(diversified)
        # HHI = 4 * (0.25^2) = 0.25, Score = 25
        assert 20 <= concentration <= 30, "Equal 4-asset portfolio should have low concentration"
        
        # Test Case 3: Empty portfolio
        empty = []
        concentration = agent._calculate_concentration(empty)
        assert concentration == 0, "Empty portfolio should have 0 concentration"
    
    @pytest.mark.asyncio
    async def test_liquidity_scoring(self):
        """Test liquidity risk calculation with protocol tiers"""
        agent = RiskAgent()
        
        # Test Case 1: High liquidity protocols
        high_liquidity = [
            PortfolioAsset(
                token_symbol="USDC",
                token_address="0x123",
                balance=10000,
                usd_value=10000,
                percentage_of_portfolio=50,
                protocol="merchant_moe"  # High tier
            ),
            PortfolioAsset(
                token_symbol="mETH",
                token_address="0x456",
                balance=3,
                usd_value=10000,
                percentage_of_portfolio=50,
                protocol="fusionx"  # High tier
            )
        ]
        liquidity_score = await agent._calculate_liquidity(high_liquidity)
        assert liquidity_score < 30, "High liquidity protocols should have low risk"
        
        # Test Case 2: Low liquidity protocols
        low_liquidity = [
            PortfolioAsset(
                token_symbol="TOKEN",
                token_address="0x789",
                balance=1000,
                usd_value=5000,
                percentage_of_portfolio=100,
                protocol="clipper_dex"  # Low tier
            )
        ]
        liquidity_score = await agent._calculate_liquidity(low_liquidity)
        assert liquidity_score > 50, "Low liquidity protocols should have high risk"
    
    @pytest.mark.asyncio
    async def test_volatility_scoring(self):
        """Test volatility calculation by asset type"""
        agent = RiskAgent()
        
        # Test Case 1: All stablecoins (very low volatility)
        stables = [
            PortfolioAsset(
                token_symbol="USDC",
                token_address="0x123",
                balance=10000,
                usd_value=10000,
                percentage_of_portfolio=100
            )
        ]
        vol_score = await agent._calculate_volatility(stables)
        assert vol_score < 10, "Stablecoins should have very low volatility"
        
        # Test Case 2: High volatility tokens
        volatile = [
            PortfolioAsset(
                token_symbol="MNT",
                token_address="0x456",
                balance=5000,
                usd_value=5000,
                percentage_of_portfolio=100
            )
        ]
        vol_score = await agent._calculate_volatility(volatile)
        assert vol_score > 50, "MNT should have high volatility"
    
    @pytest.mark.asyncio
    async def test_contract_risk_scoring(self):
        """Test contract risk with protocol tiers"""
        agent = RiskAgent()
        
        # Test Case 1: Established protocols (low risk)
        established = [
            PortfolioAsset(
                token_symbol="mETH",
                token_address="0x123",
                balance=10,
                usd_value=35000,
                percentage_of_portfolio=100,
                protocol="merchant_moe"  # Established tier
            )
        ]
        contract_risk = await agent._calculate_contract_risk(established)
        assert contract_risk < 20, "Established protocols should have low contract risk"
        
        # Test Case 2: Unknown protocols (high risk)
        unknown = [
            PortfolioAsset(
                token_symbol="RANDOM",
                token_address="0x789",
                balance=1000,
                usd_value=5000,
                percentage_of_portfolio=100,
                protocol="unknown_dex"
            )
        ]
        contract_risk = await agent._calculate_contract_risk(unknown)
        assert contract_risk > 50, "Unknown protocols should have high contract risk"
    
    def test_correlation_risk_scoring(self):
        """Test market correlation risk (Kelvin's hypothesis)"""
        agent = RiskAgent()
        
        # Test Case 1: Healthy market (low correlation)
        score, condition = agent._calculate_correlation_risk(0.3)
        assert condition == "healthy_rotation", "Low correlation should be healthy"
        assert score < 30, "Healthy market should have low risk"
        
        # Test Case 2: Neutral market
        score, condition = agent._calculate_correlation_risk(0.5)
        assert condition == "neutral_consolidation", "Mid correlation should be neutral"
        assert 30 <= score <= 50, "Neutral market should have moderate risk"
        
        # Test Case 3: Stressed market (high correlation)
        score, condition = agent._calculate_correlation_risk(0.8)
        assert condition == "stressed_correlation", "High correlation should be stressed"
        assert score > 60, "Stressed market should have high risk"
    
    def test_risk_level_assignment(self):
        """Test risk score to level conversion"""
        agent = RiskAgent()
        
        assert agent._get_risk_level(25) == RiskLevel.LOW
        assert agent._get_risk_level(40) == RiskLevel.MEDIUM
        assert agent._get_risk_level(60) == RiskLevel.HIGH
        assert agent._get_risk_level(85) == RiskLevel.CRITICAL
    
    @pytest.mark.asyncio
    async def test_full_portfolio_analysis(self):
        """Test complete portfolio risk analysis"""
        agent = RiskAgent()
        
        # Run analysis with different market conditions
        for correlation in [0.3, 0.5, 0.8]:
            result = await agent.analyze_portfolio(
                wallet_address="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
                market_correlation=correlation
            )
            
            # Validate result structure
            assert hasattr(result, 'score'), "Result should have score"
            assert hasattr(result, 'level'), "Result should have level"
            assert hasattr(result, 'factors'), "Result should have factors"
            assert hasattr(result, 'recommendations'), "Result should have recommendations"
            assert hasattr(result, 'market_condition'), "Result should have market_condition"
            
            # Validate score range
            assert 0 <= result.score <= 100, "Score should be 0-100"
            
            # Validate all factors present
            assert 'concentration' in result.factors
            assert 'liquidity' in result.factors
            assert 'volatility' in result.factors
            assert 'contract_risk' in result.factors
            assert 'correlation_risk' in result.factors
            
            # Validate recommendations exist
            assert len(result.recommendations) > 0, "Should have recommendations"
    
    def test_recommendations_generation(self):
        """Test recommendation logic"""
        agent = RiskAgent()
        
        # Mock metrics
        from agents.risk_agent import RiskMetrics
        
        # High concentration scenario
        high_conc_metrics = RiskMetrics(
            concentration_score=70.0,
            liquidity_score=20.0,
            volatility_score=30.0,
            contract_risk_score=10.0,
            correlation_risk_score=15.0,
            overall_score=50.0
        )
        
        mock_assets = [
            PortfolioAsset(
                token_symbol="mETH",
                token_address="0x123",
                balance=10,
                usd_value=35000,
                percentage_of_portfolio=70
            )
        ]
        
        recommendations = agent._generate_recommendations(
            high_conc_metrics,
            mock_assets,
            "healthy_rotation"
        )
        
        # Should recommend diversification
        assert any("concentration" in rec.lower() for rec in recommendations), \
            "Should recommend addressing concentration"
    
    def test_edge_cases(self):
        """Test edge cases and error handling"""
        agent = RiskAgent()
        
        # Empty asset list
        empty_result = agent._calculate_concentration([])
        assert empty_result == 0, "Empty portfolio should return 0"
        
        # Extreme values
        extreme_asset = [
            PortfolioAsset(
                token_symbol="TOKEN",
                token_address="0x123",
                balance=999999999,
                usd_value=999999999999,
                percentage_of_portfolio=100
            )
        ]
        concentration = agent._calculate_concentration(extreme_asset)
        assert concentration == 100, "Single asset should always be 100% concentration"


class TestRiskAgentIntegration:
    """Integration tests for Risk Agent with other components"""
    
    @pytest.mark.asyncio
    async def test_risk_analysis_with_alerts(self):
        """Integration test with alert manager - temporarily skipped"""
        pytest.skip("Skipping due to circular import - refactoring needed")
        
        agent = RiskAgent()
        alert_manager = AlertManager()
        
        # Analyze high-risk portfolio
        result = await agent.analyze_portfolio(
            wallet_address="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
            market_correlation=0.8  # Stressed market
        )
        
        # Check for alerts
        alerts = await alert_manager.check_risk_alerts(
            wallet_address="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
            risk_score=result.score,
            risk_factors=result.factors,
            market_condition=result.market_condition
        )
        
        # Should trigger at least one alert (high concentration)
        assert len(alerts) > 0, "High risk should trigger alerts"
        
        # Verify alert content
        for alert in alerts:
            assert hasattr(alert, 'alert_type')
            assert hasattr(alert, 'severity')
            assert hasattr(alert, 'message')
            assert len(alert.message) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
