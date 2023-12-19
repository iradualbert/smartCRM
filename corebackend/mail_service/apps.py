from django.apps import AppConfig



class MailServiceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'mail_service'
    
    def ready(self) -> None:
        from .jobs import start_mail_service_job
        start_mail_service_job()
        return super().ready()
