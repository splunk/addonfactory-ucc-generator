Splunk.namespace('Splunk.Admin');



Splunk.Admin.sorter = function(a, b) {
    return (a.value > b.value ? 1 : (a.value < b.value ? -1 : 0));
};


Splunk.Admin.initAccumulator2 = function() {

    /**
     * initialize the accumulator select boxes to support the insert/delete
     * behavior
     */
    $('table.accumulator').each(function() {

        // get refs to all the players
        var availableList = $('select.available', this);
        var selectedList = $('select.selected', this);
        var proxyList = $('select.proxy', this);

        // define 'insert' action
        var insertItems = function(things) {
            selectedList.append(things.clone());
            things.each(function() {
                $(this).prop('disabled', true);
            });
            $('option', availableList).prop('selected', false);
            $('option', selectedList).prop('selected', false);

            // sort and dedup
            var previous_value = null;
            $('option', selectedList).sortElements(Splunk.Admin.sorter).each(function() {
                if (this.value == previous_value) {
                    $(this).remove();
                } else {
                    previous_value = this.value;
                }
            });

            // copy into proxy
            proxyList.html('').append($('option', selectedList).clone());
            $('option', proxyList).prop('selected', true);
        };

        // define 'delete' action
        var deleteItems = function(things) {
            things.each(function() {
                var matchSelector = "option[value='" + $(this).attr('value') + "']";
                $(matchSelector, availableList).prop("disabled", false);
            });
            things.remove();
            availableList.focus();
            $('option', selectedList).prop('selected', false);

            // copy into proxy
            proxyList.html('').append($('option', selectedList).clone());
            $('option', proxyList).prop('selected', true);
        };

        // bind user actions
        $('button.insert', this).bind('click', function(evt) {
            insertItems($('option:selected', availableList));
        });
        $('button.delete', this).bind('click', function(evt) {
            deleteItems($('option:selected', selectedList));
        });
        availableList.bind('dblclick', function(evt) {
            if ($(evt.target).is('option')) {
                insertItems($(evt.target));
            }
        });
        selectedList.bind('dblclick', function(evt) {
            if ($(evt.target).is('option')) {
                deleteItems($(evt.target));
            }
        });


    });

};



Splunk.Admin.initAccumulator = function() {

    $('.accumulator').each(function() {
            
        var availableList =$('ul.available', this);
        var selectedList = $('ul.selected', this);
        var proxyList = $('select.proxy', this);

        // define 'insert' action
        var insertItem = function(liObject) {
            var value = $.trim(liObject.attr('val'));
            var label = $.trim(liObject.text());
            
            selectedList.append($('<li/>').attr('val', value).text(label));
            proxyList.append($('<option/>').attr('value', value).prop('selected', true).text(label));

            $("li[val='" + value + "']", availableList).addClass('chosen');
            $('li', selectedList).sortElements(function(a,b) {
                return a.innerHTML > b.innerHTML ? 1 : a.innerHTML < b.innerHTML ? -1 : 0;
            });

        };


        // define 'delete' action
        var deleteItem = function(liObject) {
            var value = liObject.attr('val');
            
            $("li[val='" + value + "']", availableList).removeClass('chosen');
            $("option[value='" + value + "']", proxyList).remove();
            $("li[val='" + value + "']", selectedList).remove();

        };

        // bind user actions
        availableList.bind('click', function(evt) {
            var item = $(evt.target);
            if (item.is('li') && !item.hasClass('disabled')) {
                if (item.hasClass('chosen')) {
                    deleteItem(item);
                } else {
                    insertItem(item);
                }
            }
            // one guess why this is here...
            setTimeout(function(){selectedList.addClass('ie-sucks');}, 10);
        });
        selectedList.bind('click', function(evt) {
            if ($(evt.target).is('li')) {
                deleteItem($(evt.target));
            }
        });


    });


};


jQuery.fn.sortElements = (function(){
    var sort = [].sort;
    return function(comparator, getSortable) {
        getSortable = getSortable || function(){return this;};
        var placements = this.map(function(){
            var sortElement = getSortable.call(this),
                parentNode = sortElement.parentNode,
 
                // Since the element itself will change position, we have
                // to have some way of storing its original position in
                // the DOM. The easiest way is to have a 'flag' node:
                nextSibling = parentNode.insertBefore(document.createTextNode(''), sortElement.nextSibling);
            return function() {
                if (parentNode === this) {
                    throw new Error("You can't sort elements if any one is a descendant of another.");
                }
                // Insert before flag:
                parentNode.insertBefore(this, nextSibling);
                // Remove flag:
                parentNode.removeChild(nextSibling);
            };
        });
 
        return sort.call(this, comparator).each(function(i){
            placements[i].call(getSortable.call(this));
        });
    };
})();


$(function(){
    // because minification can be on or off, may be doubly-bound
    $('a.aboutLink').unbind('click');
    
    $('a.aboutLink').click(function(event) {
        Splunk.Popup.AboutPopup($('.aboutPopupContainer'));
    });

    $('.alerts_opener').click(function() {
        Splunk.window.openAerts(this.href);
        return false;
    });
    
    $('.job_manager_opener').click(function() {
        Splunk.window.openJobManager();
        return false;
    });
    
    $('.splIcon-close').click(function() {
       // window.close(); //     SPL-39399 - this causes a warning dialog in IE
        return false;
    });
});

$(function() {
    Splunk.Admin.initAccumulator();
});
