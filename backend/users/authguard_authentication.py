from __future__ import annotations

import time
from typing import Any, Optional

import httpx
import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed


User = get_user_model()


_JWKS_CACHE: dict[str, Any] = {"keys": None, "fetched_at": 0.0}


def _get_jwks_keys() -> dict[str, Any]:
    """
    Fetch AuthGuard JWKS and return a mapping: kid -> jwk.

    Kept in-process for performance; for multi-pod deployments add an external cache.
    """

    now = time.time()
    ttl_seconds = getattr(settings, "AUTHGUARD_JWKS_CACHE_TTL_SECONDS", 3600)
    if _JWKS_CACHE["keys"] and (now - float(_JWKS_CACHE["fetched_at"])) < ttl_seconds:
        return _JWKS_CACHE["keys"]  # type: ignore[return-value]

    jwks_url = getattr(settings, "AUTHGUARD_JWKS_URL", "") or ""
    if not jwks_url:
        raise AuthenticationFailed("AuthGuard JWKS not configured")

    verify = not bool(getattr(settings, "AUTHGUARD_TLS_INSECURE_SKIP_VERIFY", False))
    timeout_seconds = int(getattr(settings, "AUTHGUARD_CLIENT_TIMEOUT_SECONDS", 10))

    try:
        with httpx.Client(verify=verify, timeout=timeout_seconds) as client:
            res = client.get(jwks_url)
            res.raise_for_status()
            jwks = res.json()
    except Exception as e:  # pragma: no cover
        raise AuthenticationFailed(f"JWKS fetch failed: {e}") from e

    keys = jwks.get("keys", []) or []
    kid_to_jwk: dict[str, Any] = {}
    for k in keys:
        kid = k.get("kid")
        if kid:
            kid_to_jwk[str(kid)] = k

    if not kid_to_jwk:
        raise AuthenticationFailed("JWKS contained no usable keys")

    _JWKS_CACHE["keys"] = kid_to_jwk
    _JWKS_CACHE["fetched_at"] = now
    return kid_to_jwk


class AuthGuardJWTAuthentication(BaseAuthentication):
    """
    Validate AuthGuard access tokens signed with RS256 via JWKS.
    Then map token `sub` -> `users.User.authguard_user_id`.
    """

    keyword = "Bearer"

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != self.keyword.lower():
            # For strictness, do not attempt parsing other auth schemes.
            return None

        token = parts[1].strip()
        if not token:
            return None

        try:
            header = jwt.get_unverified_header(token)
            if header.get("alg") != "RS256":
                raise AuthenticationFailed("Invalid token algorithm")
        except Exception as e:
            raise AuthenticationFailed(f"Invalid token header: {e}") from e

        kid = header.get("kid")
        if not kid:
            raise AuthenticationFailed("Token missing kid")

        kid_to_jwk = _get_jwks_keys()
        jwk = kid_to_jwk.get(str(kid))
        if not jwk:
            raise AuthenticationFailed("Unknown token key (kid)")

        # PyJWT uses cryptography under the hood to build an RSA public key.
        try:
            public_key = jwt.algorithms.RSAAlgorithm.from_jwk(jwk)
        except Exception as e:  # pragma: no cover
            raise AuthenticationFailed(f"Unable to construct RSA key: {e}") from e

        issuer = getattr(settings, "AUTHGUARD_ISSUER", "") or ""
        audience = getattr(settings, "AUTHGUARD_AUDIENCE", "") or ""
        clock_skew_seconds = int(getattr(settings, "AUTHGUARD_JWT_CLOCK_SKEW_SECONDS", 30))

        options = {
            "require": ["exp", "sub"],
        }
        jwt_kwargs: dict[str, Any] = {
            "algorithms": ["RS256"],
            "options": options,
            "leeway": clock_skew_seconds,
        }
        if issuer:
            jwt_kwargs["issuer"] = issuer
        if audience:
            jwt_kwargs["audience"] = audience

        try:
            decoded = jwt.decode(token, public_key, **jwt_kwargs)
        except Exception as e:
            raise AuthenticationFailed(f"Token validation failed: {e}") from e

        sub = decoded.get("sub")
        if not sub:
            raise AuthenticationFailed("Token missing sub")

        try:
            user = User.objects.get(authguard_user_id=sub)
        except User.DoesNotExist:
            raise AuthenticationFailed("User not mapped in Django")  # do not auto-create

        # Coarse authorization: trust AuthGuard role claim to reflect admin-level access.
        # (MyMental's "counselor" maps to AuthGuard "user", so we do not override it.)
        token_role = decoded.get("role")
        if token_role in ("admin", "superadmin"):
            user.user_type = "admin"
        elif token_role == "user" and getattr(user, "user_type", None) == "admin":
            user.user_type = "client"

        # Attach claims for downstream fine-grained checks (if needed).
        setattr(user, "_authguard_claims", decoded)

        return user, decoded

