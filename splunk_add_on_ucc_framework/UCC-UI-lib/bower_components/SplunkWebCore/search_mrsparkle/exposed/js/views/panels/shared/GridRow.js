/**
 * @author ahebert
 * @date 3/15/15
 *
 * GridRow for the prebuilt panels manager page
 */
define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'views/Base',
        'views/shared/basemanager/SharingCell',
        'views/shared/basemanager/StatusCell',
        'contrib/text!views/panels/shared/GridRow.html'
    ],
    function (
        $,
        _,
        Backbone,
        module,
        BaseView,
        SharingCellView,
        StatusCellView,
        GridRowTemplate
    ) {
        return BaseView.extend({
            moduleId: module.id,
            tagName: "tr",
            className: "list-item",
            template: GridRowTemplate,

            events: {
                'click .entity-edit-action': function(e) {
                    this.model.controller.trigger("editEntity", this.model.entity);
                    e.preventDefault();
                }
            },

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.template = this.options.template;
                this.canUseApps = this.model.user.canUseApps();

                this.children.actionCell = new this.options.customViews.ActionCell({
                    collection: this.collection,
                    entitySingular: this.options.entitySingular,
                    model: this.model
                });

                this.children.sharingCell = new SharingCellView({
                    model: this.model
                });

                if (this.options.grid.showStatusColumn) {
                    this.children.statusCell = new StatusCellView({
                        collection: this.collection,
                        model: this.model
                    });
                }
            },

            render: function() {
                var html = this.compiledTemplate({
                        canEdit: this.model.entity.entry.links.has("edit"),
                        canUseApps: this.canUseApps,
                        name: this.model.entity.entry.get('name') || "",
                        app: this.model.entity.entry.acl.get('app') || "",
                        owner: "nobody" === this.model.entity.entry.acl.get("owner") ?
                            _('No owner').t() : this.model.entity.entry.acl.get("owner") || ""
                    }
                );

                this.$el.html(html);
                this.children.actionCell.render().appendTo(this.$(".action-cell-placeholder"));
                this.children.sharingCell.render().appendTo(this.$(".sharing-cell-placeholder"));
                if (this.children.statusCell) {
                    this.children.statusCell.render().appendTo(this.$(".status-cell-placeholder"));
                }

                return this;
            }
        },
        {
            columns: [
                {
                    id: 'name',
                    title: _('Name').t()
                },
                {
                    id: 'owner',
                    title: _('Owner').t()
                },
                {
                    id: 'app',
                    title: _('App').t(),
                    visible: function() {
                        return this.canUseApps;
                    }
                }
            ]
        });
    });
