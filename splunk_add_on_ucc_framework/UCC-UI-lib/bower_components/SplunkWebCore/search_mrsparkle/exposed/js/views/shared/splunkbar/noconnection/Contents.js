define([
    'underscore',
    'module',
    'views/Base',
    'views/shared/waitspinner/Master',
    'contrib/text!./Contents.html',
    './Contents.pcssm',
    'splunk.util'
],
    function(
        _,
        module,
        BaseView,
        WaitSpinnerView,
        Template,
        css,
        splunkUtil
        ){

        var image = new Image();
        image.src = splunkUtil.make_url("/static/img/skins/default/loading_medium_green.png");
        var image2x = new Image();
        image2x.src = splunkUtil.make_url("/static/img/skins/default/loading_medium_green_2x.png");


        return BaseView.extend({
            moduleId: module.id,
            template: Template,
            css: css,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                var spinnerOptions = {
                    color: 'green',
                    size: 'medium',
                    frameWidth: 19,
                    useLocalClassNames: true
                };

                this.children.spinner = new WaitSpinnerView(spinnerOptions);
                this.visible = false;
            },
            show: function() {
                this.children.spinner.start();
            },
            hide: function() {
                this.children.spinner.stop();
            },
            render: function() {
                var html = this.compiledTemplate({
                    css: this.css
                });
                this.$el.html(html);
                this.children.spinner.render().appendTo(this.$('[data-role=spinner-wrapper]'));
                return this;
            }
        });
    });
