# Folio — portable Django Cotton components

A small, book-inspired component library: white space, strong typography, circular
icon buttons, black primary actions, softly colored panels, and visible borders.
It uses Bootstrap 5 and Django Cotton, with no Kenekoi models, URL names,
base template, or build tools. Book-specific artwork and builder-specific interactions remain
in the bookbuilder app.

## Clone and use

Clone this repository as `folio/` beside your project's `manage.py`:

```bash
git clone <folio-repository-url> folio
```

Add one entry to your Django settings:

```python
INSTALLED_APPS += ["folio"]
```

Folio is a template and static asset app. It has no models, admin, migrations,
views, or URL configuration. No installation of the Folio package, custom Cotton
settings, or template-loader configuration is needed. Your environment needs Django
and `django-cotton`; Folio enables Cotton automatically if it is not already listed
in `INSTALLED_APPS`. If Cotton is already configured, Folio reuses that setup.

Load the assets in your base template's `<head>` and use components in the body:

```django
<head>
  <c-folio.assets />
</head>
<body class="folio">
  <c-folio.button variant="primary" shape="pill">Create something</c-folio.button>
  <c-folio.icon-button icon="plus" label="Add item" />
</body>
```

`assets` loads Bootstrap 5 CSS and Folio's CSS. If your project already loads
Bootstrap, use `<c-folio.assets :bootstrap="False" />` instead. Native disclosures and forms work without scripting. The bundled minimal vanilla
JavaScript opens dialogs through `data-folio-open="dialog-id"` and closes them
through `data-folio-close`, including clicks outside the dialog. Django's normal staticfiles setup serves the bundled assets;
run your usual `collectstatic` step in production.

See `templates/folio_examples.html` for a complete example. Pass a Django `form`
and paginator `page` to preview all components.

## Adding components

Add component templates under `templates/cotton/folio/`, styles to
`static/folio/folio.css`, and icons under `static/folio/icons/`. Add examples and
update the table below. Keep components independent of application models and URLs.

The small includes under `templates/folio/` support projects which already use
`COTTON_DIR = "."`. Add a corresponding include there for each new component;
projects with Cotton's default settings load the canonical templates directly.
Do not change the host project's Cotton directory setting.

## Components

| Component | Properties |
| --- | --- |
| `assets` | Loads Bootstrap CSS and Folio CSS. Set `:bootstrap="False"` if Bootstrap is already loaded. |
| `button` | `href` renders a link; otherwise `type` defaults to `button`. `variant`: secondary, primary, danger. `shape`: rounded, circle, pill. `size`: normal, small. Optional `label`, `class`. |
| `icon-button` | Required accessible `label`; `icon` or custom slot; `href`, `type`, `variant`, `class`. |
| `icon` | `name` matches a bundled SVG filename; optional `class`. Decorative and hidden from assistive technology. |
| `field` | Django bound `field`, optional `empty-text`, `class`. Use `layout="row"`, optional `label` and `description`, for a settings row with supporting content in the slot. Includes labels, help, validation errors, checkbox groups, and switches. |
| `panel` | `tone`: paper, soft, blue; optional `class`; content in slot. |
| `avatar` | `src`, accessible `label`, fallback `initial`; `size`: normal or large. |
| `badge` | `tone`: neutral, blue, success; optional `class`. |
| `toolbar` | Accessible `label`, optional `class`; buttons in slot. |
| `navbar` | Accessible `label`; named `start` and `end` slots; default slot in center. |
| `empty` | `title`, optional `description`, `icon`; optional action slot. |
| `disclosure` | `title`, optional `:open="True"`; native details with content in slot. |
| `tile` | `href`, `title`, optional `caption`, `class`; preview content in slot. |
| `workspace` | Named `sidebar` slot and main content; responsive two-column layout. |
| `cover` | `title`, `author`, optional `image`, `tone`: sage or blue. |
| `outline-node` | `title`, optional `number`, `:open`; named `actions` slot and nested content. |
| `choice-card` | `title`; miniature preview in slot; button attributes pass through. |
| `answer-row` | Bordered row for inputs, answers, and controls. |
| `form-field` | `label`, optional `help`, `class`; labeled custom control in slot. Use `field` for Django bound fields. |
| `editor` | `title`, named `actions` slot, content for your form. |
| `dialog` | Required `id` and accessible `label`; native modal with close control. |
| `word-bank` | `parts` (sentence fragments), `options` (id/text), `name`; native selects enhanced into word tiles and clearable blanks. Repeated answers supported. |
| `practice` | `title`, optional `progress`; content and named `actions` footer. |
| `shared-actions` | `count`; Save everywhere and Save a copy here (`name="save_as_copy" value="1"`). Host app handles persistence. |
| `switch` | `name`, accessible `label`, `value`, `:checked`, optional `off_icon` and `on_icon`. |
| `pagination` | Django paginator `page`, optional search `query`, accessible `label`. Uses `q` and `page` URL parameters. |

Additional HTML attributes pass through to the root element, including `id`,
`data-*`, `aria-*`, and form attributes on buttons. Give icon-only controls a
meaningful `label`. Use `aria-pressed` on toggle buttons. Use `disabled` only on
actual buttons; omit `href` to render a button. Include CSRF tokens in POST forms.

```django
<c-folio.navbar>
  <c-slot name="start"><c-folio.icon-button label="Back" href="/">←</c-folio.icon-button></c-slot>
  <strong>My project</strong>
  <c-slot name="end"><c-folio.icon-button icon="settings" label="Settings" /></c-slot>
</c-folio.navbar>
```

## Customize

Override CSS variables on `.folio`: `--folio-ink`, `--folio-blue`, `--folio-line`,
`--folio-muted`, `--folio-soft`, `--folio-focus`. The font uses the system's Arial /
Helvetica stack; no web font downloads. Add SVGs under `static/folio/icons/`.
All component classes use the `folio-` prefix. Theme and control overrides
apply within the `.folio` scope. Native disclosures need no scripting. Dropdowns are intentionally outside
this library; use your project's accessible dropdown behavior.

## Distribution

Run `python scripts/export.py` to create `.local/exports/folio.zip` containing
the complete template-only Django app, including components, styles, icons,
license notices, examples, and these instructions. Extract it into a `folio/`
directory beside `manage.py` and add `"folio"` to `INSTALLED_APPS`. Commit the source files; regenerate the bundle after edits.
Folio's components and styles are MIT licensed; bundled icons retain their
upstream MIT notices. See `static/folio/LICENSE` and `static/folio/THIRD_PARTY_NOTICES.md`.

`navigation-switch` takes `first_label`, `first_href`, `second_label`,
`second_href`, and `active` (`first` or `second`). `file-row` takes `title`,
`caption`, `icon`, and `selected`; host apps supply selection and loading behavior.
Spacing, control size, border width, and radius variables are defined on `.folio`.

`<c-folio.search-dialog id="search" label="Search books" action="/books/">` provides a native dialog, focused search field, and a live results slot. Pair it with an icon button carrying `data-folio-open="search"`. The action should return an HTML results fragment for `?q=...&search_dialog=1`; regular GET requests remain ordinary pages.

`<c-folio.segmented-nav first_label="Books" first_href="/manage/" second_label="Courses" second_href="/manage/?section=courses" active="first" />` renders equal pill segments with an inset active pill. It uses links and `aria-current="page"`; optional HTMX attributes are forwarded to the wrapper.

`<c-folio.appbar title="Book title" back_href="/manage/">` provides one shared app bar. Supply `start` and `actions` slots for navigation and controls. The back link is optional, works without JavaScript, and exposes `data-folio-back` for a host to enhance using its own navigation history. Folio does not inspect browser history or assume application routes.

## Notifications

Notifications work without Bootstrap. Load `<c-folio.assets :bootstrap="False" />`
and render a stack containing notification components:

```html
<section class="folio-notifications folio" data-folio-notifications aria-label="Notifications">
  <c-folio.notification level="success">Book saved.</c-folio.notification>
  <c-folio.notification level="error">Could not save. Please try again.</c-folio.notification>
  <c-folio.notification :icon="False">Your message here.</c-folio.notification>
</section>
```

Up to three messages appear at the bottom right, with newer messages below older
ones. Additional messages wait in a queue. Success and info messages dismiss after
six seconds of active viewing; hovering, keyboard focus, or a hidden browser tab
pauses the timer. Errors and warnings remain until dismissed. All messages have a
close button; reduced-motion preferences and mobile safe areas are respected.
Without JavaScript, messages remain visible and the stack can scroll.

Client-side messages can use a text-only event (content is never interpreted as HTML):

```js
document.dispatchEvent(new CustomEvent('folio:notify', {
  detail: {message: 'Book saved.', level: 'success'}
}));
```

New components inserted by HTMX are picked up after swaps. Kenekoi renders Django
messages through `core/_notifications.html` on both shared pages and the homepage.
