/**
 * @author jszeto
 * @date 10/28/2014
 *
 * Displays a table of Archive Indexes. Each row of the table contains links to perform operations on the given archive.
 * The user can expand the row to see more details about the archive
 *
 * INPUTS:
 *
 * model: {
 *     application {models/Application}
 * },
 * collection: {
 *     archives {collections/services/data/vix/Indexes} - set of filtered, sorted and paginated archive indexes
 *     providers {collections/services/data/vix/Providers} - set of providers that will be shown on the providers tab, limited by pagination and sorting.
 *     providersAll {collections/services/data/vix/Providers} - set of all providers
 * }
 */
define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'helpers/grid/RowIterator',
    './ArchiveGridRow',
    'views/shared/FlashMessages',
    'views/shared/controls/SyntheticCheckboxControl',
    'views/shared/delegates/ColumnSort',
    'views/shared/delegates/RowExpandCollapse',
    'contrib/text!views/virtual_indexes/ArchiveGrid.html',
    'uri/route',
    'util/hunk_util',
    'util/splunkd_utils',
    'bootstrap.tooltip'
],
    function(
        $,
        _,
        module,
        BaseView,
        RowIterator,
        ArchiveGridRow,
        FlashMessagesView,
        SyntheticCheckboxControl,
        ColumnSort,
        RowExpandCollapse,
        template,
        route,
        hunk_util,
        splunkDUtils
        // tooltip
        ){
        return BaseView.extend({
            moduleId: module.id,
            template: template,
            className: 'push-margins',
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.numProviders = 0;
                this.children.columnSort = new ColumnSort({
                    el: this.el,
                    model: this.collection.archives.fetchData,
                    autoUpdate: false
                });

                this.children.selectAllCheckbox = new SyntheticCheckboxControl();
                this.children.selectAllCheckbox.on("change", this.onSelectAllCheckBoxChange, this);

                this.children.flashMessages = new FlashMessagesView({
                    className: 'message-single'
                });

                this.collection.providers.on('change reset', function(){
                    this.numProviders = this.collection.providers.length;
                    this.updateNoIndexesMessage();
                }, this);

                this.collection.archives.on('change reset', function(){
                    if (this.collection.archives.length == 0) {
                        this.updateNoIndexesMessage();
                    } else {
                        this.children.flashMessages.flashMsgHelper.removeGeneralMessage('vix_no_archive');
                    }

                    // Set the select All checkbox to unchecked but don't trigger a change event
                    this.children.selectAllCheckbox.setValue(false,true,{silent:true});

                    this.render();
                }, this);

                this.collection.providers.on('change reset', this.debouncedRender, this);
                this.model.limits.on('change unified_search', this.debouncedRender, this);
            },
            events: {
                'click .searchAction' : function(e) {
                    var id = this.getIDFromTarget(e);
                    this.collection.archives.trigger('search', this.collection.archives.get(id).entry.get('name'));
                    e.preventDefault();
                },
                'click .deleteAction' : function(e) {
                    var id = this.getIDFromTarget(e);
                    this.collection.archives.trigger('deleteRequest', this.collection.archives.get(id));
                    e.preventDefault();
                },
                'click .disableAction' : function(e) {
                    var id = this.getIDFromTarget(e);
                    this.collection.archives.trigger('disableRequest', this.collection.archives.get(id));
                    e.preventDefault();
                },
                'click .enableAction' : function(e) {
                    var id = this.getIDFromTarget(e);
                    this.collection.archives.trigger('enableRequest', this.collection.archives.get(id));
                    e.preventDefault();
                },
                'click a.provider-link': function(e) {
                    //console.log("clicked provider",$(e.target).attr("data-provider"));
                    document.location.href = route.manager(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app'),
                        'vix_provider_new',
                        {
                            data: {
                                id: $(e.target).attr("data-provider")
                            }
                        }
                    );
                    e.preventDefault();
                }
            },

            updateNoIndexesMessage: function() {
                if (this.collection.archives.length == 0) {
                    var learnMoreLink = route.docHelp(
                            this.model.application.get('root'),
                            this.model.application.get('locale'),
                            'learnmore.virtualindex.archive'
                        ),
                        errMessage = _('No indexes are archived.').t() +
                            (this.numProviders==0?_(' You must have at least one provider to create an archive. ').t():'') +
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
                _(this.archiveRows).each(function(archiveRow) {
                    archiveRow.setCheckBoxValue(newValue);
                }, this);
            },
            onEditOlderThan: function(archive) {
                this.collection.archives.trigger("editArchive", this.collection.archives.get(archive));
            },
            onEditCutoffSec: function(archive) {
                this.collection.archives.trigger('editCutoffSec', this.collection.archives.get(archive));
            },
            onSelectedChange: function(archiveID, selected) {
                this.trigger("selectedChange",archiveID,selected);
            },

            getIDFromTarget: function(event) {
                return $(event.target).closest('tr').data('row-expand-collapse-id');
            },

            render: function() {

                this.children.selectAllCheckbox.detach();

                var rowIterator = new RowIterator({ });
                // TODO [JCS] Remove existing archiveRows
                this.archiveRows = [];
                var html = this.compiledTemplate({
                    _:_,
                    collection: this.collection.archives,
                    sortKeyAttribute: ColumnSort.SORT_KEY_ATTR,
                    headerCellClass: RowExpandCollapse.HEADER_CELL_CLASS
                });

                var $html = $(html);

                var nextArchiveAttempt = "";
                if (this.model.archiveAttempt) {
                    nextArchiveAttempt = this.model.archiveAttempt.entry.content.get('next_scheduled_time');
                }

                rowIterator.eachRow(this.collection.archives, function(archive, index, rowNumber, isExpanded) {
                    var provider = this.collection.providersAll.getProviderByName(archive.entry.content.get("vix.provider"));
                    var bandWidth = "";
                    if (provider) {
                        bandWidth = hunk_util.formatBandWidth(provider.entry.content.get("vix.output.buckets.max.network.bandwidth"));
                    }

                    var archiveRow = new ArchiveGridRow({model: {archive: archive, limits: this.model.limits},
                                                         index: index,
                                                         isExpanded: isExpanded,
                                                         rowNumber: rowNumber,
                                                         bandWidth: bandWidth,
                                                         nextArchiveAttempt: nextArchiveAttempt});
                    this.archiveRows.push(archiveRow);
                    this.listenTo(archiveRow, "action:editOlderThan", this.onEditOlderThan);
                    this.listenTo(archiveRow, 'action:editCutoffSec', this.onEditCutoffSec);
                    this.listenTo(archiveRow, "selectedChange", this.onSelectedChange);
                    $html.find(".archive-grid-table-body").append(archiveRow.render().el);
                }, this);

                this.children.columnSort.update($html);
                this.$el.html($html);
                this.children.flashMessages.render().appendTo(this.$el);
                this.children.selectAllCheckbox.render().appendTo(this.$(".select-all-checkbox"));

                var toolTipText = _('Determine the amount of bandwidth to give archived indexes for a particular provider').t();
                this.$('.tooltip-link').tooltip({animation:false, title: toolTipText, container: 'body'});

                return this;
            }
        });
    });
