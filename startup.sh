python3 ./corebackend/manage.py collectstatic --noinput
python3 ./corebackend/manage.py makemigrations --noinput
python3 ./corebackend/manage.py migrate 
gunicorn --workers 2 corebackend.corebackend.wsgi