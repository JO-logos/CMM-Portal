# Portal logo assets

`cmm-logo-w.svg` is the selected authenticated-portal logo used by `prototype/dashboard.html` in both the desktop sidebar and mobile header.

To update the selected portal logo, replace `cmm-logo-w.svg` with another approved SVG using the same filename. No HTML, JavaScript, or CSS change should be needed. Preserve the replacement artwork, aspect ratio, and colors.

The logo is referenced through normal external `<img>` elements with `object-fit: contain`. It is not embedded in HTML or CSS and is not used as a background image.

`cmm-logo.png` remains in place for the preserved wireframe and archived visual-direction concepts. This maintains the previous replaceable-PNG approach without making it the selected authenticated-portal asset.

Future Odoo asset path:

`cmm_member_portal/static/src/img/cmm-logo-w.svg`

## Public login-page logos

The login page also uses these approved external SVG assets:

- `cmm-logo.svg`
- `logos-missions-logo.svg`
- `korean-christian-journal-logo.svg`
- `logos-chapel-logo.svg`

Their common white circular presentation is controlled by `prototype/css/login.css`. Keep the supplied artwork transparent and do not bake the CSS circle into replacement files.
