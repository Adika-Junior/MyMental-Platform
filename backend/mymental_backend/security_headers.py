"""
OWASP-recommended security headers middleware
Implements comprehensive security headers per OWASP guidelines
"""
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings


class SecurityHeadersMiddleware(MiddlewareMixin):
    """
    Enhanced security headers middleware following OWASP recommendations:
    - Content Security Policy (CSP)
    - Strict Transport Security (HSTS)
    - X-Content-Type-Options
    - X-Frame-Options
    - X-XSS-Protection
    - Referrer-Policy
    - Permissions-Policy
    - Cross-Origin Resource Policies
    """
    
    def process_response(self, request, response):
        # Content Security Policy (CSP) - OWASP A05:2021
        # Prevents XSS, data injection, and clickjacking
        csp_directives = [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  # 'unsafe-eval' for Next.js
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: blob: https:",
            "font-src 'self' data:",
            "connect-src 'self' http://localhost:8000 http://127.0.0.1:8000 ws://localhost:8000 ws://127.0.0.1:8000",
            "frame-ancestors 'none'",  # Prevent clickjacking
            "base-uri 'self'",
            "form-action 'self'",
            "frame-src 'none'",
            "object-src 'none'",
            "upgrade-insecure-requests",  # Force HTTPS
        ]
        response['Content-Security-Policy'] = '; '.join(csp_directives)

        # HTTP Strict Transport Security (HSTS) - OWASP A02:2021
        # Force HTTPS connections
        if not settings.DEBUG:
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload'

        # X-Content-Type-Options - Prevent MIME sniffing (OWASP A03:2021)
        response['X-Content-Type-Options'] = 'nosniff'

        # X-Frame-Options - Prevent clickjacking (OWASP A05:2021)
        response['X-Frame-Options'] = 'DENY'

        # X-XSS-Protection - Enable browser XSS filter
        response['X-XSS-Protection'] = '1; mode=block'

        # Referrer-Policy - Control referrer information
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'

        # Permissions-Policy (formerly Feature-Policy)
        # Restrict browser features to prevent abuse
        permissions = [
            "geolocation=()",
            "microphone=()",
            "camera=()",
            "payment=()",
            "usb=()",
            "magnetometer=()",
            "gyroscope=()",
            "accelerometer=()",
        ]
        response['Permissions-Policy'] = ', '.join(permissions)

        # Cross-Origin-Embedder-Policy - Prevent cross-origin data leaks
        response['Cross-Origin-Embedder-Policy'] = 'require-corp'

        # Cross-Origin-Opener-Policy - Isolate browsing contexts
        response['Cross-Origin-Opener-Policy'] = 'same-origin'

        # Cross-Origin-Resource-Policy - Control resource loading
        response['Cross-Origin-Resource-Policy'] = 'same-origin'

        return response
