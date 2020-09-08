define(['contrib/jquery-2.1.0.js'], function($) {
    // These globals are needed for backward compatibility. Some user javascript
    // depends on jQuery being available globally.
    if (!window.$) {
        window.$ = $;
        window.jQuery = $;
    }
    return $;
});
