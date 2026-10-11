from django.apps import apps
from django.template.loader import render_to_string
from django.test import SimpleTestCase


class ComponentLibraryTests(SimpleTestCase):
    def test_examples_render_native_controls_and_forward_attributes(self):
        html = render_to_string("folio_examples.html", {
            "sentence_parts": ["A ", " idea."],
            "word_options": [{"id": "a", "text": "new"}],
        })
        self.assertNotIn("<c-", html)
        self.assertNotIn("{{ attrs }}", html)
        self.assertIn('data-folio-open="example-dialog"', html)
        self.assertIn('data-folio-close', html)
        self.assertIn('data-component-test="passed"', html)
        self.assertIn('name="answer"', html)
        self.assertIn('data-folio-word-value="a"', html)
        self.assertFalse(list(apps.get_app_config("folio").get_models()))
