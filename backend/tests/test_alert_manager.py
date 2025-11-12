"""
Unit tests for Alert Manager
Tests alert triggering, cooldowns, and storage
"""
import pytest
from datetime import datetime, timedelta
from services.alert_manager import AlertManager
from api.models.alerts import AlertType, AlertSeverity


class TestAlertManager:
    """Test suite for Alert Manager"""
    
    def test_initialization(self):
        """Test Alert Manager initializes correctly"""
        manager = AlertManager()
        
        # Check default triggers loaded
        assert len(manager.default_triggers) > 0
        assert AlertType.HIGH_RISK_SCORE in manager.default_triggers
        assert AlertType.CRITICAL_RISK_SCORE in manager.default_triggers
    
    @pytest.mark.asyncio
    async def test_critical_risk_alert_creation(self):
        """Test critical risk alert triggers correctly"""
        manager = AlertManager()
        
        alerts = await manager.check_risk_alerts(
            wallet_address="0x123",
            risk_score=90.0,  # Critical
            risk_factors={
                "concentration": 80.0,
                "liquidity": 30.0,
                "volatility": 60.0,
                "contract_risk": 20.0,
                "correlation_risk": 40.0
            },
            market_condition="stressed_correlation"
        )
        
        # Should trigger critical alert
        assert len(alerts) > 0, "Should trigger alerts"
        
        # Check for critical alert
        critical_alerts = [a for a in alerts if a.severity == AlertSeverity.CRITICAL]
        assert len(critical_alerts) > 0, "Should have critical alert"
    
    @pytest.mark.asyncio
    async def test_concentration_alert(self):
        """Test concentration alert triggers"""
        manager = AlertManager()
        
        alerts = await manager.check_risk_alerts(
            wallet_address="0x123",
            risk_score=55.0,
            risk_factors={
                "concentration": 70.0,  # High
                "liquidity": 20.0,
                "volatility": 30.0,
                "contract_risk": 10.0,
                "correlation_risk": 15.0
            },
            market_condition="healthy_rotation"
        )
        
        # Check for concentration alert
        conc_alerts = [
            a for a in alerts 
            if a.alert_type == AlertType.CONCENTRATION_WARNING
        ]
        assert len(conc_alerts) > 0, "Should trigger concentration alert"
    
    @pytest.mark.asyncio
    async def test_market_stress_alert(self):
        """Test market stress alert (Kelvin's hypothesis)"""
        manager = AlertManager()
        
        alerts = await manager.check_risk_alerts(
            wallet_address="0x123",
            risk_score=60.0,
            risk_factors={
                "concentration": 40.0,
                "liquidity": 30.0,
                "volatility": 40.0,
                "contract_risk": 20.0,
                "correlation_risk": 75.0  # Stressed
            },
            market_condition="stressed_correlation"
        )
        
        # Check for market stress alert
        stress_alerts = [
            a for a in alerts 
            if a.alert_type == AlertType.MARKET_STRESS
        ]
        assert len(stress_alerts) > 0, "Should trigger market stress alert"
    
    def test_cooldown_logic(self):
        """Test alert cooldown prevents spam"""
        manager = AlertManager()
        
        alert_key = "test_wallet:high_risk"
        
        # First check - should pass
        assert manager._check_cooldown(alert_key, 60), "First check should pass"
        
        # Update cooldown
        manager._update_cooldown(alert_key)
        
        # Second check - should fail (within cooldown)
        assert not manager._check_cooldown(alert_key, 60), "Should be in cooldown"
    
    def test_alert_storage(self):
        """Test alerts are stored correctly"""
        manager = AlertManager()
        
        from api.models.alerts import Alert
        import uuid
        
        alert = Alert(
            alert_id=str(uuid.uuid4()),
            alert_type=AlertType.HIGH_RISK_SCORE,
            severity=AlertSeverity.HIGH,
            title="Test Alert",
            message="Test message",
            wallet_address="0x123",
            triggered_by="test"
        )
        
        initial_count = len(manager.alerts)
        manager._store_alert(alert)
        
        assert len(manager.alerts) == initial_count + 1, "Alert should be stored"
    
    def test_get_alerts_by_wallet(self):
        """Test retrieving alerts for specific wallet"""
        manager = AlertManager()
        
        from api.models.alerts import Alert
        import uuid
        
        # Store alerts for different wallets
        for i in range(3):
            alert = Alert(
                alert_id=str(uuid.uuid4()),
                alert_type=AlertType.HIGH_RISK_SCORE,
                severity=AlertSeverity.HIGH,
                title=f"Alert {i}",
                message="Test",
                wallet_address=f"0x{i}",
                triggered_by="test"
            )
            manager._store_alert(alert)
        
        # Get alerts for specific wallet
        wallet_alerts = manager.get_alerts(wallet_address="0x1")
        assert len(wallet_alerts) == 1, "Should get alerts for specific wallet"
        assert wallet_alerts[0].wallet_address == "0x1"
    
    def test_undelivered_alerts(self):
        """Test retrieving undelivered alerts"""
        manager = AlertManager()
        
        from api.models.alerts import Alert
        import uuid
        
        # Create delivered and undelivered alerts
        delivered = Alert(
            alert_id=str(uuid.uuid4()),
            alert_type=AlertType.HIGH_RISK_SCORE,
            severity=AlertSeverity.HIGH,
            title="Delivered",
            message="Test",
            triggered_by="test",
            delivered=True
        )
        
        undelivered = Alert(
            alert_id=str(uuid.uuid4()),
            alert_type=AlertType.HIGH_RISK_SCORE,
            severity=AlertSeverity.HIGH,
            title="Undelivered",
            message="Test",
            triggered_by="test",
            delivered=False
        )
        
        manager._store_alert(delivered)
        manager._store_alert(undelivered)
        
        pending = manager.get_undelivered_alerts()
        assert any(a.alert_id == undelivered.alert_id for a in pending)
        assert not any(a.alert_id == delivered.alert_id for a in pending)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
