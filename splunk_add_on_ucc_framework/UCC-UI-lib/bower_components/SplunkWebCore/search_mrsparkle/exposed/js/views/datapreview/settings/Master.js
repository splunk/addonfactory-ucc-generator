define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/datapreview/settings/SettingsPanels',
        'views/shared/FlashMessages',
        'contrib/text!views/datapreview/settings/Master.html',
        'views/shared/knowledgeobjects/SourcetypeMenu',
        'util/splunkd_utils',
        'bootstrap.tooltip' //NO IMPORT
    ],
    function(
        $,
        _,
        module,
        BaseView,
        SettingsPanels,
        FlashMessage,
        settingsTemplate,
        SourcetypeMenu,
        splunkdUtils
    ){
        return BaseView.extend({
            moduleId: module.id,
            template: settingsTemplate,
            className: 'settings-wrapper',
            events: {
                'click .btn-saveAs': 'showSaveDialog'
            },
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.children.sourcetypeMenu = new SourcetypeMenu({
                    model: this.model,
                    collection: this.collection,
                    deferreds: this.options.deferreds,
                    addNewSourcetypeLink: true,
                    addLabel: true
                });

                this.children.settingsPanels = new SettingsPanels({
                    collection: this.collection,
                    model: this.model
                });

                this.errorTypes = [splunkdUtils.FATAL, splunkdUtils.ERROR, splunkdUtils.NOT_FOUND];
                this.children.flashMessage = new FlashMessage({
                    model: {
                        searchJob: this.model.searchJob,
                        searchJobControl: this.model.searchJob.control,
                        report: this.model.report,
                        preview: this.model.preview,
                        source: this.model.sourceModel,
                        sourcetype: this.model.sourcetypeModel
                    },
                    whitelist: this.errorTypes
                });

                function isDefaultSorucetypeName(){
                    var name = this.model.sourcetypeModel.entry.get('name');
                    if(name === 'default' || name === '__auto__learned__') {
                        return true;
                    }
                    return false;
                }

                this.model.sourcetypeModel.on('sync', function () {
                    if (isDefaultSorucetypeName.call(this)) {
                        this.model.report.entry.content.set('display.events.type', 'list');
                        this.updateSaveButton(true);
                    } else {
                        this.updateSaveButton(false);
                    }
                }.bind(this));


                this.model.sourcetypeModel.on('change', function () {
                    if (isDefaultSorucetypeName.call(this)) {
                        this.model.report.entry.content.set('display.events.type', 'list');
                    }
                    this.updateSaveButton(true);
                }.bind(this));

            },
            showSaveDialog: function(e){
                this.model.previewPrimer.trigger('showSaveDialog', e);
            },
            updateSaveButton: _.debounce(function (highlight) {
                //events that call this are chatty, so lets debounce it to prevent flicker in the UI
                if (highlight) {
                    this.$('.btn-saveAs').addClass('btn-primary');
                } else {
                    this.$('.btn-saveAs').removeClass('btn-primary');
                }
            }, 100),
            render: function() {
                if (this.children.sourcetypeMenu) {
                    this.children.sourcetypeMenu.detach();
                }
                if (this.children.settingsPanels) {
                    this.children.settingsPanels.detach();
                }

                this.$el.html(this.compiledTemplate({}));

                this.$('.source-type').append(this.children.sourcetypeMenu.render().el);
                this.$('.settingsPanels').append(this.children.settingsPanels.render().el);

                this.$('.flashMessageWrapper').append(this.children.flashMessage.render().el);

                //TODO move this to more specific view
                this.$('.tooltip-link').tooltip({
                    animation:false,
                    container: 'body',
                    placement: 'bottom'
                });

                return this;
            }
        });
    }
);
