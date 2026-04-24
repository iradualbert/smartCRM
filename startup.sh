#!/usr/bin/env sh
set -eu

PORT="${PORT:-8000}"
GUNICORN_WORKERS="${GUNICORN_WORKERS:-3}"
GUNICORN_TIMEOUT="${GUNICORN_TIMEOUT:-120}"

cd corebackend

python3 manage.py migrate --noinput
python3 manage.py collectstatic --noinput

exec gunicorn corebackend.wsgi:application \
  --bind "0.0.0.0:${PORT}" \
  --workers "${GUNICORN_WORKERS}" \
  --timeout "${GUNICORN_TIMEOUT}"
