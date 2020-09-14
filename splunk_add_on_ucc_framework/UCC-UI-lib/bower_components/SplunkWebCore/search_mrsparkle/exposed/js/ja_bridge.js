/**
 * The JABridge class provides a standard interface to Flash movies that implement AS JABridge interface.
 *
 * @class JABrige
 * @param id {String} The target id/name attribute of the embedded swf element.
 */
(function(global) {

Splunk.JABridge = function(id){
    // Singleton based on id
    if(Splunk.JABridge.instances[id]){
        return Splunk.JABridge.instances[id];
    }
    // Private members
    var self = this,
        isConnected = false, //Connection status
        properties = {},
        propertiesArray = [],
        methods = {},
        methodsArray = [],
        events = {},
        eventsArray = [],
        hasListeners = {},
        isInitialized = false,
        isNotified = false,
        eventListeners = {},
        notifyConnectTimeout,
        connectCallback, //Reference to the callback method on connect
        closeCallback, //References to the callback method on close
        inDocumentElement; //The object reference to the in document embedded swf element
    /**
     * Slice utility for a closures "arguments" property. The argument property is an Array like
     * structure that is missing common methods.
     */
    var argumentsSlice = function(args, start, end){
        var argList = [];
        end = end || args.length;
        for(var i=start; i<end; i++){
            argList.push(args[i]);
        }
        return argList;
    };
    /**
     * The Array indexOf method is not supported accross all platforms.
     */
    var indexOf = function(array, item){
        if(array.indexOf){
            return array.indexOf(item);
        }else{
            for(var i=0; i<array.length; i++){
                if(array[i]==item){
                    return i;
                }
            }
            return -1;
        }
    };
    var notifyConnect = function(){
        isNotified = true;
        connectCallback();
    };
    /**
     * Sends operation command to Flash movie.
     */
    var sendOperation = function(operation){
        operation = Splunk.JABridge.Cerealizer.serialize(operation);
        var response;
        if(!inDocumentElement){
            inDocumentElement = self.getFlashElement();
        }
        if(inDocumentElement){
            var method = inDocumentElement[Splunk.JABridge.RECEIVER_METHOD];
            if(method){
                response = inDocumentElement[Splunk.JABridge.RECEIVER_METHOD](operation);//Shorthand method(operation) or apply does not work with consistently.
                response = Splunk.JABridge.Cerealizer.deserialize(response);
            }
        }
        if(response==null){
            throw new Error("Null response object. Connection may have been lost.");
        }
        if(typeof(response)!="object"){
            throw new Error("Invalid response object.");
        }
        if(response.success!=true){
            if(response.message){
                throw new Error(response.message);
            }
            throw new Error("Uknown error.");
        }
        return response.result;
    };
    var processConnect = function(){
        if(!isConnected){
            isConnected = true;
            //Post-event handler
            notifyConnectTimeout = setTimeout(notifyConnect, 0);
        }
        return Splunk.JABridge.successResponse();
    };
    var processClose = function(){
        if(isConnected){
            clearTimeout(notifyConnectTimeout);
            var wasNotified = isNotified;
            hasListeners = {};
            eventListeners = {};
            isConnected = false;
            isNotified = false;
            var closeCallbackCopy = closeCallback;
            if(wasNotified && (closeCallbackCopy!=null)){
                try{
                    closeCallback();
                }catch(err){
                    setTimeout(function(){throw err;}, 0);
                }
            }
        }
        return Splunk.JABridge.successResponse();
    };
    var processGetInterface = function(){
        var i = 0,
            propertySet = [],
            methodSet = [],
            eventSet = [],
            property,
            method,
            event;
        for(i=0; i<propertiesArray.length; i++){
            var propertyDescriptor = propertiesArray[i];
            property = {};
            property.name = propertyDescriptor.name;
            if(propertyDescriptor.getter==null){
                property.access = "write-only";
            }else if(propertyDescriptor.setter == null){
                property.access = "read-only";
            }else{
                property.access = "read-write";
            }
            property.type = propertyDescriptor.type;
            property.description = propertyDescriptor.description;
            propertySet.push(property);
        }
        for(i=0; i<methodsArray.length; i++){
            var methodDescriptor = methodsArray[i];
            method = {};
            method.name = methodDescriptor.name;
            method.parameters = methodDescriptor.parameters;
            method.returnType = methodDescriptor.returnType;
            method.description = methodDescriptor.description;
            methodSet.push(method);
        }
        for(i=0; i<eventsArray.length; i++){
            var eventDescriptor = eventsArray[i];
            event = {};
            event.name = eventDescriptor.name;
            event.parameters = eventDescriptor.parameters;
            event.description = eventDescriptor.description;
            eventSet.push(event);
        }
        return Splunk.JABridge.resultResponse({"properties":propertySet, "methods":methodSet, "events":eventSet});
    };
    var processGetProperty = function(propertyName){
        var response;
        try{
            var propertyDescriptor = properties[propertyName];
            if(!propertyDescriptor){
                throw new Error("Unknown property " + propertyName + ".");
            }
            if(propertyDescriptor.getter==null){
                throw new Error("Property " + propertyName + " is write-only.");
            }
            var result = propertyDescriptor.getter();
            response = Splunk.JABridge.resultResponse(result);
        }catch(err){
            response = Splunk.JABridge.errorResponse(err.message);
        }
        return response;
    };
    var processSetProperty = function(propertyName, value){
        var response;
        try{
            var propertyDescriptor = properties[propertyName];
            if(!propertyDescriptor){
                throw new Error("Unknown property " + propertyName + ".");
            }
            if(propertyDescriptor.setter==null){
                throw new Error("Property " + propertyName + " is read-only.");
            }
            propertyDescriptor.setter(value);
            response = Splunk.JABridge.successResponse();
        }catch(err){
            response = Splunk.JABridge.errorResponse(err.message);
        }
        return response;
    };
    var processCallMethod = function(methodName, args){
        var response;
        try{
            var methodDescriptor = methods[methodName];
            if(!methodDescriptor){
                throw new Error("Unknown method " + methodName + ".");
            }
            if(!(args instanceof Array)){
                args = [args];
            }
            var result = methodDescriptor.method.apply(null, args);
            response = Splunk.JABridge.resultResponse(result);
        }catch(err){
            response = Splunk.JABridge.errorResponse(err.message);
        }
        return response;
    };
    var processAddEventListener = function(eventName){
        var response;
        try{
            var eventDescriptor = events[eventName];
            if(!eventDescriptor){
                throw new Error("Unknown event " + eventName + ".");
            }
            hasListeners[eventName] = true;
            response = Splunk.JABridge.successResponse();
        }catch(err){
            response = Splunk.JABridge.errorResponse(err.message);
        }
        return response;
    };
    var processRemoveEventListener = function(eventName){
        var response;
        try{
            var eventDescriptor = events[eventName];
            if(!eventDescriptor){
                throw new Error("Uknown event " + eventName + ".");
            }
            delete hasListeners[eventName];
            response = Splunk.JABridge.successResponse();
        }catch(err){
            response = Splunk.JABridge.errorResponse(err.message);
        }
        return response;
    };
    var processDispatchEvent = function(eventName, args){
        var reponse;
        try{
            if(!(args instanceof Array)){
                args = [args];
            }
            var listeners = eventListeners[eventName];
            if(listeners!=null){
                listeners = listeners.concat();
                for(var i=0; i<listeners.length; i++){
                    listeners[i].apply(null, args);
                }
            }
            response = Splunk.JABridge.successResponse();
        }catch(err){
            response = Splunk.JABridge.errorResponse(err.message);
        }
        return response;
    };
    var addInterfaceToString = function(interfaceDescriptor){
        interfaceDescriptor.toString = function(){
            var header = "----------------------------------------\n";
            str = "";
            str += header;
            str += "properties\n";
            str += header;
            str += "\n";
            for(var i in this.properties){
                var property = this.properties[i];
                str += property.name;
                if(property.type){
                    str += ":" + property.type;
                }
                if(property.access=="read-only"){
                    str += " [read-only]";
                }else if(property.access=="write-only"){
                    str += " [write-only]";
                }
                if(property.description){
                    str += "\n" + property.description;
                }
                str += "\n\n";
            }
            str += header;
            str += "methods\n";
            str += header;
            str += "\n";
            for(var k in this.methods){
                var method = this.methods[k];
                str += method.name;
                str += "(";
                if(method.parameters){
                    for(var j=0; j<method.parameters.length; j++){
                        if(j>0){
                            str += ", ";
                        }
                        str += method.parameters[j];
                    }
                }
                str += ")";
                if(method.returnType){
                    str += ":" + method.returnType;
                }
                if(method.description){
                    str += "\n" + method.description;
                }
                str += "\n\n";
            }
            str += header;
            str += "events\n";
            str += header;
            str += "\n";
            for(var l in this.events){
                var event = this.events[l];
                str += event.name;
                str += "(";
                if(event.parameters){
                    for(var m=0; m<event.parameters.length; m++){
                        if(m>0){
                            str += ", ";
                        }
                        str += event.parameters[m];
                    }
                }
                str += ")";
                if(event.description){
                    str += "\n" + event.description;
                }
                str += "\n\n";
            }
            return str;
        };
    };
    /**
     * Getting the reference to an embedded Flash movie is inconsistent due to the use
     * of the non-standard embed element in many implementations.
     */
    self.getFlashElement = function(){
        return window[id] || document.getElementById(id);
    };
    self.isConnected = function(){
        return isConnected;
    };
    self.id = function(){
        return id;
    };
    self.getInterface = function(){
        if(!isConnected){
            throw new Error(Splunk.JABridge.CONNECTION_ERROR);
        }
        try{
            var interfaceDescriptor = sendOperation({"type":"getInterface"});
            addInterfaceToString(interfaceDescriptor);
        }catch (err){
            throw new Error(err.message);
        }
        return interfaceDescriptor;
    };
    self.getProperty = function(propertyName){
        if(!isConnected){
            throw new Error(Splunk.JABridge.CONNECTION_ERROR);
        }
        try{
            var value = sendOperation({"type":"getProperty", "propertyName":propertyName});
        }catch(err){
            throw new Error(err.message);
        }
        return value;
    };
    self.setProperty = function(propertyName, value){
        if(!isConnected){
            throw new Error(Splunk.JABridge.CONNECTION_ERROR);
        }
        try{
            sendOperation({"type":"setProperty", "propertyName":propertyName, "value":value});
        }catch(err){
            throw new Error(err.message);
        }
    };
    self.callMethod = function(methodName){
        if(!isConnected){
            throw new Error(Splunk.JABridge.CONNECTION_ERROR);
        }
        var result;
        var args = argumentsSlice(arguments, 1);
         try{
            result = sendOperation({"type":"callMethod", "methodName":methodName, "arguments":args});
        }catch(err){
            throw new Error(err.message);
        }
        return result;
    };
    self.addEventListener = function(eventName, listener){
        if(!isConnected){
            throw new Error(Splunk.JABridge.CONNECTION_ERROR);
        }
        var listeners = eventListeners[eventName];
        if(listeners==null){
            try{
                sendOperation({"type":"addEventListener", "eventName":eventName});
            }catch(err){
                throw new Error(err.message);
            }
            listeners = eventListeners[eventName] = [];
            listeners.push(listener);
        }else if(indexOf(listeners, listener)<0){
            listeners.push(listener);
        }
    };
    self.removeEventListener = function(eventName, listener){
        if(!isConnected){
            throw new Error(Splunk.JABridge.CONNECTION_ERROR);
        }
        var listeners = eventListeners[eventName];
        if(listeners!=null){
            var index = indexOf(listeners, listener);
            if(index>=0){
                listeners.splice(index, 1);
                if(listeners.length==0){
                    delete eventListeners[eventName];
                    try{
                        sendOperation({"type":"removeEventListener", "eventName":eventName});
                    }catch(err){
                        throw new Error(err.message);
                    }
                }
            }
        }
    };
    self.receiveOperation = function(operation){
        if(!isInitialized){
            return null;
        }
        if(operation==null){
            throw new Error("A null communication object.");
        }
        if(typeof(operation)!="object"){
            throw new Error("Invalid communication object.");
        }
        if(!operation.type){
            throw new Error("A null operation type.");
        }
        try{
            switch(operation.type){
                case "close":
                    response = processClose();
                    break;
                case "connect":
                    response = processConnect();
                    break;
                case "getInterface":
                    response = processGetInterface();
                    break;
                case "getProperty":
                    response = processGetProperty(operation.propertyName);
                    break;
                case "setProperty":
                    response = processSetProperty(operation.propertyName, operation.value);
                    break;
                case "callMethod":
                    response = processCallMethod(operation.methodName, operation.arguments);
                    break;
                case "addEventListener":
                    response = processAddEventListener(operation.eventName);
                    break;
                case "removeEventListener":
                    response = processRemoveEventListener(operation.eventName);
                    break;
                case "dispatchEvent":
                    response = processDispatchEvent(operation.eventName, operation.arguments);
                    break;
                default:
                    response = Splunk.JABridge.errorResponse("Unknown operation " + operation.type + ".");
                    break;
            }
        }catch(err){
            response = Splunk.JABridge.errorResponse(err.message);
        }
        return response;
    };
    /**
     * Expose a JavaScript property to Flash.
     * @method addProperty
     * @param {String} propertyName Exposed reference name of property.
     * @param {Function/null} getter (Optional) Handler that returns a property or null. If getter is null,  setter must be defined.
     * @param {Function/null} setter (Optional) Handler that sets a property or null. If setter is null, getter must be defined.
     * @param {String} type (Optional) Return type documentation.
     * @param {String} description (Optional) General description documentation.
     */
    self.addProperty = function(propertyName, getter, setter, type, description){
        if(isInitialized){
            throw new Error(Splunk.JABridge.INITIALIZED_ERROR);
        }
        if(getter==null && setter==null){
            throw new Error("One of paramaters getter or setter must be non-null");
        }
        if(properties[propertyName]){
            throw new Error("Property already defined.");
        }
        var propertyDescriptor = new Splunk.JABridge.PropertyDescriptor(propertyName, getter, setter, type, description);
        properties[propertyName] = propertyDescriptor;
        propertiesArray.push(propertyDescriptor);
    };
    /**
     * Expose a JavaScript method to Flash.
     * @method addMethod
     * @param {String} methodName Exposed reference name of method.
     * @param {Function} method (Optional) Handler that is called.
     * @param {Array} parameters (Optional) Array of String parameter documentation.
     * @param {String} returnType (Optional) Return type documentation.
     * @param {String} description (Optional) General description documentation.
     */
    self.addMethod = function(methodName, method, parameters, returnType, description){
        if(isInitialized){
            throw new Error(Splunk.JABridge.INITIALIZED_ERROR);
        }
        if(methods[methodName]){
            throw new Error("Method already defined.");
        }
        var methodDescriptor = new Splunk.JABridge.MethodDescriptor(methodName, method, parameters, returnType, description);
        methods[methodName] = methodDescriptor;
        methodsArray.push(methodDescriptor);
    };
    /**
     * Expose a JavaScript event to Flash.
     * @method addEvent
     * @param {String} eventName Exposed reference name of event.
     * @param {Array} parameters (Optional) Array of String parameter documentation.
     * @param {String} description (Optional) General description documentation.
     */
    self.addEvent = function(eventName, parameters, description){
        if(isInitialized){
            throw new Error(Splunk.JABridge.INITIALIZED_ERROR);
        }
        if(events[eventName]){
            throw new Error("Event already defined.");
        }
        var eventDescriptor = new Splunk.JABridge.EventDescriptor(eventName, parameters, description);
        events[eventName] = eventDescriptor;
        eventsArray.push(eventDescriptor);
    };
    /**
     * Dispatch an exposed JavaScript event to Flash.
     * @method dispatchEvent
     * @param {String} eventName Exposed reference name of event to trigger.
     */
    self.dispatchEvent = function(eventName){
        if(!isConnected){
            throw new Error(Splunk.JABridge.CONNECTION_ERROR);
        }
        var args = argumentsSlice(arguments, 1);
        if(!events[eventName]){
            throw new Error("Unknown event " + eventName + ".");
        }
        if(!hasListeners[eventName]){
            return;
        }
        try{
            sendOperation({"type":"dispatchEvent", "eventName":eventName, "arguments":args});
        }catch(err){
            throw new Error(err.message);
        }
    };
    /**
     * Close the bridge, remove event listeners, reset connection state and fire the close callback handler.
     */
    self.close = function(){
        if(!isInitialized){
            return;
        }
        clearTimeout(notifyConnectTimeout);
        var wasConnected = isConnected;
        var wasNotified = isNotified;
        var closeCallbackCopy = closeCallback;
        hasListeners = {};
        eventListeners = {};
        isConnected = false;
        connectCallback = null;
        closeCallback = null;
        isInitialized = false;
        isNotified = false;
        if(wasConnected){
            try{
                sendOperation({"type":"close", "id":id});
            }catch(err){}
            if(wasNotified && (closeCallbackCopy!=null)){
                try{
                    closeCallbackCopy();
                }catch(err){
                    setTimeout(function(){throw err;}, 0);
                }
            }
        }
    };
    /**
     * Close the bridge, delete reference in static instances, self-destruct.
     */
    self.dispose = function(){
        self.close();
        delete Splunk.JABridge.instances[id];
        for(var i in self){
            if(self.hasOwnProperty(i)){
                delete self[i];
            }
        }
    };
    /**
     * Connect a JavaScript interface to a Flash movie.
     * @method connect
     * @param {Function} callback1 Callback to be fired when JavaScript/Flash connection negotiation completed.
     * @param {Function} callback2 Callback to be fired when JavaScript/Flash connection has been closed.
     */
    self.connect = function(callback1, callback2){
        if(callback1!=null && callback1==Splunk.JABridge.connectAll){
            if(!isInitialized || isConnected){
                return;
            }
        }else{
            if(callback1==null){
                throw new Error("A callback must be defined in order for a JavaScript/Flash connection negotiation.");
            }
            self.close();
            connectCallback = callback1;
            closeCallback = callback2;
            isInitialized = true;
        }
        try{
            sendOperation({"type":"connect", "id":id});
            isConnected = true;
            notifyConnectTimeout = setTimeout(notifyConnect, 0);
        }catch(err){}
    };
    self.JABridge = function(){
        Splunk.JABridge.instances[id] = self;
    }();
};
//Class members.
Splunk.JABridge.RECEIVER_METHOD = "JABridge_receiveOperation"; //ActionScript ExternalInteface exposed receiver method.
Splunk.JABridge.CONNECTION_ERROR = "JABridge not connected.";
Splunk.JABridge.INITIALIZED_ERROR = "JABridge already initialized.";
Splunk.JABridge.getInstance = function(id){
    return new Splunk.JABridge(id);
};
Splunk.JABridge.instances = {};
Splunk.JABridge.successResponse = function(){
    return {"success":true};
};
Splunk.JABridge.resultResponse = function(result){
    return {"success":true, "result":result};
};
Splunk.JABridge.errorResponse = function(message){
    return {"success":false, "message":message};
};
Splunk.JABridge.receiveOperation = function(operation){
    var response;
    try{
        operation = Splunk.JABridge.Cerealizer.deserialize(operation);
        if(!operation.id){
            if(!Splunk.JABridge.isConnectAll){
                Splunk.JABridge.isConnectAll = true;
                setTimeout(Splunk.JABridge.connectAll, 0);
            }
            response = Splunk.JABridge.errorResponse("null operation id.");
        }else{
            var instance = Splunk.JABridge.instances[operation.id];
            if(instance!=null){
                response = instance.receiveOperation(operation);
            }
        }
    }catch(error){
        response = Splunk.JABridge.errorResponse(error.message);
    }
    return Splunk.JABridge.Cerealizer.serialize(response);
};
var JABridge_receiveOperation = global.JABridge_receiveOperation = Splunk.JABridge.receiveOperation;
Splunk.JABridge.isConnectAll = false;
Splunk.JABridge.connectAll = function(){
    var instances = Splunk.JABridge.instances;
    for(var i in instances){
         if(instances.hasOwnProperty(i)){
            instances[i].connect(Splunk.JABridge.connectAll);
         }
    }
    Splunk.JABridge.isConnectAll = false;
};
Splunk.JABridge.PropertyDescriptor = function(name, getter, setter, type, description){
    var self = this;
        self.name = name;
        self.getter = getter;
        self.setter = setter;
        self.type = type;
        self.description = description;
};
Splunk.JABridge.MethodDescriptor = function(name, method, parameters, returnType, description){
    var self = this;
        self.name = name;
        self.method = method;
        self.parameters = parameters;
        self.returnType = returnType;
        self.description = description;
};
Splunk.JABridge.EventDescriptor = function(name, parameters, description){
    var self = this;
        self.name = name;
        self.parameters = parameters;
        self.description = description;
};
/*jshint -W057:false */
Splunk.JABridge.Cerealizer = new function(){
/*jshint -W057:true */
    var self = this;
    var references = [];
    var tokens = "";
    var tokenCount = 0;
    var tokenIndex = 0;
    self.serialize = function(value){
        references = [];
        var str = serializeValue(value);
        references = null;
        return str;
    };
    self.deserialize = function(str){
        var value;
        try{
            references = new Array();
            tokens = str;
            tokenCount = tokens?tokens.length:0;
            tokenIndex = 0;
            value = deserializeNext();
            if(tokenIndex<tokenCount){
                throw new Error("Unexpected token.");
            }
        }catch(e){
            throw new Error("Deserialize error at index " + tokenIndex + ": " + e.message);
        }finally{
            references = null;
            tokens = null;
            tokenCount = 0;
            tokenIndex = 0;
        }
        return value;
    };
    var arrayIndexOf = function(array, item, fromIndex){
        if(array.indexOf){
            return array.indexOf(item, fromIndex);
        }else{
            for(var i = fromIndex || 0; i<array.length; i++){
                if(array[i]===item){
                    return i;
                }
            }
            return -1;
        }
    };
    var serializeValue = function(value){
        if(value===null){
            return "";
        }
        switch(typeof(value)){
            case "number":
                return serializeNumber(value);
            case "boolean":
                return serializeBoolean(value);
            case "string":
                return serializeString(value);
            case "object":
                var ref = serializeReference(value);
                if(ref){
                    return ref;
                }
                if(value instanceof Array){
                    return serializeArray(value);
                }
                return serializeObject(value);
            default:
                return "";
        }
    };
    var serializeNumber = function(num){
        return "#" + String(num) + "#";
    };
    var serializeBoolean = function(bool){
        return (bool?"t":"f");
    };
    var serializeString = function(str){
        return "\"" + escape(str) + "\"";
    };
    var serializeArray = function(arr){
        references.push(arr);
        var str = "";
        str += "[";
        var length = arr.length;
        for(var i=0; i<length; i++){
            if(i>0){
                str += ",";
            }
            str += serializeValue(arr[i]);
        }
        str += "]";
        return str;
    };
    var serializeObject = function(obj){
        references.push(obj);
        var str = "";
        str += "{";
        var i = 0;
        for(var p in obj){
            if(i>0){
                str += ",";
            }
            str += escape(p) + ":" + serializeValue(obj[p]);
            i++;
        }
        str += "}";
        return str;
    };
    var serializeReference = function(ref){
        var index = arrayIndexOf(references, ref);
        if(index>=0){
            return "@" + index + "@";
        }
        return null;
    };
    var deserializeNext = function(){
        if(tokenIndex>=tokenCount){
            return null;
        }
        switch(tokens.charAt(tokenIndex)){
            case "#":
                return deserializeNumber();
            case "t":
            case "f":
                return deserializeBoolean();
            case "\"":
                return deserializeString();
            case "[":
                return deserializeArray();
            case "{":
                return deserializeObject();
            case "@":
                return deserializeReference();
            default:
                return null;
        }
    };
    var deserializeNumber = function(){
        tokenIndex++;//eat #
        var endIndex = arrayIndexOf(tokens, "#", tokenIndex);
        if(endIndex<0){
            throw new Error("Expecting closing #.");
        }
        if(endIndex==tokenIndex){
            throw new Error("Expecting number.");
        }
        var num = Number(tokens.substring(tokenIndex, endIndex));
        tokenIndex = endIndex + 1;
        return num;
    };
    var deserializeBoolean = function(){
        return (tokens.charAt(tokenIndex++)=="t");
    };
    var deserializeString = function(){
        tokenIndex++;//eat "
        var endIndex = arrayIndexOf(tokens, "\"", tokenIndex);
        if(endIndex<0){
            throw new Error("Expecting closing quote.");
        }
        var str = unescape(tokens.substring(tokenIndex, endIndex));
        tokenIndex = endIndex + 1;
        return str;
    };
    var deserializeArray = function(){
        tokenIndex++;//eat [
        if(tokenIndex>=tokenCount){
            throw new Error("Expecting closing brace.");
        }
        var arr = [];
        references.push(arr);
        var token = tokens.charAt(tokenIndex);
        if(token == "]"){
            tokenIndex++;
            return arr;
        }
        while(true){
            arr.push(deserializeNext());
            if(tokenIndex>=tokenCount){
                throw new Error("Expecting closing brace.");
            }
            token = tokens.charAt(tokenIndex++);
            if(token=="]"){
                break;
            }
            if(token!=","){
                throw new Error("Expecting comma or closing brace.");
            }
        }
        return arr;
    };
    var deserializeObject = function(){
        tokenIndex++;//eat {
        if(tokenIndex>=tokenCount){
            throw new Error("Expecting closing bracket.");
        }
        var obj = {};
        references.push(obj);
        var token = tokens.charAt(tokenIndex);
        if(token=="}"){
            tokenIndex++;
            return obj;
        }
        var colonIndex;
        var propertyName;
        while(true){
            colonIndex = arrayIndexOf(tokens, ":", tokenIndex);
            if(colonIndex<0){
                throw new Error("Expecting colon.");
            }
            propertyName = unescape(tokens.substring(tokenIndex, colonIndex));
            tokenIndex = colonIndex + 1;
            obj[propertyName] = deserializeNext();
            if(tokenIndex>=tokenCount){
                throw new Error("Expecting closing bracket.");
            }
            token = tokens.charAt(tokenIndex++);
            if(token=="}"){
                break;
            }
            if(token!=","){
                throw new Error("Expecting comma or closing bracket.");
            }
        }
        return obj;
    };
    var deserializeReference = function(){
        tokenIndex++;//eat @
        var endIndex = arrayIndexOf(tokens, "@", tokenIndex);
        if (endIndex<0){
            throw new Error("Expecting closing @.");
        }
        if(endIndex==tokenIndex){
            throw new Error("Expecting integer reference.");
        }
        var referenceIndex = Math.round(Number(tokens.substring(tokenIndex, endIndex)));
        if(isNaN(referenceIndex) || (referenceIndex<0) || (referenceIndex>=references.length)){
            throw new Error("Invalid reference.");
        }
        tokenIndex = endIndex + 1;
        return references[referenceIndex];
    };
};

})(this);