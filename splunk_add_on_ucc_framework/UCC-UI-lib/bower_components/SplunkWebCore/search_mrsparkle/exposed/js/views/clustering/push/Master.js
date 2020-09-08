define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'views/clustering/push/PushStatus',
    'views/clustering/push/PushProgress',
    'views/clustering/push/RestartProgress',
    'views/clustering/push/PushErrors',
    'views/clustering/push/ConfirmDialog',
    'uri/route',
    'contrib/text!views/clustering/push/Master.html',
    './Master.pcss'
],
function(
    $,
    _,
    module,
    BaseView,
    PushStatus,
    PushProgress,
    RestartProgress,
    PushErrors,
    ConfirmDialog,
    route,
    Template,
    css
){
        return BaseView.extend({
            moduleId: module.id,
            template: Template,
            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.children.pushStatus = new PushStatus({
                    model: this.model
                });
                this.children.pushProgress = new PushProgress({
                    model: {
                        pushModel: this.model.pushModel,
                        masterInfo: this.model.masterInfo
                    }
                });
                this.children.restartProgress = new RestartProgress({
                    model: {
                        pushModel: this.model.pushModel,
                        masterInfo: this.model.masterInfo
                    }
                });
                this.children.pushErrors = new PushErrors({
                    model: {
                        pushModel: this.model.pushModel
                    }
                });

                this.model.pushModel.on('change:state', function() {
                    /*
                    Toggle between status and progress views when progress begins or ends
                     */
                    if (this.model.pushModel.get('state') == 'validation') {
                        this.children.pushStatus.$el.hide();
                        this.children.pushProgress.reset();
                        this.children.pushProgress.$el.show();
                        this.$('a.btn-primary').hide();
                    } else if (this.model.pushModel.get('state') == 'restart') {
                        this.children.restartProgress.reset();
                        this.children.restartProgress.$el.show();
                    } else if (this.model.pushModel.get('state') == 'idle') {
                        setTimeout(function() {  // let user contemplate on the results for a second
                            this.children.pushStatus.$el.show();
                            this.children.pushProgress.$el.hide();
                            this.children.restartProgress.$el.hide();
                            this.$('a.btn-primary').show();
                        }.bind(this), 1000);
                    }
                }, this);

                this.model.pushModel.on('tick', function() {
                    if (_.isEmpty(this.model.pushModel.get('errors'))) {
                        this.children.pushErrors.$el.hide();
                    } else {
                        this.children.pushErrors.$el.show();
                    }
                }, this);
            },

            events: {
                'click a.btn-primary': function(e) {
                    this.children.confirmDialog = new ConfirmDialog({
                        model: this.model
                    });
                    $('body').append(this.children.confirmDialog.render().el);
                    this.children.confirmDialog.show();
                    e.preventDefault();
                }
            },

            render: function() {
                var root = this.model.application.get('root'),
                    locale = this.model.application.get('locale'),
                    docLink = route.docHelp(root, locale, 'manager.clustering.bundle'),
                    learnMoreLink = route.docHelp(root, locale, 'learnmore.clustering.bundle');
                var html = this.compiledTemplate({
                    docLink: docLink,
                    learnMoreLink: learnMoreLink
                });
                this.$el.html(html);
                this.$('.section-bg').append(this.children.pushStatus.render().el);
                this.$('.section-bg').append(this.children.pushProgress.render().el);
                this.$('.section-bg').append(this.children.restartProgress.render().el);
                this.$('.section-bg').append(this.children.pushErrors.render().el);
                this.children.pushProgress.$el.hide();
                this.children.restartProgress.$el.hide();
            }
        });

    });
