import contextvars


# Request-scoped context
_request_id_var = contextvars.ContextVar('request_id', default=None)


def get_request_id():
    return _request_id_var.get()


def set_request_id(request_id: str):
    _request_id_var.set(request_id)


def clear_request_id():
    _request_id_var.set(None)


class RequestIdFilter:
    """Python logging filter that injects request_id into log records."""

    def filter(self, record):
        req_id = get_request_id()
        record.request_id = req_id if req_id else "-"
        return True


