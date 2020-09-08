define(
    [
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'splunk.util'
    ],
    function(_,
        Backbone,
        module,
        Base,
        ControlGroup,
        splunkUtil
    ) {
        return Base.extend({
            moduleId: module.id,
            tagName: 'form',
            className: 'form-horizontal form-complex',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.children.scriptFile = new ControlGroup({
                    className: 'control-group control-group-run-script',
                    controlType: 'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        modelAttribute: 'action.script.filename',
                        model: this.model.alert.entry.content
                    },
                    label: _('Filename').t(),
                    help: splunkUtil.sprintf(_('Located in %s or %s').t(), '$SPLUNK_HOME/bin/scripts', '$SPLUNK_HOME/etc/'+ this.model.application.get('app') + '/bin/scripts')
                });
            },
            render: function()  {
                this.children.scriptFile.render().appendTo(this.$el);
                return this;
            }
        });
});
