define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'splunk.util',
    'util/string_utils',
    'views/Base',
    'views/shared/delegates/Popdown',
    'views/shared/Button',
    './Section',
    './Modal',
    'uri/route',
    'contrib/text!./MenuContents.html',
    './MenuContents.pcssm'
],
function(
    $,
    _,
    Backbone,
    module,
    splunk_util,
    string_utils,
    BaseView,
    Popdown,
    ButtonView,
    Section,
    SettingsModal,
    route,
    systemMenuTemplate,
    css
){
    return BaseView.extend({
        moduleId: module.id,
        template: systemMenuTemplate,
        css: css,
        initialize: function() {
            var self = this;
            BaseView.prototype.initialize.apply(this, arguments);
            self.debouncedRender();
            this.collection.sections.on('ready', function(){
                self.debouncedRender();
            }, this);
        },
        events: {
            'click [data-action=show-all]': 'showAllSections'
        },
        render: function() {
            var root = this.model.application.get('root'),
                locale = this.model.application.get('locale'),
                app = this.model.application.get('app'),
                managementConsoleApp = this.collection.apps.findByEntryName('splunk_monitoring_console'),
                managementConsoleAvailable = (managementConsoleApp && !managementConsoleApp.entry.content.get("disabled")),
                canShowMore = this.collection.managers.canShowMore(),
                html = this.compiledTemplate({
                    userCanAddData:
                        this.model.user.canAddData() &&
                        this.collection.managers.findByEntryName('adddata'),
                    addDataURL: route.addData(root, locale, (app === 'launcher' ? undefined : app)),
                    userCanExploreData:
                        this.model.user.canExploreData() &&
                        this.collection.managers.findByEntryName('explore_data'),
                    exploreDataURL: route.exploreData(root, locale, app),
                    managementConsoleAvailable: managementConsoleAvailable,
                    managementConsoleURL: route.managementConsole(root, locale),
                    canShowMore: canShowMore,
                    css: css
                });
            var $html = $(html);
            var $body = $html.filter("[data-popdown-role=body]");

            if (canShowMore) {
                this.children.showMore = new ButtonView({label: _('Show All Settings').t(), action: 'show-all'});
                this.children.showMore.render().appendTo($html.filter('[data-popdown-role=footer]'));
            }

            this.addSections($body);
            if(this.sectionCount < 2) {
                $body.attr('class' , css.menuNarrow);
            }

            this.$el.html($html);

            this.children.popdown = new Popdown({el:this.el, mode: 'dialog'});

            return this;
        },
        addSections: function($body){
            var self = this;
            this.sectionCount = 0;
            this.collection.sections.each(function(section){
                if (section.get('items') && section.get('items').length === 0) {
                    return;
                }
                var sectionView = self.children[section.get('id')] = new Section({
                    model: section
                });

                self.sectionCount++;
                $body.append(sectionView.render().el);
            });
        },
        showAllSections: function(evt) {
            this.children.dialog = new SettingsModal({
                collection: {
                    managers: this.collection.managers,
                    sections: this.collection.sections
                },
                model: {
                    application: this.model.application
                },
                onHiddenRemove: true
            });
            this.children.dialog.show();
        }
    });
});
