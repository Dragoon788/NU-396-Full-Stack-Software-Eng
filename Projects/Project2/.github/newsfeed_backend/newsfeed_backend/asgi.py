"""
ASGI config for newsfeed_backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.2/howto/deployment/asgi/
"""

import os
from django.core.asgi import get_asgi_application
from django.urls import path
from api.views import graphql_app

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'newsfeed_backend.settings')

django_asgi_app = get_asgi_application()

from django.conf import settings
from django.core.asgi import get_asgi_application
from django.urls import re_path

application = ProtocolTypeRouter({
    "http": URLRouter([
        re_path(r"graphql", graphql_app),
    ])
})

