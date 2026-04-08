import posixpath
from pathlib import Path

from django.utils._os import safe_join
from django.views.static import serve

def serve_static(request, path, document_root=None):
    path = posixpath.normpath(path).lstrip("/")
    fullpath = Path(safe_join(document_root, path))
    if fullpath.is_file():
        return serve(request, path, document_root)
    else:
        return serve(request, "index.html", document_root)
    
    
