from .auth import routes as auth_routes
from .fb_auth import routes as fb_auth_routes


all_routes = [
    *auth_routes,
    *fb_auth_routes,
]
