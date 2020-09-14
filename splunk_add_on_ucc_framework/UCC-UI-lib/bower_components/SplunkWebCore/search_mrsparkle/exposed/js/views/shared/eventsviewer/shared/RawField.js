define(
    [
        'jquery',
        'underscore',
        'module',
        'keyboard/SearchModifier',
        'splunk.util',
        'views/Base',
        'views/shared/JSONTree',
        'helpers/user_agent'
    ],
    function($, _, module, KeyboardSearchModifier, util, BaseView, JSONTree, userAgent){
        return BaseView.extend({
            decorations: {
                'decoration_audit_valid': {"msg": "Valid", "label": "label-success", "icon": "icon-check-circle"} ,
                'decoration_audit_gap': {"msg": "Gap", "label": "label-warning", "icon": "icon-minus-circle"} ,
                'decoration_audit_tampered': {"msg": "Tampered!", "label": "label-important", "icon": "icon-alert-circle"} ,
                'decoration_audit_cantvalidate': {"msg": "Can't validate!", "label": "label-info", "icon": "icon-question-circle" }
            },
            moduleId: module.id,
            tagName: 'div',
            /**
             * @param {Object} options {
             *     model: {
             *         event: <models.services.search.job.ResultsV2.results[i]>,
             *         result: <models.services.search.job.ResultsV2,
             *         report: <models.services.SavedSearch>,
             *         state: <models.Base>,
             *         searchJob: <models.Job>
             *     },
             *     highlightExtractedTime: true|false (caution: will disable segmentation/drilldown)
             */
            initialize: function(){
                BaseView.prototype.initialize.apply(this, arguments);

                this.options = $.extend(true, { segmentation: true }, this.options);

                this.interaction       = 'i' + this.options.idx;
                this.showFormattedJSON = 'j' + this.options.idx;
                this.showAllLines      = 's' + this.options.idx;

                this.keyboardSearchModifier = new KeyboardSearchModifier();

                this.children.json = new JSONTree({
                    json: this.model.event.getRawText()
                });

                this.setJSONFormattingType();
            },
            startListening: function() {
                this.listenTo(this.model.event, 'change', function() {
                    this.children.json.setJSON(this.model.event.getRawText(), false);
                    this.render();
                });

                this.listenTo(this.model.report.entry.content, 'change:display.events.type', function() {
                    var wrap = util.normalizeBoolean(this.model.report.entry.content.get("display.events.list.wrap")),
                        $raw = this.$('.raw-event'),
                        $json = this.$('.json-event');
                    $raw.removeClass('wrap');
                    $json.removeClass('wrap');
                    if (this.model.report.entry.content.get('display.events.type') === 'raw' || wrap) {
                        $raw.addClass('wrap');
                        $json.addClass('wrap');
                    }

                    this.setJSONFormattingType();
                    if (!this.isType('table')) {
                        this.render();
                    }
                });

                this.listenTo(this.model.report.entry.content, 'change:display.events.list.wrap', function() {
                    var wrap = util.normalizeBoolean(this.model.report.entry.content.get("display.events.list.wrap")),
                        $raw = this.$('.raw-event'),
                        $json = this.$('.json-event');
                    if (wrap && !$raw.hasClass('wrap')) {
                        $raw.addClass('wrap');
                        $json.addClass('wrap');
                    } else {
                        $raw.removeClass('wrap');
                        $json.removeClass('wrap');
                    }
                });

                //any interaction with json should force modalization
                this.listenTo(this.children.json, 'interaction', function() {
                    this.model.state.trigger(this.interaction);
                });
            },
            events: {
                'mouseover .t': function(e) {
                    var $elem = this.getSegmentParent(e.target);
                    $elem.addClass('h');
                },
                'mouseout .t': function(e) {
                    var $elem = this.getSegmentParent(e.target);
                    $elem.removeClass('h');

                },
                'click span.t': function(e) {
                    //check if click or highlight event
                    var windowSelection = window.getSelection();
                    if (windowSelection.anchorOffset === windowSelection.focusOffset) {
                        // adding this if insures the click event is only fired once
                        // for nested segments without having to call stopPropagation
                        // which would stop the search assistant closing event.
                        // SPL-85828
                        if ((this.model.report.entry.content.get('display.events.raw.drilldown') !== 'none') && (e.currentTarget === e.target)) {
                            var $root = this.getSegmentRoot($(e.currentTarget)),
                                type = "segmentation",
                                data;

                            if (!$root) {
                                $root = this.getSegmentParent(e.currentTarget);
                            }
                            data = {
                                value: $root.text(),
                                app: this.model.application.get('app'),
                                owner: this.model.application.get('owner'),
                                stripReportsSearch: false
                            };

                            if ($root.hasClass('a')) {
                                data = $.extend(data, {
                                    q: this.model.report.entry.content.get('search'),
                                    action: 'removeterm'
                                });
                            } else if (this.children.json.isValidJSON() && this.model.state.get(this.showFormattedJSON)) {
                                type = "fieldvalue";
                                data = $.extend(data, {
                                    q: this.keyboardSearchModifier.isReplacement(e) ? '*' : this.model.report.entry.content.get('search'),
                                    action: 'fieldvalue',
                                    field: $root.data('path'),
                                    value: $root.text(),
                                    negate: this.keyboardSearchModifier.isNegation(e),
                                    usespath: true
                                });
                            } else {
                                data = $.extend(data, {
                                    q: this.keyboardSearchModifier.isReplacement(e) ? '*' : this.model.report.entry.content.get('search'),
                                    action: 'addterm',
                                    negate: this.keyboardSearchModifier.isNegation(e)
                                });
                            }

                            this.model.state.trigger('drilldown', {
                                data: data,
                                event: e,
                                idx: this.options.idx,
                                type: type,
                                $target: $root,
                                stateModel: this.model.state
                            });
                        }
                    }
                },
                'click a.hideinline': function(e) {
                    this.model.state.set(this.showAllLines, false);
                    this.model.state.trigger(this.options.idx + '-allLinesCollapse');
                    e.preventDefault();
                },
                'click a.showinline': function(e) {
                    this.model.state.set(this.showAllLines, true);
                    e.preventDefault();
                },
                'click a.toggle-raw-json': function(e) {
                    this.model.state.set(this.showFormattedJSON, !this.model.state.get(this.showFormattedJSON));
                    this.render();
                    this.model.state.trigger(this.interaction);
                    this.model.state.trigger(this.options.idx + '-jsonCollapse');
                    e.preventDefault();
                }
            },
            getSegmentParent: function(element){
                var parent = element.parentNode;
                if (parent.childNodes[parent.childNodes.length-1]==element && $(parent).hasClass('t')) {
                    element = parent;
                }
                return $(element);
            },
            isType: function(type) {
                return (this.model.report.entry.content.get('display.events.type') === type);
            },
            setJSONFormattingType: function() {
                // Default to raw JSON in raw mode, and pretty JSON in list mode
                if (this.isType('raw')) {
                    this.model.state.set(this.showFormattedJSON, false);
                } else if (this.isType('list')) {
                    this.model.state.set(this.showFormattedJSON, this.children.json.isValidJSON());
                }
            },
            getSegmentRoot: function($element) {
                if($element.hasClass('event')) {
                    return void(0);
                } else if($element.hasClass('a')) {
                    return $element;
                } else {
                    return this.getSegmentRoot($element.parent());
                }
            },
            render: function() {
                var wrap = true,
                    content = this.model.report.entry.content,
                    linecount = parseInt(this.model.event.get('_fulllinecount'), 10);

                if(this.isType('list') || this.isType('table')) {
                    wrap = util.normalizeBoolean(content.get('display.events.list.wrap'));
                }

                if(userAgent.isIE()) {
                    while (this.el.firstChild) {
                        this.el.removeChild(this.el.firstChild);
                    }
                }
                
                this.el.innerHTML = this.compiledTemplate({
                    _: _,
                    util: util,
                    isTable: this.isType('table'),
                    isJSON: this.children.json.isValidJSON(),
                    isFormatted: this.model.state.get(this.showFormattedJSON),
                    model: this.model.event,
                    linecount: linecount,
                    wrap: wrap,
                    expanded: this.model.state.get(this.showAllLines),
                    decorations: this.decorations
                });

                var $rawevent = this.$('.raw-event'),
                    $jsonevent = this.$('.json-event');

                if(!this.isType('table') && this.model.state.get(this.showFormattedJSON)) {
                    this.children.json.render().appendTo($jsonevent);
                } else if(this.isType('table')) {
                    $rawevent.append(_.escape(this.model.event.getRawText()));
                } else if (this.options.highlightExtractedTime) {
                    $rawevent[0].innerHTML = this.model.event.getRawTimeExtraction();
                } else {
                    $rawevent[0].innerHTML = this.model.event.getRawSegmentation();
                }
                return this;
            },
            template: '\
                <% if(model.has("_decoration") && decorations[model.get("_decoration")]) { %>\
                    <% var decoration = decorations[model.get("_decoration")]; %>\
                    <span class="audit label  <%- decoration.label %>"><i class="<%- decoration.icon %>"></i> <%- decoration.msg %></span>\
                <% } %>\
                <div class="json-event <% if(wrap){ %> wrap <% } %>"></div>\
                <div class="raw-event normal <% if(wrap){ %> wrap <% } %>"></div>\
                <% if (isJSON && !isTable) { %><a href="#" class="toggle-raw-json"><%- (!isFormatted) ? _("Show syntax highlighted").t(): _("Show as raw text").t() %></a> <% } %>\
                <% if (!isJSON || !isFormatted) { %>\
                    <% if (expanded) { %>\
                        <a href="#" class="hideinline"><%= _("Collapse").t() %></a>\
                    <% } else if (model.isTruncated()) { %>\
                        <a href="#" class="showinline"><%= util.sprintf(_("Show all %s lines").t(), linecount) %></a>\
                    <% } %>\
                <% } %>\
            '
        });
    }
);
