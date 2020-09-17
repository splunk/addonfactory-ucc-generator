define([
        'jquery',
        'module',
        'contrib/text!./SlideList.html',
        'views/Base',
        'views/shared/Icon',
        'views/shared/delegates/StopScrollPropagation',
        './SlideList.pcssm'
], function(
    $,
    module,
    template,
    BaseView,
    IconView,
    StopScrollPropagation,
    css
    ){
    return BaseView.extend({
        moduleId: module.id,
        tagName: 'ul',
        attributes: {'data-role': 'slidelist-menu'},
        css: css,
        template: template,
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            if (this.options.needsBack) {
                this.$el.css('transform', 'translateX(100%)');
            }
            this.children.stopScrollPropagation = new StopScrollPropagation({el:this.el});
        },
        render: function() {
            var html = this.compiledTemplate({
                navData: this.options.navData,
                css: this.css,
                needsBack: this.options.needsBack
            });
            this.$el.append(html);
            if ( this.options.needsBack) {
                this.children.backButton = new IconView({
                    icon: 'chevronLeft'
                });
                this.children.backButton.render().prependTo(this.$('[data-role="back"]'));
            }
            var i,
                $childIcons = this.$('[data-role=submenu-icon]');
            for(i = 0; i < $childIcons.length; i++ ) {
                this.children['icon' + i] || (this.children['icon' + i] = new IconView({icon: 'chevronRight'}));
                this.children['icon' + i].render().appendTo($childIcons.eq(i));
            }

            var $dispatchViews = this.$('[data-role=secondary-report-link][data-dispatch-view]');
            for(i = 0; i < $dispatchViews.length; i++ ) {
                var iconStyle = $dispatchViews.eq(i).attr('data-dispatch-view');
                this.children['dispatchView' + i] || (this.children['dispatchView' + i] = new IconView({icon: iconStyle}));
                this.children['dispatchView' + i].render().appendTo($dispatchViews.eq(i));
            }

            return this;
        }
    });
});
