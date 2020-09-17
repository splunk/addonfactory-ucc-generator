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
            className: 'nav menu-stopping',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.stoppingRegexObjects = this.options.stopRules || [];
            },
    
            activate: function(options) {
                if (this.active) {
                    return BaseView.prototype.activate.apply(this, arguments);
                }
        
                var selectedNum = this.model.command.get('regExpStoppingIndex'),
                    regexObject;
        
                if (!selectedNum) {
                    selectedNum = 0;
                    regexObject = this.stoppingRegexObjects[selectedNum];

                    // The default selection for each step will just be the first item in the group
                    this.model.command.set({
                        regExpStopping: regexObject.regex,
                        regExpStoppingIndex: selectedNum
                    });
                }
        
                return BaseView.prototype.activate.apply(this, arguments);
            },
    
            events: {
                'click a': function(e) {
                    e.preventDefault();
            
                    var $target = $(e.currentTarget),
                        indexInObjectsArray = $target.data('index'),
                        regexObject = this.stoppingRegexObjects[indexInObjectsArray];
            
                    $target.parent().addClass('selected').siblings().removeClass('selected');
            
                    this.model.command.set({
                        regExpStopping: regexObject.regex,
                        regExpStoppingIndex: indexInObjectsArray
                    });
                }
            },
    
            render: function() {
                var selectedNum = this.model.command.get('regExpStoppingIndex') || 0;
        
                this.$el.html(this.compiledTemplate({
                    _: _,
                    stoppingRegexObjects: this.stoppingRegexObjects
                }));
        
                $(this.$('li')[selectedNum + 1]).addClass('selected');

                return this;
            },

            template: '\
                <li class="text"><%= _("3. Followed by...").t() %></li>\
                <% _.each(stoppingRegexObjects, function(regex, index) { %>\
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