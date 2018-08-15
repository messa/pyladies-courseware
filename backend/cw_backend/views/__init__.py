from .admin_users import routes as admin_users_routes
from .auth import routes as auth_routes
from .page_data import routes as page_data_routes
from .fb_auth import routes as fb_auth_routes


all_routes = [
    *auth_routes,
    *page_data_routes,
    *fb_auth_routes,
    *admin_users_routes,
]
