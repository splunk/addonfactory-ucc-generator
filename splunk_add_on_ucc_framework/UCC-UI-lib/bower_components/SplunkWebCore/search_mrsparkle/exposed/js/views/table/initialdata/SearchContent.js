define(
    [
        'underscore',
        'jquery',
        'module',
        'views/table/initialdata/BaseContent'
    ],
    function(
        _,
        $,
        module,
        BaseContentView
    ) {
        return BaseContentView.extend({
            moduleId: module.id,
            className: 'search-content',

            initialize: function() {
                BaseContentView.prototype.initialize.apply(this, arguments);
            },

            startListening: function(options) {
                BaseContentView.prototype.startListening.apply(this, arguments);
                this.listenTo(this.model.command, 'change:baseSPL', this.handleSearchChange);
            },

            render: function() {
                this.appendDoneButton();

                return this;
            }
        });
    }
);