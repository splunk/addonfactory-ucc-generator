define(['jquery', 'jquery.ui.widget', 'jquery.ui.position'], function($){
    return $.widget( "splunk.slidenav", {
        options: {
            levelTemplate: '',
            navData: {},
            childPropertyName: 'children',
            backText: 'Back'
        },
        _create: function(){
            var self = this;
            this.isAnimating = false;
            this.$el = $(this.element);
            this.$wrap = $('<div class="auto"></div>');
            this.$el.append(this.$wrap);
            this._chain = [this.addLevel(this.options.navData)];
            this.$backButton = $(self.templateBack());
            this.$el.prepend(this.$backButton);
            this.$backButton.on('click', function(event){
                self.back();
                event.preventDefault();
            });
            this.$el.on('click', 'LI', function(event){
                var li = $(event.target).closest('LI');
                self.select(li, event);
            });
        },
        addLevel: function(navData){
            var newLevel = $(this.options.levelTemplate(navData));
            this.$wrap.append(newLevel);
            if(this._chain){
                newLevel.position({
                    of: this._chain[this._chain.length-1],
                    my: 'left top',
                    at: 'right top',
                    collision: 'none',
                    offset: "0 0"
                });
            }
            newLevel.data('slidenav', navData);
            return newLevel;
        },
        select: function(selected, event){
            if(this.isAnimating){
                return false;
            }
            var ul = selected.closest('ul'),
                navData = ul.data('slidenav'),
                selectedIndex = selected.data("index");
            selected.find('a').addClass('slideNavActiveParent');
            selected = navData[this.options.childPropertyName][selectedIndex];
            if(selected[this.options.childPropertyName] && selected[this.options.childPropertyName].length > 0){
                if(event){
                    event.preventDefault();
                }
                this.next(selected);
            }else{
                this._trigger('select', event, selected);
            }
        },
        next: function(selected){
            var current = this._chain[this._chain.length-1] || null;
            selected.domReference = selected.domReference || this.addLevel(selected);
            this._chain.push(this.slide(selected.domReference.show(), function(){
                current.find('a').prop('tabindex', '-1');
                selected.domReference.find('a').first().focus();
            }));
            this.$backButton.show();
        },
        back: function(){
            if(this._chain.length <= 1 || this.isAnimating){
                return false;
            }
            if(this._chain.length === 2){
                this.$backButton.hide();
            }
            var $hide = this._chain.pop(),
                to = this._chain[this._chain.length-1];
            to.find('.slideNavActiveParent').removeClass('slideNavActiveParent').focus();
            this.slide(to, function(){
                $hide.scrollTop(0).hide();
                to.find('a').prop('tabindex', '0');
            });
        },
        slide: function(to, callback){
            var self = this;
            this.$wrap.outerHeight(to.outerHeight());
            this.isAnimating = true;
            this.$wrap.animate({
                left: -to.position().left
            }, {
                duration: 200,
                complete: function(){
                    self.isAnimating = false;
                    if(callback){
                        callback.apply(self, arguments);
                    }
                }
            });
            return to;
        },
        templateBack: function(){
            return this.options.templateBack || '<div class="backbutton" style="display: none;"><a href="#" class="slidenavback "><i class="icon-chevron-left"></i>'+this.options.backText+'</a></div>';
        }
    });
});
