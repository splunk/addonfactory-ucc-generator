/**
 * Message twice it's a long way to the bay!
 */
Splunk.Message = $.klass({
    /**
     * Define regex used to convert a mediawiki-style link token to a proper <a href> tag.  The basic pattern is:
     * [<external_link> <label>]
     * [[<internal_link>|<label>]]
     *
     * The target window can be specified by prefixing a (!):
     * [!<external_link> <label>]
     * [[!<internal_link>|<label>]]
     *
     * Example:
     * [http://www.google.com Google Search]
     * [[/manager/settings|Edit server settings]]
     *
     * TODO: If this ever needs more wiki syntax, we'll have to move to a proper tokenizer; this is just quick and dirty.
     */
    EXTERNAL_LINK_REX: /\[(\!?)(\w+\:\/\/[^\s]+)\s+([^\]]+)\]/g,
    INTERNAL_LINK_REX: /\[\[(\!?)([^\|]+)\|([^\]]+)\]\]/g,
    TARGET_BLANK_TOKEN_REX: /#~#!#~#/g,
    TARGET_SAME_TOKEN_REX: /\s*#~##~#/g,
    SERVER_DELETE_RESOURCE: Splunk.util.make_url("/api/messages/delete"),
    /**
     * Constructor
     */
    initialize: function(){
        this.logger = Splunk.Logger.getLogger("splunk.message");
        this.displayedMessages = [];
        this.allMessages = [];
        this.filter = '*';
        
        // For the main header message bar, Display as many as 3 messages, and show option for viewing all messages
        if (this.filter == "*") {
            this.maxQueueSize = 20; 
            this.defaultDisplaySize = 3; 
        } else { 
            //Default behavior for all other message bars is to only show the number of messages given by maxSize.  No "show all" button.         
	    this.maxSize = 1; 
            this.defaultDisplaySize = this.maxSize; 
            this.maxQueueSize = this.maxSize; 
        }
        
        this.selectedDisplaySize = this.defaultDisplaySize; 
        this.list = $("#adminlite_messages");
        this.messenger = Splunk.Messenger.System.getInstance();
        this.messenger.receive(this.filter, this.unshift.bind(this), undefined, true);//Listen to all including control messages

        var self = this; 

        // Handler for removing messages 
        $("a.remove", "#adminlite_messages").live('click',  function() { 
            var message_id = $(this).attr("data-id"); 
            if ($(this).hasClass("splunkd")){
               $.ajax({
                  type: "POST",
                  url: self.SERVER_DELETE_RESOURCE,
                  dataType: "text",
                  data: "message_id="+message_id,
                  error: function () {self.onMessageDeleted(message_id);  },
                  success: function () { self.onMessageDeleted(message_id); }
               });
            } else { 
                self.onMessageDeleted(message_id); 
            }
            return false; 
        }); 

        //Handler for viewing all hidden messages
        $("a.showall", "#adminlite_messages").live('click', function() {
            self.onShowAll(); 
        }); 

        //Handler for hiding messages
        $("a.hide", "#adminlite_messages").live('click', function() {
            self.onHide(); 
        });
    },
     /**
     * Show an alert if the delete post request fails 
     *
     */
     onServerMessagesError: function(data){
         alert("Could not delete message: "); 
     },
    /**
     * Clear all message list elements from the DOM.
     *
     * @param {Array} arguments[0] Optional array of levels to exclude from clear process.
     */
    clear: function(){
        var levels = arguments[0] || [];
        var allMessages = [];
        this.logger.warn("Clearing messages with the exclusion of levels", levels);
        for(var i=0; i<this.allMessages.length; i++){
            var message = this.allMessages[i];
            if($.inArray(message.level, levels)!=-1){
                allMessages.push(message);
            }
        }
        this.allMessages = allMessages;
        this.displayedMessages = this.allMessages.slice(0, this.selectedDisplaySize);
        this.list.html(this.getHTMLTransform());
        $(document).trigger("messageClear");
    },
    /**
     * Simple handler for control messages.
     * 
     * @param {Object} message Standard messenger message object ({level:String, content:String, className:String, date:String}).
     */
    handleControlMessage: function(message) {
        switch(message.content) {
            case 'CLEAR':
                this.clear();
                break;
            default:
                break;
        }
    },
    /**
     * Generate the HTML content for display.
     * 
     * @type String
     * @return An HTML formatted string of all messages.
     */
    getHTMLTransform: function(){
        var html = [];
        for(var i=0; i<this.displayedMessages.length; i++){
            var message = this.displayedMessages[i];
            html.push('<li class="message ' + message.level + '">');
            html.push('<div style="float:left">'); 
            html.push(this.getWikiTranform(message.content));
            html.push('</div>'); 

            // Only removable splunkd messages will have a non-numeric message id.  
            var myClass = ''; 
            if (isNaN(message.id)) { 
                myClass = 'splunkd'; 
                html.push('<div style="float:right"><a href="#" data-id="'+Splunk.util.escapeHtml(message.id)+'" class="remove '+myClass+'">x</a></div>'); 
            }

            html.push('<div style="clear:both"/>'); 
            html.push('</li>');
        }

        // show link to view all hidden messages  
        var numhiddenmessages = this.allMessages.length-this.selectedDisplaySize;  
        if (numhiddenmessages > 0){ 
            var content = "" + numhiddenmessages + " messages not shown."; 
            html.push('<li class="info">');
            html.push(this.getWikiTranform(content));
            html.push('<a href="#" class="showall"> Show all </a>'); 
            html.push('</li>');
        }   

        // If user is viewing all messages, show a link to hide the messages
        if (this.selectedDisplaySize == this.maxQueueSize && this.allMessages.length > this.defaultDisplaySize) { 
           html.push('<li class="info"> <a href="#" class="hide">Hide messages</a> </li>');
        }  

        return html.join('');
    },
    /**
     * Transform a string against wiki formatting rules.
     *
     * @param {String} str The string to format.
     * 
     * @type String
     * @return A HTML formatted string. 
     */
    getWikiTranform: function(str){
        var text = Splunk.util.escapeHtml(str);
        // we tokenize the conditional '!' prefix and replace it after
        text = text.replace(this.EXTERNAL_LINK_REX, '<a href="$2" #~#$1#~#>$3</a>');
        text = text.replace(this.INTERNAL_LINK_REX, this._generateInternalLink);
        text = text.replace(this.TARGET_BLANK_TOKEN_REX, 'target="_blank"');
        text = text.replace(this.TARGET_SAME_TOKEN_REX, '');
        return text;
     },

     _generateInternalLink: function(str, blank_token, url, text) {
        url = Splunk.util.make_url(url);
        return '<a href="'+url+'"#~#'+blank_token+'#~#>'+text+'</a>';
     },
     /**
     * Removes the message with the given message_id from the message list
     */
     onMessageDeleted: function(message_id){
         for(var j=0; j<this.allMessages.length; j++){
             var id  = this.allMessages[j].id;
             if(message_id==id){
                 this.allMessages.splice(j, 1);
                 j--;
             }
         }

        
         this.displayedMessages = this.allMessages.slice(0, this.selectedDisplaySize); 
         this.list.html(this.getHTMLTransform());
         $(document).trigger("messageUnshift", this.container);
    },
    /**
     * Shows all messages 
     */
    onShowAll: function(){
         this.selectedDisplaySize = this.maxQueueSize; 
         this.displayedMessages = this.allMessages.slice(0, this.selectedDisplaySize); 
         this.list.html(this.getHTMLTransform());
         $(document).trigger("messageUnshift", this.container);
    },
    /**
     * Shows all messages 
     */
    onHide: function(){
         this.selectedDisplaySize = this.defaultDisplaySize; 
         this.displayedMessages = this.allMessages.slice(0, this.selectedDisplaySize); 
         this.list.html(this.getHTMLTransform());
         $(document).trigger("messageUnshift", this.container);
    },
     /**
     * Adds one or more messages to the beginning of an ordered list and
     * returns the new length (behaves like the Array unshift method).
     *
     * @param {Arguments} arguments.length>0 Optional message objects to be added to the display ({level:String, content:String, className:String, date:String}).
     *
     * @type Number
     * @return The new length of messages.
     */
    unshift: function(){
        var previousMessages = [].concat(this.allMessages);
        for(var i=arguments.length-1; i>-1; i--){
            var message = arguments[i];
            if(message.control){
                this.handleControlMessage(message);
                continue;
            }
            for(var j=0; j<this.allMessages.length; j++){
                var content = this.allMessages[j].content;
                var level = this.allMessages[j].level;
                if(message.content==content && message.level==level){
                    this.allMessages.splice(j, 1);
                    j--;
                }
            }
            this.allMessages = [{level: message.level, content: message.content, id: message.id}].concat(this.allMessages);
        }

        this.allMessages.splice(this.maxQueueSize, this.allMessages.length-this.maxQueueSize);
        this.displayedMessages = this.allMessages.slice(0, this.selectedDisplaySize); 
 
        if(!Splunk.util.objectSimilarity(previousMessages, this.displayedMessages)){
            this.list.html(this.getHTMLTransform());
            $(document).trigger("messageUnshift");
        }
        return $("li", this.list).length;
    }
});
