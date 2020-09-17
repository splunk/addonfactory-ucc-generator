define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base'
    ],
    function(
        _,
        $,
        module,
        BaseView
    ) {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'ul',
            className: 'nav menu-extraction',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.extractionRegexObjects = this.options.extractRules || [];
            },

            activate: function(options) {
                if (this.active) {
                    return BaseView.prototype.activate.apply(this, arguments);
                }

                var selectedNum = this.model.command.get('regExpExtractionIndex'),
                    regexObject;

                if (!selectedNum) {
                    selectedNum = 0;
                    regexObject = this.extractionRegexObjects[selectedNum];

                    // The default selection for each step will just be the first item in the group
                    this.model.command.set({
                        regExpExtraction: regexObject.regex,
                        regExpExtractionIndex: selectedNum
                    });
                }

                return BaseView.prototype.activate.apply(this, arguments);
            },

            events: {
                'click a': function(e) {
                    e.preventDefault();

                    var $target = $(e.currentTarget),
                        indexInObjectsArray = $target.data('index'),
                        regexObject = this.extractionRegexObjects[indexInObjectsArray];

                    $target.parent().addClass('selected').siblings().removeClass('selected');

                    this.model.command.set({
                        regExpExtraction: regexObject.regex,
                        regExpExtractionIndex: indexInObjectsArray
                    });
                }
            },

            render: function() {
                var selectedNum = this.model.command.get('regExpExtractionIndex') || 0;

                this.$el.html(this.compiledTemplate({
                    _: _,
                    extractionRegexObjects: this.extractionRegexObjects
                }));

                $(this.$('li')[selectedNum + 1]).addClass('selected');

                return this;
            },

            template: '\
                <li class="text"><%= _("2. Extract...").t() %></li>\
                <% _.each(extractionRegexObjects, function(regex, index) { %>\
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