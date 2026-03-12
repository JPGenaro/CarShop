from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Sube archivos existentes de MEDIA_ROOT al storage configurado (por ejemplo S3).'

    def add_arguments(self, parser):
        parser.add_argument(
            '--overwrite',
            action='store_true',
            help='Sobrescribe archivos aunque ya existan en el storage remoto.',
        )

    def handle(self, *args, **options):
        media_root = Path(settings.MEDIA_ROOT)
        overwrite = options['overwrite']

        if not media_root.exists():
            self.stdout.write(self.style.WARNING('MEDIA_ROOT no existe. No hay archivos para migrar.'))
            return

        synced = 0
        skipped = 0

        for local_file in media_root.rglob('*'):
            if not local_file.is_file():
                continue

            relative_path = local_file.relative_to(media_root).as_posix()
            storage_path = f'media/{relative_path}' if not relative_path.startswith('media/') else relative_path

            if default_storage.exists(storage_path) and not overwrite:
                skipped += 1
                continue

            with local_file.open('rb') as file_handle:
                if default_storage.exists(storage_path) and overwrite:
                    default_storage.delete(storage_path)
                default_storage.save(storage_path, File(file_handle, name=local_file.name))
            synced += 1

        self.stdout.write(self.style.SUCCESS(
            f'Sincronización completada. Subidos: {synced}. Omitidos: {skipped}.'
        ))