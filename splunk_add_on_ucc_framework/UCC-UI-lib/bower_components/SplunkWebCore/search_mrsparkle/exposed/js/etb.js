String.prototype.trim = function () { return this.replace(/^\s*/, "").replace(/\s*$/, ""); };

function validateForm() {
    if ($('#eventtype').text().trim() == '') {
	alert('No eventtype to save.');
	return false;
    }
    return true;
}
		
function openSave() {
    if (!validateForm()) return false;
    $('.splOverlay').show();
    $('#saveLayer').left = parseInt($(window).width() / 3, 10) + 'px';
    $('#saveLayer').show();
    $('#eventTypeName').focus();
    $('#eventTypeName').keydown(function(event) {
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
    $('#eventTypeName').val('');
    $('#eventTypeName').unbind();
}

function revertEdit() {
    $('#eventtype').val("");
    $('#edited').val("");
    $('#iterate').submit();
    return false;
}

function openEditRule() {
    $('#editeventtype').val($('#eventtype').val());
	$('.splOverlay').show();
    $('#editRuleLayer').show();
    $('#editeventtype').focus();
    $('#editeventtype').keydown(function(event) {
    //    comment out return-key because we're using a textarea that wants return keys
    //    if (event.keyCode == 13) {
    //        $('#editRuleLayer button.splButton-primary').click();
    //        event.stopPropagation();
    //        return false;
    //    } else 
          if (event.keyCode == 27) {
             closeEdit();
          }
    });
}

function editRule() {
    $('#eventtype').val($('#editeventtype').val());
    $('#edited').val("True");
    closeEdit();
}

function closeEdit() {
    $('.splOverlay').hide();
    $('#editRuleLayer').hide();
    $('#editeventtype').unbind();
}


function openTestAlert() {
    $('.splOverlay').show();
    $('#testAlertLayer').left = parseInt($(window).width() / 3, 10) + 'px';
    $('#testAlertLayer').show();

    $('#testAlertLayer button.splButton-primary').click(function(event) {
        testAlert($('#testAlertLayer #testingurl').val());
        event.stopPropagation();
        return false;
    });

    $(document).keydown(function(event) {
        if (event.keyCode == 13) {
            $('#testAlertLayer button.splButton-primary').click();
            event.stopPropagation();
            return false;
        } else if (event.keyCode == 27) {
            closeTestAlert();
        }
    });
}

function testAlert(url) {
    var ptr = window.open(url, 'eventtype_search', 'toolbar=no, directories=no, location=no, status=yes, menubar=no, resizable=yes, scrollbars=yes, width=1200, height=800');
    if(ptr) ptr.focus();
    closeTestAlert();
}

function closeTestAlert() {
    $('.splOverlay').hide();
    $('#testAlertLayer').hide();
    $(document).unbind('keydown');
    $('#testAlertLayer button.splButton-primary').unbind('click');
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
}
    
window.onload = function() {
    $('.splIcon-close').click(function() {
	    window.close();  
	    return false;  
	}); 
};