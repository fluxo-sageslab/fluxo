"""
Alert API Routes
Endpoints for retrieving and managing alerts
"""
from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
import logging

from api.models.alerts import Alert
from api.models.schemas import APIResponse
from services.alert_manager import AlertManager

logger = logging.getLogger(__name__)

router = APIRouter()

# Initialize alert manager (in production, use dependency injection)
alert_manager = AlertManager()


@router.get("/")
async def get_alerts(
    wallet_address: Optional[str] = Query(None, description="Filter by wallet address"),
    limit: int = Query(50, ge=1, le=100, description="Number of alerts to return")
):
    """
    Get alerts for a user
    
    Query params:
    - wallet_address: Optional filter by wallet
    - limit: Max number of alerts (default 50)
    """
    try:
        alerts = alert_manager.get_alerts(wallet_address, limit)
        
        return APIResponse(
            success=True,
            message=f"Retrieved {len(alerts)} alerts",
            data={
                "alerts": [alert.to_dict() for alert in alerts],
                "total": len(alerts),
                "wallet_address": wallet_address
            }
        )
    except Exception as e:
        logger.error(f"Failed to get alerts: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/undelivered")
async def get_undelivered_alerts():
    """
    Get all undelivered alerts (for x402 delivery service)
    """
    try:
        alerts = alert_manager.get_undelivered_alerts()
        
        return APIResponse(
            success=True,
            message=f"Retrieved {len(alerts)} undelivered alerts",
            data={
                "alerts": [alert.to_dict() for alert in alerts],
                "total": len(alerts)
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/mark-delivered/{alert_id}")
async def mark_alert_delivered(
    alert_id: str,
    delivery_method: str = Query(..., description="Delivery method used")
):
    """
    Mark an alert as delivered
    Used by x402 delivery service after successful delivery
    """
    try:
        alert_manager.mark_delivered(alert_id, delivery_method)
        
        return APIResponse(
            success=True,
            message="Alert marked as delivered",
            data={"alert_id": alert_id, "delivery_method": delivery_method}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/health")
async def alerts_health():
    """Alert system health check"""
    total_alerts = len(alert_manager.alerts)
    undelivered = len(alert_manager.get_undelivered_alerts())
    
    return {
        "service": "alerts",
        "status": "operational",
        "stats": {
            "total_alerts": total_alerts,
            "undelivered": undelivered,
            "delivered": total_alerts - undelivered
        },
        "alert_types": [t.value for t in alert_manager.default_triggers.keys()]
    }
