define(
    [
        'underscore',
        'jquery',
        'module',
        'collections/services/data/ui/Times',
        'models/Base',
        'models/services/AppLocal',
        'models/services/server/ServerInfo',
        'models/shared/TimeRange',
        'models/shared/User',
        'views/Base',
        'views/shared/timerangepicker/Master',
        '../Master.pcss'
    ],
    function(
        _,
        $,
        module,
        TimesCollection,
        BaseModel,
        AppLocalModel,
        ServerInfoModel,
        TimeRangeModel,
        UserModel,
        BaseView,
        TimeRangePicker,
        css
    ) {
        return BaseView.extend({
            moduleId: module.id,
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.model = new BaseModel();

                this.timeRangePickerView = new TimeRangePicker({
                    model: {
                        state: this.model,
                        timeRange: new TimeRangeModel({
                            enableRealTime: true
                        }),
                        user: new UserModel({}, {
                            serverInfoModel: new ServerInfoModel()
                        }),
                        appLocal: new AppLocalModel(),
                        application: this.model
                    },
                    collection: new TimesCollection()
                });
            },

            render: function() {
                this.$el.html(this.template);
                this.timeRangePickerView.render().appendTo(this.$('.docs-example'));

                return this;
            },

            template: '\
                <div class="section" id="time">\
                    <h2>Time Picker</h2>\
                    <div class=docs-example></div>\
                </div>\
            '
        });
    }
);
