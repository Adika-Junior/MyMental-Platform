from django.core.cache import cache
from typing import Callable, Any


def _version_key(namespace: str) -> str:
    return f"v:{namespace}"


def _user_version_key(namespace: str, user_id: int) -> str:
    return f"v:{namespace}:u:{user_id}"


def get_namespace_version(namespace: str, default: int = 1) -> int:
    version = cache.get(_version_key(namespace))
    if version is None:
        cache.set(_version_key(namespace), default)
        return default
    return int(version)


def bump_namespace(namespace: str) -> None:
    cache.incr(_version_key(namespace)) if cache.get(_version_key(namespace)) else cache.set(_version_key(namespace), 2)


def get_user_namespace_version(namespace: str, user_id: int, default: int = 1) -> int:
    key = _user_version_key(namespace, user_id)
    version = cache.get(key)
    if version is None:
        cache.set(key, default)
        return default
    return int(version)


def bump_user_namespace(namespace: str, user_id: int) -> None:
    key = _user_version_key(namespace, user_id)
    cache.incr(key) if cache.get(key) else cache.set(key, 2)


def build_cache_key(prefix: str, *parts: Any, version: int | None = None) -> str:
    base = ":".join([prefix, *[str(p) for p in parts]])
    return f"{base}:v{version}" if version is not None else base


def get_or_set(key: str, producer: Callable[[], Any], ttl: int = 300):
    value = cache.get(key)
    if value is not None:
        return value
    value = producer()
    cache.set(key, value, ttl)
    return value


