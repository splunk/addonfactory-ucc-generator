define(['jquery', 'underscore', 'module', 'views/Base', 'util/splunkd_utils', 'bootstrap.tooltip'], function($, _, module, Base, splunkd_utils /* bootstrap tooltip */) {
    return Base.extend({
        moduleId: module.id,
        className: 'playpause btn-pill btn-square',
        tagName: 'a',
        attributes: {
            "href": "#"
        },
        initialize: function(){
            Base.prototype.initialize.apply(this, arguments);
            this.activate();
        },
        
        startListening: function() {
            this.listenTo(this.model.entry.content, 'change', this.render);  
        },
        
        events: {
            'click': function(e) {
                e.preventDefault();
                
                if (!this.isActive()) {
                    return true;
                }
                
                var action = $(e.currentTarget).data('mode'),
                    options = {
                        success: function() {
                            this.model.fetch();
                        }.bind(this),
                        error: function(model, response) {
                            if (response.status == splunkd_utils.NOT_FOUND) {
                                this.model.trigger('jobControls:notFound');
                            }
                        }.bind(this)
                    };
                    
                if (action === 'pause') {
                    this.model.pause(options);
                }
                else if (action === 'unpause') {
                    this.model.unpause(options);
                }
            }
        },
        
        isActive: function() {
            return (this.model.isRunning() || this.model.entry.content.get('isPaused')) && this.model.entry.acl.canWrite();
        },
        
        render: function() {
            var isPaused = this.model.entry.content.get('isPaused'),
                currentMode = this.$el.data('mode'),
                attachTooltipTo = this.options.attachTooltipTo || this.$el;
                
            // Don't update the DOM unless something is changing to avoid button/tooltip flickering. (SPL-80413)
            // When reading this code keep in mind that the 'mode' of the button is what it will do if clicked
            // as opposed to the state of the job (i.e. for a paused job the 'mode' is 'unpause').
            if(isPaused && currentMode !== 'unpause') {
                this.$el.data('mode', 'unpause').html('<i class="icon-play"></i><span class="hide-text">' + _("Resume").t() + '</span>');
                // We have to blur the element before destroying the tooltip or Firefox will get confused (SPL-80012).
                // Same thing below when pausing.
                this.$el.blur().tooltip('destroy').tooltip({animation:false, title:_('Resume').t(), container: attachTooltipTo});
            }
            if(!isPaused && currentMode !== 'pause') {
                this.$el.data('mode', 'pause').html('<i class="icon-pause"></i><span class="hide-text">' + _("Pause").t() + '</span>');
                this.$el.blur().tooltip('destroy').tooltip({animation:false, title:_('Pause').t(), container: attachTooltipTo});
            }
            this.$el.css("display", '');
            return this;
        }
    });
});
