define([
    'jquery',
    'module',
    'views/Base',
    'contrib/text!views/clustering/peer/PeerDetails.html',
    'bootstrap.tooltip'
],
    function(
        $,
        module,
        BaseView,
        PeerDetailsTemplate,
        bsToolTip
        ) {
        return BaseView.extend({
            moduleId: module.id,
            tagName: 'dl',
            className: 'list-dotted',
            template: PeerDetailsTemplate,
            initialize: function(options) {
                var self = this;
                BaseView.prototype.initialize.call(this, options);
                this.model.peerStatus.on('change reset', function(){
                    self.render.call(this);
                });
                // Please contact ykou if you have any question
                // The reason changed the event from 'change reset' to 'sync' is that,
                // we only want to update this page when the setting is successfully saved.
                // The 'sync' event is triggered only when the .save() method succeeded.
                // Please refer to line 102 to line 114 in views/clustering/config/PeerSetup.js.
                // Here if the event is 'change reset', this listener will be triggered when
                // this.model.clusterConfig.transposeToRest() method is called, because it contains .set() methods
                // which would trigger 'change' event. But, the data haven't been sent to server yet, it is just stored
                // in the model.
                // The data is sent to server when this.model.clusterConfig.save() method is called.
                // Calling save with new attributes will cause a "change" event immediately, a "request" event as the
                // Ajax request begins to go to the server, and a "sync" event after the server has acknowledged the
                // successful change. Pass {wait: true} if you'd like to wait for the server before setting
                // the new attributes on the model.
                // http://backbonejs.org/#Model-save
                // Here, we only want to update this view when the server acknowledged the successful change.
                // =================================================================================================
                // In addition, we need to change it from this.model.clusterConfig.entry.content
                // to this.model.clusterConfig, otherwise it would not be able to capture the 'sync' event.
                // I guess the reason is that the 'sync' event is triggered by the .save() method, and we are
                // actually calling the .save() method from this.model.clusterConfig model instead of
                // this.model.clusterConfig.entry.content model.
                // I'm not 100% sure, please let me know if there's anything wrong.
                this.model.clusterConfig.on('sync', function(){
                    self.render.call(this);
                });
            },
            render: function() {
                var html = this.compiledTemplate(this.model);
                this.$el.html(html);
                this.$('.tooltip-link').tooltip({animation:false, container: 'body'});
                return this;
            }
        });
    });
