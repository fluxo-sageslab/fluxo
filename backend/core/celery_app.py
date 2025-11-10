from celery import Celery

from .config import CELERY_BROKER_URL, CELERY_RESULT_BACKEND


# Create the Celery app using URLs defined in `core.config` so credentials
# and hosts can be managed through environment variables.
celery_app = Celery(
    "Backend-Worker",
    broker=CELERY_BROKER_URL,
    backend=CELERY_RESULT_BACKEND,
    include=[
        'tasks.agent_tasks.onchain_task',
        'tasks.agent_tasks.automation_task',
        'tasks.agent_tasks.execution_task',
        'tasks.agent_tasks.governance_task',
        'tasks.agent_tasks.macro_task',
        'tasks.agent_tasks.market_data_task',
        'tasks.agent_tasks.portfolio_task',
        'tasks.agent_tasks.research_task',
        'tasks.agent_tasks.risk_task',
        'tasks.agent_tasks.social_task',
        'tasks.agent_tasks.x402_task',
        'tasks.agent_tasks.yield_task'
    ],
)

# Also allow programmatic updates from CELERY_CONFIG if needed elsewhere.
celery_app.conf.update({
    'broker_url': CELERY_BROKER_URL,
    'result_backend': CELERY_RESULT_BACKEND,
})