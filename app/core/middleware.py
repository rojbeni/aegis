import time
import uuid

import structlog
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

logger = structlog.get_logger()


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        structlog.contextvars.clear_contextvars()

        request_id = str(uuid.uuid4())

        # Bind context that will be included in EVERY log during this request
        structlog.contextvars.bind_contextvars(
            request_id=request_id,
            method=request.method,
            path=request.url.path,
            client_host=request.client.host if request.client else "unknown",
        )

        start_time = time.perf_counter()
        response = await call_next(request)
        process_time = time.perf_counter() - start_time

        # Add duration to the final log
        logger.info(
            "http.request",
            status_code=response.status_code,
            duration=f"{process_time:.4f}s",
        )

        # Inject request_id into response headers (helpful for debugging)
        response.headers["X-Request-ID"] = request_id
        return response
