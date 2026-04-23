from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("contenttypes", "0002_remove_content_type_name"),
        ("sales", "0012_documentemail"),
    ]

    operations = [
        migrations.AddField(
            model_name="documentevent",
            name="company",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="document_events",
                to="sales.company",
            ),
        ),
        migrations.AddField(
            model_name="documentevent",
            name="source_content_type",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="sales_document_events",
                to="contenttypes.contenttype",
            ),
        ),
        migrations.AddField(
            model_name="documentevent",
            name="source_object_id",
            field=models.CharField(blank=True, default="", max_length=255),
        ),
        migrations.AlterField(
            model_name="documentevent",
            name="document",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="events",
                to="sales.document",
            ),
        ),
        migrations.AddIndex(
            model_name="documentevent",
            index=models.Index(fields=["company", "created_at"], name="sales_docum_company_bbdced_idx"),
        ),
        migrations.AddIndex(
            model_name="documentevent",
            index=models.Index(fields=["source_content_type", "source_object_id"], name="sales_docum_source__487e1b_idx"),
        ),
    ]
