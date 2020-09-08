define(
    [
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/managementconsole/shared/controls/TypeaheadTextControl',
        'bootstrap.tooltip'
    ],
    function(
        $,
        _,
        Backbone,
        module,
        BaseView,
        TypeaheadTextControl
    ) {
        var DEFAULT_PLACEHOLDER = ('<' + _('unrecognized key').t() + '>');

        return BaseView.extend({
            moduleId: module.id,
            className: 'attribute-list',
            placeholders: {},
            keyAutocomplete: [],

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.compiledAttrTemplate = _.template(this.attrTemplate);
                this.textControls = [];

                this.options.typeaheadWaitModel = this.options.typeaheadWaitModel || new Backbone.Model();
                this.options.typeaheadWaitModelAttribute = this.options.typeaheadWaitModelAttribute || 'canRender';

                if (!this.options.typeaheadWaitModel.has(this.options.typeaheadWaitModelAttribute)) {
                    this.options.typeaheadWaitModel.set(this.options.typeaheadWaitModelAttribute, true);
                }

                if (this._displayDefaults()) {
                    this.listenTo(this.options.defaultsModel, 'change:' + this.options.defaultsAttribute, this.debouncedRender);
                }

                this.setPlaceholders(this.options.placeholders, { skipRender: true });
                this.setKeyAutocomplete(this.options.keyAutocomplete, { skipRender: true });
            },

            events: {
                'click .add-new-attr': function(e) {
                    e.preventDefault();

                    this.renderAttrs('', '', null);
                },

                'click .delete-attr': function(e) {
                    this._deleteAttr(e);
                },

                'keypress .delete-attr': function(e) {
                    // keyCode 13 is ENTER
                    if (e.keycode === 13) {
                        this._deleteAttr(e);
                    }
                },

                'change input': function() {
                    this._updateList();
                },

                'click .revert-attr': function(e) {
                    var $tr = $(e.target).closest('tr'),
                        key = $tr.data('key');

                    e.preventDefault();

                    this.model.set(
                        this.options.modelAttribute,
                        _.reject(this.model.get(this.options.modelAttribute), function(item) {
                            return item[0] === key;
                        })
                    );
                }
            },

            render: function() {
                var attrsList = this.model.get(this.options.modelAttribute),
                    defaultsList = this._displayDefaults() ? this.options.defaultsModel.get(this.options.defaultsAttribute) : [],
                    merged = [],
                    $tbody = this.$('tbody.attrs'),
                    scrollTop = $tbody.length && $tbody.scrollTop(),
                    // These are the unique classnames (uniqe for particular row)
                    // that can be focused on. They are used to find the currently
                    // focused element so we can determine which to focus on after re-render
                    focusUniqueClassNames = [
                        'input-key',
                        'input-value',
                        'revert-attr',
                        'delete-attr'
                    ],
                    $focus = $tbody.find(
                        _.map(focusUniqueClassNames, function(className) {
                            return '.' + className + ':focus';
                        }).join(', ')
                    ),
                    hasFocus = $focus.get().length,
                    // This is how we determine what the next rendered class *will* be
                    // in order to focus later
                    $focusInputKey = hasFocus && $focus.closest('tr').find('.input-key'),
                    focusKey = $focusInputKey && $focusInputKey.get().length && $focusInputKey.val(),
                    focusClass = hasFocus && $focus.attr('class'),
                    $newFocus = null;

                // Render an empty row even if there are no attributes
                if (attrsList.length === 0 && defaultsList.length === 0) {
                    attrsList = [['', '']];
                }

                this.removeTextControls();

                this.$el.html(this.compiledTemplate({
                    displayDefaults: this._displayDefaults()
                }));

                merged = this.options.merger(defaultsList, attrsList);

                _.each(merged, function(attr) {
                    var key = attr[0],
                        values = attr[1];

                    this.renderAttrs(key, values.localValue, values.defaultValue);
                }, this);

                // Retain some state
                if (scrollTop) {
                    this.$('tbody.attrs').scrollTop(scrollTop);
                }
                if (focusKey) {
                    $newFocus = this.$('tbody.attrs ' + 
                        'tr[data-key="' + _.escape(focusKey) + '"] ' + 
                        '[class="' + _.escape(focusClass) + '"]'
                    );

                    // If it's an input, we need to focus to highlight all text
                    if ($newFocus.prop('tagName') === 'INPUT') {
                        $newFocus.select();
                    } 
                    // Otherwise we can simply focus
                    else {
                        $newFocus.focus();
                    }
                }

                // When there defaults are being displayed,
                // it's less clear what the meaing of the actions are.
                // But when we are not displaying defaults, the single
                // delete action is clear enough.
                if (this._displayDefaults()) {
                    this.$('.action-tooltip').tooltip({
                        placement: 'right'
                    });
                }

                return this;
            },

            renderAttrs: function(key, localValue, defaultValue) {
                var $attrRow = $(this.compiledAttrTemplate({
                        key: key,
                        localValue: localValue,
                        defaultValue: defaultValue,
                        displayDefaults: this._displayDefaults(),
                        placeholders: this.placeholders || {},
                        DEFAULT_PLACEHOLDER: DEFAULT_PLACEHOLDER
                    })),
                    $keyContainer = $attrRow.find('td.key'),
                    waitModel = new Backbone.Model({
                        canRender: false
                    }),
                    waitModelEvent = 'scroll',
                    keyModel = new Backbone.Model({
                        key: key
                    }),
                    textControl = new TypeaheadTextControl(
                        $.extend(
                            true,
                            {
                                inputClassName: 'input-key',
                                sources: this.getFinalSources(),
                                model: keyModel,
                                modelAttribute: 'key',
                                waitModel: waitModel,
                                waitModelAttribute: 'canRender',
                                waitModelEvent: waitModelEvent,
                                typeaheadView: {
                                    extraWidth: 12
                                },
                                clearOnEsc: false
                            },
                            this.options.typeaheadOptions
                        )
                    ),
                    that = this;
                
                this.textControls.push(textControl);

                this.$('.attrs').append($attrRow);
                this.$('.attrs').scroll(_.debounce(function() {
                    waitModel.trigger(waitModelEvent);
                }, 100));
                textControl.render().$el.appendTo($keyContainer);
                $keyContainer.data('textControl', textControl);

                this.updateWaitModel(waitModel);
                this.listenTo(this.options.typeaheadWaitModel, 'change:' + this.options.typeaheadWaitModelAttribute, this.updateWaitModel.bind(this, waitModel));
                this.listenTo(keyModel, 'change:key', this.updateKeyModel.bind(this, keyModel, $attrRow.find('td.value input')));
                if (this.options.typeaheadWaitModelEvent) {
                    this.listenTo(this.options.typeaheadWaitModel, this.options.typeaheadWaitModelEvent, this.triggerWaitModel.bind(this, waitModel, waitModelEvent));
                }
            },

            updateWaitModel: function(waitModel) {
                waitModel.set('canRender', this.options.typeaheadWaitModel.get(this.options.typeaheadWaitModelAttribute));
            },

            triggerWaitModel: function(waitModel, waitModelEvent) {
                waitModel.trigger(waitModelEvent);
            },

            updateKeyModel: function(keyModel, $input) {
                this.model.set(this.options.modelAttribute, this._collectAttrsList(), { silent: true });
                $input.attr('placeholder', this.placeholders[keyModel.get('key')] || DEFAULT_PLACEHOLDER);
            },

            getFinalSources: function() {
                return _.difference(this.keyAutocomplete, _.keys(_.object(this._collectAttrsList())));
            },

            setKeyAutocomplete: function(keyAutocomplete, opts) {
                this.keyAutocomplete = keyAutocomplete;

                if (!opts || !opts.skipRender) {
                    this.debouncedRender();
                }
            },

            setPlaceholders: function(placeholders, opts) {
                this.placeholders = placeholders;

                if (!opts || !opts.skipRender) {
                    this.debouncedRender();
                }
            },

            remove: function() {
                this.removeTextControls();
                return BaseView.prototype.remove.apply(this, arguments);
            },

            removeTextControls: function() {
                if (_.isArray(this.textControls)) {
                    _.each(this.textControls, function(textControl) {
                        textControl.remove();
                    });
                }
            },

            template: '\
                <table>\
                    <thead>\
                        <tr>\
                            <th class="key"> <%- _("Key").t() %> </th>\
                            <th class="value"> <%- _("Value").t() %> </th>\
                            <% if (displayDefaults) { %>\
                            <th class="default"><%- _("Default").t() %></th>\
                            <% } %>\
                            <th></th>\
                        </tr>\
                    </thead>\
                    <tbody class="attrs">\
                    </tbody>\
                </table>\
                <a href="#" class="add-new-attr"><i class="icon icon-plus-circle"></i> <%- _("Add New Attribute").t() %> </a>',

            attrTemplate: '\
                <tr class="attr" data-key="<%- key %>">\
                    <td class="key">\
                    </td>\
                    <td class="value">\
                        <input \
                            class="input-value" \
                            type="text" \
                            value="<%- localValue || defaultValue %>" \
                            <% if (key) { %> \
                            placeholder="<%- placeholders[key] || DEFAULT_PLACEHOLDER %>" \
                            <% } %> \
                        />\
                    </td>\
                    <% if (displayDefaults) { %>\
                    <td class="default">\
                        <% if (defaultValue !== null) { %> \
                        <input \
                            class="input-default" \
                            type="text" \
                            disabled="disabled" \
                            value="<%- defaultValue %>" \
                            title="<%- defaultValue %>" \
                        /> \
                        <% } %> \
                    </td>\
                    <% } %>\
                    <td class="actions">\
                        <% if (defaultValue === null) { %> \
                        <a href="#" class="btn-pill delete-attr action-tooltip" title="<%- _("Delete").t() %>">\
                            <i class="icon-x"></i>\
                        </a>\
                        <% } else if (localValue !== null) { %> \
                        <a href="#" class="btn-pill revert-attr action-tooltip" title="<%- _("Revert").t() %>">\
                            <i class="icon-rotate-counter"></i>\
                        </a>\
                        <% } %> \
                    </td>\
                </tr>',

            _deleteAttr: function(e) {
                e.preventDefault();
                var $row = $(e.target).closest('tr');
                $row.remove();
                this._updateList();
            },

            _updateList: function() {
                this.model.set(this.options.modelAttribute, this._collectAttrsList());
            },

            _collectAttrsList: function() {
                var attrsList = [],
                    $attrs = this.$el.find('.attr');

                // Clear out whitespace only rows - not valid
                $attrs = _.reject($attrs, function(attr) {
                    var keyTrimmed = $.trim(this._getKeyValueFromAttrRow($(attr))),
                        valueTrimmed = $.trim($(attr).find('input.input-value').val());

                    return keyTrimmed === '' && valueTrimmed === '';
                }, this);

                attrsList = _.map($attrs, function(attr) {
                    var result = [
                            // Key:
                            this._getKeyValueFromAttrRow($(attr)),
                            // Local Value
                            $(attr).find('input.input-value').val()
                        ],
                        $def = $(attr).find('input.input-default');

                    if ($def.get(0)) {
                        // Default Value
                        result.push($def.val());
                    }

                    return result;
                }, this);

                // Do not update attributes that are their defaults
                attrsList = _.filter(attrsList, function(attr) {
                    var defaultValue = attr[2],
                        localValue = attr[1];

                    return defaultValue !== localValue;
                });

                return _.map(attrsList, function(attr) {
                    return [attr[0], attr[1]];
                });
            },

            _getKeyValueFromAttrRow: function($row) {
                var textControl = $row.find('td.key').data('textControl');
                return textControl ? textControl.getValue() : '';
            },

            _displayDefaults: function() {
                return !!this.options.defaultsModel;
            }
        });
    }
);
