"""Export the standalone Folio component library for another Django project."""
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


ROOT = Path(__file__).resolve().parent.parent


def export_folio():
    destination = ROOT / ".local/exports/folio.zip"
    destination.parent.mkdir(parents=True, exist_ok=True)
    sources = [
        (ROOT / "templates/cotton/folio", "templates/cotton/folio"),
        (ROOT / "templates/folio", "templates/folio"),
        (ROOT / "static/folio", "static/folio"),
    ]
    with ZipFile(destination, "w", compression=ZIP_DEFLATED) as bundle:
        for directory, archive_directory in sources:
            for path in sorted(directory.rglob("*")):
                if path.is_file():
                    bundle.write(path, f"{archive_directory}/{path.relative_to(directory)}")
        bundle.write(ROOT / "templates/folio_examples.html", "templates/folio_examples.html")
        for name in ["README.md", "LICENSE", "__init__.py", "apps.py", "pyproject.toml", "tests.py"]:
            bundle.write(ROOT / name, name)
        bundle.write(ROOT / "scripts/export.py", "scripts/export.py")
    return destination


if __name__ == "__main__":
    print(export_folio())
