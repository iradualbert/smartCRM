from django.apps import AppConfig



class CommonConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'common'

    def ready(self) -> None:
        from .jobs import start_jobs
        start_jobs()
        return super().ready()
