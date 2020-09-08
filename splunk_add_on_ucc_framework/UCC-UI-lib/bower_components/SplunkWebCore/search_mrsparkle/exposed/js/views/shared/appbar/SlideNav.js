define([
        'jquery',
        'underscore',
        'module',
        'views/Base',
        './SlideList',
        './SlideNav.pcssm'
], function(
    $,
    _,
    module,
    BaseView,
    SlideListView,
    css
    ){
    return BaseView.extend({
        moduleId: module.id,
        css: css,
        attributes: {'data-role': 'slidenav-menu'},
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.children.list = [];
            this.addLevel(this.options.navData, false);
        },
        events: {
            'click [data-has-children]': 'next',
            'click [data-role="back"]': function(e) {
                e.stopPropagation();
                this.back();
            }
        },
        addLevel: function(navData, needsBack){
            var newLevel = new SlideListView({
                navData: navData,
                needsBack: needsBack
            });
            this.children.list.push(newLevel);
            newLevel.appendTo(this.$el);
            return newLevel;
        },
        next: function(e){
            e.stopPropagation();
            var selectedIndex = $(e.currentTarget).attr('data-last-section', 'true').attr('data-index');
            var current = this.children.list[this.children.list.length-1];
            this.$el.height( current.$el.height() );
            var newLevel = this.addLevel(current.options.navData.submenu[selectedIndex], true);
            newLevel.render().$el.width();
            newLevel.$el.css('transform', 'translateX(0%)');
            current.$el.css('transform', 'translateX(-100%)');
            this.$el.height( newLevel.$el.height() );

            newLevel.$el.one('transitionend', function() {
                newLevel.$el.find('a').first().focus();
                current.$el.hide();
            }.bind(this));
        },
        back: function(){
            var hide = this.children.list.pop(),
                to = this.children.list[this.children.list.length-1];
            to.$el.show().width();
            hide.$el.css('transform', 'translateX(100%)');
            to.$el.css('transform', 'translateX(0%)');
            this.$el.height( to.$el.height());

            hide.$el.one('transitionend', function() {
                hide.remove();
                to.$el.find('[data-last-section]').removeAttr('data-last-section').focus();
            }.bind(this));
        },
        render: function() {
            this.children.list[0].render();
            return this;
        }
    });
});
