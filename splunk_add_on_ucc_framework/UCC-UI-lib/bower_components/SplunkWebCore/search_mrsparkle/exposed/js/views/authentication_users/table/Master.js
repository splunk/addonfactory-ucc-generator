define(function(require, exports, module) {

    var $ = require("jquery");
    var _ = require("underscore");
    var SplunkUtil = require("splunk.util");
    var BaseView = require("views/Base");
    var Table = require("views/authentication_users/table/Table");
    var CollectionPaginator = require("views/shared/CollectionPaginator");
    var LabelControl = require("views/shared/controls/LabelControl");
    var TextControl = require("views/shared/controls/TextControl");

    var template = require("contrib/text!views/authentication_users/table/Master.html");

    return BaseView.extend({

        moduleId: module.id,
        template: template,

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.filter = new TextControl({
                model: this.model.metadataModel,
                modelAttribute: "nameFilter",
                inputClassName: "search-query",
                placeholder: _("filter").t(),
                updateOnKeyUp: true
            });

            this.children.pageLabel = new LabelControl({
                additionalClassNames: "page-label"
            });

            this.children.paginator = new CollectionPaginator({
                model: this.model.metadataModel,
                collection: this.collection.users
            });

            this.children.table = new Table({
                model: this.model,
                collection: this.collection
            });

            this.collection.users.on("reset add remove", this.updatePageLabel, this);
        },

        render: function() {
            if (!this.el.innerHTML) {
                var application = this.model.application;
                var app = application.get("app");
                var newURL = SplunkUtil.make_url("manager/" + app + "/authentication/users/_new?action=edit");
                var html = this.compiledTemplate({
                    _: _,
                    newURL: newURL
                });
                this.$el.html(html);
            }

            this.updatePageLabel();

            this.children.filter.render().appendTo(this.$(".toolbar-right"));
            this.children.pageLabel.render().appendTo(this.$(".toolbar-right"));
            this.children.paginator.render().appendTo(this.$(".toolbar-right"));
            this.children.table.render().appendTo(this.$el);

            return this;
        },

        updatePageLabel: function() {
            var text = "";

            var paging = this.collection.users.paging;
            var total = paging.get("total");
            if (total > 1) {
                var offset = paging.get("offset");
                var perPage = paging.get("perPage");
                var start = offset + 1;
                var end = Math.min(offset + perPage, total);
                text = SplunkUtil.sprintf(_("Showing %d-%d of %d items").t(), start, end, total);
            } else if (total > 0) {
                text = _("Showing 1 of 1 item").t();
            }

            this.children.pageLabel.setValue(text);
        }

    });

});
