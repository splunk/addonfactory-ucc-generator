define(
    [
        'underscore',
        'module',
        'models/datasets/commands/InitialData',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'contrib/text!./IndexesAndSourcetypesSVG.html',
        'contrib/text!./DatasetSVG.html',
        'contrib/text!./SearchSVG.html'
    ],
    function(
        _,
        module,
        InitialDataCommand,
        BaseView,
        ControlGroup,
        IndexesAndSourcetypesSVG,
        DatasetSVG,
        SearchSVG
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'method-picker',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.initialDataTabs = new ControlGroup({
                    controlType: 'SyntheticRadio',
                    additionalClassNames: ['method-options'],
                    controlOptions: {
                        model: this.model.command,
                        modelAttribute: 'selectedMethod',
                        showAsButtonGroup: false,
                        linkClassName: 'method-option',
                        items: [
                            {
                                svg: IndexesAndSourcetypesSVG,
                                label: _('Indexes & Source Types').t(),
                                value: InitialDataCommand.METHODS.INDEXES_AND_SOURCETYPES
                            },
                            {
                                svg: DatasetSVG,
                                label: _('Existing Datasets').t(),
                                value: InitialDataCommand.METHODS.DATASET
                            },
                            {
                                svg: SearchSVG,
                                label: _('Search (Advanced)').t(),
                                value: InitialDataCommand.METHODS.SEARCH
                            }
                        ]
                    }
                });
            },

            render: function() {
                if (!this.$el.html()) {
                    this.$el.html(this.compiledTemplate({
                        _: _
                    }));
                    this.children.initialDataTabs.activate({ deep: true }).render().appendTo(this.$el);
                }

                return this;
            },

            template: '\
                <div class="select-method">\
                    <h3>\
                        <%- _("Select one:").t() %>\
                    </h3>\
                </div>\
            '
        });
    }
);
