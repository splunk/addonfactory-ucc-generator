define(
    [
        'underscore',
        'module',
        'views/Base',
        'views/shared/controls/ControlGroup',
        'views/shared/controls/TextControl',
        'views/shared/delegates/Dock'
    ],
    function(
        _,
        module,
        BaseView,
        ControlGroup,
        TextControl,
		Dock
    ){ 
    return BaseView.extend({
        moduleId: module.id,
        className: 'pull-left form',
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.hideDock = this.options.hideDock;

            this.children.textFilter = new TextControl({
                model: this.model.metadata,
                modelAttribute: "query",
                inputClassName: 'search-query',
                placeholder: _("Find apps by keyword, technology...").t(),
				canClear: true
            });
			
            this.collection.options.on('sync', this.onOptionsSync, this);

            this.children.authorFilter = new TextControl({
                model: this.model.metadata,
                modelAttribute: "created_by",
                inputClassName: 'input-small search-query',
                placeholder: _("author").t(),
                canClear: true
            });

            this.model.metadata.on('change:created_by', function() {
                this.render();
            }, this);
        },

        // Overridden in subclasses
        onOptionsSync: function() {
            this.populateFilters();
        },

        populateFilters: function(options) {
            options = _.defaults({ skipRender: false}, options);

            _.each(this.children, function(child, key) {
                if( key.indexOf('filter') !== -1) {
                    child.remove();
                }
            });
            for (var i = 0; i < this.collection.options.length; i++) {
                this.children['filter_' + i] = new ControlGroup({
                    label: _(this.collection.options.models[i].get('label')).t(),
                    controlType: 'CheckboxGroup',
                    controlOptions: {
                        model: this.model.metadata,
                        modelAttribute: this.collection.options.models[i].get('key'),
                        items: this.collection.options.models[i].get('options')
                    }
                });
            }

            if (!options.skipRender) {
                this.render();
            }
        },
		
		events: {
			"click .tag-author": function(e) {
				e.preventDefault();
				this.model.metadata.unset('created_by');
			}
		},

        render: function() {
            _.each(this.children, function(child) {
                child.$el.detach();
            });
            this.$el.html(this.compiledTemplate({
					author: this.model.metadata.get('created_by'),
                    _: _
				}));
            this.children.textFilter.render().appendTo(this.$('.text-filter-control'));
            for (var i = 0; i < this.collection.options.length; i++) {
                this.children['filter_' + i].render().appendTo(this.$el);
            }

            if (!this.hideDock) {
                this.children.tableDock = new Dock({
                    el: this.$('.text-filter-control-wrapper')[0],
                    affix: '.text-filter-control'
                });
            }
            return this;
        },
        template: ' \
            <div class="text-filter-control-wrapper">\
                <div class="text-filter-control"> \
                </div> \
            </div>\
			<% if (author) { %>\
				<div class="control-group"> \
					<label class="control-label"><%- _("Author").t() %></label> \
					<div class="controls "> \
					<a href="" class="tag tag-author"><%- author %> <i class="icon-x"></i></a> \
					</div> \
				</div> \
			<% } %>'
    });
});
        
