This directory contains all the base PostCSS files that will be processed into CSS.

It also includes some shared pcss files that may be required by views.

## dir structure

* pcss/
	* base/ (base overrides and styles. compiled into lite and enterprise)
	* shared/ (files that may be required by views)
	* version-5-and-earlier/ (legacy css files that are compiled into exposed/css/)

## build profiles

Base:
web/build_tools/profiles/css_base_enterprise.config.js
web/build_tools/profiles/css_base_lite.config.js

Shared:
N/A. These are compiled with the js pages.

Version 5 and Earlier:
web/build_tools/profiles/css_legacy.config.js
web/build_tools/profiles/css_legacy_skin.config.js
