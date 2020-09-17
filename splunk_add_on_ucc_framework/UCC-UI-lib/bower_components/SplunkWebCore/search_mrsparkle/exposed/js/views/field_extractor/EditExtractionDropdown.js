/**
 * Dropdown Menu displaying a list of options when user clicks on an existing extracted field: Rename or Remove.
 * Clicking on each list item will open a modal confirming that action.
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
                this.fieldValue = this.options.fieldValue;
                this.fieldName = this.options.fieldName;
            },
            events: {
                'click a.remove-extraction': function(e){
                    e.preventDefault();
                    this.children.removeDialog = new TextDialog({
                        id: "modal_delete"
                    });

                    this.children.removeDialog.settings.set("primaryButtonLabel",_("Remove").t());
                    this.children.removeDialog.settings.set("cancelButtonLabel",_("Cancel").t());
                    this.children.removeDialog.settings.set("titleLabel",_("Remove Extraction").t());
                    this.children.removeDialog.setText(splunkUtils.sprintf(_('Are you sure you want to remove %s?').t(),
                        '<em>' + _.escape(this.fieldName) + '</em>'));

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
                },
                'click a.rename-extraction': function(e){
                    e.preventDefault();
                    if (this.$el.find('.rename-extraction').hasClass('disabled')) {
                        return false;
                    }
                    else {
                        this.children.renameDialog = new RenameDialog({
                            fieldValue: this.fieldValue,
                            fieldName: this.fieldName,
                            onHiddenRemove: true,
                            model: {
                                state: this.model.state
                            }
                        });
                        this.children.renameDialog.on('action:rename', function(newFieldName){
                            this.trigger('action:rename', newFieldName);
                            this.children.renameDialog.hide();
                        }, this);

                        $("body").append(this.children.renameDialog.render().el);
                        this.children.renameDialog.show();
                    }
                }
            },
            removeHandler: function() {
                this.trigger('action:remove', this.fieldName);
                this.children.removeDialog.hide();
            },
            render: function() {
                var enabled = false;
                if (this.model.state.get('regex')) {
                    enabled = true;
                }
                var html = this.compiledTemplate({
                    fieldName: this.fieldName,
                    eventType: this.options.eventType,
                    enabled: enabled
                });
                
                this.el.innerHTML = PopTartView.prototype.template_menu;
                this.$el.append(html);
                return this;
            },
            template: '\
                <ul class="first-group">\
                    <li class="dropdown-title-field-name"><%- fieldName %></li>\
                </ul>\
                <ul class="second-group">\
                    <% if(eventType === "master") { %>\
                        <li><a class="edit-extraction-action rename-extraction <%- enabled === false ? \"disabled\" : \"\"%>" href="#"><%- _("Rename Field").t() %></a></li>\
                    <% } %>\
                    <li><a class="edit-extraction-action remove-extraction" href="#"><%- _("Remove Field").t() %></a></li>\
                </ul>\
            '
        });
    }
);
