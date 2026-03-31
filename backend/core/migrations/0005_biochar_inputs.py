from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_remove_field_custom_crop_alter_field_crop_type'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='field',
            name='global_max',
        ),
        migrations.AddField(
            model_name='field',
            name='biochar_tons_per_hectare',
            field=models.DecimalField(decimal_places=4, default=20, max_digits=10),
        ),
        migrations.AddField(
            model_name='field',
            name='biochar_cost_per_ton',
            field=models.DecimalField(decimal_places=2, default=0, max_digits=10),
        ),
    ]
