// displays Splunk input properties for tcp/udp
// @author: nmistry
define([
    'underscore',
    'jquery',
    'backbone',
    'module',
    'views/Base',
    'views/shared/controls/ControlGroup'
], function (
    _,
    $,
    backbone,
    module,
    BaseView,
    ControlGroup
) {
    return BaseView.extend({
        moduleId: module.id,

        tagName: 'div',

        className: 'modal-step form-horizontal',

        initialize: function () {
            BaseView.prototype.initialize.apply(this, arguments);
            this.children.connectionHost = new ControlGroup({
                className: 'connection_host control-group',
                controlType: 'SyntheticRadio',
                controlOptions: {
                    model: this.model.entry.content,
                    modelAttribute: 'connection_host',
                    items: [
                        {
                            label: _('DNS').t(),
                            value: 'dns'
                        },
                        {
                            label: _('IP').t(),
                            value: 'ip'
                        },
                        {
                            label: _('Manual').t(),
                            value: 'none'
                        }
                    ]
                },
                label: this.model.getLabel('connection_host'),
                tooltip: this.model.getTooltip('connection_host')
            });

            this.children.host = new ControlGroup({
                className: 'host control-group',
                controlType: 'Text',
                controlOptions: {
                    model: this.model.entry.content,
                    modelAttribute: 'host',
                    placeholder: _('optional').t()
                },
                label: this.model.getLabel('host'),
                tooltip: this.model.getTooltip('host')
            });

            this.children.source = new ControlGroup({
                className: 'source control-group',
                controlType: 'Text',
                controlOptions: {
                    model: this.model.entry.content,
                    modelAttribute: 'source',
                    placeholder: _('optional').t()
                },
                label: this.model.getLabel('source'),
                tooltip: this.model.getTooltip('source'),
                help: this.model.getHelpText('source')
            });

            this.children.index = new ControlGroup({
                className: 'index control-group',
                controlType: 'Text',
                controlOptions: {
                    model: this.model.entry.content,
                    modelAttribute: 'index'
                },
                label: this.model.getLabel('index'),
                tooltip: this.model.getTooltip('index')
            });

            this.children.sourcetype = new ControlGroup({
                className: 'sourcetype control-group',
                controlType: 'Text',
                controlOptions: {
                    model: this.model.entry.content,
                    modelAttribute: 'sourcetype',
                    placeholder: _('optional').t()
                },
                label: this.model.getLabel('sourcetype'),
                tooltip: this.model.getTooltip('sourcetype')
            });

            this.listenTo(this.model.entry.content, 'change:connection_host', this.handleConnectionHostChange);
        },

        handleConnectionHostChange: function (model, value, options) {
            if (value === 'none') {
                this.children.host.$el.show();
            } else {
                this.children.host.$el.hide();
            }
        },

        render: function () {
            this.$el.html('');
            this.$el.append(this.children.connectionHost.render().el);
            this.$el.append(this.children.host.render().el);
            if (!_.isEmpty(this.model.getValue('connection_host'))) {
                this.children.host.$el.hide();
            }
            this.$el.append(this.children.source.render().el);
            this.$el.append(this.children.index.render().el);
            this.$el.append(this.children.sourcetype.render().el);
            return this;
        }
    });
});
