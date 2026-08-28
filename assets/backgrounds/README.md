# Login backgrounds

Add approved web-optimized images to this directory using either:

- `background (number).jpg`
- `background (number).png`

Run `python prototype/build.py` after adding or removing an image. The build scans matching files, sorts them numerically, and regenerates the login background CSS and JavaScript manifest. Number gaps are allowed; duplicate numbers are not.

Use landscape images large enough to cover desktop screens. Keep each web file reasonably compressed because one image is downloaded when a new browser session opens the login page.
