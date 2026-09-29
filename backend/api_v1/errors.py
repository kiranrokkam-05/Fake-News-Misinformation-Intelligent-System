from uuid import uuid4


def error_payload(code: str, message: str, details=None, request_id: str | None = None):
    return {
        "error": {
            "code": code,
            "message": message,
            "request_id": request_id or str(uuid4()),
            "details": details or {},
        }
    }
