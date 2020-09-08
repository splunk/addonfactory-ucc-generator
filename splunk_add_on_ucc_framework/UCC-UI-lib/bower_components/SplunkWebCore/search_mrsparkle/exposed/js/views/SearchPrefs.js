define(
    [
        'underscore',
        'module', 
        'uri/route',
        'views/Base',
        'views/shared/timerangepicker/Master',
        'views/shared/FlashMessages',
        './SearchPrefs.pcss'
    ],
    function(
        _,
        module,
        route,
        Base,
        TimeRangePicker,
        FlashMessagesView,
        css
    ){
        return Base.extend({
            moduleId: module.id,
             /**
             * @param {Object} options {
             *     model: {
             *         userPrefGeneralDefault: <model.services.data.UserPrefGeneralDefault>,
             *         timeRange: <models.shared.TimeRange>,
             *         appLocal: <models.services.AppLocal>
             *         user: <models.shared.User>,
             *         application: <models.shared.Application>,
             *     },
             *     collections: {
             *         times: <collections.services.data.ui.Times>,
             *     }
             * }
             */
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.backUrl = "systemsettings";

                this.helpUrl = route.docHelp(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    'learnmore.search.time_range_picker.global.default');

                this.children.flashMessages = new FlashMessagesView({model: this.model.userPrefGeneralDefault});

                this.children.timeRangePicker = new TimeRangePicker({
                    model: {
                        state: this.model.userPrefGeneralDefault,
                        timeRange: this.model.timeRange,
                        appLocal: this.model.appLocal,
                        user: this.model.user,
                        application: this.model.application
                    },
                    collection: this.collection.times,
                    className: 'btn-group',
                    timerangeClassName: 'btn',
                    forceTimerangeChange: true
                });
                this.activate();
            },

           events: {
                'click .btn.save-button': function(e) {
                    this.model.userPrefGeneralDefault.save({}, {
                        data: {
                            default_earliest_time: this.model.userPrefGeneralDefault.get('dispatch.earliest_time'),
                            default_latest_time: this.model.userPrefGeneralDefault.get('dispatch.latest_time')
                        },
                        success: function(model, response) {
                            window.location.href = this.backUrl;
                        }.bind(this)
                    }); 
                    e.preventDefault();
                }
            },
 
            render: function() {
                this.$el.html(this.compiledTemplate({
                    url: this.backUrl,
                    helpUrl: this.helpUrl
                }));

                this.children.timeRangePicker.render().insertBefore(this.$('.exampleText'));
                this.children.flashMessages.render().prependTo(this.$('.formWrapper'));
                return this;
            },

            template: '\
                <div class="section-padded section-header"> \
                    <h2 class="section-title"><%- _("Search preferences").t() %></h2> \
                    <div class="breadcrumb"><a href="<%- url%>"><%- _("Server settings").t() %></a> &raquo <%- _("Search preferences").t() %></div> \
                </div>\
                <div class="editFormWrapper"> \
                    <div class="formWrapper"> \
                        <label><%- _("Default search time range").t() %></label> \
                        <p class="exampleText"> \
                            <em><%- _("This time range is used as the default time range for searches.").t() %></em> \
                            <a href="<%- helpUrl %>" target="_blank" class="help-link"><%- _("Learn more").t() %>\
                                <i class="icon-external"></i> \
                            </a> \
                        </p> \
                    </div> \
                    <div class="jmFormActions"> \
                        <a href="<%- url%>" class="btn btn-secondary cancel-button"><%- _("Cancel").t() %></a> \
                        <a href="#" class="btn btn-primary save-button"><%- _("Save").t() %></a> \
                    </div> \
                </div> \
                '
        });
    }
);
