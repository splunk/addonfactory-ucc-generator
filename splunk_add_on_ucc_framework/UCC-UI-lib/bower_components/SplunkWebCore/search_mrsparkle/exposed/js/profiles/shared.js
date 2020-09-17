// reference this from another build profile with mainConfigFile: './shared.build.profile.js'
requirejs.config({
    baseUrl: '../',
    preserveLicenseComments: false,
    map: {
        "*": {
            css: "splunkjs/contrib/require-css/css",
            'requirejs': 'require/requirejs',
            // Aliases for files that have been moved, but need to be acessible to apps
            // SPL-120323
            'views/shared/WaitSpinner': 'views/shared/waitspinner/Master'
        }
    },
    paths: {
        // paths outside of baseUrl
        'templates': '../../templates',
        'api': '../build/api',

        // Makes requring an app's static assets cleaner
        'app': '../app',

        // jQuery and contrib plugins
        'jquery': 'contrib/jquery-2.1.0',
        'jquery.history': 'contrib/jquery.history',
        'jquery.bgiframe': 'contrib/jquery.bgiframe-3.0.0',
        'jquery.cookie': 'contrib/jquery.cookie',
        'jquery.deparam': 'contrib/jquery.deparam',
        'jquery.fileupload': 'contrib/jquery.fileupload',
        'jquery.iframe-transport': 'contrib/jquery.iframe-transport',

        // internal jQuery plugins
        'splunk.jquery.csrf': 'splunk.jquery.csrf_protection',

        // jQuery UI plugins
        'jquery.ui.core': 'contrib/jquery-ui-1.10.4/jquery.ui.core',
        'jquery.ui.widget': 'contrib/jquery-ui-1.10.4/jquery.ui.widget',
        'jquery.ui.datepicker': 'contrib/jquery-ui-1.10.4/jquery.ui.datepicker',
        'jquery.ui.position': 'contrib/jquery-ui-1.10.4/jquery.ui.position',
        'jquery.ui.mouse': 'contrib/jquery-ui-1.10.4/jquery.ui.mouse',
        'jquery.ui.draggable': 'contrib/jquery-ui-1.10.4/jquery.ui.draggable',
        'jquery.ui.droppable': 'contrib/jquery-ui-1.10.4/jquery.ui.droppable',
        'jquery.ui.sortable': 'contrib/jquery-ui-1.10.4/jquery.ui.sortable',
        'jquery.ui.resizable': 'contrib/jquery-ui-1.10.4/jquery.ui.resizable',
        'jquery.ui.button': 'contrib/jquery-ui-1.10.4/jquery.ui.button',
        'jquery.ui.spinner': 'contrib/jquery-ui-1.10.4/jquery.ui.spinner',
        'jquery.ui.effect': 'contrib/jquery-ui-1.10.4/jquery.ui.effect',
        'jquery.ui.effect-slide': 'contrib/jquery-ui-1.10.4/jquery.ui.effect-slide',
        'tree.jquery': 'contrib/jqTree/tree.jquery',
        'jquery.resize': 'contrib/jquery-resize',

        // bootstrap components
        // FIXME: bootstrap.button collides with jquery.ui.button on the jQuery prototype !!
        'bootstrap.affix': 'contrib/bootstrap-2.3.1/bootstrap-affix',
        'bootstrap.alert': 'contrib/bootstrap-2.3.1/bootstrap-alert',
        'bootstrap.button': 'contrib/bootstrap-2.3.1/bootstrap-button',
        'bootstrap.carousel': 'contrib/bootstrap-2.3.1/bootstrap-carousel',
        'bootstrap.collapse': 'contrib/bootstrap-2.3.1/bootstrap-collapse',
        'bootstrap.dropdown': 'contrib/bootstrap-2.3.1/bootstrap-dropdown',
        'bootstrap.modal': 'contrib/bootstrap-2.3.1/bootstrap-modal',
        'bootstrap.popover': 'contrib/bootstrap-2.3.1/bootstrap-popover',
        'bootstrap.scrollspy': 'contrib/bootstrap-2.3.1/bootstrap-scrollspy',
        'bootstrap.tab': 'contrib/bootstrap-2.3.1/bootstrap-tab',
        'bootstrap.tooltip': 'contrib/bootstrap-2.3.1/bootstrap-tooltip',
        'bootstrap.transition': 'contrib/bootstrap-2.3.1/bootstrap-transition',
        'bootstrap.typeahead': 'contrib/bootstrap-2.3.1/bootstrap-typeahead',

        // other contrib libraries
        'moment': 'contrib/moment',
        'numeral': 'contrib/numeral',
        'underscore': 'require/underscore',
        'backbone': 'require/backbone',
        'highcharts': 'contrib/highcharts-4.0.4/highcharts',
        'highcharts.runtime_patches': 'contrib/highcharts-4.0.4/runtime_patches',
        'backbone_validation': 'contrib/backbone-validation-amd',
        'prettify': 'contrib/google-code-prettify/prettify',
        'intro': 'contrib/intro',
        'document-register-element': 'contrib/polyfills/document-register-element.max.amd',

        /* augments builtin prototype */
        'strftime': 'contrib/strftime',
        'leaflet': 'contrib/leaflet/leaflet',
        'jg_global': 'contrib/jg_global',
        'jgatt': 'contrib/jg_library',
        'jg': 'contrib/jg_lib',
        'lowpro': 'contrib/lowpro_for_jquery',
        'spin': 'contrib/spin',
        'sax': 'contrib/sax',
        "ace":"contrib/ace-editor",

        // Splunk legacy
        'splunk': 'splunk',
        'splunk.legend': 'legend',
        'splunk.logger': 'logger',
        'splunk.error': 'error',
        'splunk.util': 'util',
        'util/sprintf': 'contrib/sprintf',
        'splunk.pdf': 'pdf',
        'splunk.i18n': 'stubs/i18n',
        'splunk.config': 'stubs/splunk.config',
        'splunk.paginator': 'paginator',
        'splunk.messenger': 'messenger',
        'splunk.time': 'splunk_time',
        'splunk.timerange': 'time_range',
        'splunk.window': 'window',
        'splunk.jabridge': 'ja_bridge',
        'splunk.print': 'print',
        'splunk.session': 'session',

        // splunkjs
        "async": "splunkjs/contrib/requirejs-plugins/async",
        "select2": "contrib/select2-3.4.6",

        // paths for deprecated versions of jquery
        'contrib/jquery-1.8.2': 'contrib/deprecated/jquery-1.8.2',
        'contrib/jquery-1.8.3': 'contrib/deprecated/jquery-1.8.3',
        'contrib/jquery-1.10.2': 'contrib/deprecated/jquery-1.10.2'
    },
    shim: {

        /* START splunkjs */
        'splunkjs/splunk': {
            deps: ['jquery'],
            exports: 'splunkjs'
        },

        /* Select2*/
        "select2/select2": {
            deps: ["jquery", "helpers/user_agent", "css!contrib/select2-3.4.6/select2.css", "views/shared/pcss/select2.pcss"],
            exports: "Select2",
            init: function($, UserAgent) {
                var Select2 = this.Select2;
                Select2.class.single.prototype.getPlaceholder = function() {
                    // if a placeholder is specified on a single select without a valid placeholder option ignore it
                    if (this.select) {
                        if (this.getPlaceholderOption() === undefined) {
                            return undefined;
                        }
                    }
                    // https://github.com/select2/select2/issues/3300
                    // SPL-111895, SPL-112886, disable placeholder for IE <= 11
                    if (UserAgent.isIELessThan(12)) {
                        return undefined;
                    }
                    return Select2.class.abstract.prototype.getPlaceholder.apply(this, arguments);
                };
                return Select2;
            }
        },

        /* START contrib jQuery plugins */
        'jquery.cookie': {
            deps: ['jquery']
        },
         'jquery.fileupload': {
            deps: ['jquery']
        },
        'jquery.iframe-transport': {
        	deps: ['jquery']
        },
        'jquery.history': {
            deps: ['jquery'],
                exports: 'History'
        },
        'jquery.bgiframe': {
            deps: ['jquery']
        },

        "jquery.attributes": {
            deps: ['jquery']
        },

        "jquery.spin": {
            deps: ['jquery']
        },

        "jquery.sparkline": {
            deps: ['jquery']
        },

        "jquery.deparam": {
            deps: ['jquery'],
            exports: "jQuery.fn.deparam"
        },

        /* START internal jQuery plugins */
        'splunk.jquery.csrf_protection': {
            deps: ['jquery.cookie', 'splunk.util']
        },

        /* START jQuery UI plugins */
        'jquery.ui.core': {
            deps: ['jquery']
        },
        'jquery.ui.widget': {
            deps: ['jquery.ui.core']
        },
        'jquery.ui.position': {
            deps: ['jquery.ui.widget']
        },
        'jquery.ui.mouse': {
            deps: ['jquery.ui.widget']
        },
        'jquery.ui.sortable': {
            deps: ['jquery.ui.widget', 'jquery.ui.mouse', 'jquery.ui.draggable', 'jquery.ui.droppable']
        },
        'jquery.ui.draggable': {
            deps: ['jquery.ui.widget', 'jquery.ui.mouse']
        },
        'jquery.ui.droppable': {
            deps: ['jquery.ui.widget', 'jquery.ui.mouse']
        },
        'jquery.ui.resizable': {
            deps: ['jquery.ui.widget', 'jquery.ui.mouse']
        },
        'jquery.ui.datepicker': {
            deps: ['jquery', 'jquery.ui.widget', 'splunk.i18n'],
            exports: 'jquery.ui.datepicker',
            init: function(jQuery, widget, i18n) {
                var initFn = i18n.jQuery_ui_datepicker_install;
                if (typeof initFn === 'function') {
                    initFn(jQuery);
                }
                return jQuery.ui.datepicker;
            }
        },
        'jquery.ui.button': {
            deps: ['jquery.ui.widget', 'jquery.ui.core']
        },
        'jquery.ui.spinner': {
            deps: ['jquery.ui.widget', 'jquery.ui.core', 'jquery.ui.button']
        },
        'jquery.ui.effect': {
            deps: ['jquery.ui.core']
        },
        'jquery.ui.effect-slide': {
            deps: ['jquery.ui.core', 'jquery.ui.effect']
        },
        'tree.jquery': {
            deps: ['jquery']
        },
        'jquery.resize': {
            deps: ['jquery'],
            init: function($) {
                // The plugin itself does not prevent bubbling of the resize events, add that here.
                $.event.special.elementResize.noBubble = true;
            }
        },

        // bootstrap components
        'bootstrap.affix': {
            deps: ['jquery']
        },
        'bootstrap.alert': {
            deps: ['jquery']
        },
        'bootstrap.button': {
            deps: ['jquery']
        },
        'bootstrap.carousel': {
            deps: ['jquery']
        },
        'bootstrap.collapse': {
            deps: ['jquery', 'bootstrap.transition']
        },
        'bootstrap.dropdown': {
            deps: ['jquery']
        },
        'bootstrap.modal': {
            deps: ['jquery']
        },
        'bootstrap.popover': {
            deps: ['jquery', 'bootstrap.tooltip']
        },
        'bootstrap.scrollspy': {
            deps: ['jquery']
        },
        'bootstrap.tab': {
            deps: ['jquery']
        },
        'bootstrap.tooltip': {
            deps: ['jquery']
        },
        'bootstrap.transition': {
            deps: ['jquery']
        },
        'bootstrap.typeahead': {
            deps: ['jquery']
        },

        /* START other contrib libraries */
        "backbone.nested": {
            // Not sure if needed
            deps: ['backbone'],
            exports: 'Backbone.NestedModel'
        },
        highcharts: {
            deps: ['jquery', 'splunk', 'highcharts.runtime_patches'],
            init: function($, Splunk, runtimePatches) {
                var Highcharts = Splunk.Highcharts = this.Highcharts;
                // Remove Highcharts from the global namespace so multiple versions can
                // co-exist on the same page.  As a safety measure in case existing external
                // code relies on this global, it is still available as `Splunk.Highcharts`.
                delete this.Highcharts;
                runtimePatches.applyPatches(Highcharts);
                return Highcharts;
            }
        },
        prettify: {
            exports: 'prettyPrint'
        },
        leaflet: {
            deps: ['jquery', 'splunk.util', 'splunk.config', 'helpers/user_agent', 'contrib/text!contrib/leaflet/leaflet.css'],
            exports: 'L',
            init: function($, SplunkUtil, splunkConfig, userAgent, css) {
                if (splunkConfig.INDEPENDENT_MODE) {
                    var imageUrl = require.toUrl('') + 'splunkjs/contrib/leaflet/images';
                    css = css.replace(/url\(images/g, 'url(' + imageUrl);
                }
                else {
                    // resolve image urls
                    css = css.replace(/url\(images/g, "url(" + SplunkUtil.make_url("/static/js/contrib/leaflet/images"));
                }
                // inject css into head
                $("head").append("<style type=\"text/css\">" + css + "</style>");

                // SPL-98647: monkey patch the getParamString method to avoid an XSS vulnerability in our
                // version of Leaflet.
                // See https://github.com/Leaflet/Leaflet/pull/1317/files
                if (this.L && this.L.Util) {
                    this.L.Util.getParamString = function(obj, existingUrl) {
                        var params = [];
                        for(var i in obj) {
                            if (obj.hasOwnProperty(i)) {
                                params.push(encodeURIComponent(i) + '=' + encodeURIComponent(obj[i]));
                            }
                        }
                        return ((!existingUrl || existingUrl.indexOf('?') === -1) ? '?' : '&') + params.join('&');
                    };
                }
            }
        },
        jg_global: {
            // export the dictionary of functions to a different variable, since in "wrapShim" mode require will
            // assign the return value from init to that global.
            exports: 'jg_globals',
            init: function() {
                this.jg_globals = {
                    jg_namespace: this.jg_namespace,
                    jg_extend: this.jg_extend,
                    jg_static: this.jg_static,
                    jg_mixin: this.jg_mixin,
                    jg_has_mixin: this.jg_has_mixin
                };
                return this.jg_globals;
            }
        },
        jgatt: {
            deps: ['jg_global'],
            exports: 'jgatt'
        },
        lowpro: {
            deps: ['jquery']
        },
        'sax': {
            exports: 'sax'
        },
        'ace/ace': {
            exports: 'ace'
        },

        /* Start Splunk legacy */
        splunk: {
            exports: 'Splunk'
        },
        'splunk.util': {
            deps: ['jquery', 'splunk', 'splunk.config', 'util/sprintf'],
            exports: 'Splunk.util',
            init: function($, Splunk, config, sprintf) {
                return $.extend({ sprintf: sprintf }, Splunk.util);
            }
        },
        'util/sprintf': {
            exports: 'sprintf'
        },
        'splunk.legend': {
            deps: ['splunk'],
                exports: 'Splunk.Legend'
        },
        'splunk.logger': {
            deps: ['splunk', 'splunk.util'],
                exports: 'Splunk.Logger'
        },
        'splunk.error': {
            deps: ['jquery', 'splunk', 'splunk.logger'],
            exports: 'Splunk.Error'
        },
        'splunk.pdf': {
            deps: ['splunk', 'splunk.util', 'jquery'],
            exports: 'Splunk.pdf'
        },
        strftime: {
            deps: []
        },
        'splunk.paginator': {
            deps: ['splunk'],
                exports: 'Splunk.paginator'
        },
        'splunk.jquery.csrf': {
            deps: ['jquery', 'jquery.cookie', 'splunk.util']
        },
        'splunk.messenger': {
            deps: ['splunk', 'splunk.util', 'splunk.logger', 'splunk.i18n', 'lowpro'],
            exports: 'Splunk.Messenger'
        },
        'splunk.time': {
            deps: ['jg_global', 'jgatt'],
            exports: 'splunk.time'
        },
        'splunk.timerange': {
            deps: ['splunk', 'splunk.util', 'splunk.logger', 'splunk.i18n', 'splunk.time', 'lowpro'],
            exports: 'Splunk.Timerange',
            init: function(Splunk) {
                Splunk.namespace("Globals");
                if (!Splunk.Globals.timeZone) {
                    Splunk.Globals.timeZone = new Splunk.TimeZone(Splunk.util.getConfigValue('SERVER_ZONEINFO'));
                }
                return Splunk.TimeRange;
            }
        },
        'splunk.window': {
            deps: ['splunk', 'splunk.util', 'splunk.i18n'],
            exports: 'Splunk.window'
        },
        'splunk.jabridge': {
            deps: ['splunk'],
            exports: 'Splunk.JABridge'
        },
        'splunk.print': {
            deps: ['jquery', 'lowpro', 'splunk', 'splunk.logger'],
            exports: 'Splunk.Print'
        },
        'splunk.session': {
            deps: ['lowpro', 'splunk', 'jquery', 'splunk.logger', 'splunk.util'],
            exports: 'Splunk.Session'
        },

        // shim handlers for the various versions of jquery

        'contrib/jquery-2.1.0': {
            exports: 'jQuery'
        },
        'contrib/jquery-1.10.2': {
            exports: 'jQuery',
            init: function() {
                if(this.console && typeof this.console.warn === 'function') {
                    this.console.warn('You are using a deprecated version of jQuery, please upgrade to the latest version');
                }
                return this.jQuery;
            }
        },
        'contrib/jquery-1.8.2': {
            exports: 'jQuery',
            init: function() {
                if(this.console && typeof this.console.warn === 'function') {
                    this.console.warn('You are using a deprecated version of jQuery, please upgrade to the latest version');
                }
                return this.jQuery;
            }
        },
        'contrib/jquery-1.8.3': {
            exports: 'jQuery',
            init: function() {
                if(this.console && typeof this.console.warn === 'function') {
                    this.console.warn('You are using a deprecated version of jQuery, please upgrade to the latest version');
                }
                return this.jQuery;
            }
        }
    }
})
