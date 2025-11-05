import uuid
from django.utils.deprecation import MiddlewareMixin
from ..observability import request_context


class RequestIdMiddleware(MiddlewareMixin):
    """Attach a unique request ID to each request and propagate to logs."""

    def process_request(self, request):
        req_id = request.headers.get('X-Request-ID') or str(uuid.uuid4())
        request.META['X_REQUEST_ID'] = req_id
        request_context.set_request_id(req_id)

    def process_response(self, request, response):
        req_id = request.META.get('X_REQUEST_ID')
        if req_id:
            response['X-Request-ID'] = req_id
        request_context.clear_request_id()
        return response


