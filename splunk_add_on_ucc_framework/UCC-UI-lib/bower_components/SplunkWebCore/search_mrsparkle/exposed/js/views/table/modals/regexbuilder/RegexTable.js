define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base'
    ],
    function(
        _,
        $,
        module,
        BaseView
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'table table-results',
            tagName: 'table',

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },

            highlightRegexMatches: function(matches) {
                var $tbody = this.$('tbody'),
                    highlightedHtml;

                // First, clear the existing table
                $tbody.html('');

                // Then, for each returned match from the server, add a table row containing the highlighted event string
                _.each(matches, function(match) {
                    highlightedHtml = this.getHighlightedHtml(match);
                    $tbody.append('<tr><td class="field-value">' + highlightedHtml + '</td></tr>');
                }, this);
            },

            getHighlightedHtml: function(match) {
                var html = '',
                    preHighlightRanges = match['pre_highlight_ranges'], // nested array of [[1,2], [3,4]] format
                    highlightRange =  match['highlight_range'], // non-nested array of [6,8] format
                    postHighlightRanges = match['post_highlight_ranges'], // nested array of [[11,12], [13,14]] format
                    eventString = match['field_value'];

                this.model.regexBuilder.validateMatch(match);

                if (!preHighlightRanges.length) {
                    // If there are no preHighlightRanges returned and highlightRange doesn't start at index 0,
                    // then assume that all chars leading up to the highlightRanges are preHighlighted
                    if (highlightRange[0] > 0) {
                        html += '<span class="starting">' + this.encodeFragment(eventString.slice(0, highlightRange[0])) + '</span>';
                    } else {
                        // If highlightRange starts at index 0, then there is no preHighlightRange to highlight
                        html += this.encodeFragment(eventString.slice(0, highlightRange[0]));

                    }

                } else {
                    _.each(preHighlightRanges, function(preHighlightRange, i) {
                        // 1.) Append the start of the event string up until the first highlight as regular text
                        if (i === 0) {
                            html += this.encodeFragment(eventString.slice(0, preHighlightRange[0]));
                        }

                        // 2.) For each preHighlightRange, append the highlighted matched text.
                        html += '<span class="starting">' + this.encodeFragment(eventString.slice(preHighlightRange[0], preHighlightRange[1])) + '</span>';

                        // 3.) Append unmatched text between the highlighted preHighlightRange segments as regular text
                        if (i < preHighlightRanges.length - 1) {
                            html += this.encodeFragment(eventString.slice(preHighlightRange[1], preHighlightRanges[i + 1][0]));
                        } else {
                            // In the case of the last preHighlightRange, append unmatched text from the end
                            // of the last preHighlightRange until the start of the highlightRange
                            html += this.encodeFragment(eventString.slice(preHighlightRange[1], highlightRange[0]));
                        }
                    }, this);
                }

                // 4.) Append the actual highlighted match
                html += '<span class="match">' + this.encodeFragment(eventString.slice(highlightRange[0], highlightRange[1])) + '</span>';

                // 5.) For each postHighlightRange, append both the matched highlighted text segments, and the
                // unmatched unhighlighted text between them.
                if (!postHighlightRanges.length) {
                    // If there are no postHighlightRanges returned, then assume that all chars from the highlight
                    // up to the end of the event string are normal
                    html += this.encodeFragment(eventString.slice(highlightRange[1], eventString.length));
                } else {
                    _.each(postHighlightRanges, function(postHighlightRange, i) {
                        // Append unmatched text between the highlighted match and the first postHighlightRange
                        if (i === 0) {
                            html += this.encodeFragment(eventString.slice(highlightRange[1], postHighlightRange[0]));
                        }

                        // Append the matched text
                        html += '<span class="stopping">' + this.encodeFragment(eventString.slice(postHighlightRange[0], postHighlightRange[1])) + '</span>';

                        // Append the unmatched text between the matched segments
                        if (i < postHighlightRanges.length - 1) {
                            html += this.encodeFragment(eventString.slice(postHighlightRange[1], postHighlightRanges[i + 1][0]));
                        } else {
                            // This is the last postHighlightRange, so append the text from its end range until the end of the event string
                            html += this.encodeFragment(eventString.slice(postHighlightRange[1]));
                        }
                    }, this);
                }

                return html;
            },

            encodeFragment: function(fragment) {
                // Escaping any dangerous characters, since encodedMatch is going to be shown to the user
                return fragment.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            },



            render: function() {
                this.$el.html(this.compiledTemplate({
                    _: _,
                    fieldName: this.options.fieldName
                }));

                return this;
            },

            template: '\
                <colgroup>\
                    <col data-field="<%- fieldName %>" />\
                </colgroup>\
                <thead>\
                    <tr>\
                        <th class="field field-<%- fieldName %>" data-field="<%- fieldName %>">\
                            <%- fieldName %>\
                        </th>\
                    </tr>\
                </thead>\
                <tbody></tbody>\
            '
        });
    }
);