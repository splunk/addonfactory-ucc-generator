define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'contrib/text!views/shared/appbar/AppLabel.html',
    './AppLabel.pcssm'
],
function(
    $,
    _,
    module,
    BaseView,
    templateAppLabel,
    css
){
    return BaseView.extend({
        moduleId: module.id,
        css: css,
        tagName: 'h2',
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.model.appNav.on('change', this.render, this);
        },
        showLogo: function(){
            this.$('[data-role=app-logo]').show();
            this.$('[data-role=app-name]').hide();
        },
        showName: function(){
            this.$('[data-role=app-name]').show();
            this.$('[data-role=app-logo]').hide();
        },
        render: function(){
            var label = this.model.appNav.get('label') || '';

            var html = _.template(templateAppLabel, {
                appLink: this.model.appNav.get('link'),
                appLabel: label,
                appLogo: this.model.appNav.get('logo'),
                css: this.css
            });
            this.$el.html(html);

            this.setAppLabelDisplay();

            return this;
        },
        setAppLabelDisplay: function(){
            if (this.model.appNav.get('logo')) {
                var img = new Image();
                img.onload = function(){
                    if(parseInt(img.width, 10) < 2){
                        this.showName();
                    } else{
                        this.$('[data-role=app-logo]').remove();
                        $(img).attr('class', css.image).attr('data-role=app-logo');
                        this.$('[data-role=app-home-link]').prepend(img);
                        this.showLogo();
                    }
                }.bind(this);

                img.onerror = function(){
                    this.showName();
                }.bind(this);

                img.src = this.model.appNav.get('logo');
            }
        }
    });
});
