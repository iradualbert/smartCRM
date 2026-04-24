import posixpath
from pathlib import Path

from django.http import Http404
from django.utils._os import safe_join
from django.views.static import serve


def serve_file(request, path="", document_root=None, fallback_to_index=False):
    path = posixpath.normpath(path).lstrip("/")
    fullpath = Path(safe_join(document_root, path))

    if fullpath.is_file():
        return serve(request, path, document_root)

    if fallback_to_index:
        index_path = Path(safe_join(document_root, "index.html"))
        if index_path.is_file():
            return serve(request, "index.html", document_root)

    raise Http404()
