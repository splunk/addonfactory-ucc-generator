define([
    'jquery',
    'underscore',
    'views/shared/delegates/Base'
],function(
    $,
    _,
    DelegateBase
    
){
    return DelegateBase.extend({
      awake: true,
      initialize: function(options) {
        var defaults = {
          offset: 0,
          affix: '> div',
          affixTopClassName: 'affix-top' 
        };
        _.defaults(options, defaults);
        DelegateBase.prototype.initialize.apply(this, arguments);
        
        this.$container = this.$el.parent();
        this.$window = $(window);
        this.windowHeight = this.$window.height();
        
        this.activate();
        this.resizeWindow(); 
      },
      activate: function(options) {
          options || (options = {});
          if(this.active) {
              return DelegateBase.prototype.activate.call(this, options);
          }
        
          this.$window.on('scroll.affix.' + this.cid, this.checkPosition.bind(this));
          this.$window.on('resize.affix.' + this.cid, this.resizeWindow.bind(this));
          this.$window.on('click.affix.' + this.cid,  function() {
              _.defer(this.checkPosition.bind(this));
          }.bind(this));

          this.checkPosition();
          this.resizeWindow();
          
          return DelegateBase.prototype.activate.call(this, options);
      },
      deactivate: function(options) {
          options || (options = {});
          if(!this.active) {
              return DelegateBase.prototype.deactivate.apply(this, arguments);
          }
          DelegateBase.prototype.deactivate.apply(this, arguments);
          
          this.$window.off('.' + this.cid);
          delete this.affixed;

          return this;
      },
      resizeWindow:function() {
          this.windowHeight = this.$window.height();
          this.checkPosition();
      },
      checkPosition: function () {
        if (!this.$el.is(':visible')) return;
    
        var scrollTop = this.$window.scrollTop(),
            containerTop = this.$el.offset().top,
            containerHeight = this.$el.height(),
            affix;
    
        affix = scrollTop > containerTop - this.options.offset;
        
        if (this.affixed === affix) return;
    
        this.affixed = affix;
        this.$(this.options.affix)[affix ? 'addClass' :  'removeClass'](this.options.affixTopClassName);
      },
      disable: function() {
        this.$(this.options.affix).addClass('disabled');
      },
      enable: function() {
        this.$(this.options.affix).removeClass('disabled');
      },
      remove: function() {
          $(window).off('scroll.affix.' + this.cid);
          $(window).off('resize.affix.' + this.cid);
          $(window).off('click.affix.' + this.cid);
          
          return DelegateBase.prototype.deactivate.apply(this, arguments);
      }
    });
});
