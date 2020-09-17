define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'helpers/grid/RowIterator',
    'views/shared/FlashMessages',
    'views/shared/delegates/ColumnSort',
    'views/shared/dialogs/TextDialog',
    'contrib/text!views/virtual_indexes/IndexesGrid.html',
    'uri/route',
    'util/splunkd_utils',
    'util/string_utils'
],
    function(
        $,
        _,
        module,
        BaseView,
        RowIterator,
        FlashMessagesView,
        ColumnSort,
        TextDialog,
        template,
        route,
        splunkDUtils,
        stringUtils
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
                    model: this.collection.indexes.fetchData,
                    autoUpdate: false
                });
                this.children.flashMessages = new FlashMessagesView({
                    className: 'message-single'
                });

                this.collection.providers.on('change reset', function(){
                    this.numProviders = this.collection.providers.length;
                    this.updateNoIndexesMessage();
                }, this);

                this.collection.indexes.on('change reset', function(){
                    if (this.collection.indexes.length == 0) {
                        this.updateNoIndexesMessage();
                    } else {
                        this.children.flashMessages.flashMsgHelper.removeGeneralMessage('vix_no_indexes');
                    }
                    this.render();
                }, this);

            },
            events: {
                'click .searchAction' : function(e) {
                    var id = $(e.target).parent('td').data('id');
                    this.collection.indexes.trigger('search', this.collection.indexes.get(id).entry.get('name'));
                    e.preventDefault();
                },
                'click .deleteAction' : function(e) {
                    var id = $(e.target).parent('td').data('id');
                    this.collection.indexes.trigger('deleteRequest', this.collection.indexes.get(id));
                    e.preventDefault();
                },
                'click .disableAction' : function(e) {
                    var id = $(e.target).parent('td').data('id');
                    this.collection.indexes.trigger('disableRequest', this.collection.indexes.get(id));
                    e.preventDefault();
                },
                'click .enableAction' : function(e) {
                    var id = $(e.target).parent('td').data('id');
                    this.collection.indexes.trigger('enableRequest', this.collection.indexes.get(id));
                    e.preventDefault();
                }
            },
            
            /**
             * Returns true if there is an accelerated datamodel that depends on this vix.
             */
            hasDependentDataModel: function(vixName) {
                return _(this.collection.dataModels.models).any(function(dataModel) {
                    if (dataModel.entry.content.acceleration.get('enabled')) {
                        return _(dataModel.entry.content.objects.models).any(function(obj) {
                            if (obj.attributes && obj.attributes.constraints && obj.attributes.constraints.length) {
                                var search = obj.attributes.constraints[0].search || '';
                                if (search.startsWith('index=')) {
                                    return (search.slice('index='.length) === vixName);
                                } 
                            }
                            return false;
                        }, this);
                    }
                    return false;
                },this);
            },

            showDataModelWarningModal: function() {
                this.children.warnAccelerationDialog = new TextDialog({id: 'modal_warn'});
                this.children.warnAccelerationDialog.settings.set('primaryButtonLabel', undefined);
                this.children.warnAccelerationDialog.settings.set('cancelButtonLabel', undefined);
                this.children.warnAccelerationDialog.on('hidden', this.destroyWarnAccelerationDialogHandler, this);
                this.children.warnAccelerationDialog.settings.set('titleLabel', _('Data Model Acceleration Warning').t());
                this.children.warnAccelerationDialog.setText(
                    _('This Virtual Index has an accelerated data model that depends on it. Please turn off acceleration on all dependent data models before changing the virtual index.').t());
                $('body').append(this.children.warnAccelerationDialog.render().el);
                this.children.warnAccelerationDialog.show();
            },
            
            makeEditLink: function(id) {
                return route.manager(
                    this.model.application.get('root'),
                    this.model.application.get('locale'),
                    this.model.application.get('app'),
                    'vix_index_new',
                    {
                        data: {
                            id: id
                        }
                    }
                );
            },

            makeProviderLink: function(id) {
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

            updateNoIndexesMessage: function() {
                if (this.collection.indexes.length == 0) {
                    var learnMoreLink = route.docHelp(
                            this.model.application.get('root'),
                            this.model.application.get('locale'),
                            'learnmore.virtualindex.indexes'
                        ),
                        errMessage = _('No indexes.').t() +
                            (this.numProviders==0?_(' You must have at least one provider to create indexes. ').t():'') +
                            '<a href="'+learnMoreLink+'" target="_blank">' +
                            _('Learn more.').t()+' <i class="icon-external"></i></a>';
                    this.children.flashMessages.flashMsgHelper.addGeneralMessage('vix_no_indexes',
                        {
                            type: splunkDUtils.ERROR,
                            html: errMessage
                        });
                } else {
                    this.children.flashMessages.flashMsgHelper.removeGeneralMessage('vix_no_indexes');
                }
            },
            render: function() {
                var rowIterator = new RowIterator({ });
                var html = this.compiledTemplate({
                    _:_,
                    collection: this.collection.indexes,
                    eachRow: rowIterator.eachRow,
                    sortKeyAttribute: ColumnSort.SORT_KEY_ATTR,
                    makeEditLink: _(this.makeEditLink).bind(this),
                    makeProviderLink: _(this.makeProviderLink).bind(this),
                    stringUtils: stringUtils,
                    maxIndexLength: 80,
                    maxProviderLength: 25
                });

                var $html = $(html);

                this.children.columnSort.update($html);
                this.$el.html($html);
                this.$el.append(this.children.flashMessages.render().el);

                return this;
            }
        });
    });
