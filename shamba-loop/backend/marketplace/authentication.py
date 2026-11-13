from dataclasses import dataclass
from functools import cached_property

import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed


@dataclass(frozen=True)
class ClerkPrincipal:
    id: str

    @property
    def pk(self) -> str:
        return self.id

    @property
    def is_authenticated(self) -> bool:
        return True


class ClerkJWTAuthentication(BaseAuthentication):
    @cached_property
    def jwks_client(self):
        if not settings.CLERK_JWKS_URL:
            raise AuthenticationFailed("Authentication is not configured.")
        return jwt.PyJWKClient(settings.CLERK_JWKS_URL, cache_keys=True)

    def authenticate(self, request):
        authorization = get_authorization_header(request).split()
        if not authorization:
            return None
        if len(authorization) != 2 or authorization[0].lower() != b"bearer":
            raise AuthenticationFailed("Use a valid bearer session token.")
        if not settings.CLERK_JWT_ISSUER:
            raise AuthenticationFailed("Authentication is not configured.")

        try:
            token = authorization[1].decode("utf-8")
            signing_key = self.jwks_client.get_signing_key_from_jwt(token)
            options = {"verify_aud": settings.CLERK_JWT_AUDIENCE is not None}
            claims = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                issuer=settings.CLERK_JWT_ISSUER,
                audience=settings.CLERK_JWT_AUDIENCE,
                options=options,
            )
        except (jwt.PyJWTError, UnicodeDecodeError, ValueError) as error:
            raise AuthenticationFailed("Your session is invalid or has expired.") from error

        subject = claims.get("sub")
        if not isinstance(subject, str) or not subject:
            raise AuthenticationFailed("Your session does not identify a user.")
        return ClerkPrincipal(subject), claims

    def authenticate_header(self, request):
        return "Bearer"
