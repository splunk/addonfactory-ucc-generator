define(
[
    'jquery',
    'underscore',
    'module',
    'splunk.util',
    'uri/route',
    'util/splunkd_utils',
    'views/shared/Modal',
    'views/home/dashboard/shared/dashboardselector/AutoSuggest',
    'views/shared/FlashMessages',
    'models/Base',
    'models/search/Dashboard',
    'collections/shared/Dashboards', 
    'models/services/data/ui/Pref'
],
function (
    $,
    _,
    module,
    splunkUtil,
    route,
    splunkdutils,
    Modal,
    AutoSuggestView,
    FlashMessagesView, 
    BaseModel,
    DashboardModel,
    DashboardsCollection, 
    UIPrefModel
) {
    return Modal.extend({
        moduleId: module.id,
        initialize: function () {
            Modal.prototype.initialize.apply(this, arguments);
            //models
            this.model.state = new BaseModel({id: ""});
            this.model.dashboardWorking = new DashboardModel();
            //collections
            this.collection = new DashboardsCollection();
            this.children.dashboardSearchFilter = new AutoSuggestView({
                model: {
                    state: this.model.state, 
                    active: !this.model.dashboard.isNew() ? this.model.dashboard : null
                },
                collection: this.collection,
                map: function(model) {
                    return {
                        id: model.get('id'),
                        name: model.meta.get('label')
                    };
                }
            });
            this.listenTo(this.model.state, 'change:search', this.fetchDashboardCollection);
            this.listenTo(this.model.state, 'change:id', this.clearErrorMessage);
            this.children.flashMessagesView = new FlashMessagesView(); 
        },
        clearErrorMessage: function() {
            if (!_.isUndefined(this.model.state.get('id'))) {  //If user has made a valid selection, then clear the error message
                this.children.flashMessagesView.flashMsgHelper.removeGeneralMessage(splunkdutils.ERROR);
            }
        }, 
        events: $.extend({}, Modal.prototype.events, {
            'click a.modal-btn-primary': function (e) {
                var dashboardId = this.model.state.get('id');
                if (!_.isUndefined(dashboardId)) {
                    this.model.userPref.entry.content.set({
                        'display.page.home.dashboardId': dashboardId
                    });
                    this.model.userPref.save({}, {
                        success: function() {
                            if (dashboardId) {
                                var dashboard = this.collection.get(dashboardId); 
                                if (dashboard) {
                                    this.model.dashboard.setFromSplunkD(dashboard.toSplunkD());
                                } else {
                                    //possible that the selected model does not exist in collection due to truncation
                                    this.model.dashboardWorking.clear();
                                    this.model.dashboardWorking.set('id', dashboardId);
                                    this.model.dashboardWorking.fetch({
                                        success: function() {
                                            this.model.dashboard.setFromSplunkD(this.model.dashboardWorking.toSplunkD());
                                        }.bind(this),
                                        error: function() {
                                            this.model.dashboard.clear();
                                        }.bind(this)
                                    });
                                }
                            } else {
                                this.model.dashboard.clear();
                            }
                            this.remove();
                        }.bind(this) 
                    }); 
                } else {
                    this.children.flashMessagesView.flashMsgHelper.addGeneralMessage(splunkdutils.ERROR,
                        {type: splunkdutils.ERROR,
                            html: _("Please select a dashboard.").t()});
                }
                e.preventDefault();
            }
        }),
        fetchDashboardCollection: function() {
            var search = this.model.state.get('search') || '';
            this.collection.safeFetch({
                    data: {
                        sort_dir: 'asc',
                        sort_key: 'label',
                        sort_mode: 'natural',
                        count: 14,
                        //digest: '1', cannot filter by digest as it removes the ability to filter by eai:data
                        app: '-',
                        owner: this.model.application.get('owner'),
                        search: '(((eai:acl.can_write="1") AND (NOT name="pdf_activity"))  AND (eai:data="*<dashboard*" OR eai:data="*<form*")) AND ' + 
                        DashboardsCollection.availableWithUserWildCardSearchString(this.model.application.get('owner')) + 
                        ' AND ' + splunkdutils.createSearchFilterString(search, ['label', 'name'])
                   } 
            });
        },
        render: function () {
                this.$el.html(Modal.TEMPLATE);
                this.$(Modal.HEADER_TITLE_SELECTOR).html(_("Choose Default Dashboard").t());
                var dashboardLink = route.manager(this.model.application.get('root'), this.model.application.get('locale'), 'system', 'dashboards');
                this.$(Modal.BODY_SELECTOR).html(this.compiledTemplate({
                    collection: this.collection,
                    model: this.model.application,
                    route: route,
                    _: _,
                    link:  splunkUtil.sprintf(_('You can set a dashboard as home from the <a href="%s">dashboards listing page</a> too').t(), dashboardLink)
                }));
                this.$el.find(".flash-messages-placeholder").append(this.children.flashMessagesView.render().el);
                this.$el.find(".filter-container").append(this.children.dashboardSearchFilter.render().el);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);
                this.$('.modal-body').removeClass('modal-body-scrolling'); //Make the modal un-scrollable so that the dashboard selector overflows outside of the modal. Otherwise, the modal will elongate to accomodate the dashboard selector and a scrollbar appears inside the modal. 
            return this;
        },
        template: '\
            <div class="flash-messages-placeholder"></div>\
            <div class="filter-container"></div>\
            <p>\
                <%- _("Only simpleXML dashboards can be displayed on home.").t() %><br>\
                <%= link %>\
            </p>\
        '
    });
});
