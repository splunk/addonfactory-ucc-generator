define(function(require, exports, module) {

    var $ = require("jquery");
    var _ = require("underscore");
    var RowIterator = require("helpers/grid/RowIterator");
    var BaseView = require("views/Base");
    var Row = require("views/authentication_users/table/Row");
    var TableHead = require("views/shared/TableHead");

    var template = require("contrib/text!views/authentication_users/table/Table.html");

    return BaseView.extend({

        moduleId: module.id,
        template: template,
        rows: [],

        events: {
            "click .model-title": function(e){
                e.preventDefault();
                var target = $(e.target);
                var id = target.closest("tr").data("row-expand-collapse-id");
                this.model.eventModel.trigger("edit", id);
            }
        },

        initialize: function(options) {
            BaseView.prototype.initialize.call(this, options);

            this.collection.users.on("reset add remove", this.debouncedRender, this);

            this.children.head = new TableHead({
                model: this.model.metadataModel,
                columns: [
                    { label: _("Username").t(), className: "col-username", sortKey: "name" },
                    { label: _("Authentication system").t(), className: "col-auth", sortKey: "type" },
                    { label: _("Full name").t(), className: "col-fullname", sortKey: "realname" },
                    { label: _("Email address").t(), className: "col-email", sortKey: "email" },
                    { label: _("Time zone").t(), className: "col-timezone", sortKey: "tz" },
                    { label: _("Default app").t(), className: "col-app", sortKey: "defaultApp" },
                    { label: _("Default app inherited from").t(), className: "col-inherited", sortKey: "defaultAppSourceRole" },
                    { label: _("Roles").t(), className: "col-roles", sortKey: "roles" },
                    { label: _("Actions").t(), className: "col-actions" }
                ]
            });
        },

        render: function() {
            _(this.rows).each(function(row) {
                row.off();
                row.detach();
            }, this);

            var $html = $(this.compiledTemplate({}));

            this.rows = [];

            var rowIterator = new RowIterator();
            rowIterator.eachRow(this.collection.users, function(model, index, rowNumber, isExpanded) {
                var models = $.extend({}, this.model, { rowModel: model });

                var rowView = new Row({
                    model: models,
                    isExpanded: isExpanded,
                    index: index,
                    rowNumber: rowNumber
                });

                rowView.on("all", function() {
                    this.trigger.apply(this, arguments);
                }, this);

                this.rows.push(rowView);

                $html.find(".item-table-body").append(rowView.render().el);
            }, this);

            $html.find(".item-table-head-placeholder").replaceWith(this.children.head.render().el);
            this.$el.html($html);

            return this;
        }

    });

});
