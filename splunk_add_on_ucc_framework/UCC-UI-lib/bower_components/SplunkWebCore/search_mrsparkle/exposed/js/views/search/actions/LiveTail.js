define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/reportcontrols/dialogs/createreport/Master',
        'uri/route',
        'splunk.util'
    ],
    function(_, module, Base, SaveAsDialog, route, splunk_utils) {
        return Base.extend({
            tagName: 'a',
            attributes: {
                "href": "#"
            },
            moduleId: module.id,
            className: 'live-tail btn-pill',

            events: {
                'click': function(e) {
                    e.preventDefault();
                    var root = this.model.application.get('root'),
                        locale = this.model.application.get('locale'),
                        app = this.model.application.get('app'),
                        url = route.page(root, locale, app, 'live_tail', {
                            data: {
                                q: this.options.searchString,
                                earliest: 'rt-10',
                                latest: 'rt',
                                'dispatch.indexedRealtime': true
                            }
                        }),
                        target = 'tail',
                        attr = 'width=1200, height=850, top=50, left=50, toolbar=no, status=no, titlebar=no, menubar=no, location=no';
                    window.open(url, target, attr);
                }
            },

            render: function() {
                this.$el.html(splunk_utils.sprintf('%s<sup>%s</sup>', _('Live Tail').t(), _('BETA').t()));
                return this;
            }
        });
    }
);
