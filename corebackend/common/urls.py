from django.conf import settings
from django.urls import re_path

from .views import serve_file


urlpatterns = [
    re_path(
        r"^files/(?P<path>.*)$",
        serve_file,
        {"document_root": settings.MEDIA_ROOT, "fallback_to_index": False},
    ),
    re_path(
        r"^(?P<path>assets/.*)$",
        serve_file,
        {"document_root": settings.REACT_APP_BUILD_PATH, "fallback_to_index": False},
    ),
    re_path(
        r"^(?P<path>(?:favicon\.ico|robots\.txt|manifest\.json|site\.webmanifest|asset-manifest\.json|.*\.(?:png|jpg|jpeg|svg|webp|gif|css|js|map|txt|woff2?|ttf|eot)))$",
        serve_file,
        {"document_root": settings.REACT_APP_BUILD_PATH, "fallback_to_index": False},
    ),
    re_path(
        r"^(?P<path>.*)$",
        serve_file,
        {"document_root": settings.REACT_APP_BUILD_PATH, "fallback_to_index": True},
    ),
]
