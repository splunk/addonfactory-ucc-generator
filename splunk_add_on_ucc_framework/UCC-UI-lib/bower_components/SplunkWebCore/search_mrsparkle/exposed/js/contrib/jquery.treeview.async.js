/*
 * Async Treeview 0.1 - Lazy-loading extension for Treeview
 * 
 * http://bassistance.de/jquery-plugins/jquery-plugin-treeview/
 *
 * Copyright (c) 2007 Jörn Zaefferer
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 *
 * Revision: $Id$
 *
 */

;(function($) {

function load(settings, root, child, container, offset) {
	function createNode(parent) {
        var fileSize = this.hasChildren ? '' : _('Size: ') + (this.fileSize||'0').toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + _('Kb');
		var current = $("<li/>").attr("id", escape(this.id || "")).append($("<span/>").text(this.text).attr('title',fileSize));
        if (settings.separate_children && this.hasChildren && this.offset == undefined) {
            if ($('.hasChildren', parent).length > 0) {
                $('.hasChildren:last', parent).after(current);
            } else {
                current.prependTo(parent);
            }
        } else {
            current.appendTo(parent);
        }
        
		if (this.classes) {
			current.children("span").addClass(this.classes);
		}
		if (this.expanded) {
			current.addClass("open");
		}
        if (this.offset != undefined) {
            current.attr('offset', this.offset);
            current.addClass('showmore')
        }
        if (!this.selectable) {
            current.addClass('noSelection')
        }
        if (this.hasChildren != undefined && !this.hasChildren) {
            // to make showmore clickable
            current.append('<ul/>');
            current.addClass('leaf');
        }        
		if (this.hasChildren || this.children && this.children.length) {
			var branch = $("<ul/>").appendTo(current);
			if (this.hasChildren) {
				current.addClass("hasChildren");
                if (!this.children) {
                    createNode.call({
                        classes: "placeholder",
                        text: "",
                        children:[]
                    }, branch);
                }
			}
			if (this.children && this.children.length) {
				$.each(this.children, createNode, [branch])
			}
		}
	}
    root = unescape(root).replace(/&amp;/g,'&')
                         .replace(/&#39;/g,'\'')
                         .replace(/&lt;/g,'<')
                         .replace(/&gt;/g,'>');
	$.ajax($.extend(true, {
		url: settings.url,
		dataType: "json",
        cache: false,
		data: {
			root: root,
            offset: offset
		},
		success: function(response) {
            if (!response.success) {
                settings.showMessage(response.messages[0].message);
                if (container.children.length > 0) {
                    // if not initial load, disable current node, otherwise display root
                    settings.disableCurrentNode();
                    return;
                }
            }
            
            $(child).find('li[id=""]').remove();
            $.each(response.data, createNode, [child]);
            if (response.offset + response.count < response.total) {
                createNode.call({'text':_('show more'), 'hasChildren':'true', 'offset':response.offset+response.count}, child);
            }
            $(container).treeview({add: child});
	    }
	}, settings.ajax));
}

var proxied = $.fn.treeview;
$.fn.treeview = function(settings) {
    var container = this;
    var userToggle = settings.toggle;
    
	if (!settings.url) {
		return proxied.apply(this, arguments);
	}
	if (!container.children().size()) {
		load(settings, settings.startNode, this, container);
    }
	
	return proxied.call(this, $.extend({}, settings, {
		collapsed: true,
		toggle: function() {
			var $this = $(this);
            if ($this.hasClass('showmore')) {
                $this.closest('ul').append($('<li id=""><span class="placeholder"></span></li>'));
				load(settings, ($this.parents('li:first').attr('id') || $('ul#treebody').attr('root')), $this.closest('ul'), container, offset=$this.attr('offset'));
                $this.remove();
			}
            else if ($this.hasClass("hasChildren")) {
                var childList = $this.removeClass("hasChildren").find("ul");
                load(settings, this.id, childList, container);
            }
            if (userToggle) {
                userToggle.apply(this, arguments);
            }
            
		}
	}));
};

})(jQuery);
