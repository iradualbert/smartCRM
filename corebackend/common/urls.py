from django.urls import re_path, path
from django.views.generic.base import RedirectView

from django.conf import settings
from .views import serve_static 

# favicon_view = RedirectView.as_view(url='/static/favicon.ico', permanent=True)
# robots_txt_view = RedirectView.as_view(url='/static/robots.txt', permanent=True)
# manifest_view = RedirectView.as_view(url="/static/manifest.json", permanent=True)
# snugtop_view = RedirectView.as_view(url="/static/snugtop.jpg", permanent=True)

urlpatterns = [
    # path("robots.txt", robots_txt_view),
    # path("favicon.ico", favicon_view),
    # path("manifest.json", manifest_view),
    # path("snugtop.jpg", snugtop_view),
    re_path(r"^files/(?P<path>.*)$", serve_static, {"document_root": settings.MEDIA_ROOT}),
    # re_path(r"^(?P<path>.*)$", serve_static, {"document_root": settings.REACT_APP_BUILD_PATH}),
    ]