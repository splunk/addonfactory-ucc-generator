define(
    [
         'jquery',
         'underscore',
         'module',
         'views/Base',
         'views/shared/Modal',
         'views/shared/controls/ControlGroup',
         'views/shared/jobcontrols/menu/EditModal',
         'uri/route',
         'util/time',
         'splunk.util'
     ],
     function($, _, module, Base, Modal, ControlGroup, EditModal, route, time_utils, splunkUtil){
        return Modal.extend({
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
                var externalJobLinkPage = this.options.externalJobLinkPage || this.model.application.get('page'),
                    data = {
                        sid: this.model.searchJob.id
                    };

                if (this.model.application.get('page') === 'report' && this.model.report && !this.model.report.isNew()) {
                    data.s = this.model.report.id;
                }

                this.linkToJob = route[externalJobLinkPage](
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.application.get("app"),
                    {
                        data: data,
                        absolute: true
                    }
                );

                //link to job
                this.children.link = new ControlGroup({
                    label: _("Link To Job").t(),
                    controlType:'Text',
                    help: _('Copy or bookmark the link by right-clicking the icon, or drag the icon into your bookmarks bar.').t(),
                    controlOptions: {
                        className: 'job-link',
                        defaultValue: this.linkToJob,
                        append: '<a class="add-on bookmark" href="' + this.linkToJob + '"><i class="icon-bookmark"></i><span class="hide-text">' + _("Splunk Search Job").t() + '</span></a>'
                    }
                });
            },
            events: $.extend({}, Modal.prototype.events, {
                'click .jobSettings': function(e) {
                    this.hide();

                    this.children.editModal = new EditModal({
                        model: {
                            searchJob: this.model.searchJob,
                            application: this.model.application,
                            report: this.model.report,
                            serverInfo: this.model.serverInfo
                        },
                        onHiddenRemove: true,
                        externalJobLinkPage: this.options.externalJobLinkPage || this.model.application.get('page')
                    });

                    this.children.editModal.render().appendTo($("body"));
                    this.children.editModal.show();

                    e.preventDefault();
                },
                'click a.bookmark': function(e) {
                    e.preventDefault();
                }
            }),
            render: function() {
                var ttl = this.model.searchJob.entry.acl.get("ttl") || 0,
                    time = time_utils.getRelativeStringFromSeconds(ttl, true);

                var template = this.compiledTemplate({
                    settingsAnchor: '<a class="jobSettings" href="#">' + _("Job&nbsp;Settings").t() + '</a>',
                    time: time,
                    _: _,
                    splunkUtil: splunkUtil
                });

                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Share Job").t());

                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

                this.children.link.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));

                this.$(Modal.BODY_SELECTOR).prepend(template);

                return this;
            },
            template: '\
                <p>\
                    <%=  splunkUtil.sprintf(_("The job&#39;s lifetime has been extended to %s and read permissions have been set to Everyone. Manage the job via %s.").t(), time, settingsAnchor) %>\
                </p>\
            '
        });
    }
);
