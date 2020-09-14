/**
 * Dropdown menu that is rendered when user clicks on the existing required text in the Master Event,
 * prompting the user to remove the required text.
 */
define(
    [
        'underscore',
        'module',
        'jquery',
        'views/Base',
        'views/shared/PopTart',
        './RenameExtractionDialog',
        'views/shared/dialogs/TextDialog',
        'splunk.util'
    ],
    function(
        _,
        module,
        $,
        BaseView,
        PopTartView,
        RenameDialog,
        TextDialog,
        splunkUtils
    )
    {
        return PopTartView.extend({
            moduleId: module.id,
            className: 'dropdown-menu dropdown-menu-narrow',
            initialize: function() {
                PopTartView.prototype.initialize.apply(this, arguments);
            },
            events: {
                'click a.remove-required-text': function(e){
                    e.preventDefault();
                    this.hide();
                    this.children.removeDialog = new TextDialog({ id: "modal_delete" });

                    this.children.removeDialog.settings.set("primaryButtonLabel",_("Remove").t());
                    this.children.removeDialog.settings.set("cancelButtonLabel",_("Cancel").t());
                    this.children.removeDialog.settings.set("titleLabel",_("Remove Required Text").t());
                    this.children.removeDialog.setText(splunkUtils.sprintf(_('Are you sure you want to remove %s?').t(),
                        '<em>' + _.escape(this.options.requiredText) + '</em>'));

                    this.children.removeDialog.on('click:primaryButton', function(e){
                        this.removeHandler();
                    }, this);
                    this.children.removeDialog.$el.on('keypress', _.bind(function(e) {
                        var ENTER_KEY = 13;
                        if(e.which === ENTER_KEY) {
                            this.removeHandler();
                        }
                    }, this));
                    this.children.removeDialog.on("hide", function(){
                        this.children.removeDialog.remove();
                    }, this);

                    $("body").append(this.children.removeDialog.render().el);
                    this.children.removeDialog.show();
                }
            },
            removeHandler: function() {
                this.trigger('action:remove');
                this.children.removeDialog.hide();
            },
            render: function() {
                var html = this.compiledTemplate({});
                
                this.el.innerHTML = PopTartView.prototype.template_menu;
                this.$el.append(html);
                return this;
            },
            template: '\
                <ul class="first-group">\
                    <li class="dropdown-title-required-text"><%- _("Required Text").t() %></li>\
                </ul>\
                <ul class="second-group">\
                    <li><a class="remove-required-text" href="#"><%- _("Remove Required Text").t() %></a></li>\
                </ul>\
            '
        });
    }
);
