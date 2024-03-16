python3 corebackend/manage.py collectstatic --noinput
python3 corebackend/manage.py makemigrations --noinput
python3 corebackend/manage.py migrate 
python3 corebackend/manage.py runserver 0.0.0.0:8000