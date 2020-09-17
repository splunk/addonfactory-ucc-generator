define(
    [
        'module',
        'jquery',
        'underscore',
        'views/Base',
        'views/shared/Button',
        'views/shared/delegates/StopScrollPropagation',
        './ModalLocalClassNames.pcssm',
        'util/keyboard'
    ],
    function(
            module,
            $,
            _,
            Base,
            Button,
            StopScrollPropagation,
            css,
            keyboard
            ) {

        var HIDE_REASONS = {
            ClickClose: 'clickClose',
            ClickBackground: 'clickBackground',
            PressEscape: 'pressEscape'
        };

        return Base.extend({
                moduleId: module.id,
                css: css,
                attributes: {
                    style: 'display:none',
                    tabindex: -1,
                    role: 'dialog'
                },
                initialize: function() {
                    Base.prototype.initialize.apply(this, arguments);

                    var defaults = {
                        keyboard: true,
                        showCloseButton: true,
                        closeOnEscape: true,
                        headerView: null,
                        title: null,
                        titleView: null,
                        bodyView: null,
                        bodyScrolling: true,
                        bodyPadded: true,
                        footerView: null,
                        buttonsLeft: [],
                        buttonsRight: [],
                        inputSelector: 'a:visible, button:visible:not([disabled]), input[type="text"]:visible:not([disabled]), input[type="password"]:visible:not([disabled]), textarea:visible:not([disabled])'
                    };
                    _.defaults(this.options, defaults);

                    this.keydownEventCode = null;
                    this.keydownEventTarget = null;
                    this.shown = false;

                    this.children.closeButton = new Button({icon: 'close', style: 'pill', action: 'close-modal', title: 'close'});
                    this.clearButtons(); //setup empty arrays
                    //accessors
                    this.setHeaderView(this.options.headerView);
                    this.setBodyView(this.options.bodyView);
                    this.setTitleView(this.options.titleView);
                    this.setFooterView(this.options.footerView);
                    this.setButtonsLeft(this.options.buttonsLeft);
                    this.setButtonsRight(this.options.buttonsRight);
                },

                set: function(options) {
                    _.each(options, function(value, key) {
                        var functionName = 'set' + key.charAt(0).toUpperCase() + key.slice(1);

                        if (typeof this[functionName] == 'function') {
                           this[functionName](value);
                        } else {
                           this.options[key] = value;
                           this.debouncedRender();
                        }
                    }, this);

                    return this;
                },
                debouncedRender: function() {
                    this.el.innerHTML && Base.prototype.debouncedRender.apply(this, arguments);
                    return this;
                },
                setHeaderView: function(view) {
                    this._setView(view, 'header');
                    return this;
                },
                setTitleView: function(view) {
                    this._setView(view, 'title');
                    return this;
                },
                setBodyView: function(view) {
                    this._setView(view, 'body');
                    return this;
                },
                setFooterView: function(view) {
                    this._setView(view, 'footer');
                    return this;
                },
                _setView: function(view, location) {
                    if (!view || this.children[location] == view) {
                        return;
                    }
                    //this.el.innerHTML && this.$('[data-modal-role=' + location + ']').html(''); // need to clear existing html, but not safe :(
                    this.children[location] && this.children[location].remove();
                    this.children[location] = view.appendTo(this.$('[data-modal-role=' + location + ']'));
                    this[location] = this.children[location];
                    this.debouncedRender();
                },

                setButtonsLeft: function(views) {
                    return this._setButtons(views, 'Left');
                },
                setButtonsRight: function(views) {
                    return this._setButtons(views, 'Right');
                },
                _setButtons: function(views,  side) {
                    this['clear' + side + 'Buttons']();
                    this.children['buttons' + side] = views;
                    this.debouncedRender();
                    return this;
                },

                addLeftButtonView: function(view, index) {
                    return this._addButtonView(view, index, 'Left');
                },
                addRightButtonView: function(view, index) {
                    return this._addButtonView(view, index, 'Right');
                },
                _addButtonView: function(view, index, side) {
                    var buttons = this.children['buttons' + side];
                    if (typeof index == 'number') {
                        buttons.splice(index, 0, view);
                    } else {
                        buttons.push(view);
                    }
                    this.debouncedRender();
                    return this;
                },

                clearButtons: function() {
                    this.clearLeftButtons();
                    this.clearRightButtons();
                    return this;
                },
                clearLeftButtons: function() {
                    this.children.buttonsLeft && this.children.buttonsLeft.forEach(function(view) {view.remove();});
                    this.children.buttonsLeft = [];
                    this.debouncedRender();
                    return this;
                },
                clearRightButtons: function() {
                    this.children.buttonsRight && this.children.buttonsRight.forEach(function(view) {view.remove();});
                    this.children.buttonsRight = [];
                    this.debouncedRender();
                    return this;
                },

                focus: function() {
                    //focus on close by default
                    this.children.closeButton && this.children.closeButton.$el.focus();

                    // check for any inputs inside the body, focus the first visible one
                    // if no inputs inside the body, focus to the first visible footer button.
                    var $inputs = this.$('[data-modal-role=body], [data-modal-role=footer]').find(this.options.inputSelector);

                    for(var i = 0; i < $inputs.length; i++) {
                        var $input = $inputs.eq(i);
                        if ($input.css('visibility') !== 'hidden') {
                            $input.focus();
                            break;
                        }
                    }
                },

                //if you extend this class and need your own events object then you need to declare it like:
                // $.extend({}, Modal.prototype.events, {
                events: {
                    'click [data-action=close-modal]': function(e) {
                        this.hide({reason:HIDE_REASONS.ClickClose});
                    },
                    'keydown': function(e) {
                        var keyCode = e.which;
                        this.keydownEventCode = e.which;
                        this.keydownEventTarget = e.target;

                        if (keyCode === keyboard.KEYS.TAB) {
                            keyboard.handleCircularTabbing(this.$el, e);
                        } else if (keyCode === keyboard.KEYS.ESCAPE && this.hide && this.options.closeOnEscape) {
                            this.hide({reason:HIDE_REASONS.PressEscape});
                        }
                    },
                    'keyup': function(e) {
                        var keyCode = e.which;
                        if (keyCode === keyboard.KEYS.ENTER && this.keydownEventCode === keyboard.KEYS.ENTER) {
                            var $target = $(e.target);

                            if(e.target !== this.keydownEventTarget && $(this.keydownEventTarget).is('input')  && $(this.keydownEventTarget).attr('type') === 'text')
                                $target = $(this.keydownEventTarget);

                            if ($target.is('input') && $target.attr('type') === 'text' && this.$el.find('.btn-primary:visible').length === 1) {
                                // if the currently focused element is any kind of text input,
                                // make sure to blur it so that any change listeners are notified
                                if ($target.is(this.options.inputSelector)) {
                                    $target.blur();
                                }
                                e.preventDefault();
                                this.keydownEventCode = null;
                                this.keydownEventTarget = null;
                                this.$el.find('.btn-primary:visible').click();
                            }
                        }
                    }
                },
                hide: function(params) {
                    if (this.$el.attr('data-modal-state') === 'open') {
                        this.$el.attr('data-modal-state', 'closed');
                        this.$backdrop.attr('data-modal-state', 'closed');
                        this.$el.one('transitionend', this.onHidden.bind(this));
                        this.$backdrop.off();

                        this.children.body && this.children.body.hide && this.children.body.hide();
                        if (!params) {
                            this.trigger("hide");
                        } else {
                            this.trigger("hide", {reason: params.reason});
                        }
                    }
                },
                onHidden: function() {
                    this.$backdrop.hide();
                    this.$el.off('transitionend');

                    if (this.options.onHiddenRemove) {
                        this.remove();
                    } else {
                        this.$el.hide();
                    }
                    this.shown = false;
                    this.trigger("hidden");
                },
                backDropEventCallback: function() {
                    this.hide({reason:HIDE_REASONS.ClickBackground});
                },
                show: function() {
                    if (!this.$backdrop) {
                        this.$backdrop =  $('<div class="' + this.css.backdrop + '"></div>');
                    }
                    this.options.closeOnEscape && this.$backdrop.on('click', this.backDropEventCallback.bind(this));

                    this.render().$el.appendTo($('body')).show();
                    this.$backdrop.appendTo($('body')).width(); //redraw

                    this.$el.attr('data-modal-state', 'open');
                    this.$backdrop.show().attr('data-modal-state', 'open');

                    this.children.body && this.children.body.show && this.children.body.show();

                    this.children.stopScrollPropagation = new StopScrollPropagation({el: this.el, selector: '[data-modal-role=body]'});
                    this.focus();
                    this.trigger("shown");
                },
                toggle: function() {
                    this.$el.attr('data-modal-state') == 'open' ? this.hide() : this.show();
                },
                remove: function() {
                    this.$backdrop && this.$backdrop.remove();
                    Base.prototype.remove.apply(this, arguments);
                },
                render: function() {
                    var html = this.compiledTemplate({
                        css: this.css,
                        scroll: this.options.bodyScrolling ? 'Scrolling' : '',
                        padded: this.options.bodyPadded ? 'Padded' : '',
                        hasHeaderView: !!this.children.header,
                        hasBodyView: !!this.children.body,
                        hasFooterView: !!this.children.footer,
                        showFooter: (!!this.children.footer || !!this.children.buttonsRight.length || !!this.children.buttonsLeft.length),
                        options: this.options
                    });
                    // prevents jQuery from removing event listeners upon multiple calls to this.$el.html(html)
                    // so that events defined in the head/body/footer views fire correctly
                    _.each(this.children, function(child) {
                        child.$el && child.$el.detach();
                    });

                    this.$el.html(html);

                    this.children.header && this.children.header.render().appendTo(this.$("[data-modal-role=header]"));
                    this.children.header || (this.options.showCloseButton && this.children.closeButton.render().appendTo(this.$("[data-modal-role=close]")));
                    this.children.title && this.children.title.render().replaceAll(this.$("[data-modal-role=title]"));
                    this.children.body && this.children.body.render().appendTo(this.$("[data-modal-role=body]"));
                    this.children.footer && this.children.footer.render().appendTo(this.$("[data-modal-role=footer]"));

                    this.shown && this.children.body.show && this.children.body.show();

                    _(this.children.buttonsLeft || []).each(function (view, index){
                        view.render().appendTo(this.$("[data-modal-role=footer-buttons-left]"));
                    }, this);

                    _(this.children.buttonsRight || []).each(function (view, index){
                        view.render().appendTo(this.$("[data-modal-role=footer-buttons-right]"));
                    }, this);

                    this.focus();
                },
                template: '\
                    <% if (hasHeaderView) {%>\
                        <div class="<%=css.headerWrapper%>" data-modal-role="header">\</div>\
                    <% } else if (options.title || options.showCloseButton) {%>\
                    <div class="<%=css.header%>" data-modal-role="header">\
                        <h3 class="<%=css.title%>" data-modal-role="title"><%-options.title%></h3>\
                        <div class="<%=css.closeWrapper%>" data-modal-role="close"></div>\
                    </div>\
                    <% }%>\
                    <div class="<%= css["body" + scroll + padded] %>" data-modal-role="body">\
                        <% if (!hasBodyView) {%>\
                            <div class="<%=css.loading%>">Loading....</div>\
                        <% }%>\
                    </div>\
                    <% if (showFooter) {%>\
                    <div class="<%= hasFooterView ? css.footerWrapper : css.footer%>" data-modal-role="footer">\
                        <div class="<%= css.buttonsLeft%>" data-modal-role="footer-buttons-left">\
                        </div>\
                        <div class="<%= css.buttonsRight%>" data-modal-role="footer-buttons-right">\
                        </div>\
                    </div>\
                    <% }%>\
                '
            },
            {
                HIDE_REASONS: HIDE_REASONS
            }
        );
    }
);
