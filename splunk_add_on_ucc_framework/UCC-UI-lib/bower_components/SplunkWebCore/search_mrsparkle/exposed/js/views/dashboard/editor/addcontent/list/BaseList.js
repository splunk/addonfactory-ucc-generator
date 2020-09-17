define(
    [
        'jquery',
        'underscore',
        'views/Base',
        'util/keyboard'
    ],
    function($,
             _,
             BaseView,
             KeyboardUtil) {
        return BaseView.extend({
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.id = options.id || _.uniqueId('list_');
                this.model = _.extend({}, this.model);
                this.collection = options.collection || {};
                this.title = options.title;
                this.listenTo(this.collection, 'reset', this._renderContent);
                this.loadingMore = false;
            },
            events: {
                'click .show-more': "_showMore",
                'keydown .show-more': function(e) {
                    if (e.keyCode === KeyboardUtil.KEYS['ENTER']) {
                        this._showMore();
                    }
                }
            },
            _showMore: function() {
                this.loadingMore = true;
                this.collection.fetchData.set('count', this.collection.fetchData.get('count') + this.collection.original_count);
                this.$el.find('.show-more').text(_('loading...').t());
            },
            render: function() {
                var html = $(_.template(this.template, {
                    id: this.id,
                    title: this.title
                }));
                this.$el.html(html);
                this.$container = this.$el.find('.accordion-inner ul');
                this._renderContent();
                return this;
            },
            expand: function() {
                this.$el.find('.collapse').first().addClass('in').css('height', 'auto');
                this.$el.find('.accordion-toggle').first().removeClass('collapsed');
            },
            collapse: function() {
                this.$el.find('.collapse').first().removeClass('in').css('height', '0px');
                this.$el.find('.accordion-toggle').first().addClass('collapsed');
            },
            _renderContent: function() {
                this.$container.empty();
                this._removeChildren();
                this.collection.each(function(entryModel) {
                    var entry = this._createEntryView(entryModel);
                    this.$container.append(entry.render().$el);
                    this.listenTo(entry, 'all', this.trigger);
                    this.children[entry.id] = entry;
                }, this);
                this._updateState();
                if (this.collection.fetchData) {
                    if (this.collection.length >= this.collection.fetchData.get('count')) {
                        this.$('.accordion-inner ul').first().append($('<li class="panel-content"><a class="show-more" href="#">' + _('Show More').t() + '</a></li>'));
                    }
                    this.loadingMore = false;
                }
            },
            _getItemsCount: function() {
                return this.collection.paging.get('total');
            },
            _updateState: function() {
                // update count
                this._updateCount();
                this._updateExpandState();
            },
            _updateCount: function() {
                var count = this._getItemsCount();
                this.$count && (this.$count.remove());
                this.$count = $('<span class="total"/>').text(' (' + count + ')').appendTo(this.$el.find('.accordion-toggle').first());
            },
            _updateExpandState: function() {
                if (this.loadingMore) {
                    return;
                }
                // remove data-toggle attribute to prevent inconsistent state
                if (this._getItemsCount() == 0) {
                    this.$el.find('.accordion-toggle').first().removeAttr('data-toggle');
                    this.collapse();
                    return;
                }
                else {
                    this.$el.find('.accordion-toggle').first().attr('data-toggle', 'collapse');
                }

                // update state
                if (this.model.sidebarState.has('filter') && this.model.sidebarState.get('filter') != "") {
                    this.expand();
                }
                else {
                    this.collapse();
                }
            },
            _removeChildren: function() {
                _.each(this.children, function(child) {
                    this.stopListening(child);
                    child.remove();
                }, this);
            },
            _createEntryView: function(entryModel) {
                // implement by sub modules
            },
            template: '\
             <div class="accordion-group">\
                <div class="accordion-heading">\
                    <a class="accordion-toggle" data-toggle="collapse" href="#<%- id %>">\
                        <%- title %>\
                    </a>\
                </div>\
                <div class="collapse" id="<%- id %>">\
                    <div class="accordion-inner">\
                        <ul></ul>\
                    </div>\
                </div>\
            </div>\
            '
        });
    });