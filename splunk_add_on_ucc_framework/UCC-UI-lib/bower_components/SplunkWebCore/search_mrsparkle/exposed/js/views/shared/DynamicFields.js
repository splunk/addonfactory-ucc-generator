/**
 * Dynamic fields control allows adding and removing custom fields to a model.
 *
 * @param {Object} options
 */

define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'contrib/text!views/shared/DynamicField.html',
        'contrib/text!views/shared/DynamicFields.html',
        'util/console'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        SubTemplate,
        Template,
        console
        )
    {

        return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                var defaults = {
                    items: [['','']],
                    newItemLink: _('New setting').t(),
                    prefix: null,
                    silent: false
                };
                _.defaults(this.options, defaults);

                //templates
                this.templates = {};
                this.templates.templateField = _.template(SubTemplate);
                this.templates.templateFields = _.template(Template);

                // render model attributes that begin with the prefix and are not in exclude list
                this.model.on('change reset', this.render, this);
            },
            events: {
                'click .newItemLink': function(e) {
                    e.preventDefault();
                    if (this.$('.template:hidden').length == 1) {
                        this.$('.elements').show();
                        return;
                    }
                    var template = $(this.templates.templateField({
                        name: '',
                        value: ''
                    }));
                    template.show();
                    template.insertAfter(this.$('.template').last());
                },
                'click .close-row': "onCloseRow",
                'keypress .close-row': function(e) {
                	if (e.keyCode === 13) //ENTER
             			this.onCloseRow(e);
                },
                'change input#value': function(e) {
                    var $input = $(e.target),
                        key = $input.closest('tr').find('input#key').val(),
                        value = $input.val();
                    if (key) {
                        if (this.options.prefix && key.indexOf(this.options.prefix)!==0) {
                            key = this.options.prefix + key;
                        }
                        this.model.set(key, value, {silent: this.options.silent});
                    }
                }
            },
            getModelAttributes: function() {
                // TODO implement this
                console.log(this.$('input#key').val());
            },
            render: function() {
                var that = this,
                    items = [];
                _(this.model.attributes).each(function(val,key) {
                    if (that.options.prefix && key.indexOf(that.options.prefix) !== 0) {
                        return;
                    }
                    if (that.options.hideEmpty && (typeof val === 'string' && !val.length)) {
                        return;
                    }
                    if (!_.contains(that.options.exclude, key)) {
                        items.push([key, val]);
                    }
                });
                if (items.length == 0) {
                    items.push(['', '']);
                }

                var html = this.templates.templateFields({
                    newItemLink: this.options.newItemLink
                });
                this.removeChildren();
                this.$el.html(html);

                _(items).each(function(object, i) {
                    var field = $(that.templates.templateField({
                        name: object[0],
                        value: object[1]
                    }));
                    this.$('.templates').append(field);
                });

                if (this.options.items.length > 0) {
                    this.$('.elements').show();
                    this.$('.template').show();
                }
                return this;
            },
            onCloseRow: function(e) {
                var $target = $(e.target),
                    key = $target.closest('tr').find('input#key').val();
                e.preventDefault();
                this.model.set(key, '', {silent: this.options.silent});
                if (this.$('.template').length == 1) {
                    this.$('.elements').hide();
                    this.$('.template').find('input').val('');
                    return;
                }
                $(e.target).closest('tr').remove();
            }
        });
    });
