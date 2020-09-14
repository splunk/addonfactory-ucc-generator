define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'shim/Duo',
        'util/console'
    ],
    function (
        $,
        _,
        module,
        BaseView,
        Duo,
        console
    ) {
        return BaseView.extend({
            moduleId: module.id,

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
            },
            handlePostBack: function(formObj) {
                var $form = $(formObj);
                this.model.save({
                    'sig_response': $form.find('input[name=sig_response]').val()
                });
            },
            initializeDuo: function(){
                if (!this.$('#duo_iframe').length) {

                    if (!this.model.get('apiHostname') || !this.model.get('postActionUrl') || !this.model.get('signatureRequest')){
                        console.log('Failed to initialize Duo. One of the required duo coniguration was not available.' +
                            ' (apiHostname='+ this.model.get('apiHostname') +
                            ',postActionUrl='+ this.model.get('postActionUrl') +
                            ',signatureRequest='+ this.model.get('postActionUrl') +')');
                        throw new Error('Unable to configure Duo');
                    }

                    var $loading = this.$('.duo-loading'),
                        $iframe = $('<iframe id="duo_iframe" width="620" height="500" frameborder="0" allowtransparency="true" style="background: transparent;"></iframe>')
                            .appendTo(this.$('.wrapper-container'));
                    $('<form id="duo_form"></form>').appendTo(this.$('.wrapper-container'));
                    $loading.show();

                    Duo.init({
                        'host': this.model.get('apiHostname'),
                        'post_action': this.model.get('postActionUrl'),
                        'sig_request': this.model.get('signatureRequest'),
                        'iframe': $iframe.get(0),
                        'submit_callback': this.handlePostBack.bind(this)
                    });

                    setTimeout(function(){$loading.hide();},3000);
                }
            },
            show: function() {
                this.$el.show();
                this.initializeDuo();
            },
            hide: function() {
                var $iframe = this.$('#duo_iframe');
                if ($iframe) {
                    $iframe.attr('src', 'about:blank');
                    $iframe.remove();
                }
                this.$('#duo_form').remove();
                this.$el.hide();
            },
            loadingMessage: _('Loading multifactor authentication from Duo Security ... ').t(),
            render: function() {
                var html = this.compiledTemplate({
                    loadingMessage: this.loadingMessage
                });
                this.$el.html(html);
                return this;
            },
            template: '<div class="wrapper-container"><div class="duo-loading"><%= loadingMessage %></div></div>'
        });
    }
);