define(function(require, exports, module) {
    var $ = require('jquery');
    var _ = require('underscore');
    var Backbone = require('backbone');
    var BaseSplunkView = require('./basesplunkview');
    var HeaderView = require('./headerview');
    var FooterView = require('./footerview');
    var template = require('contrib/text!./layoutview.html');
    var splunkUtil = require('splunk.util');
    var sharedmodels = require('./sharedmodels');

    /**
     * Manages the chrome and layout of a page.
     */

    /**
     * @constructor
     * @memberOf splunkjs.mvc
     * @name LayoutView
     * @description The **Layout** view manages the chrome and layout of a page:<br>
     * - The Splunk bar at the very top of the page provides a link to the Splunk Enterprise home page, 
     * a list of apps, and menu options for Splunk Enterprise.
     * - The app bar provides links to the app-specific features and views.
     * - The footer lists Splunk Enterprise links and a copyright notice.
     * @extends splunkjs.mvc.BaseSplunkView
     *
     * @param {Object} options
     * @param {String} options.id - The unique ID for this control.
     * @param {Boolean} [options.hideAppBar = false] - Hides the app bar.
     * @param {Boolean} [options.hideAppsList = false] - Hides the app list in
     * the Splunk bar.
     * @param {Boolean} [options.hideChrome = false] - Renders only the main content, hiding
     * the app bar, Splunk bar, and footer.
     * @param {Boolean} [options.hideFooter = false] - Hides the footer.
     * @param {Boolean} [options.hideSplunkBar = false] - Hides the Splunk bar.
     * @param {String} [options.layout = "scrolling"] - The type of page layout
     * (`fixed | scrolling`).
     *
    */
    var Layout = BaseSplunkView.extend(/** @lends splunkjs.mvc.LayoutView.prototype */{
        moduleId: module.id,
        el: 'body',
        options: {
            hideChrome: false,
            hideAppBar: false,
            hideSplunkBar: false,
            hideFooter: false,
            hideAppsList: false,
            layout: 'scrolling'
        },
        initialize: function(options) {
            this.configure();
            BaseSplunkView.prototype.initialize.apply(this, arguments);
            this.$el.removeAttr('class').removeAttr('id');
        },
        getContainerElement: function() {
            if (this._$main) {
                return this._$main[0];
            } else {
                throw new Error('Layout must be rendered before container can be accessed');
            }
        },
        /**
         * Draws the view to the screen. Called only when you create the view manually.
         */
        render: function() {
            var compiledTemplate = _.template(this.template);
            this.$el.append(compiledTemplate({
                _: _,
                make_url: splunkUtil.make_url
            }));
            this._$main = $('<div role="main">');
            this.$('#navSkip').after(this._$main);
            this._applyLayoutStyles();
            var $header = this.$('header');
            if (!this.options.hideChrome) {
                this._headerView = new HeaderView({
                    id: 'header',
                    el: $header,
                    splunkbar: !this.options.hideSplunkBar,
                    appbar: !this.options.hideAppBar,
                    showAppsList: !this.options.hideAppsList
                }).render();
                $header.removeAttr('class').removeAttr('id');
                
                if (!this.options.hideFooter) {
                    var $footer = this.$('footer');
                    this._footerView = new FooterView({
                        id: 'footer',
                        el: $footer
                    }).render();
                    $footer.removeAttr('class').removeAttr('id');
                }
            }
            return this;
        },
        remove: function() {
            this._$main = null;
            this._headerView.remove();
            this._footerView.remove();
            return BaseSplunkView.prototype.remove.apply(this, arguments);
        },
        setElement: function() {
            // Overriding the BaseSplunkView implementation to avoid the extra
            // hooks added to the DOM.
            return Backbone.View.prototype.setElement.apply(this, arguments);
        },
        _applyLayoutStyles: function() {
            this.$el.css({
                margin: 0
            });
            if (this.options.layout === 'fixed') {
                this._$main.css({
                    flex: '1 0 0',
                    position: 'relative'
                });
                this.$el.css({
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    overflow: 'hidden'
                });
                this.$el.find('header, footer').css({
                    flex: '0 0 auto'
                });
            } else {
                this._$main.css({
                    position: 'relative',
                    minHeight: '500px'
                });
            }
        },
        template: template
    });

    return Layout;
});
