"""Application configuration helpers.

This module centralizes simple config values and environment-backed
settings. Keep secrets and credentials out of source control — set them
via environment variables or a secrets manager and reference them here.

Examples of URL formats for Celery broker/result-backend are below.

Redis broker/result backend:
	redis://[:password]@hostname:port/db
	e.g. redis://:s3cr3t@redis.example.com:6379/0


"""

import os
from typing import Final

# Celery broker and result backend. Prefer setting these in the environment
# - CELERY_BROKER_URL
# - CELERY_RESULT_BACKEND

CELERY_BROKER_URL: Final[str] = os.getenv(
		"CELERY_BROKER_URL", "redis://localhost:6379/0"
)

# By default use the same Redis for results; override with CELERY_RESULT_BACKEND
CELERY_RESULT_BACKEND: Final[str] = os.getenv(
		"CELERY_RESULT_BACKEND", CELERY_BROKER_URL
)

# Helpful: expose a small dict for direct Celery config update
CELERY_CONFIG = {
		"broker": CELERY_BROKER_URL,
		"broker_url": CELERY_BROKER_URL,
		"backend": CELERY_RESULT_BACKEND,
		"result_backend": CELERY_RESULT_BACKEND,
}


DEFILLAMA_URL_ENDPOINTS: Final[dict[str, str]] = {
    'protocols': 'https://api.llama.fi/protocols',
    'chains': 'https://api.llama.fi/chains',
    'defi': 'https://api.llama.fi/defi',
    'protocol': 'https://api.llama.fi/protocol/{protocol_slug}',
    'pools':'https://yields.llama.fi/pools'
}

MANTLE_RPC_URL = 'https://rpc..'