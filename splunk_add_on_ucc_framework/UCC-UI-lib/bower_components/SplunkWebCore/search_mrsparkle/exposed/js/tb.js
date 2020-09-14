String.prototype.trim = function () { return this.replace(/^\s*/, "").replace(/\s*$/, ""); };

function openSave() {
    $('.splOverlay').show();
    $('#saveLayer').left = parseInt($(window).width() / 3, 10) + 'px';
    $('#saveLayer').show();
    $('#objectName').focus();
    $('#objectName').keydown(function(event) {
        if (event.keyCode == 13) {
            $('#saveLayer button.splButton-primary').click();
            event.stopPropagation();
            return false;
        } else if (event.keyCode == 27) {
            closeSave();
        }
    });
}

function closeSave() {
    $('.splOverlay').hide();
    $('#saveLayer').hide();
    $('#objectName').val('');
    $('#objectName').unbind();
}

function openSuccess() {
    $('.splOverlay').show();
    $('#saveSuccessLayer').left = parseInt($(window).width() / 3, 10) + 'px';
    $('#saveSuccessLayer').show();
    $(document).keydown(function(event) {
        if (event.keyCode == 13 || event.keyCode == 27) {
            saveSuccessClose();
            event.stopPropagation();
            return false;
        }
    });
}

function saveSuccessClose() {
    $('.splOverlay').hide();
    $('#saveSuccessLayer').hide();
    $(document).unbind('keydown');
    $(window).close();  
    return false;  

}
    
window.onload = function() {
    $('.splIcon-close').click(function() {
	    window.close();  
	    return false;  
	}); 
};