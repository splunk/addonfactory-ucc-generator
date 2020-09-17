/**
 * @author jszeto
 * @date 3/18/15
 * Displays a table of Archives. Each row of the table contains links to perform operations on the given archive.
 * The user can expand the row to see more details about the archive
 *
 * INPUTS:
 *
 * model: {
 *     application {models/Application}
 * },
 * collection: {
 *     archives {collections/services/data/Archives} - set of filtered, sorted and paginated archives
 * }
 */
define([
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'helpers/grid/RowIterator',
        './ArchivesGridRow',
        'views/shared/FlashMessages',
        'views/shared/controls/SyntheticCheckboxControl',
        'views/shared/delegates/ColumnSort',
        'views/shared/delegates/RowExpandCollapse',
        'contrib/text!views/archives/shared/ArchivesGrid.html',
        'uri/route',
        'util/splunkd_utils'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        RowIterator,
        ArchivesGridRow,
        FlashMessagesView,
        SyntheticCheckboxControl,
        ColumnSort,
        RowExpandCollapse,
        template,
        route,
        splunkDUtils
    ){
        return BaseView.extend({
            moduleId: module.id,
            template: template,
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.children.columnSort = new ColumnSort({
                    el: this.el,
                    model: this.collection.archives.fetchData,
                    autoUpdate: false
                });

                //this.children.selectAllCheckbox = new SyntheticCheckboxControl();
                //this.children.selectAllCheckbox.on("change", this.onSelectAllCheckBoxChange, this);

                this.children.flashMessages = new FlashMessagesView({
                    className: 'message-single'
                });

                this.collection.archives.on('change reset', function(){
                    if (this.collection.archives.length == 0) {
                        this.updateNoArchivesMessage();
                    } else {
                        this.children.flashMessages.flashMsgHelper.removeGeneralMessage('vix_no_archive');
                    }

                    // Set the select All checkbox to unchecked but don't trigger a change event
                    //this.children.selectAllCheckbox.setValue(false,true,{silent:true});

                    this.debouncedRender();
                }, this);


            },

            updateNoArchivesMessage: function() {
                if (this.collection.archives.length == 0) {
                    var learnMoreLink = route.docHelp(
                            this.model.application.get('root'),
                            this.model.application.get('locale'),
                            'learnmore.virtualindex.archive'
                        ),
                        errMessage = _('No archives are defined.').t() +
                            '<a href="'+learnMoreLink+'" target="_blank">' +
                            _('Learn more.').t()+' <i class="icon-external"></i></a>';
                    this.children.flashMessages.flashMsgHelper.addGeneralMessage('vix_no_archive',
                        {
                            type: splunkDUtils.ERROR,
                            html: errMessage
                        });
                } else {
                    this.children.flashMessages.flashMsgHelper.removeGeneralMessage('vix_no_archive');
                }
            },
            onSelectAllCheckBoxChange: function(newValue, oldValue) {
                _(this.archivesRows).each(function(archiveRow) {
                    archiveRow.setCheckBoxValue(newValue);
                }, this);
            },
            onSelectedChange: function(archiveID, selected) {
                this.trigger("selectedChange",archiveID,selected);
            },

            getIDFromTarget: function(event) {
                return $(event.target).closest('tr').data('row-expand-collapse-id');
            },

            render: function() {

                //this.children.selectAllCheckbox.detach();

                var rowIterator = new RowIterator({ });
                // TODO [JCS] Remove existing archivesRows
                this.archivesRows = [];
                var html = this.compiledTemplate({
                    _:_,
                    collection: this.collection.archives,
                    sortCellClass: ColumnSort.SORTABLE_ROW,
                    sortKeyAttribute: ColumnSort.SORT_KEY_ATTR,
                    headerCellClass: RowExpandCollapse.HEADER_CELL_CLASS
                });

                var $html = $(html);

                rowIterator.eachRow(this.collection.archives, function(archiveModel, index, rowNumber, isExpanded) {
                    /* console.log("archive row",archive.entry.get("name"),
                     "provider name",archive.entry.content.get("vix.provider"),
                     "bandWidth",bandWidth);*/

                    var archivesRow = new ArchivesGridRow({model: { archive: archiveModel, controller: this.model.controller},
                        index: index,
                        isExpanded: isExpanded,
                        rowNumber: rowNumber});
                    this.archivesRows.push(archivesRow);
                    //this.listenTo(archivesRow, "selectedChange", this.onSelectedChange);
                    $html.find(".archives-grid-table-body").append(archivesRow.render().el);
                }, this);

                this.children.columnSort.update($html);
                this.$el.html($html);
                this.children.flashMessages.render().appendTo(this.$el);
                //this.children.selectAllCheckbox.render().appendTo(this.$(".select-all-checkbox"));

                return this;
            }
        });
    });


