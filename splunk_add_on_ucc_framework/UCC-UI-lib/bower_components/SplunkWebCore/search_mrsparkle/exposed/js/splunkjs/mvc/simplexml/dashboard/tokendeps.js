define(function(require, exports, module){
    var _ = require('underscore'); 
    var mvc = require('../../mvc');
    var TokenUtils = require('../../tokenutils');
    
    var registry = mvc.Components;
    
    var TokenDependenciesMixin = {
        setupTokenDependencies: function(){
            var tokenDependencies = this.settings.get('tokenDependencies', { tokens: true });            
            if(!tokenDependencies) { this._tokenDepsMet = true; }
            
            TokenUtils.listenToTokenDependencyChange(tokenDependencies, registry, this.handleTokenChange, this);
            
            this.listenTo(this.settings, 'change:tokenDependencies', function(settings, newTokenDependencies) {
                var oldTokenDependencies = settings.previous('tokenDependencies');
                TokenUtils.stopListeningToTokenDependencyChange(oldTokenDependencies, registry);
                TokenUtils.listenToTokenDependencyChange(newTokenDependencies, registry, this._start, this);
            });
            
            this.handleTokenChange();
        },
        handleTokenChange: function() {
            var tokenDependencies = this.settings.get('tokenDependencies', { tokens: true });
            if (TokenUtils.tokenDependenciesMet(tokenDependencies, registry)) {
                this._tokenDepsMet = true;
                this.show();
            } else {
                this._tokenDepsMet = false;
                this.hide();
            }
        },
        stopListeningToTokenDependencyChange: function() {
            var tokenDependencies = this.settings.get('tokenDependencies', { tokens: true });
            TokenUtils.stopListeningToTokenDependencyChange(tokenDependencies, registry);
        },
        tokenDependenciesMet: function(){
            return this._tokenDepsMet;
        },
        show: function() {
            this.$el.removeClass('hidden').trigger('elementVisibilityChanged');
        },
        hide: function() {
            this.$el.addClass('hidden').trigger('elementVisibilityChanged');
        }
    };
    
    return TokenDependenciesMixin;
});