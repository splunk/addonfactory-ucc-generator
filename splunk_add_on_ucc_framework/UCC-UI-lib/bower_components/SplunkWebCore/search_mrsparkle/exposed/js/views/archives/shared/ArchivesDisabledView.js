/**
 * @author ecarillo
 * @date 8/24/2015
 * Displays a static disabled view of the Archives Page.
 *
 * INPUTS:
 *
 * model: {
 *     application {models/Application}
 * }
 */
define([
        'underscore',
        'module',
        'views/Base',
        'splunk.util',
        'uri/route',
        'contrib/text!views/archives/shared/ArchivesDisabledView.html'
    ],
    function(
        _,
        module,
        BaseView,
        splunkUtil,
        route,
        template
    ){
        return BaseView.extend({
            moduleId: module.id,
            template: template,
            className: 'archives-view archives-disabled-view',

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
            },

            render: function() {
                var docUrl = route.docHelp(
                    this.model.application.get("root"),
                    this.model.application.get("locale"),
                    'learnmore.cloud.archives'
                );

                var html = this.compiledTemplate({
                    _: _,
                    docUrl: docUrl,
                    splunkUtil: splunkUtil
                });
                this.$el.html(html);

                return this;
            }
        });
    });
