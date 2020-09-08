/**
 * Created by rtran on 2/23/16.
 */
define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'uri/route',
        'views/shared/apps_remote/Master',
        '../../../AddApp.pcss'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        route,
        AppBrowser,
        css
){
        return AppBrowser.extend({
            moduleId: module.id,

            initialize: function () {
                AppBrowser.prototype.initialize.apply(this, arguments);

                this.model.wizard.on('change:hideFilter', function(model, hideFilter) {
                    if (hideFilter) {
                        this._hideFilterBar();
                    } else {
                        this._showFilterBar();
                    }
                }, this);
            },

            _showFilterBar: function() {
                this.$('.shared-waitspinner').removeClass('no-left-margin');
                this.$('.app-browser-filterbar').show();
            },

            _hideFilterBar: function() {
                this.$('.shared-waitspinner').addClass('no-left-margin');
                this.$('.app-browser-filterbar').hide();
            },

            render: function () {
                this.$el.html(this.compiledTemplate());
                if(this.collection.appsRemote.error.get('status')) {
                    this._handleErrors();
                    this.$('.app-browser-filterbar').hide();
                    this.model.wizard.trigger('browseAppError');
                } else { // no errors so render initial state
                    this.$('.alert-error').hide();
                    this.children.filterBar.render().appendTo(this.$('.app-browser-filterbar'));
                    this.children.resultsPane.render().appendTo(this.$('.results-body'));
                    this._hideFilterBar();
                }

                return this;
            },

            template: ' \
                <div class="side-container app-browser-filterbar"> \
                </div> \
				<div class="main-container app-results-container"> \
				    <div class="content-header browse-app-header"> \
                        <h3 class="content-title"><%- _("Browse App").t() %></h3> \
                    </div> \
                    <div class="results-body"> \
                        <div class="alert alert-error"></div> \
                    </div> \
				</div> \
            '
        });
    });