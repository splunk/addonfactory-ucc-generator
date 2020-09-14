define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base'
    ],
    function(
        $,
        _,
        module,
        BaseView
    ) {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'ul',
            className: 'nav menu-starting',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.startingRegexObjects = this.options.startRules || [];
            },

            activate: function(options) {
                if (this.active) {
                    return BaseView.prototype.activate.apply(this, arguments);
                }

                var selectedNum = this.model.command.get('regExpStartingIndex'),
                    regexObject;

                if (!selectedNum) {
                    selectedNum = 0;
                    regexObject = this.startingRegexObjects[selectedNum];

                    // The default selection for each step will just be the first item in the group
                    this.model.command.set({
                        regExpStarting: regexObject.regex,
                        regExpStartingIndex: selectedNum
                    });
                }

                return BaseView.prototype.activate.apply(this, arguments);
            },

            events: {
                'click a': function(e) {
                    e.preventDefault();

                    var $target = $(e.currentTarget),
                        indexInObjectsArray = $target.data('index'),
                        regexObject = this.startingRegexObjects[indexInObjectsArray];

                    $target.parent().addClass('selected').siblings().removeClass('selected');

                    this.model.command.set({
                        regExpStarting: regexObject.regex,
                        regExpStartingIndex: indexInObjectsArray
                    });
                }
            },

            render: function() {
                var selectedNum = this.model.command.get('regExpStartingIndex') || 0;

                this.$el.html(this.compiledTemplate({
                    _: _,
                    startingRegexObjects: this.startingRegexObjects
                }));

                $(this.$('li')[selectedNum + 1]).addClass('selected');

                return this;
            },

            template: '\
                <li class="text"><%= _("1. Start after...").t() %></li>\
                <% _.each(startingRegexObjects, function(regex, index) { %>\
                    <% var label = regex.label || ""; %>\
                    <li>\
                        <a href="" data-index="<%- index %>">\
                            <i class="icon-check"></i>\
                            <%= label %>\
                        </a>\
                    </li>\
                <% }); %>\
            '
        });
    }
);