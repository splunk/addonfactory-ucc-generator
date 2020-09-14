define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'splunk.i18n'
    ],
    function($, _, module, Base, i18n){
        return Base.extend({
            moduleId: module.id,
            className: 'pattern-table',
            tagName: 'table',
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);
            },
            startListening: function() {
                this.listenTo(this.model.patternData.results, 'reset', this.render);

                this.listenTo(this.model.state, 'unselectPattern', this.unSelectPattern);

                $(window).on('resize.' + this.cid, this.setSelectedRowCenter.bind(this));
                $(document).on('PrintEnd.' + this.cid, this.setSelectedRowCenter.bind(this));
            },

            setSelectedRowCenter: function() {
                var selectedPatternId = this.model.state.get('selectedPattern');
                if (selectedPatternId) {
                    var $selectedRow = this.$('#' + selectedPatternId);
                    this.model.state.set({
                        'selectedRowCenter': $selectedRow.position().top + Math.floor($selectedRow.height() / 2) + 20
                    });
                    this.model.state.trigger('updateCenter');
                }
            },
            //
            activate: function(options) {
                if (this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }

                this.render();

                return Base.prototype.activate.apply(this, arguments);
            },
            deactivate: function(options) {
                if (!this.active) {
                    return Base.prototype.deactivate.apply(this, arguments);
                }
                Base.prototype.deactivate.apply(this, arguments);
                $(window).off('.' + this.cid);
                $(document).off('.' + this.cid);
                return this;
            },
            remove: function() {
                $(window).off('.' + this.cid);
                $(document).off('.' + this.cid);
                Base.prototype.remove.apply(this, arguments);
            },
            events: {
                'click tr': function(e) {
                    e.preventDefault();
                    var previousSelectedPattern = this.model.state.get('selectedPattern'),
                        currentSelectedPattern = e.currentTarget.id,
                        $currentTarget = $(e.currentTarget);

                    if (this.model.patternJob.isDone()) {
                        if (previousSelectedPattern !== currentSelectedPattern) {
                            if (previousSelectedPattern) {
                                this.unSelectPattern(previousSelectedPattern);
                            }
                            $currentTarget.addClass('selected expanded');
                            
                            this.model.state.set({
                                'selectedPattern': currentSelectedPattern
                            });
                            this.setSelectedRowCenter();
                        }
                    }
                }
            },
            unSelectPattern: function(cid) {
                this.$('#' + cid).removeClass('selected expanded');
            },
            getSampleEventString: function(pattern) {
                var eventString = '';
                _(pattern.getSampleEventTokens()).each(function(tokenObject) {
                    if (tokenObject.highlight || tokenObject.timestamp) {
                        var $container = $('<div>');
                        var $span = $('<span>');
                        $span.addClass(tokenObject.highlight ? 'includeterm' : 'timestamp');
                        $span.text(tokenObject.token);
                        $container.append($span);
                        eventString += $container.html();
                    } else {
                        eventString += _.escape(tokenObject.token);
                    }
                });
                return eventString;
            },
            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _,
                    i18n: i18n,
                    patternJob: this.model.patternJob,
                    patternData: this.model.patternData,
                    getSampleEventString: this.getSampleEventString
                }));
                
                if (this.model.patternJob.isDone()) {
                    this.$el.removeClass('search-disabled');
                } else {
                    this.$el.addClass('search-disabled');
                }
                
                return this;
            },
            template: '\
                <tbody class="patterns">\
                    <% patternData.results.each(function(pattern) {  %>\
                        <tr id="<%- pattern.cid %>">\
                            <td class="percent">\
                                <%- i18n.format_percent(pattern.getPercentMatched()) %>\
                            </td>\
                            <td class="description">\
                                <div class="sample-event">\
                                    <%= getSampleEventString(pattern) %>\
                                </div>\
                            </td>\
                        </tr>\
                    <% }); %>\
                </tbody>\
            '
        });
    }
);