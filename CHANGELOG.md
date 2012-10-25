Hasher Changelog
================


v1.1.1 (2012/10/25)
-------------------

 - fix iOS5 bug when going to a new page and coming back afterwards, caused by
   cached reference to an old instance of the `window.location`. (#43)
 - fix IE compatibility mode. (#44).


v1.1.0 (2011/11/01)
-------------------

 - add `hasher.replaceHash()` (#35)
 - `hasher.initialized.memorize = true` avoid issues if adding listener after
   `initialized` already dispatched if using signals 0.7.0+. (#33)
 - single distribution file for AMD and plain browser. (#34)


v1.0.0 (2011/08/03)
-------------------

 - initial public release.
