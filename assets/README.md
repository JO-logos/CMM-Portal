# CMM Portal assets

This directory contains the replaceable visual assets used by the standalone prototype and intended for transfer into the Odoo custom module.

## Backgrounds

Add login backgrounds to `backgrounds/` using `background (number).jpg` or `background (number).png`. Number gaps are allowed. Run `python prototype/build.py` from the source workspace root after adding or removing an image; a flattened prototype export can run `python build.py` from its root.

Use web-optimized landscape images large enough to cover desktop displays. The login page selects one background per browser session.

## Brand assets

`brand/cmm-logo-w.svg` is used by the authenticated portal and public login page. The login page also uses `cmm-logo.svg`, `logos-missions-logo.svg`, `korean-christian-journal-logo.svg`, and `logos-chapel-logo.svg`.

Replace approved artwork using the same filename and preserve its transparency, aspect ratio, and colors. Logo sizing and white circular presentation are controlled by CSS.

## Fonts and icons

`fonts/dm-sans-variable.ttf` is the locally hosted DM Sans variable font used by the login clock and date. Keep `fonts/OFL-DM-Sans.txt` with the font.

`icons/cmm-weather-icons.svg` contains the login weather symbols. Keep `icons/LICENSE-lucide.txt` with these icons.

## Odoo handoff

Move these assets into the custom module's static asset directories and update QWeb asset URLs accordingly. The prototype does not require embedding SVG or image data inside HTML or CSS.
