define(['jquery',
        'jquery.ui.core',
        'jquery.ui.widget',
        'jquery.ui.mouse',
        'imports?jQuery=jquery,this=>window!contrib/jquery-resize'], function($) {
    // The plugin itself does not prevent bubbling of the resize events, add that here.
    $.event.special.elementResize.noBubble = true;
    return $;
});