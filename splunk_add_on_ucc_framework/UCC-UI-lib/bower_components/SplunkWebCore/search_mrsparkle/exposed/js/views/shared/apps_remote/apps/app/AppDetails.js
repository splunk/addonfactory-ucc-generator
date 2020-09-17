define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'util/moment',
        'util/general_utils'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        moment,
        utils
        ){

        var LABEL_LOOKUP = {
            'categories': 'category',
            'contents': 'app_content'
        };

        return BaseView.extend({
            moduleId: module.id,
            className: 'app-details',
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },

            events: {
                'click .author': function(e) {
                    var author = $(e.currentTarget).data('author');
                    if (author) {
                        this.model.metadata.set('created_by', author);
                    }
                },

                'click .categories': function(e) {
                    var category = $(e.currentTarget).data('categories');
                    var categories = utils.asArray(this.model.metadata.get('category'));
                    if (category && categories.indexOf(category) === -1) {
                        categories = categories.slice(0);
                        categories.push(category);
                        this.model.metadata.set('category', categories);
                    }
                },

                'click .content': function(e) {
                    var content = $(e.currentTarget).data('content');
                    var contents = utils.asArray(this.model.metadata.get('content'));
                    if (content && contents.indexOf(content) === -1) {
                        contents = contents.slice(0);
                        contents.push(content);
                        this.model.metadata.set('content', contents);
                    }
                }
            },

            findLabel: function (group, value) {
                var model = _.find(this.collection.options.models, function(model) {
                    return model.get('key') === LABEL_LOOKUP[group] || model.get('key') === group;
                });
                var item = _.find(model && model.get('options'), function(item) {
                    return item.value === value;
                });

                return item ? item.label : "";
            },

            renderList: function (selector, attribute, label) {
                var $placeholder = this.$(selector);
                $placeholder.html(label + ':&nbsp');
                var categories = this.model.appRemote.get(attribute) || [];
                for ( var i = 0; i < categories.length; i++ ) {
                    $placeholder.append($('<a class="' + attribute + '" "href="#"></a>').data(attribute, categories[i]).text(this.findLabel(attribute, categories[i])));
                    if (i !== categories.length - 1) {
                        $placeholder.append(',&nbsp;');
                    } else {
                        $placeholder.append('&nbsp;');
                    }
                }
                $placeholder.append('&nbsp;|&nbsp;');
            },


            render: function () {
                var created_time = this.model.appRemote.get('created_time');
                var updated_time = this.model.appRemote.get('updated_time');
                updated_time = moment(updated_time).fromNow();
                created_time = moment(created_time).fromNow();
                var template = this.compiledTemplate({
                    model: this.model.appRemote,
                    created_time: created_time,
                    updated_time: updated_time,
                    _: _
                });
                this.$el.html(template);
                if(this.model.appRemote.get('categories')) {
                    this.renderList('span[title~=Category]', 'categories', 'Category');
                }
                if(this.model.appRemote.get('content')) {
                    this.renderList('span[title~=Content]', 'content', 'Content');
                }
                return this;
            },

            template:
                       '<span class="app-detail" title="Category"><span class="categories-placeholder"></span></span>' +
                        '<span class="app-detail" title="Content"><span class="content-placeholder"></span></span>' +
                        '<span class="app-detail" title="Author"><%- _("Author").t() %>:&nbsp; <a class="author" data-author="<%- model.get("created_by").username %>"><%- model.get("created_by").display_name %></a>&nbsp;|&nbsp;</span>' +
                        '<span class="app-detail" title="Downloads"><%- _("Downloads").t() %>:&nbsp;<%- model.get("download_count") %>&nbsp;|&nbsp;</span>' +
                        '<span class="app-detail" title="Released"><%- _("Released").t() %>:&nbsp<%- created_time %>&nbsp;|&nbsp;</span>' +
                        '<span class="app-detail" title="Last update"><%- _("Last Updated").t() %>:&nbsp; <%- updated_time %> &nbsp;|&nbsp;</span>' +
                        '<span class="app-detail" title="Website"><a href="https://apps.splunk.com/app/<%- model.get("uid") %>" target="_blank"><%- _("View on Splunkbase").t() %></a></span>'
        });
    });
