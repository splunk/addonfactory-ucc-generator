/**
 * View that contains the Master Event and handles their highlighting and interactivity. Event is splitted by delimiter and user can name each extracted field
 */
define([
            'jquery',
            'underscore',
            'module',
            'views/Base',
            './FieldExtractionForm',
            'views/shared/delegates/Popdown',
            'util/field_extractor_utils',
            './EditDelimExtractionDropdown',
            'bootstrap.tooltip'  // package without return type
        ],
        function(
            $,
            _,
            module,
            BaseView,
            FieldExtractionForm,
            Popdown,
            fieldExtractorUtils,
            DelimExtractionDropdown
        ) {

    return BaseView.extend({

        moduleId: module.id,
        className: 'automatic-extraction-editor',

        /**
         * @constructor
         *
         * @param options {Object} {
         *     model: {
         *         state {Model} model to track the state of the editing process
         *     }
         * }
         */
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.state, 'change:masterEvent', this.debouncedRender);
            this.listenTo(this.model.state, 'change:delimitedBounds change:regex change:delimFieldNames', function() {
                this.trigger('action:hideMasterEventViewer');
                this.updateEventTable();
            });

            this.debouncedRender();
        },

        events: {
            'mouseup td.masterevt-hdr > span': function(e) {
                e.preventDefault();
                var $target = $(e.target);
                if ($target.hasClass('icon-pencil')) {
                    $target = $target.parent();
                }
                var fieldNum = $target.parent().data('fieldnum');
                var fieldName = $target.text();
                this._openExtractionDropdown($target, fieldNum, fieldName);
            }, 
            'mouseup td.masterevt-col': function(e) {
                e.preventDefault();
                var $target = $(e.target);
                var fieldNum = $target.parent().data('fieldnum');
                var fieldName = $target.parent().data('fieldname');
                this._openExtractionDropdown($target, fieldNum, fieldName);
            }
        },

        _openExtractionDropdown: function($target, fieldNum, fieldName) {
            if (this.children.delimExtractionDropdown) {
                this.stopListening(this.children.delimExtractionDropdown);
                this.children.delimExtractionDropdown.remove();
            }
            this.children.delimExtractionDropdown = new DelimExtractionDropdown({
                startIndex: fieldNum,
                fieldName: fieldName,
                model: {
                    state: this.model.state
                }
            });
            
            this.$delimPopdownDialog = $(this.delimPopdownTemplate).appendTo(this.el);
    
            this.children.delimExtractionPopdown = new Popdown({
                el: this.el,
                dialog: '.popdown-dialog',
                mode: 'dialog',
                attachDialogTo: 'body',
                adjustPosition: false
            });
            this.children.delimExtractionDropdown.render().appendTo(this.$delimPopdownDialog);
            this.listenTo(this.children.delimExtractionDropdown, 'action:renameField', function (fieldName, index) {
                var delimFieldNames = this.model.state.get('delimFieldNames') || {};
                delimFieldNames[index] = fieldName;
                this.model.state.set('delimFieldNames', delimFieldNames);
                this.model.state.trigger('delimFieldNamesUpdated');
                this.children.delimExtractionPopdown.hide();
            });
            this.children.delimExtractionPopdown.pointTo($target);
            this.children.delimExtractionPopdown.show();
            this.children.delimExtractionDropdown.focus();
        },

        updateEventTable: function() {
            var bounds = this.model.state.get('delimitedBounds') || [];
            var masterEvent = this.model.state.get('masterEvent');
            var fieldNames = this.model.state.get('delimFieldNames');
            if (_.isUndefined(fieldNames) || fieldNames.length < bounds.length) {
                fieldNames = [];
                for (var i=1; i<=bounds.length; i++) {
                    fieldNames.push('field' + i);
                }
                this.model.state.set({'delimFieldNames': fieldNames}, {silent: true});
                this.model.state.trigger('delimFieldNamesUpdated');
            }
            var $header = $('<tr>');
            var $row = $('<tr>');

            _(bounds).each(function(val, i) {
                var hdrName = (!_.isUndefined(fieldNames[i])) ? fieldNames[i] : ('field' + (i+1));
                var color = fieldExtractorUtils.getFieldColorWithIndex(i);
                var hdrVal= '<span>' + hdrName + '<i class="icon-pencil"></i></span>';
                var colValue = '<span class="highlighted-match highlighted-' + color + '">' +
                                masterEvent.substring(val['start'], val['end']) + '</span>';
                var th = $('<td>').addClass('masterevt-hdr').data('fieldnum', i).append(hdrVal);
                var td = $('<td>').addClass('masterevt-col').data('fieldnum', i).data('fieldname', hdrName).append(colValue);
                $header.append(th);
                $row.append(td);
            }.bind(this));
                    
            this.$('table.masterevent').empty();
            this.$('table.masterevent').append($('<thead>').append($header));
            this.$('table.masterevent').append($('<tbody>').append($row));

            this.$('.icon-pencil').each(function(index, element) {
                $(element).tooltip({ animation: false, title: _('Edit').t(), container: element });
            });
        },

        render: function() {
            this.$el.html(this.compiledTemplate({
            }));
            this.updateEventTable();

            return this;
        },

        template: '\
            <div class="master-event-container scrolling-table-wrapper">\
                    <table class="masterevent table table-chrome table-striped not-wrapped-results"></table>\
            </div>\
        ',
        
        delimPopdownTemplate: '\
            <div class="popdown-dialog">\
                <div class="arrow extraction-dialog-arrow"></div>\
            </div>\
        '

    });

});
