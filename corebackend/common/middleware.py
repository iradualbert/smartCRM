from django.utils.deprecation import MiddlewareMixin
from django.middleware.csrf import CsrfViewMiddleware


class DisableCsrfCheckForDRF(MiddlewareMixin):
    def process_request(self, request):
        # Check if the request is for a DRF view
        if request.path.startswith('/api/'):
            setattr(request, '_dont_enforce_csrf_checks', True)

class CsrfDisableMiddleware(CsrfViewMiddleware):
    def _reject(self, request, reason):
        # Check if the request is for a DRF view
        if request.path.startswith('/api/'):
            return None
        return super()._reject(request, reason)