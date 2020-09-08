function updateSummarizationStatus() {
    $.get(
      Splunk.util.make_url('manager','system','summarization','allstatuses') ,  
    function(data) { 
         var o = jQuery.parseJSON(data); 
         $.each(o, function() {
             $.each(this, function(k,obj) {
                 var tsumId ="#" + k; 
                 if ($(tsumId).length){
			 var completed = ''; 
			 completed = parseInt(100 * parseFloat(obj.complete), 10);

			 var newStatus = '' + completed + '% ' + _('Complete'); 
			 var lastUpdatedString = (obj.mod_time == "None") ? '' : " <span class='access_time'>" + _('Updated: ') + obj.mod_time + "</span>";
                      
			 if (obj.is_inprogress == "True"){
			     newStatus = "<div class='running'> " + _('Building summary - ') + completed + "%";         
			 } else {
			     if (obj.is_suspended == "True"){
				 newStatus = '<span class="icon_small yellow_warning_small">&nbsp;</span> ' + _("Suspended.");
			     } else if (obj.isNotStarted == "True") {
				 newStatus = _('Summarization not started ');
			     } else if (obj.isNotEnoughData == "True"){
				 newStatus = '<span class="icon_small yellow_warning_small">&nbsp;</span> ' +  _("Not enough data to summarize.");
			     } else if (obj.isUpdatedALongTimeAgo == "True") {
				 newStatus = _('Pending (Built summary - ') + completed + "%)"; 
			     } else if (completed == 100){
				 newStatus = _('Complete ');   
			     } 
			 }
	 
			 newStatus += lastUpdatedString; 

                         $(tsumId).html(newStatus);
                 } 
             }); 
         });  
     });   
}

