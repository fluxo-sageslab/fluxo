"""
Whale Tracking API Routes
"""
from fastapi import APIRouter, HTTPException, Query
from tasks.agent_tasks.whale_task import whale_task
from celery.result import AsyncResult
from core import celery_app
from api.models.schemas import APIResponse

router = APIRouter()

@router.post('/track')
async def track_whales(
    timeframe: str = Query("24h", description="Time period (1h, 24h, 7d)"),
    min_value_usd: float = Query(100000, description="Minimum transaction value")
):
    """
    Start whale tracking task
    
    Monitors large wallet movements and generates alerts
    """
    try:
        task = whale_task.delay(timeframe, min_value_usd)
        
        return APIResponse(
            success=True,
            message="Whale tracking started",
            data={
                "task_id": task.id,
                "status": "processing",
                "timeframe": timeframe,
                "min_value_usd": min_value_usd,
                "check_status": f"/api/whale/status/{task.id}"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get('/status/{task_id}')
async def get_whale_status(task_id: str):
    """Check whale tracking task status"""
    task_result = AsyncResult(task_id, app=celery_app)
    
    response_data = {
        'task_id': task_id,
        'status': task_result.state.lower()
    }
    
    if task_result.state == 'SUCCESS':
        response_data['result'] = task_result.result
        response_data['message'] = 'Whale tracking completed'
    elif task_result.state == 'FAILURE':
        response_data['error'] = str(task_result.info)
        response_data['message'] = 'Tracking failed'
    
    return APIResponse(
        success=True,
        message="Task status retrieved",
        data=response_data
    )


@router.get('/whale')
async def whale_health():
    """Health check"""
    return {
        'agent': 'whale_tracker',
        'status': 'operational',
        'data_sources': ['Mock (Week 2)', 'Dune (Week 3)', 'Nansen (Week 3)']
    }
