from .fb_auth import routes as fb_auth_routes
from .frontend_proxy import routes as frontend_proxy_routes


all_routes = [
    *fb_auth_routes,
    # keep frontend_proxy_routes last because it contains wildcard route
    *frontend_proxy_routes,
]
