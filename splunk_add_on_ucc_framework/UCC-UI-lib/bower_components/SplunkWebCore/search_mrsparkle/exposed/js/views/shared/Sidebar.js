define(function(require, exports, module) {
    var _ = require('underscore');
    var $ = require('jquery');
    var BaseView = require('views/Base');
    var keyboardUtil = require('util/keyboard');
    var css = require('./Sidebar.pcss');

    var SideBar = BaseView.extend({
        moduleId: module.id,
        className: 'side-bar-master',
        defaults: {
            modalize: true,
            direction: 'right'
        },
        initialize: function (options) {
            this.options = options = _.extend({},this.defaults, options);
            BaseView.prototype.initialize.apply(this, arguments);
            this.contents = [];
            $(window).on('keydown', this.keyDown.bind(this));
        },
        keyDown: function(evt) {
            var keyCode = evt.which;

            if (keyCode === keyboardUtil.KEYS.TAB) {
                if (this.$(":focus").length) {
                    keyboardUtil.handleCircularTabbing(this.contents[this.contents.length - 1], evt);
                }
                else {
                    this.contents[this.contents.length - 1].find('a').first().focus();
                    evt.preventDefault();
                }
            } else if (keyCode === keyboardUtil.KEYS.ESCAPE)  {
                this.popSidebar();
                evt.stopPropagation();
            }
        },
        events: {
            'click .background-cover': 'close',
            'click .accordion-toggle': 'checkShouldToggleAccordion'
        },
        render: function() {
            this.$el.html(this.compiledTemplate({options: this.options}));
            return this;
        },
        close: function(evt) {
            if (typeof evt.preventDefault == "function") {
                evt.preventDefault();
            }
            evt.data = 1;
            this.removeSidebars(evt);
        },
        checkShouldToggleAccordion: function(evt) {
            this.trigger('accordionToggleClicked', evt);
        },
        remove: function() {
            $(window).off('keydown');
            BaseView.prototype.remove.apply(this, arguments);
        },
        addSidebar: function($el) {
            if (!$el) {
                return null;
            }
            var $sidebar = $(_.template(this.sidebarTemplate, {}));
            $sidebar.find('.sidebar-body').append($el);
            $sidebar.css({visibility: 'hidden'});
            if (this.contents.length==0) {
                $sidebar.addClass('first');
            }

            this.$el.append($sidebar);

            //+1 for the border
            var width = $sidebar.width() + 1;

            this.contents.push($sidebar);
            $sidebar.find('.close').bind('click', this.contents.length, _.bind(this.removeSidebars, this));
            var cssArg = {visibility: 'visible', width: width - 1};
            cssArg[this.options.direction] = '-' + width + 'px';
            $sidebar.css(cssArg);
            this.shiftSidebars(width);
        },
        removeSidebars: function(evt) {
            if (typeof evt.preventDefault == "function") {
                evt.preventDefault();
            }
            var index = evt.data - 1;
            var remove = this.contents.slice(index, this.contents.length);
            var width = _.reduce(remove, function (memo, item) {
                // add 1 px for the border
                return memo + item.width() + 1;
            }, 0);
            var removedSidebarsCount = this.contents.length - index;
            var animationArgs = {};
            animationArgs[this.options.direction] = "-=" + width;
            this.$('.sidebar').animate(animationArgs, _.bind(function() {
                $.each(remove, function() {
                    this.remove();
                });
                if (index == 0) {
                    this.remove();
                }
            }, this));
            this.contents = this.contents.slice(0, index);
            this.trigger('sidebarsRemoved', removedSidebarsCount);
        },
        popSidebar: function() {
            this.removeSidebars({data: this.contents.length});
        },
        shiftSidebars: function(width) {
            // shift all sidebars.
            var animationArgs = {};
            animationArgs[this.options.direction] = "+=" + width + "px";
            this.$('.sidebar').animate(animationArgs);
        },
        show: function() {
            this.shiftSidebars();
        },
        replaceLastSidebar: function($el) {
            this.contents[this.contents.length - 1].find('.sidebar-body').empty().append($el);
        },
        template: '' +
            '<% if (options.modalize) { %>' +
            '    <div class="background-cover"/>' +
            '<% } %>',
        sidebarTemplate: '' +
            '<div class="sidebar">' +
                '<a class="close" href="#"><i class="icon-x"/></a>' +
                '<div class="sidebar-body"></div>' +
            '</div>'
    });

    return SideBar;
});
