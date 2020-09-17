module.exports = {
    resolve: {
        alias: {
            'coreAliases': __filename,
            // contrib libraries
            'jquery$': 'shim/jquery',
            'moment': 'contrib/moment',
            'numeral': 'shim/numeral',
            'highcharts.runtime_patches': 'contrib/highcharts-4.0.4/runtime_patches',
            'backbone_validation': 'contrib/backbone-validation-amd',
            'intro': 'shim/intro',
            'document-register-element': 'contrib/polyfills/document-register-element.max.amd',

            /* augments builtin prototype */
            'strftime': 'contrib/strftime',
            'jg': 'contrib/jg_lib', // TODO Do we need to shim this?
            'spin': 'contrib/spin',
            'sax': 'contrib/sax',
            'ace/ace$': 'shim/ace-editor',

            // splunkjs
            'async': 'splunkjs/contrib/requirejs-plugins/async', // TODO We should not use splunkjs in core! Move this to core?

            // paths for deprecated versions of jquery
            'contrib/jquery-1.8.2': 'contrib/deprecated/jquery-1.8.2',
            'contrib/jquery-1.8.3': 'contrib/deprecated/jquery-1.8.3',
            'contrib/jquery-1.10.2': 'contrib/deprecated/jquery-1.10.2',

            // Begin shimmed modules

            /* augments builtin prototype */
            'leaflet': 'shim/leaflet',
            'jg_global$': 'shim/jg_global',
            'jgatt$': 'shim/jgatt',
            'lowpro': 'shim/lowpro',

            // other contrib libraries
            'underscore': 'require/underscore', // shim shared with requirejs config
            'backbone': 'require/backbone', // shim shared with requirejs config
            'highcharts': 'shim/highcharts',
            'prettify': 'shim/prettify',
            'requirejs': 'shim/requirejs',

            'jquery.history$': 'shim/jquery.history',
            'jquery.bgiframe$': 'shim/jquery.bgiframe',
            'jquery.cookie$': 'shim/jquery.cookie',
            'jquery.deparam$': 'shim/jquery.deparam',
            'jquery.fileupload$': 'shim/jquery.fileupload',
            'jquery.iframe-transport$': 'shim/jquery.iframe-transport',

            // jQuery UI plugins
            'jquery.ui.core': 'shim/jquery.ui.core',
            'jquery.ui.widget': 'shim/jquery.ui.widget',
            'jquery.ui.datepicker': 'shim/jquery.ui.datepicker',
            'jquery.ui.position': 'shim/jquery.ui.position',
            'jquery.ui.mouse': 'shim/jquery.ui.mouse',
            'jquery.ui.draggable': 'shim/jquery.ui.draggable',
            'jquery.ui.droppable': 'shim/jquery.ui.droppable',
            'jquery.ui.sortable': 'shim/jquery.ui.sortable',
            'jquery.ui.resizable': 'shim/jquery.ui.resizable',
            'jquery.ui.button': 'shim/jquery.ui.button',
            'jquery.ui.spinner': 'shim/jquery.ui.spinner',
            'jquery.ui.effect': 'shim/jquery.ui.effect',
            'jquery.ui.effect-slide': 'shim/jquery.ui.effect-slide',
            'tree.jquery': 'shim/tree.jquery',
            'jquery.resize': 'shim/jquery.resize',
            'jquery.sparkline$': 'shim/jquery.sparkline',

            // bootstrap components
            // FIXME: bootstrap.button collides with jquery.ui.button on the jQuery prototype !!
            'bootstrap.affix': 'shim/bootstrap.affix',
            'bootstrap.alert': 'shim/bootstrap.alert',
            'bootstrap.button': 'shim/bootstrap.button',
            'bootstrap.carousel': 'shim/bootstrap.carousel',
            'bootstrap.collapse': 'shim/bootstrap.collapse',
            'bootstrap.dropdown': 'shim/bootstrap.dropdown',
            'bootstrap.modal': 'shim/bootstrap.modal',
            'bootstrap.popover': 'shim/bootstrap.popover',
            'bootstrap.scrollspy': 'shim/bootstrap.scrollspy',
            'bootstrap.tab': 'shim/bootstrap.tab',
            'bootstrap.tooltip': 'shim/bootstrap.tooltip',
            'bootstrap.transition': 'shim/bootstrap.transition',
            'bootstrap.typeahead': 'shim/bootstrap.typeahead',

            // Splunk legacy
            'splunk$': 'shim/splunk',
            'splunk.legend': 'shim/splunk.legend',
            'splunk.logger': 'shim/splunk.logger',
            'splunk.error': 'shim/splunk.error',
            'splunk.util': 'shim/splunk.util',
            'splunk.pdf': 'shim/splunk.pdf',
            'splunk.i18n': 'stubs/i18n', // shim shared with requirejs config
            'splunk.config': 'stubs/splunk.config', // shim shared with requirejs config
            'splunk.paginator': 'shim/splunk.paginator',
            'splunk.messenger': 'shim/splunk.messenger',
            'splunk.time': 'shim/splunk.time',
            'splunk.timerange': 'shim/splunk.timerange',
            'splunk.window': 'shim/splunk.window',
            'splunk.jabridge': 'shim/splunk.jabridge', // Do we need this still?
            'splunk.print': 'shim/splunk.print',
            'splunk.session': 'shim/splunk.session',
            'splunk.jquery.csrf$': 'shim/splunk.jquery.csrf',

            'select2/select2$': 'shim/select2',

            'splunkjs/splunk$': 'shim/splunkjs'
        }
    }
}
