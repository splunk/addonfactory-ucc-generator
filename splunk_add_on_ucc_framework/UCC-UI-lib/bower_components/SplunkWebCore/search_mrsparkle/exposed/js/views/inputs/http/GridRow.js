/**
 * @author lbudchenko/jszeto
 * @date 2/9/14
 *
 * Represents a row in the table. The row contains links to perform
 * operations on the given index. The user can expand the row to see more details about the index
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'views/shared/controls/SyntheticCheckboxControl',
    'views/shared/delegates/RowExpandCollapse',
    'util/format_numbers_utils',
    'util/time',
    'splunk.util',
    'contrib/text!views/inputs/http/GridRow.html'
],
    function (
        $,
        _,
        Backbone,
        module,
        BaseView,
        SyntheticCheckboxControl,
        RowExpandCollapse,
        formatNumbersUtils,
        timeUtils,
        splunkUtils,
        template
        ) {

        return BaseView.extend({
            moduleId: module.id,
            tagName: "tr",
            className: "list-item",
            template: template,

            events: (function() {
                var events = {};
                events['click .cell-token'] = function(e) {
                    this.highlightToken(e.currentTarget);
                    e.preventDefault();
                };
                events['click .delete-action'] = function(e) {
                    this.model.controller.trigger("deleteEntity", this.model.entity);
                    e.preventDefault();
                };
                events['click .edit-action'] = function(e) {
                    this.model.controller.trigger("editEntity", this.model.entity);
                    e.preventDefault();
                };
                events['click .disable-action'] = function(e) {
                    this.model.entity.runAction('disable').done(function() {
                        this.model.controller.trigger('refreshEntities');
                    }.bind(this));
                    e.preventDefault();
                };
                events['click .enable-action'] = function(e) {
                    this.model.entity.runAction('enable').done(function() {
                        this.model.controller.trigger('refreshEntities');
                    }.bind(this));
                    e.preventDefault();
                };

                return events;
            })(),


            initialize: function (options) {
                BaseView.prototype.initialize.call(this, options);
            },

            highlightToken: function($cell) {
                var token = this.model.entity.entry.content.get('token'),
                    highlighted = _.template(this.highlightTemplate, {token: token});
                $($cell).html(highlighted);
                this.$('.token-highlight').focus().select();
                this.$('.token-highlight').blur(function() {
                    $($cell).text(token);
                });
            },

            controlActionsVisibility: function() {
                var canDelete = this.model.entity.entry.links.has("remove"),
                    canEdit = this.model.entity.entry.links.has("edit"),
                    canEnable = this.model.entity.entry.links.has("enable"),
                    canDisable = this.model.entity.entry.links.has("disable"),
                    globallyDisabled = this.model.settings.get('ui.disabled');

                if (!canDelete) {
                    this.$el.find('.delete-action').replaceWith(function() {
                        return $('<span>').addClass('disabled-action').append($(this).contents());
                    });
                }
                if (!canEdit) {
                    this.$el.find('.edit-action').replaceWith(function() {
                        return $('<span>').addClass('disabled-action').append($(this).contents());
                    });
                }
                if (!canEnable || globallyDisabled) {
                    this.$el.find('.enable-action').replaceWith(function() {
                        return $('<span>').addClass('disabled-action').append($(this).contents());
                    });
                }
                if (!canDisable || globallyDisabled) {
                    this.$el.find('.disable-action').replaceWith(function() {
                        return $('<span>').addClass('disabled-action').append($(this).contents());
                    });
                }
            },

            render: function () {
                var globallyDisabled = this.model.settings.get('ui.disabled');
                var html = this.compiledTemplate({
                    globallyDisabled: globallyDisabled,
                    name: this.model.entity.getPrettyName(),
                    isDisabled: this.model.entity.entry.content.get("disabled"),
                    token: this.model.entity.entry.content.get("token"),
                    sourcetype: this.model.entity.entry.content.get("sourcetype"),
                    index: this.model.entity.entry.content.get("index") || _('Default').t(),
                    description: this.model.entity.entry.content.get("description")
                });

                this.$el.html(html);

                this.controlActionsVisibility();

                return this;
            },

            highlightTemplate: '<input class="token-highlight" type="text" readonly="readonly" value="<%- token %>"/>'

        }, {
            columns: [
                {
                    id: 'name',
                    title: _('Name').t(),
                    sorts: true
                }, {
                    id: 'token',
                    title: _('Token Value').t(),
                    sorts: true
                }, {
                    id: 'sourcetype',
                    title: _('Source Type').t(),
                    sorts: true
                }, {
                    id: 'index',
                    title: _('Index').t(),
                    sorts: true
                }, {
                    id: 'disabled',
                    title: _('Status').t(),
                    sorts: true
                }
            ]
        });
    });

