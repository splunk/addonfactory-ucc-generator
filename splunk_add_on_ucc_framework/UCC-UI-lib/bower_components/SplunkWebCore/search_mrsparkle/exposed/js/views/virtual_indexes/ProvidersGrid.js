define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'helpers/grid/RowIterator',
    'views/shared/FlashMessages',
    'views/shared/delegates/ColumnSort',
    'contrib/text!views/virtual_indexes/ProvidersGrid.html',
    'uri/route',
    'util/splunkd_utils',
    'util/string_utils',
    'splunk.util',
    'bootstrap.tooltip'
],
    function(
        $,
        _,
        module,
        BaseView,
        RowIterator,
        FlashMessagesView,
        ColumnSort,
        template,
        route,
        splunkDUtils,
        stringUtils,
        splunkUtil,
        bootstrapTooltip
        ){
        return BaseView.extend({
            moduleId: module.id,
            template: template,
            className: 'push-margins',
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);

                this.children.columnSort = new ColumnSort({
                    el: this.el,
                    model: this.collection.providers.fetchData,
                    autoUpdate: false
                });
                this.children.flashMessages = new FlashMessagesView({
                    className: 'message-single'
                });
                this.collection.providers.on('change reset', function(){
                    this.debouncedRender();
                }, this);

            },
            events: {
                'click .deleteAction' : function(e) {
                    var id = $(e.target).parent('td').data('id');
                    this.collection.providers.trigger('deleteRequest', this.collection.providers.get(id));
                    e.preventDefault();
                },
                'click a.index_references': function(e) {
                    var providerName = $(e.target).parent('td').data('name');
                    this.collection.indexes.trigger('filterRequest', providerName);
                    $('.nav-tabs a[href="#vix_indexes"]').tab('show');
                    e.preventDefault();
                }
            },
            makeEditLink: function(id) {
                return route.manager(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.application.get('app'),
                    'vix_provider_new',
                    {
                        data: {
                            id: id
                        }
                    }
                );
            },
            makeCloneLink: function(id) {
                return route.manager(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.application.get('app'),
                    'vix_provider_new',
                    {
                        data: {
                            id: id,
                            mode: 'clone'
                        }
                    }
                );
            },
            render: function() {
                var rowIterator = new RowIterator({ });

                var html = this.compiledTemplate({
                    _:_,
                    collection: this.collection.providers,
                    eachRow: rowIterator.eachRow,
                    sortKeyAttribute: ColumnSort.SORT_KEY_ATTR,
                    makeEditLink: _(this.makeEditLink).bind(this),
                    makeCloneLink: _(this.makeCloneLink).bind(this),
                    stringUtils: stringUtils,
                    maxLength: 100,
                    showVixTab: this.options.showVixTab
                });

                var $html = $(html);
                this.children.columnSort.update($html);
                this.$el.html($html);
                this.$el.append(this.children.flashMessages.render().el);
                this.$('.tooltip-link').tooltip({animation:false, container: 'body'});

                if (this.collection.providers.length == 0) {
                    var learnMoreLink = route.docHelp(
                            this.model.application.get('root'),
                            this.model.application.get('locale'),
                            'learnmore.virtualindex.providers'
                        ),
                        errMessage = splunkUtil.sprintf(_('No providers. %s or %s.').t(),
                            '<a href="'+learnMoreLink+'" target="_blank">'+_('Learn more').t()+' <i class="icon-external"></i></a>',
                            '<a href="vix_provider_new">'+_('Create new provider').t()+'</a>'
                        );
                    this.children.flashMessages.flashMsgHelper.addGeneralMessage('vix_no_providers',
                        {
                            type: splunkDUtils.ERROR,
                            html: errMessage
                        }
                    );
                } else {
                    this.children.flashMessages.flashMsgHelper.removeGeneralMessage('vix_no_providers');
                }
                return this;
            }
        });
    });
