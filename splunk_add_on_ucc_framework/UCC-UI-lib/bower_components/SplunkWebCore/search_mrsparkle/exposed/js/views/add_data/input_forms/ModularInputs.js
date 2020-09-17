define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/waitspinner/Master',
        'uri/route'
    ],
    function (
        $,
        _,
        module,
        BaseView,
        WaitSpinner,
        route
    ) {
        return BaseView.extend({
            moduleId: module.id,
            className: 'modularInputView asd',
            initialize: function (options) {
                BaseView.prototype.initialize.apply(this, arguments);
                this.children.waitSpinner = new WaitSpinner();
                this.model.wizard.on('saveModularInput', this.saveModularInput, this);
                window.addEventListener("message", this.receiveMessage.bind(this));
            },
            receiveMessage: function(e){
                //the iframe hosting modular input will postMessage to tell us the input was saved (and we can go to next step)
                if(e.data === 'inputsaved'){
                    this.iframe.hide();
                    this.children.waitSpinner.$el.show();
                    this.model.wizard.stepForward(true);
                }
            },
            render: function () {
                this.iframe = $('<iframe/>', {
                    'class': 'modularInputIframe',
                    'src': this.getModInputUrl.call(this),
                    'load': this.onIframeLoad.bind(this)
                });

                this.$el.append($('<div class="spinner-placeholder"/>').html(this.children.waitSpinner.render().el));
                this.children.waitSpinner.start();
                this.$el.append(this.iframe);
                this.iframe.hide();
                return this;
            },
            getModInputUrl: function() {
                var inputType = this.model.wizard.get('inputType'),
                    baseUrl = route.manager(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app'),
                        'data'
                    );

                return baseUrl + '/inputs/' + inputType + '/_new?action=edit&embedded=1';
            },
            saveModularInput: function() {
                var submit = this.iframe.contents().find('button[type="submit"]');
                submit.click();
                this.iframe.contents().scrollTop(0);
            },
            onIframeLoad: function() {
                var newStyle = '\
                    body.splView-_admin { background: none; }  \
                    .entityEditForm { border: none; margin: 20px; } \
                    .entityEditForm fieldset legend {padding-left: 190px;}\
                    label {float: left; width: 170px; margin-right: 20px; text-align: right; } \
                    p.exampleText {margin-left: 190px; } \
                    p.fieldsetHelpText { padding-left: 190px; }\
                    ';

                var contents = this.iframe.contents().find('head')
                    .append($('<style type="text/css">  ' + newStyle + '  </style>'));

                this.children.waitSpinner.$el.hide();
                this.iframe.show();
            }
        });
    }
);
