/**
 * Contents of toggleable sidebar displaying existing saved extractions, along with
 * links to open each saved extraction in Manual Mode in separate tabs.
 */
define([
            'underscore',
            'jquery',
            'module',
            'views/Base',
            'util/field_extractor_utils',
            'util/keyboard',
            'uri/route'
        ],
        function(
            _,
            $,
            module,
            BaseView,
            fieldExtractorUtils,
            keyboardUtils,
            route
        ) {

    return BaseView.extend({

        moduleId: module.id,

        className: 'existing-extractions-list',

        /**
         * @constructor
         *
         * @param options {Object} {
         *     model: {
         *         application <models.shared.Application>
         *         sourcetypeModel <models.knowledgeobjects.Sourcetype>
         *     }
         *     collection: {
         *         extractions <collections.services.data.props.Extractions>
         *     }
         *     hideHighlight: <true/false> -optional arg-
         * }
         */

        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.listenTo(this.collection.extractions, 'request', this.renderLoading);
            this.listenTo(this.collection.extractions, 'sync reset', this.render);
            if (this.options.hideHighlight){
                this.highlight = false;
            }else{
                this.highlight = true;
            }
        },

        events: {
            'click .fields-settings-page-button': function(e) {
                e.preventDefault();
                this._handleViewFieldSettings();
            },
            'click label.checkbox.unchecked:not(.disabled)': function(e) {
                e.preventDefault();
                this._selectCheckbox($(e.target));
            },
            'click label.checkbox.checked:not(.disabled)': function(e) {
                e.preventDefault();
                this._deselectCheckbox($(e.target));
            },
            'keydown': function(e) {
                if(e.which === keyboardUtils.KEYS.TAB) {
                    keyboardUtils.handleCircularTabbing(this.$el, e);
                }
            }
        },

        renderLoading: function() {
            this.$el.html(_(this.loadingTemplate).template({}));
        },

        _handleViewFieldSettings: function() {
            var url = route.manager(
                this.model.application.get('root'),
                this.model.application.get('locale'),
                this.model.application.get('app'),
                ['fields']
            );
            window.open(url, '_blank');
        },

        _selectCheckbox: function($target) {
            $target.closest('td').find('label').removeClass('unchecked').addClass('checked');
            $target.closest('td').find('i.icon-check').show();
            this._flipHighlight($target.closest('td').attr('data-extraction-name'));
        },
        
        _deselectCheckbox: function($target){
            $target.closest('td').find('label').removeClass('checked').addClass('unchecked');
            $target.closest('td').find('i.icon-check').hide();
            this._flipHighlight($target.closest('td').attr('data-extraction-name'));
        },
        
        _flipHighlight: function(fieldName){
            var extractions = this.model.state.get('existingExtractions');
            for (var i = 0; i < extractions.length; i++) {
                if (extractions[i].fieldName === fieldName){
                    extractions[i].hidden = !extractions[i].hidden;
                    break;
                }
            }
            // Also flip highlighting for sample events.
            var sampleExtractions = this.model.state.get('existingSampleExtractions');
            var j = 0;
            for (i = 0; i < sampleExtractions.length; i++) {
                for (j = 0; j < sampleExtractions[i].length; j++) {
                    if (sampleExtractions[i][j].fieldName === fieldName) {
                        sampleExtractions[i][j].hidden = !sampleExtractions[i][j].hidden;
                        break;
                    }
                }
            }
            this.trigger('action:updateHighlighting');
            this.render();
        },
            
        render: function() {
            this.$el.html(this.compiledTemplate({
                extractions: this.getExtractionData(),
                type: this.model.state.get('type'),
                highlight: this.highlight,
                sourcetype: this.model.state.get('sourcetype'),
                source: this.model.state.get('source'),
                generateEditHref: _(function(extraction) {
                    return route.field_extractor(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app'),
                        { data: { extractionId: extraction.id } }
                    );
                }).bind(this)
            }));
            this.focus();
            return this;
        },

        focus: function() {
            this.$('.fields-settings-page-button').focus();
        },

        getExtractionData: function() {
            return this.collection.extractions
                .chain()
                .map(function(extraction) {
                    var extractionContent = extraction.entry.content,
                        extractedFields = fieldExtractorUtils.getCaptureGroupNames(extractionContent.get('value'));

                    return _(extractedFields).map(function(field) {
                        return ({
                            id: extraction.id,
                            field: field,
                            attribute: extractionContent.get('attribute'),
                            isHidden: this.isExtractionHidden(field),
                            canShow: this.canShowExtraction(field)
                        });
                    }, this);
                }, this)
                .flatten()
                .value();
        },

        isExtractionHidden: function(fieldName) {
            var extractions = this.model.state.get('existingExtractions') || [];
            for (var i = 0; i < extractions.length; i++) {
                if (extractions[i].fieldName === fieldName){
                    return extractions[i].hidden;
                }
            }
            return true;
        },
        
        canShowExtraction: function(fieldName) {
            var extractions = this.model.state.get('existingExtractions') || [];
            extractions = extractions.concat(this.model.state.get('examples') || []);
            var extract = null;
            for (var i = 0; i < extractions.length; i++) {
                if (fieldName === extractions[i].fieldName) {
                    extract = extractions[i];
                    break;
                }
            }
            return extract === null ? false : fieldExtractorUtils.canShowExtraction(extract, extractions);
        },

        loadingTemplate: '\
            <div class="alert alert-info">\
                <i class="icon-alert"></i>\
                <%- _("Loading Fields...").t() %>\
            </div>\
        ',

        template: '\
            <h3><%- _("Fields").t() %></h3>\
            <div>\
                <% if ( type === "sourcetype" && sourcetype) { %>\
                    <%- _("Source type:").t() %>\
                    <span class="sourcetype-name"><%- sourcetype %></span>\
                <% } else { %>\
                    <%- _("Source:").t() %>\
                    <span class="source-name"><%- source %></span>\
                <% } %>\
            </div>\
            <div class="extractions-sidebar-instructions">\
                <% if ( type === "sourcetype" && sourcetype) { %>\
                    <%- _("The field extractions below have been previously defined for this source type. For a complete list of field objects, please see the ").t() %>\
                <% } else { %>\
                    <%- _("The field extractions below have been previously defined for this source. For a complete list of field objects, please see the ").t() %>\
                <% } %>\
                <a href="#" class="fields-settings-page-button"> <%- _("Fields page").t() %> <i class="icon-external"></i></a>.\
            </div>\
            <table class="table table-striped">\
                <thead>\
                    <tr>\
                        <th><%- _("Field Name").t() %></th>\
                        <th><%- _("Pattern Name").t() %></th>\
                        <th><%- _("Action").t() %></th>\
                        <% if (highlight) { %>\
                            <th><%- _("Highlighted").t() %></th>\
                        <% } %>\
                    </tr>\
                </thead>\
                <tbody>\
                    <% _(extractions).each(function(extraction) { %>\
                        <tr data-extraction-id="<%- extraction.id %>">\
                            <td><%- extraction.field %></td>\
                            <td><%- extraction.attribute %></td>\
                            <td>\
                                <a href="<%- generateEditHref(extraction) %>" class="edit-button" target="_blank">\
                                    <%- _("open").t() %>\
                                    <i class="icon-external"></i>\
                                </a>\
                            </td>\
                            <% if (highlight) { %>\
                                <td class="checkbox" data-extraction-name="<%- extraction.field %>">\
                                    <label class="checkbox <%- extraction.isHidden ? "unchecked" : "checked" %><%- extraction.canShow ? "" : " disabled" %>">\
                                        <a href="#" class="btn <%- extraction.canShow ? "" : "disabled" %>">\
                                            <i class="icon-check" style="<%- extraction.isHidden ? "display:none" : "" %>">\
                                            </i>\
                                        </a>\
                                    </label>\
                                </td>\
                            <% } %>\
                        </tr>\
                    <% }) %>\
                </tbody>\
            </table>\
        '

    });

});