# fix_circular_import.py
import os
import re

def fix_redis_connect():
    """Fix models/redis_connect.py"""
    content = '''from typing import Optional
import redis.asyncio as redis

class DatabaseConnector:
    _instance: Optional['DatabaseConnector'] = None
    _redis_client: Optional[redis.Redis] = None
    
    def _new_(cls):
        if cls._instance is None:
            cls.instance = super().new_(cls)
        return cls._instance
    
    async def connect(self):
        """Initialize Redis connection with settings loaded at runtime"""
        if self._redis_client is None:
            from core.config import Settings
            settings = Settings()
            
            self._redis_client = redis.Redis(
                host=settings.REDIS_HOST,
                port=settings.REDIS_PORT,
                password=settings.REDIS_PASSWORD,
                db=settings.REDIS_DB,
                decode_responses=True
            )
        return self._redis_client
    
    async def disconnect(self):
        """Close Redis connection"""
        if self._redis_client:
            await self._redis_client.close()
            self._redis_client = None
    
    @property
    def redis(self) -> redis.Redis:
        """Get Redis client (must call connect first)"""
        if self._redis_client is None:
            raise RuntimeError("Database not connected. Call await connect() first.")
        return self._redis_client

db_connector = DatabaseConnector()
'''
    with open('models/redis_connect.py', 'w') as f:
        f.write(content)
    print("✓ Fixed models/redis_connect.py")

def fix_config():
    """Fix core/config.py to remove circular import"""
    with open('core/config.py', 'r') as f:
        content = f.read()
    
    # Remove the problematic import line
    content = re.sub(r'from models\.redis_connect import db_connector\n', '', content)
    
    # Add helper functions at the end
    if 'def get_redis_connector' not in content:
        content += '''

def get_redis_connector():
    """Get Redis connector instance (lazy import to avoid circular dependency)"""
    from models.redis_connect import db_connector
    return db_connector
'''
    
    with open('core/config.py', 'w') as f:
        f.write(content)
    print("✓ Fixed core/config.py")

if __name__ == "__main__":
    fix_redis_connect()
    fix_config()
    print("\n✅ Circular import fixed! Run tests again.")
