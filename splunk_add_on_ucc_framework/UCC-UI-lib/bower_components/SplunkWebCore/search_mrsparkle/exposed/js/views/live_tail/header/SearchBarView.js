define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'views/shared/Icon'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        IconView
        ){
        return BaseView.extend({
            moduleId: module.id,
            initialize: function(options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.children.splunk = new IconView({icon: 'splunk'});
                this.children.prompt = new IconView({icon: 'greaterRegistered'});
                this.children.liteLogo = new IconView({icon: 'lite'});
            },

            events: {
                'keydown .search': function(e) {
                    var newSearchString;
                    if (e.keyCode === 13) {
                        e.preventDefault();
                        this.updateSearch();
                        return false;
                    }
                }
            },

            updateSearch: function(search) {
                var newSearchString = search || this.$('.search').val().trim();
                this.model.report.entry.content.set('search', newSearchString);
            },

            grepSearch: function(grepStr) {
                if (grepStr) {
                    var currentSearch = this.$('.search').val().trim(),
                        searchChunks = currentSearch.split('|'),
                        newSearchString;

                    searchChunks[0] = searchChunks[0] + ' AND ' + grepStr;
                    newSearchString = searchChunks.join('|');

                    this.updateSearch(newSearchString);
                }
            },

            render: function() {
                this.$el.html(this.compiledTemplate({
                    searchString: this.model.report.entry.content.get('search')
                }));

                this.children.splunk.render().prependTo(this.$('.brand'));
                this.children.prompt.render().prependTo(this.$('[data-role=gt]'));
                this.children.liteLogo.render().prependTo(this.$('.sub-brand'));

                return this;
            },

            template: '\
                <div class="livetail-search-container">\
                    <span class="lite-bar">\
                        <span class="brand pull-left"><span data-role="gt"></span> <span class="sub-brand"></span></span>\
                    </span>\
                    <form class="search-form">\
                        <input class="search" type="text" value="<%- searchString %>">\
                    </form>\
                </div>\
            '
        });
    }
);