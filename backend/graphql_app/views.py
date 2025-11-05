from graphene_django.views import GraphQLView
from rest_framework_simplejwt.authentication import JWTAuthentication


class AuthenticatedGraphQLView(GraphQLView):
    def dispatch(self, request, *args, **kwargs):
        # Attempt to authenticate using SimpleJWT if Authorization header present
        try:
            if request.META.get('HTTP_AUTHORIZATION'):
                authenticator = JWTAuthentication()
                user_auth_tuple = authenticator.authenticate(request)
                if user_auth_tuple:
                    request.user = user_auth_tuple[0]
        except Exception:
            # Do not block GraphQL; resolvers can still enforce auth
            pass
        return super().dispatch(request, *args, **kwargs)


