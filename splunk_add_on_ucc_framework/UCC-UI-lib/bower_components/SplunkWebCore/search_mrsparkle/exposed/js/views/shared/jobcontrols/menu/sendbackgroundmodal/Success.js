define(
    [
         'jquery',
         'underscore',
         'module',
         'views/Base',
         'views/shared/Modal',
         'views/shared/controls/ControlGroup',
         'uri/route',
         'util/time',
         'splunk.util'
     ],
     function($, _, module, Base, Modal, ControlGroup, route, time_utils, splunkUtil){
        return Base.extend({
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                var linkToJob = route.search(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.application.get("app"),
                    {
                        data: {
                            sid: this.model.inmem.id
                        },
                        absolute: true
                    }
                );

                //link to job
                this.children.link = new ControlGroup({
                    label: _("Link To Job").t(),
                    controlType:'Text',
                    help: _('Copy or bookmark the link by right-clicking the icon, or drag the icon into your bookmarks bar.').t(),
                    controlOptions: {
                        defaultValue: linkToJob,
                        append: '<a class="add-on bookmark" href="' + linkToJob + '"><i class="icon-bookmark"></i><span class="hide-text">' + _("Splunk Search Job").t() + '</span></a>'
                    }
                });


                this.model.inmem.entry.content.on("change:ttl", this.updateTTL, this);
            },
            events: $.extend({}, Modal.prototype.events, {
                'click a.bookmark': function(e) {
                    e.preventDefault();
                }
            }),
            updateTTL: function() {
                var ttl = this.model.inmem.entry.acl.get("ttl") || 0,
                    time = time_utils.getRelativeStringFromSeconds(ttl, true);

                this.$(".ttl").html(time);
            },
            render: function() {
                var template = this.compiledTemplate({
                    _: _,
                    splunkUtil: splunkUtil
                });

                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("The Job is Running in the Background").t());

                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

                this.children.link.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));

                this.$(Modal.BODY_SELECTOR).prepend(template);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_DONE);
                this.updateTTL();

                return this;
            },
            template: '\
                <p>\
                    <%= splunkUtil.sprintf(_("The job&#39;s lifetime has been extended to %s.").t(), \'<span class="ttl">0</span>\') %>\
                </p>\
            '
        });
    }
);
