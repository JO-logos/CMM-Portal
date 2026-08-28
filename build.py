"""Build standalone CMM Member Portal review pages from shared HTML sources."""

from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import quote


PROTOTYPE_DIR = Path(__file__).resolve().parent
SOURCE_DIR = PROTOTYPE_DIR / "src"
DIST_DIR = PROTOTYPE_DIR / "dist"
BACKGROUND_DIR = PROTOTYPE_DIR / "assets" / "backgrounds"
BACKGROUND_CSS_PATH = PROTOTYPE_DIR / "css" / "login-backgrounds.generated.css"
BACKGROUND_JS_PATH = PROTOTYPE_DIR / "js" / "login-backgrounds.generated.js"
PLACEHOLDER_PATTERN = re.compile(r"\{\{[A-Z0-9_]+\}\}")
BACKGROUND_PATTERN = re.compile(r"^background \((\d+)\)\.(jpg|png)$", re.IGNORECASE)
FORBIDDEN_OUTPUT_TEXT = (
    "Alex Kim",
    "demo.member@example.org",
    "mock-data.js",
    "messages.js",
    "fetch(",
    "data-portal-route",
    "/my/",
)


class BuildError(RuntimeError):
    """Raised when a required source or generated artifact is invalid."""


@dataclass(frozen=True)
class PageConfig:
    output_name: str
    source_name: str
    title: str
    description: str
    label: str
    body_class: str
    active_navigation: str


PAGES = (
    PageConfig(
        output_name="dashboard.html",
        source_name="dashboard.html",
        title="CMM Member Portal — Dashboard",
        description="Christian Mutual Med-Aid selected member dashboard design",
        label="Dashboard",
        body_class="cmm-app-shell",
        active_navigation="dashboard",
    ),
    PageConfig(
        output_name="my-membership.html",
        source_name="my-membership.html",
        title="CMM Member Portal — My Membership",
        description="View CMM family membership information",
        label="My Membership",
        body_class="cmm-app-shell",
        active_navigation="my-membership",
    ),
    PageConfig(
        output_name="medical-expenses.html",
        source_name="medical-expenses.html",
        title="CMM Member Portal — Medical Expenses",
        description="View and add medical expense records",
        label="Medical Expenses",
        body_class="cmm-app-shell",
        active_navigation="medical-expenses",
    ),
    PageConfig(
        output_name="medical-expenses-add.html",
        source_name="medical-expenses-add.html",
        title="CMM Member Portal — Add Medical Expense",
        description="Add a medical expense record",
        label="Add Medical Expense",
        body_class="cmm-app-shell",
        active_navigation="medical-expenses",
    ),
    PageConfig(
        output_name="medical-expenses-detail.html",
        source_name="medical-expenses-detail.html",
        title="CMM Member Portal — Medical Expense Detail",
        description="Review a medical expense record and supporting information",
        label="Medical Expense Detail",
        body_class="cmm-app-shell",
        active_navigation="medical-expenses",
    ),
    PageConfig(
        output_name="change-payment-method.html",
        source_name="change-payment-method.html",
        title="CMM Member Portal — Change Payment Method",
        description="Update recurring or one-time giving payment preferences",
        label="Change Payment Method",
        body_class="cmm-app-shell",
        active_navigation="change-payment-method",
    ),
    PageConfig(
        output_name="document-center.html",
        source_name="document-center.html",
        title="CMM Member Portal — Document Center",
        description="View signed agreements, notices, and account documents",
        label="Document Center",
        body_class="cmm-app-shell",
        active_navigation="document-center",
    ),
    PageConfig(
        output_name="document-center-detail.html",
        source_name="document-center-detail.html",
        title="CMM Member Portal — Member Checklist",
        description="Review a signed CMM membership checklist",
        label="Member Checklist",
        body_class="cmm-app-shell",
        active_navigation="document-center",
    ),
    PageConfig(
        output_name="gift-reminders.html",
        source_name="gift-reminders.html",
        title="CMM Member Portal — Gift Reminder",
        description="Review giving reminders and contribution notices",
        label="Gift Reminder",
        body_class="cmm-app-shell",
        active_navigation="gift-reminders",
    ),
)


def read_required(path: Path) -> str:
    if not path.is_file():
        raise BuildError(f"Required source file is missing: {path}")
    try:
        return path.read_text(encoding="utf-8")
    except UnicodeError as error:
        raise BuildError(f"Source file is not valid UTF-8: {path}") from error


def replace_tokens(template: str, values: dict[str, str]) -> str:
    result = template
    for name, value in values.items():
        result = result.replace(f"{{{{{name}}}}}", value)
    return result


def ensure_resolved(html: str, output_name: str) -> None:
    unresolved = sorted(set(PLACEHOLDER_PATTERN.findall(html)))
    if unresolved:
        names = ", ".join(unresolved)
        raise BuildError(f"Unresolved placeholders in {output_name}: {names}")


def ensure_output_policy(html: str, output_name: str) -> None:
    ensure_resolved(html, output_name)
    for forbidden_text in FORBIDDEN_OUTPUT_TEXT:
        if forbidden_text in html:
            raise BuildError(
                f"Forbidden active-prototype text in {output_name}: {forbidden_text}"
            )
    if "<!-- Generated from prototype/src. Do not edit this file directly. -->" not in html:
        raise BuildError(f"Generated-file notice is missing from {output_name}")


def render_page(
    page: PageConfig,
    shell: str,
    partials: dict[str, str],
) -> str:
    navigation_values = {
        "ACTIVE_DASHBOARD_CLASS": " cmm-nav-link--active" if page.active_navigation == "dashboard" else "",
        "ACTIVE_DASHBOARD_ARIA": ' aria-current="page"' if page.active_navigation == "dashboard" else "",
        "ACTIVE_MY_MEMBERSHIP_CLASS": " cmm-nav-link--active" if page.active_navigation == "my-membership" else "",
        "ACTIVE_MY_MEMBERSHIP_ARIA": ' aria-current="page"' if page.active_navigation == "my-membership" else "",
        "ACTIVE_MEDICAL_EXPENSES_CLASS": " cmm-nav-link--active" if page.active_navigation == "medical-expenses" else "",
        "ACTIVE_MEDICAL_EXPENSES_ARIA": ' aria-current="page"' if page.active_navigation == "medical-expenses" else "",
        "ACTIVE_CHANGE_PAYMENT_METHOD_CLASS": " cmm-nav-link--active" if page.active_navigation == "change-payment-method" else "",
        "ACTIVE_CHANGE_PAYMENT_METHOD_ARIA": ' aria-current="page"' if page.active_navigation == "change-payment-method" else "",
        "ACTIVE_DOCUMENT_CENTER_CLASS": " cmm-nav-link--active" if page.active_navigation == "document-center" else "",
        "ACTIVE_DOCUMENT_CENTER_ARIA": ' aria-current="page"' if page.active_navigation == "document-center" else "",
        "ACTIVE_GIFT_REMINDERS_CLASS": " cmm-nav-link--active" if page.active_navigation == "gift-reminders" else "",
        "ACTIVE_GIFT_REMINDERS_ARIA": ' aria-current="page"' if page.active_navigation == "gift-reminders" else "",
    }
    sidebar = replace_tokens(partials["SIDEBAR"], navigation_values)
    mobile_navigation = replace_tokens(
        partials["MOBILE_NAVIGATION"],
        {"PAGE_LABEL": page.label},
    )
    page_content = read_required(SOURCE_DIR / "pages" / page.source_name)
    html = replace_tokens(
        shell,
        {
            "PAGE_TITLE": page.title,
            "PAGE_DESCRIPTION": page.description,
            "BODY_CLASS": page.body_class,
            "SIDEBAR": sidebar,
            "UTILITY_HEADER": partials["UTILITY_HEADER"],
            "MOBILE_NAVIGATION": mobile_navigation,
            "PAGE_CONTENT": page_content,
            "PORTAL_FOOTER": partials["PORTAL_FOOTER"],
        },
    )
    ensure_output_policy(html, page.output_name)
    return html.rstrip() + "\n"


def render_login_page(shell: str) -> str:
    page_content = read_required(SOURCE_DIR / "pages" / "login.html")
    html = replace_tokens(
        shell,
        {
            "PAGE_TITLE": "CMM Member Portal — Member Login",
            "PAGE_DESCRIPTION": "Sign in to the Christian Mutual Med-Aid member portal",
            "PAGE_CONTENT": page_content,
        },
    )
    ensure_output_policy(html, "login.html")
    return html.rstrip() + "\n"


def discover_backgrounds() -> list[tuple[int, Path]]:
    if not BACKGROUND_DIR.is_dir():
        raise BuildError(f"Background directory is missing: {BACKGROUND_DIR}")

    backgrounds: list[tuple[int, Path]] = []
    used_numbers: dict[int, Path] = {}
    for path in BACKGROUND_DIR.iterdir():
        if not path.is_file():
            continue
        match = BACKGROUND_PATTERN.fullmatch(path.name)
        if not match:
            continue

        number = int(match.group(1))
        if number in used_numbers:
            raise BuildError(
                "Duplicate login background number "
                f"{number}: {used_numbers[number].name} and {path.name}"
            )
        used_numbers[number] = path
        backgrounds.append((number, path))

    if not backgrounds:
        raise BuildError(
            "No login backgrounds found. Add background (number).jpg or "
            f"background (number).png files to {BACKGROUND_DIR}."
        )

    return sorted(backgrounds, key=lambda item: item[0])


def render_background_css(backgrounds: list[tuple[int, Path]]) -> str:
    rules = [
        "/* Generated by prototype/build.py. Do not edit directly. */",
        "",
    ]
    for number, path in backgrounds:
        asset_url = quote(path.name)
        rules.extend(
            (
                f".cmm-login-background--{number} {{",
                f'  background-image: url("../assets/backgrounds/{asset_url}");',
                "}",
                "",
            )
        )
    return "\n".join(rules)


def render_background_js(backgrounds: list[tuple[int, Path]]) -> str:
    class_names = [
        f"cmm-login-background--{number}"
        for number, _path in backgrounds
    ]
    manifest = json.dumps(class_names, indent=2)
    return (
        "/* Generated by prototype/build.py. Do not edit directly. */\n"
        f"window.CMM_LOGIN_BACKGROUNDS = Object.freeze({manifest});\n"
    )


def load_sources() -> tuple[str, dict[str, str]]:
    shell = read_required(SOURCE_DIR / "layouts" / "portal-shell.html")
    partials = {
        "SIDEBAR": read_required(SOURCE_DIR / "partials" / "sidebar.html"),
        "UTILITY_HEADER": read_required(SOURCE_DIR / "partials" / "utility-header.html"),
        "MOBILE_NAVIGATION": read_required(SOURCE_DIR / "partials" / "mobile-navigation.html"),
        "PORTAL_FOOTER": read_required(SOURCE_DIR / "partials" / "portal-footer.html"),
    }
    return shell, partials


def write_output(path: Path, html: str) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as output_file:
        output_file.write(html)


def build(check_only: bool) -> None:
    shell, partials = load_sources()
    login_shell = read_required(SOURCE_DIR / "layouts" / "login-shell.html")
    backgrounds = discover_backgrounds()
    rendered_pages = {
        page.output_name: render_page(page, shell, partials)
        for page in PAGES
    }
    rendered_pages["login.html"] = render_login_page(login_shell)
    generated_assets = {
        BACKGROUND_CSS_PATH: render_background_css(backgrounds),
        BACKGROUND_JS_PATH: render_background_js(backgrounds),
    }

    if check_only:
        for output_name, expected_html in rendered_pages.items():
            output_path = DIST_DIR / output_name
            actual_html = read_required(output_path)
            if actual_html != expected_html:
                raise BuildError(
                    f"Generated file is out of date: {output_path}. Run python build.py."
                )
            print(f"Checked {output_path}")
        for output_path, expected_content in generated_assets.items():
            actual_content = read_required(output_path)
            if actual_content != expected_content:
                raise BuildError(
                    f"Generated file is out of date: {output_path}. Run python build.py."
                )
            print(f"Checked {output_path}")
        return

    DIST_DIR.mkdir(parents=True, exist_ok=True)
    for output_path, content in generated_assets.items():
        write_output(output_path, content)
        print(f"Generated {output_path}")
    for output_name, html in rendered_pages.items():
        output_path = DIST_DIR / output_name
        write_output(output_path, html)
        print(f"Generated {output_path}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Build standalone CMM Member Portal HTML review pages."
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Validate that generated files exist and match the current sources.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        build(check_only=args.check)
    except BuildError as error:
        print(f"Build error: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
