define(
[
    'jquery',
    'underscore',
    'module',
    'models/managementconsole/DmcSettings',
    'views/Base',
    'contrib/text!views/add_data/Initial.html',
    'splunk.util',
    'uri/route',
    './Initial.pcss'
],
function(
    $,
    _,
    module,
    DmcSettings,
    BaseView,
    template,
    splunkUtil,
    route,
    css
){
    /**
     */
    return BaseView.extend({
        template: template,
        moduleId: module.id,

        initialize: function () {
            BaseView.prototype.initialize.apply(this, arguments);
            this.model.wizard.set('currentStep', 'initial');
            this.model.wizard.trigger('enableWizardSteps');

            this.model.dmcSettings = new DmcSettings();
        },

        events: {
            'click .link-wrap': function(e) {
                this.clickButton(e);
                e.preventDefault();
            },
            'keypress .link-wrap': function(e) {
                if (e.keyCode === 13) //ENTER
                    this.clickButton(e);
            }
        },

        clickButton: function(e) {
            var targetId = e.currentTarget.id;
            var setUpload = function(inputMode, wizardSet, wizardUnset) {
                this.model.wizard.set('upload', false);

                if (wizardUnset){
                    this.model.wizard.unset(wizardUnset);
                }

                this.model.wizard.setInputMode(inputMode);
                this.model.wizard.set(wizardSet);

                $(".adddata-header").css("display", "block"); //TODO get working in CSS
                $(".layoutRow").css("position", "absolute"); //TODO get working in CSS
            }.bind(this);

            if (targetId == 'btn-upload') {
                setUpload(0, {
                    inputType: 'file_upload',
                    currentStep: 'selectsource',
                    upload: true
                });
            } else if (targetId == 'btn-monitor') {
                setUpload(1, {
                    currentStep: 'selectsource'
                }, 'inputType');
            } else if (targetId == 'btn-forward') {
                    setUpload(2, {
                        currentStep: 'selectforwarders'
                    });
            }
        },

        render: function () {
            var addDataTutorialLink = route.docHelp(
                this.model.application.get('root'),
                this.model.application.get('locale'),
                'learnmore.adddata.datatutorial'
            );
            var monitorLink = route.docHelp(
                this.model.application.get('root'),
                this.model.application.get('locale'),
                'manager.adddata'
            );
            var troubleshootLink = route.docHelp(
                this.model.application.get('root'),
                this.model.application.get('locale'),
                'learnmore.adddata.troubleshooting'
            );

            var stewieAppsLink = route.manager(
                this.model.application.get('root'),
                this.model.application.get('locale'),
                'search',
                ['apps', 'local']
            );

            var isLite = this.model.serverInfo.isLite(),
                isCloud = this.model.serverInfo.isCloud();

            var template = this.compiledTemplate({
                model: {
                    user: this.model.user
                },
                hasModularInputs: this.collection.modularInputs.length && this.collection.modularInputs.length > 0,
                isLite: isLite,
                isCloud: isCloud,
                stewieAppsLink: stewieAppsLink,
                imgBaseUrl: splunkUtil.make_url('/static/img/skins/default'),
                addDataTutorialLink: addDataTutorialLink,
                monitorLink: monitorLink,
                troubleshootLink: troubleshootLink
            });
            this.$el.html(template);

            $(".adddata-header").css("display", "none"); //TODO get working in CSS
            $(".layoutRow").css("position", "static"); //TODO get working in CSS
            return this;
        }
    });
});
