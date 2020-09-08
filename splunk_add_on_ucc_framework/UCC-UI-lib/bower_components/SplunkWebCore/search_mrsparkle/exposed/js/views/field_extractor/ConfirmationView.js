/**
 * View that is displayed at the very final wizard step, after the user has successfully saved their extraction.
 * Displays a success message and links for subsequent actions to take.
 */
define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'splunk.util',
        'uri/route'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        BaseView,
        splunkUtils,
        route
        ) {

        return BaseView.extend({
            moduleId: module.id,

            render: function() {
                var router= route.getContextualPageRouter(this.model.application);
                var exploreFieldsHref = '';
                var extractMoreFieldsHref = '';
                if (this.model.state.get('type') === 'sourcetype') {
                    exploreFieldsHref = router.search({
                        data: {
                            q: splunkUtils.sprintf(
                                'index=_* OR index=* sourcetype=%s',
                                splunkUtils.searchEscape(this.model.state.get('sourcetype'))
                            )
                        }
                    });
                    extractMoreFieldsHref = router.field_extractor({
                        data: { sourcetype: this.model.state.get('sourcetype') }
                    });
                } else {
                    exploreFieldsHref = router.search({
                        data: {
                            q: splunkUtils.sprintf(
                                'index=_* OR index=* source="%s"',
                                splunkUtils.searchEscape(this.model.state.get('source'))
                            )
                        }
                    });
                }

                this.$el.html(this.compiledTemplate({
                    exploreFieldsHref: exploreFieldsHref,
                    extractMoreFieldsHref: extractMoreFieldsHref
                }));
                return this;
            },

            template: '\
                <div class="confirmation-body">\
                    <h4><%- _("What would you like to do next?").t() %></h4>\
                    <div class="next-step-links">\
                        <div>\
                            <i class="icon-arrow-right"></i>\
                            <a href="<%- exploreFieldsHref %>" class="explore-fields-search"><%- _("Explore the fields I just created in Search").t()%></a>\
                        </div>\
                        <% if (extractMoreFieldsHref) { %>\
                            <div>\
                                <i class="icon-arrow-right"></i>\
                                <a href="<%- extractMoreFieldsHref %>" class="extract-more-fields"><%- _("Extract more fields").t()%></a>\
                            </div>\
                        <% } %>\
                    </div>\
                </div>\
            '
        });
    });
