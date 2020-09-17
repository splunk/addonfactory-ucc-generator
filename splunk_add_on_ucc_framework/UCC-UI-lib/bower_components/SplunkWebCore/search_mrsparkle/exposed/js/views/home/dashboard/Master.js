define([
    'jquery',
    'underscore',
    'module',
    'uri/route',
    'views/home/dashboard/Title', 
    'views/home/dashboard/IFrame',
    'views/home/dashboard/Empty',
    'views/home/dashboard/shared/dashboardselector/Master', 
    'views/Base'
],
function (
    $,
    _,
    module,
    route,
    TitleView,
    IFrameView,
    EmptyView,
    DashboardSelectorView, 
    BaseView
) {
    return BaseView.extend({
        moduleId: module.id,
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.children.title = new TitleView({
                model: {
                    application: this.model.application,
                    dashboard: this.model.dashboard
                }
            });
            this.children.iFrame = this.createIframeChildView();
            this.children.empty = new EmptyView({
                model: {
                    application: this.model.application,
                    dashboard: this.model.dashboard
                }
            });
            this.listenTo(this.children.empty, 'showDashboardSelector', this.showDashboardSelector);
            this.listenTo(this.children.title, 'showDashboardSelector', this.showDashboardSelector);
            this.listenTo(this.children.iFrame, 'nukeFromSpace', this.replaceIframeChildView);
            this.listenTo(this.model.dashboard, 'change:id', this.visibility);
        },
        createIframeChildView: function() {
            return new IFrameView({
                model: {
                    application: this.model.application,
                    dashboard: this.model.dashboard
                }
            });
        },
        replaceIframeChildView: function() {
            this.stopListening(this.children.iFrame);
            this.children.iFrame.remove();
            this.children.iFrame = this.createIframeChildView();
            this.children.iFrame.insertAfter(this.children.title.el).render();
            this.listenTo(this.children.iFrame, 'nukeFromSpace', this.replaceIframeChildView);
            this.visibility();
        },
        showDashboardSelector: function(){
              if (this.children.dashboardSelector) {
                  this.children.dashboardSelector.remove();
              }
              this.children.dashboardSelector = new DashboardSelectorView({
                   model: {
                       application: this.model.application,
                       userPref: this.model.userPref, 
                       dashboard: this.model.dashboard
                   },
                   onHiddenRemove: true
               });
               this.children.dashboardSelector.render().appendTo($("body")).show();
        },
        visibility: function() {
            if (this.model.dashboard.isSimpleXML() && this.model.dashboard.isValidXML()) {
                this.children.empty.$el.hide();
                this.children.iFrame.$el.show();
                this.children.title.$el.show();
                if (!this.resizeIntervalId) { 
                    this.resizeIntervalId = setInterval(function(){
                        this.resizeToIframeHeight();  
                    }.bind(this),100);
                }
            } else {
                this.children.iFrame.$el.hide();
                this.children.iFrame.$el.contents().find('body').empty();
                this.children.empty.$el.show();
                this.children.title.$el.hide();
                if (this.resizeIntervalId) {
                   clearInterval(this.resizeIntervalId);  
                }
            }
        },
        resizeToIframeHeight: function() {
            try {
                var iframeHeight = this.$('iframe')[0].contentWindow.document.body.offsetHeight + 200 + 'px';
                this.$el.height(iframeHeight); 
            } catch (e) {
                //chill
            }
        }, 
        render: function() {
            this.visibility();
            this.children.title.appendTo(this.el).render();
            this.children.iFrame.appendTo(this.el).render();
            this.children.empty.appendTo(this.el).render();
            return this;
        }
    });
});
