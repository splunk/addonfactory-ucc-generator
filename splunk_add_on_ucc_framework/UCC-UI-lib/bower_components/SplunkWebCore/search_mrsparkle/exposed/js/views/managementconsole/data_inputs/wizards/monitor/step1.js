// displays general & advanced monitor inputs
// @author: nmistry
define([
    'underscore',
    'jquery',
    'backbone',
    'module',
    'views/Base',
    'views/shared/controls/ControlGroup',
    'views/managementconsole/shared/Accordion'
], function (
    _,
    $,
    backbone,
    module,
    BaseView,
    ControlGroup,
    Accordion
) {
    var strings = {
        ADVANCED: _('Advanced').t()
    };

    return BaseView.extend({
        moduleId: module.id,
        tagName: 'div',
        className: 'modal-step form-horizontal',

        initialize: function () {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.filepath = new ControlGroup({
                className: 'file-path control-group',
                controlType: 'Text',
                controlOptions: {
                    model: this.model.entry,
                    modelAttribute: 'name'
                },
                label: this.model.getLabel('name'),
                enabled: this.model.isNew(),
                tooltip: this.model.getTooltip('name'),
                help: this.model.getHelpText('name')
            });

            this.children.whitelist = new ControlGroup({
                className: 'whitelist control-group',
                controlType: 'Text',
                controlOptions: {
                    model: this.model.entry.content,
                    modelAttribute: 'whitelist',
                    placeholder: this.model.getPlaceholder('whitelist')
                },
                label: this.model.getLabel('whitelist'),
                tooltip: this.model.getTooltip('whitelist')
            });

            this.children.blacklist = new ControlGroup({
                className: 'blacklist control-group',
                controlType: 'Text',
                controlOptions: {
                    model: this.model.entry.content,
                    modelAttribute: 'blacklist',
                    placeholder: this.model.getPlaceholder('blacklist')
                },
                label: this.model.getLabel('blacklist'),
                tooltip: this.model.getTooltip('blacklist')
            });

            this.children.advancedView = new Accordion({
                heading: strings.ADVANCED,
                initialState: Accordion.DETAILS_COLLAPSED
            });

            this.children.recursive = new ControlGroup({
                className: 'recursive control-group',
                controlType: 'SyntheticCheckbox',
                controlOptions: {
                    model: this.model.entry.content,
                    modelAttribute: 'recursive'
                },
                label: this.model.getLabel('recursive'),
                tooltip: this.model.getTooltip('recursive')
            });

            this.children.ignoreOlder = new ControlGroup({
                className: 'ignoreOlder control-group',
                controlType: 'Text',
                controlOptions: {
                    model: this.model.entry.content,
                    modelAttribute: 'ignoreOlderThan',
                    placeholder: _('optional').t()
                },
                label: this.model.getLabel('ignoreOlderThan'),
                tooltip: this.model.getTooltip('ignoreOlderThan'),
                help: this.model.getHelpText('ignoreOlderThan')
            });

            this.children.crcsalt = new ControlGroup({
                className: 'crcsalt control-group',
                controlType: 'Text',
                controlOptions: {
                    model: this.model.entry.content,
                    modelAttribute: 'crcSalt',
                    placeholder: _('optional').t()
                },
                label: this.model.getLabel('crcSalt'),
                tooltip: this.model.getTooltip('crcSalt'),
                help: this.model.getHelpText('crcSalt')
            });

            this.children.crclength = new ControlGroup({
                className: 'crclength control-group',
                controlType: 'Text',
                controlOptions: {
                    model: this.model.entry.content,
                    modelAttribute: 'initCrcLength',
                    placeholder: _('optional').t()
                },
                label: this.model.getLabel('initCrcLength'),
                tooltip: this.model.getTooltip('initCrcLength')
            });
        },

        render: function () {
            this.$el.html(_.template(this.template, {strings: strings}));
            this.$('.advanced-section').append(this.children.advancedView.render().el);

            var general = this.$('.general-section');
            var advanced = this.$(Accordion.ACCORDION_BODY_SELECTOR);

            general.append(this.children.filepath.render().el);
            general.append(this.children.whitelist.render().el);
            general.append(this.children.blacklist.render().el);

            advanced.append(this.children.recursive.render().el);
            advanced.append(this.children.ignoreOlder.render().el);
            advanced.append(this.children.crcsalt.render().el);
            advanced.append(this.children.crclength.render().el);

            advanced.hide();
            advanced.data('hidden', true);
            return this;
        },

        template: ''+
        '<div class="general-section"></div>' +
        '<div class="advanced-section"></div>'
    });
});
