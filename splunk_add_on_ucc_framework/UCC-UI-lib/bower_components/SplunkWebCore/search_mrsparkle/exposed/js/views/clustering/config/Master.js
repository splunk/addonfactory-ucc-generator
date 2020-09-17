define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'collections/services/Messages',
    'views/shared/Modal',
    'views/shared/RestartRequired',
    'views/shared/Restart',
    'views/clustering/SuccessContents',
    'views/clustering/config/NodeType',
    'views/clustering/config/MasterSetup',
    'views/clustering/config/PeerSetup',
    'views/clustering/config/SearchHeadSetup',
    'uri/route',
    'util/console'
],
    function(
        $,
        _,
        Backbone,
        module,
        MessageCollection,
        Modal,
        RestartRequired,
        Restart,
        SuccessContents,
        NodeType,
        MasterSetup,
        PeerSetup,
        SearchSetup,
        route,
        console
        ) {
        return Modal.extend({
            moduleId: module.id,
            className: Modal.CLASS_NAME,
            /**
             * @param {Object} options {
        *       model: <models.>,
        *       collection: <collections.services.>
        * }
             */
            initialize: function(options) {
                Modal.prototype.initialize.apply(this, arguments);
                this.messages = new MessageCollection();
                /*
                 this.model.wizard is the bus for all the child pages (members of this.children).
                  startPage: the page shown on the first load of the dialog
                  currentPage: currently displayed child page
                 Events:
                  next: go to the next page
                  back: go one page back
                 */

                this.model = $.extend({}, this.model, {wizard: this.model.wizard});

                this.model.wizard.on('success', function() {
                    this.hide();
                    var return_to = route.manager(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        this.model.application.get('app'),
                        'clustering');
                    var successModal = new RestartRequired({
                        model: {
                            serverInfo: this.model.serverInfo
                        },
                        bodyView : new SuccessContents({
                            model: this.model
                        }),
                        restartCallback: function (){
                            successModal.hide();
                            var restartModal = new Restart({
                                model: {
                                    serverInfo: this.model.serverInfo
                                }
                            });
                            $('body').append(restartModal.render().el);
                            restartModal.show();
                        }.bind(this),
                        return_to: return_to
                    });
                    $('body').append(successModal.render().el);
                    successModal.show();
                }, this);

                this.children.start = new NodeType({
                    model: this.model
                });
                this.children.master = new MasterSetup({
                    model: this.model
                });
                this.children.peer = new PeerSetup({
                    model: this.model
                });
                this.children.search = new SearchSetup({
                    model: this.model
                });

                if (this.options && this.options.startView) {
                    this.model.wizard.set('startPage', this.options.startView);
                } else {
                    this.model.wizard.set('startPage', 'start');
                }

                this.model.wizard.set('currentPage', this.model.wizard.get('startPage'));
                this.model.wizard.on('next', function() {
                    var pageId = this.model.wizard.get('currentPage'),
                        page = this.children.hasOwnProperty(pageId)? this.children[pageId] : null;
                    if (pageId === 'start') {
                        var nextPageId = this.model.wizard.get('mode'),
                            nextPage = this.children.hasOwnProperty(nextPageId)? this.children[nextPageId] : null;
                        if (nextPage) {
                            page.$el.hide();
                            nextPage.$el.show();
                            this.model.wizard.set('currentPage', nextPageId);
                        } else {
                            console.error('Cannot navigate to '+nextPageId );
                        }
                    } else if (_.contains(['master','peer','search'], pageId)) {
                        this.messages.fetch().done(function() {
                            var restartRequired = this.messages.find(function(i) {
                                return i.entry.get('name')=='restart_required';
                            });
                            if (restartRequired) {
                                this.model.wizard.set('currentPage', 'restart');
                                this.model.wizard.trigger('success');
                            } else {
                                this.hide();
                            }
                        }.bind(this));
                    }
                }, this);

                this.model.wizard.on('back', function() {
                    this.refreshConfig();
                    var pageId = this.model.wizard.get('currentPage'),
                        page = this.children.hasOwnProperty(pageId)? this.children[pageId] : null;
                    this.model.wizard.set('currentPage', 'start');
                    page.$el.hide();
                    this.children.start.$el.show();
                }, this);
            },
            refreshConfig: function() {
                this.model.clusterConfig.fetch().done(function() {
                    this.model.clusterConfig.transposeFromRest();
                }.bind(this));
            },
            render: function() {
                this.refreshConfig();
                this.$el.append(this.children.start.render().el);
                this.$el.append(this.children.master.render().el);
                this.$el.append(this.children.peer.render().el);
                this.$el.append(this.children.search.render().el);
                var v;
                for (v in this.children) {
                    if (this.children.hasOwnProperty(v)) {
                        if (v === this.model.wizard.get('startPage')) {
                            this.children[v].$el.show();
                        } else {
                            this.children[v].$el.hide();
                        }
                    }
                }
                return this;
            }
        });
    });
