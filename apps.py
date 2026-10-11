from django.apps import AppConfig, apps


class FolioConfig(AppConfig):
    name = "folio"
    verbose_name = "Folio components"

    def ready(self):
        if apps.is_installed("django_cotton"):
            return

        # Folio can enable Cotton without requiring a second INSTALLED_APPS entry.
        from django_cotton.apps import wrap_loaders
        from django_cotton.nested_tag_support import enable_nested_tag_support

        enable_nested_tag_support()
        wrap_loaders("django")
