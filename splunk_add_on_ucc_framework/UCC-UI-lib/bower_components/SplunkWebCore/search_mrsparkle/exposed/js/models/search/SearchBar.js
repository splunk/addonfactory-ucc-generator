define(
    [
        'models/Base'
    ],
    function(BaseModel) {
        return BaseModel.extend({
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
            },
            defaults: {
                search: '',
                assistantOpen: false,
                assistantRolloverEnabled: true, //required to override mouseenter function during keyboard scrolling.
                assistantCursor: 0,
                assistantRolloverTimer: 0
            },
            sync: function() {
                throw 'Method disabled';
            }
        });
    }
);