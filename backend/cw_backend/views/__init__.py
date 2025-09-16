from .admin_users import routes as admin_users_routes
from .admin_courses import routes as admin_courses_routes
from .auth import routes as auth_routes
from .page_data import routes as page_data_routes
from .tasks import routes as tasks_routes
from .users import routes as users_routes

all_routes = [
    *auth_routes,
    *page_data_routes,
    *tasks_routes,
    *admin_users_routes,
    *admin_courses_routes,
    *users_routes,
]
