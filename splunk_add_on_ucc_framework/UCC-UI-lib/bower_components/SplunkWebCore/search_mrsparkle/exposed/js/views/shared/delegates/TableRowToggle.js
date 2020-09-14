define(
    [
        'jquery',
        'underscore',
        'views/shared/delegates/Base',
        'util/keyboard'
    ],
    function(
        $,
        _,
       DelegateBase,
       keyboard
    ){
        return DelegateBase.extend({
            initialize: function() {
                 DelegateBase.prototype.initialize.apply(this, arguments);
            },
            toggleRow: function($row, collapseOthers) {
                    var $cell = $row.find('td.expands'),
                        $arrow = $cell.find('i'),
                        $nextrow = $row.next('tr.field-row'),
                        rowunselected = $arrow.hasClass('icon-triangle-right-small'),
                        $moreInfo = $row.next('tr.more-info');
                   
                    (rowunselected) ? $row.trigger('expand'): $row.trigger('collapse');
                    (rowunselected) ? $nextrow.trigger('expand'): $nextrow.trigger('collapse');

                    if ($row.hasClass('expanded')) {  
                        $arrow.addClass('icon-triangle-right-small').removeClass('icon-triangle-down-small');
                        $row.removeClass('expanded');
                        $cell.attr('rowspan', '1');
                        $moreInfo.hide().trigger('collapse');
                    } else {
                        collapseOthers && this.toggleRow($row.siblings('.expanded'), false);
                        $arrow.removeClass('icon-triangle-right-small').addClass('icon-triangle-down-small');
                        $row.addClass('expanded');
                        $moreInfo.length && $cell.attr('rowspan', '2');
                        $moreInfo.show().trigger('expand');
                    }
            },
            modalize: function($row) {
               var topRowHeight = 0, activeRowHeight = 0;
               this.$top = $('<div/>');
               this.$bottom = $('<div/>');
               $row.parent().parent().after(this.$top).after(this.$bottom);
               
               $row.prevAll(':visible').each(function(index, el) {
	               //correct height!!
                   topRowHeight += $(el).outerHeight(true);
	           });

               activeRowHeight = $row.outerHeight(true);
               this.$top.css({
                   'position': 'absolute',
                   'top': '0px',
                   'left': '0px',
                   'right': '0px',
                   'height': topRowHeight + 'px',
                   'background-color': '#666',
                   'opacity': '0.3'
               });
               /*
                this.$bottom.css({
                   'position': 'absolute',
                   'left': '0px',
                   'right': '0px',
                   'bottom': '0px',
                   'top': (topRowHeight + activeRowHeight) + 'px',
                   'background-color': '#666',
                   'opacity': '0.3'
               });
               */
               /*
               console.log($row.siblings('td').length)
               $row.siblings().find('td').css('opacity', 0.2).css('background-color', '#666');
               $row.css('opacity', 1);
                */
            },
            events: {
                'click td.expands': function(e) {
                    var $row = $(e.currentTarget).closest('tr');
                    if (this.options.disabledClass
                        && $row.find('.' + this.options.disabledClass).get(0)) {
                        return false;
                    }
                    this.toggleRow($row, this.options.collapseOthers);
                    
                    //modalize logic goes here!!                   
                    //this.options.modalize && this.modalize($row);
                },
                'keydown td.expands': function(e) {
                    if (this.options.allowKeyToggle && e.which === keyboard.KEYS.ENTER) {
                        var $row = $(e.currentTarget).closest('tr');
                        if (this.options.disabledClass
                            && $row.find('.' + this.options.disabledClass).get(0)) {
                            return false;
                        }
                        this.toggleRow($row, this.options.collapseOthers);
                        e.preventDefault();
                    }
                },
                'click td.expands a': function(e) {
                    e.preventDefault();
                }
            }
        });
    }
);
