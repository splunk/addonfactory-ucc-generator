package com.splunk.external
{

	import flash.errors.IllegalOperationError;
	import flash.external.ExternalInterface;
	import flash.utils.clearTimeout;
	import flash.utils.setTimeout;

	public final class JABridge
	{

		// Private Static Properties

		private static var _id:String = ExternalInterface.objectID;
		private static var _isAvailable:Boolean = ExternalInterface.available;
		private static var _isConnected:Boolean = false;

		private static var _properties:Object = new Object();
		private static var _propertiesArray:Array = new Array();
		private static var _methods:Object = new Object();
		private static var _methodsArray:Array = new Array();
		private static var _events:Object = new Object();
		private static var _eventsArray:Array = new Array();
		private static var _hasListeners:Object = new Object();
		private static var _eventListeners:Object = new Object();
		private static var _connectCallback:Function;
		private static var _closeCallback:Function;
		private static var _notifyConnectTimeout:uint;
		private static var _isInitialized:Boolean = false;
		private static var _isNotified:Boolean = false;

		// Public Static Getters/Setters

		public static function get id() : String
		{
			return JABridge._id;
		}

		public static function get isAvailable() : Boolean
		{
			return JABridge._isAvailable;
		}

		public static function get isConnected() : Boolean
		{
			return JABridge._isConnected;
		}

		// Public Static Methods

		public static function addProperty(propertyName:String, getter:Function, setter:Function = null, type:String = null, description:String = null) : void
		{
			if (JABridge._isInitialized)
				throw new IllegalOperationError("JABridge already initialized.");
			if (propertyName == null)
				throw new TypeError("Parameter propertyName must be non-null.");
			if (propertyName.length == 0)
				throw new TypeError("Parameter propertyName must be non-empty.");
			if ((getter == null) && (setter == null))
				throw new TypeError("One of parameters getter or setter must be non-null.");
			if (JABridge._properties[propertyName] != null)
				throw new IllegalOperationError("Property already defined.");

			var propertyDescriptor:PropertyDescriptor = new PropertyDescriptor(propertyName, getter, setter, type, description);
			JABridge._properties[propertyName] = propertyDescriptor;
			JABridge._propertiesArray.push(propertyDescriptor);
		}

		public static function addMethod(methodName:String, method:Function, parameters:Array = null, returnType:String = null, description:String = null) : void
		{
			if (JABridge._isInitialized)
				throw new IllegalOperationError("JABridge already initialized.");
			if (methodName == null)
				throw new TypeError("Parameter methodName must be non-null.");
			if (methodName.length == 0)
				throw new TypeError("Parameter methodName must be non-empty.");
			if (method == null)
				throw new TypeError("Parameter method must be non-null.");
			if (JABridge._methods[methodName] != null)
				throw new IllegalOperationError("Method already defined.");

			var methodDescriptor:MethodDescriptor = new MethodDescriptor(methodName, method, parameters, returnType, description);
			JABridge._methods[methodName] = methodDescriptor;
			JABridge._methodsArray.push(methodDescriptor);
		}

		public static function addEvent(eventName:String, parameters:Array = null, description:String = null) : void
		{
			if (JABridge._isInitialized)
				throw new IllegalOperationError("JABridge already initialized.");
			if (eventName == null)
				throw new TypeError("Parameter eventName must be non-null.");
			if (eventName.length == 0)
				throw new TypeError("Parameter eventName must be non-empty.");
			if (JABridge._events[eventName] != null)
				throw new IllegalOperationError("Event already defined.");

			var eventDescriptor:EventDescriptor = new EventDescriptor(eventName, parameters, description);
			JABridge._events[eventName] = eventDescriptor;
			JABridge._eventsArray.push(eventDescriptor);
		}

		public static function connect(connectCallback:Function, closeCallback:Function = null) : void
		{
			if (!JABridge._isAvailable)
				throw new Error("ExternalInterface not available.");
			if (connectCallback == null)
				throw new TypeError("Parameter connectCallback must be non-null.");

			JABridge.close();

			try
			{
				ExternalInterface.addCallback("JABridge_receiveOperation", JABridge._receiveOperation);
				JABridge._connectCallback = connectCallback;
				JABridge._closeCallback = closeCallback;
				JABridge._isInitialized = true;
			}
			catch (e:SecurityError)
			{
				throw new SecurityError(e.message);
			}
			catch (e:Error)
			{
				throw new Error(e.message);
			}

			try
			{
				JABridge._sendOperation({ id:JABridge._id, type:"connect" });
				JABridge._isConnected = true;
				JABridge._notifyConnectTimeout = setTimeout(JABridge._notifyConnect, 0);
			}
			catch (e:Error)
			{
			}
		}

		public static function close() : void
		{
			if (!JABridge._isInitialized)
				return;

			clearTimeout(JABridge._notifyConnectTimeout);

			var wasConnected:Boolean = JABridge._isConnected;
			var wasNotified:Boolean = JABridge._isNotified;
			var closeCallback:Function = JABridge._closeCallback;

			JABridge._hasListeners = new Object();
			JABridge._eventListeners = new Object();
			JABridge._connectCallback = null;
			JABridge._closeCallback = null;
			JABridge._isInitialized = false;
			JABridge._isConnected = false;
			JABridge._isNotified = false;

			ExternalInterface.addCallback("JABridge_receiveOperation", JABridge._ignoreOperation);

			if (wasConnected)
			{
				try
				{
					JABridge._sendOperation({ id:JABridge._id, type:"close" });
				}
				catch (e:Error)
				{
				}

				if (wasNotified && (closeCallback != null))
				{
					try
					{
						closeCallback();
					}
					catch (e:Error)
					{
						JABridge._delayThrow(e);
					}
				}
			}
		}

		public static function getInterface() : Object
		{
			if (!JABridge._isConnected)
				throw new IllegalOperationError("JABridge not connected.");

			var interfaceDescriptor:Object;
			try
			{
				interfaceDescriptor = JABridge._sendOperation({ id:JABridge._id, type:"getInterface" });
				JABridge._addInterfaceToString(interfaceDescriptor);
			}
			catch (e:Error)
			{
				throw new Error(e.message);
			}
			return interfaceDescriptor;
		}

		public static function getProperty(propertyName:String) : *
		{
			if (!JABridge._isConnected)
				throw new IllegalOperationError("JABridge not connected.");
			if (propertyName == null)
				throw new TypeError("Parameter propertyName must be non-null.");
			if (propertyName.length == 0)
				throw new TypeError("Parameter propertyName must be non-empty.");

			var value:*;
			try
			{
				value = JABridge._sendOperation({ id:JABridge._id, type:"getProperty", propertyName:propertyName });
			}
			catch (e:Error)
			{
				throw new Error(e.message);
			}
			return value;
		}

		public static function setProperty(propertyName:String, value:*) : void
		{
			if (!JABridge._isConnected)
				throw new IllegalOperationError("JABridge not connected.");
			if (propertyName == null)
				throw new TypeError("Parameter propertyName must be non-null.");
			if (propertyName.length == 0)
				throw new TypeError("Parameter propertyName must be non-empty.");

			try
			{
				JABridge._sendOperation({ id:JABridge._id, type:"setProperty", propertyName:propertyName, value:value });
			}
			catch (e:Error)
			{
				throw new Error(e.message);
			}
		}

		public static function callMethod(methodName:String, ... arguments) : *
		{
			if (!JABridge._isConnected)
				throw new IllegalOperationError("JABridge not connected.");
			if (methodName == null)
				throw new TypeError("Parameter methodName must be non-null.");
			if (methodName.length == 0)
				throw new TypeError("Parameter methodName must be non-empty.");

			var result:*;
			try
			{
				result = JABridge._sendOperation({ id:JABridge._id, type:"callMethod", methodName:methodName, arguments:arguments });
			}
			catch (e:Error)
			{
				throw new Error(e.message);
			}
			return result;
		}

		public static function addEventListener(eventName:String, listener:Function) : void
		{
			if (!JABridge._isConnected)
				throw new IllegalOperationError("JABridge not connected.");
			if (eventName == null)
				throw new TypeError("Parameter eventName must be non-null.");
			if (eventName.length == 0)
				throw new TypeError("Parameter eventName must be non-empty.");
			if (listener == null)
				throw new TypeError("Parameter listener must be non-null.");

			try
			{
				var listeners:Array = JABridge._eventListeners[eventName];
				if (listeners == null)
				{
					JABridge._sendOperation({ id:JABridge._id, type:"addEventListener", eventName:eventName });
					listeners = JABridge._eventListeners[eventName] = new Array();
					listeners.push(listener);
				}
				else if (listeners.indexOf(listener) < 0)
				{
					listeners.push(listener);
				}
			}
			catch (e:Error)
			{
				throw new Error(e.message);
			}
		}

		public static function removeEventListener(eventName:String, listener:Function) : void
		{
			if (!JABridge._isConnected)
				throw new IllegalOperationError("JABridge not connected.");
			if (eventName == null)
				throw new TypeError("Parameter eventName must be non-null.");
			if (eventName.length == 0)
				throw new TypeError("Parameter eventName must be non-empty.");
			if (listener == null)
				throw new TypeError("Parameter listener must be non-null.");

			try
			{
				var listeners:Array = JABridge._eventListeners[eventName];
				if (listeners != null)
				{
					var index:int = listeners.indexOf(listener);
					if (index >= 0)
					{
						listeners.splice(index, 1);
						if (listeners.length == 0)
						{
							delete JABridge._eventListeners[eventName];
							JABridge._sendOperation({ id:JABridge._id, type:"removeEventListener", eventName:eventName });
						}
					}
				}
			}
			catch (e:Error)
			{
				throw new Error(e.message);
			}
		}

		public static function dispatchEvent(eventName:String, ... arguments) : void
		{
			if (!JABridge._isConnected)
				throw new IllegalOperationError("JABridge not connected.");
			if (eventName == null)
				throw new TypeError("Parameter eventName must be non-null.");
			if (eventName.length == 0)
				throw new TypeError("Parameter eventName must be non-empty.");

			var eventDescriptor:EventDescriptor = JABridge._events[eventName];
			if (!eventDescriptor)
				throw new Error("Unknown event " + eventName + ".");

			if (!JABridge._hasListeners[eventName])
				return;

			try
			{
				JABridge._sendOperation({ id:JABridge._id, type:"dispatchEvent", eventName:eventName, arguments:arguments });
			}
			catch (e:Error)
			{
				throw new Error(e.message);
			}
		}

		// Private Static Methods

		private static function _sendOperation(operation:*) : *
		{
			operation = Cerealizer.serialize(operation);
			var response:* = ExternalInterface.call("JABridge_receiveOperation", operation);
			response = Cerealizer.deserialize(response);

			if (response == null)
				throw new Error("Null response object. Connection may have been lost.");
			if (typeof(response) != "object")
				throw new Error("Invalid response object.");

			if (response.success != true)
			{
				if (response.message)
					throw new Error(response.message);
				throw new Error("Unknown error.");
			}

			return response.result;
		}

		private static function _receiveOperation(operation:*) : *
		{
			var response:*;
			try
			{
				operation = Cerealizer.deserialize(operation);

				if (operation == null)
					throw new Error("Null operation object.");
				if (typeof(operation) != "object")
					throw new Error("Invalid operation object.");
				if (!operation.type)
					throw new Error("Null operation type.");

				switch (operation.type)
				{
					case "connect":
						response = JABridge._processConnect(operation.id);
						break;
					case "close":
						response = JABridge._processClose();
						break;
					case "getInterface":
						response = JABridge._processGetInterface();
						break;
					case "getProperty":
						response = JABridge._processGetProperty(operation.propertyName);
						break;
					case "setProperty":
						response = JABridge._processSetProperty(operation.propertyName, operation.value);
						break;
					case "callMethod":
						response = JABridge._processCallMethod(operation.methodName, operation.arguments);
						break;
					case "addEventListener":
						response = JABridge._processAddEventListener(operation.eventName);
						break;
					case "removeEventListener":
						response = JABridge._processRemoveEventListener(operation.eventName);
						break;
					case "dispatchEvent":
						response = JABridge._processDispatchEvent(operation.eventName, operation.arguments);
						break;
					default:
						response = JABridge._errorResponse("Unknown operation " + operation.type + ".");
						break;
				}
			}
			catch (e:Error)
			{
				response = JABridge._errorResponse(e.message);
			}

			response = Cerealizer.serialize(response);

			return response;
		}

		private static function _ignoreOperation(operation:*) : *
		{
			return null;
		}

		private static function _processConnect(id:*) : Object
		{
			var response:Object;
			try
			{
				id = id as String;
				if (!id)
					throw new Error("Null id.");

				if (!JABridge._isConnected)
				{
					JABridge._id = id;
					JABridge._isConnected = true;
					JABridge._notifyConnectTimeout = setTimeout(JABridge._notifyConnect, 0);
				}

				response = JABridge._successResponse();
			}
			catch (e:Error)
			{
				response = JABridge._errorResponse(e.message);
			}
			return response;
		}

		private static function _processClose() : Object
		{
			if (JABridge._isConnected)
			{
				clearTimeout(JABridge._notifyConnectTimeout);

				var wasNotified:Boolean = JABridge._isNotified;

				JABridge._hasListeners = new Object();
				JABridge._eventListeners = new Object();
				JABridge._isConnected = false;
				JABridge._isNotified = false;

				var closeCallback:Function = JABridge._closeCallback;
				if (wasNotified && (closeCallback != null))
				{
					try
					{
						closeCallback();
					}
					catch (e:Error)
					{
						JABridge._delayThrow(e);
					}
				}
			}

			return JABridge._successResponse();
		}

		private static function _processGetInterface() : Object
		{
			var properties:Array = new Array();
			var methods:Array = new Array();
			var events:Array = new Array();
			var property:Object;
			var method:Object;
			var event:Object;

			for each (var propertyDescriptor:PropertyDescriptor in JABridge._propertiesArray)
			{
				property = new Object();
				property.name = propertyDescriptor.name;
				if (propertyDescriptor.getter == null)
					property.access = "write-only";
				else if (propertyDescriptor.setter == null)
					property.access = "read-only";
				else
					property.access = "read-write";
				property.type = propertyDescriptor.type;
				property.description = propertyDescriptor.description;
				properties.push(property);
			}

			for each (var methodDescriptor:MethodDescriptor in JABridge._methodsArray)
			{
				method = new Object();
				method.name = methodDescriptor.name;
				method.parameters = methodDescriptor.parameters;
				method.returnType = methodDescriptor.returnType;
				method.description = methodDescriptor.description;
				methods.push(method);
			}

			for each (var eventDescriptor:EventDescriptor in JABridge._eventsArray)
			{
				event = new Object();
				event.name = eventDescriptor.name;
				event.parameters = eventDescriptor.parameters;
				event.description = eventDescriptor.description;
				events.push(event);
			}

			return JABridge._resultResponse({ properties:properties, methods:methods, events:events });
		}

		private static function _processGetProperty(propertyName:*) : Object
		{
			var response:Object;
			try
			{
				propertyName = propertyName as String;
				if (!propertyName)
					throw new Error("Null propertyName.");

				var propertyDescriptor:PropertyDescriptor = JABridge._properties[propertyName];
				if (!propertyDescriptor)
					throw new Error("Unknown property " + propertyName + ".");
				if (propertyDescriptor.getter == null)
					throw new Error("Property " + propertyName + " is write-only.");

				var result:* = propertyDescriptor.getter();
				response = JABridge._resultResponse(result);
			}
			catch (e:Error)
			{
				response = JABridge._errorResponse(e.message);
			}
			return response;
		}

		private static function _processSetProperty(propertyName:*, value:*) : Object
		{
			var response:Object;
			try
			{
				propertyName = propertyName as String;
				if (!propertyName)
					throw new Error("Null propertyName.");

				var propertyDescriptor:PropertyDescriptor = JABridge._properties[propertyName];
				if (!propertyDescriptor)
					throw new Error("Unknown property " + propertyName + ".");
				if (propertyDescriptor.setter == null)
					throw new Error("Property " + propertyName + " is read-only.");

				propertyDescriptor.setter(value);
				response = JABridge._successResponse();
			}
			catch (e:Error)
			{
				response = JABridge._errorResponse(e.message);
			}
			return response;
		}

		private static function _processCallMethod(methodName:*, arguments:*) : Object
		{
			var response:Object;
			try
			{
				methodName = methodName as String;
				if (!methodName)
					throw new Error("Null methodName.");

				var methodDescriptor:MethodDescriptor = JABridge._methods[methodName];
				if (!methodDescriptor)
					throw new Error("Unknown method " + methodName + ".");

				if ((arguments != null) && !(arguments is Array))
					arguments = [ arguments ];

				var result:* = methodDescriptor.method.apply(null, arguments);
				response = JABridge._resultResponse(result);
			}
			catch (e:Error)
			{
				response = JABridge._errorResponse(e.message);
			}
			return response;
		}

		private static function _processAddEventListener(eventName:*) : Object
		{
			var response:Object;
			try
			{
				eventName = eventName as String;
				if (!eventName)
					throw new Error("Null eventName.");

				var eventDescriptor:EventDescriptor = JABridge._events[eventName];
				if (!eventDescriptor)
					throw new Error("Unknown event " + eventName + ".");

				JABridge._hasListeners[eventName] = true;
				response = JABridge._successResponse();
			}
			catch (e:Error)
			{
				response = JABridge._errorResponse(e.message);
			}
			return response;
		}

		private static function _processRemoveEventListener(eventName:*) : Object
		{
			var response:Object;
			try
			{
				eventName = eventName as String;
				if (!eventName)
					throw new Error("Null eventName.");

				var eventDescriptor:EventDescriptor = JABridge._events[eventName];
				if (!eventDescriptor)
					throw new Error("Unknown event " + eventName + ".");

				delete JABridge._hasListeners[eventName];
				response = JABridge._successResponse();
			}
			catch (e:Error)
			{
				response = JABridge._errorResponse(e.message);
			}
			return response;
		}

		private static function _processDispatchEvent(eventName:*, arguments:*) : Object
		{
			var response:Object;
			try
			{
				eventName = eventName as String;
				if (!eventName)
					throw new Error("Null eventName.");

				if ((arguments != null) && !(arguments is Array))
					arguments = [ arguments ];

				var listeners:Array = JABridge._eventListeners[eventName];
				if (listeners != null)
				{
					listeners = listeners.concat();
					for each (var listener:Function in listeners)
						listener.apply(null, arguments);
				}

				response = JABridge._successResponse();
			}
			catch (e:Error)
			{
				response = JABridge._errorResponse(e.message);
			}
			return response;
		}

		private static function _successResponse() : Object
		{
			return { success:true };
		}

		private static function _resultResponse(result:*) : Object
		{
			return { success:true, result:result };
		}

		private static function _errorResponse(message:String) : Object
		{
			return { success:false, message:message };
		}

		private static function _notifyConnect() : void
		{
			JABridge._isNotified = true;
			JABridge._connectCallback();
		}

		private static function _delayThrow(e:Error) : void
		{
			setTimeout(function() : void { throw e; }, 0);
		}

		private static function _addInterfaceToString(interfaceDescriptor:Object) : void
		{
			interfaceDescriptor.toString = function() : String
			{
				var str:String = "";

				var numParameters:int;
				var i:int;

				str += "----------------------------------------\n";
				str += "properties\n";
				str += "----------------------------------------\n";
				str += "\n";
				for each (var property:Object in this.properties)
				{
					str += property.name;
					if (property.type)
						str += ":" + property.type;
					if (property.access == "read-only")
						str += " [read-only]";
					else if (property.access == "write-only")
						str += " [write-only]";
					if (property.description)
						str += "\n" + property.description;
					str += "\n\n";
				}

				str += "----------------------------------------\n";
				str += "methods\n";
				str += "----------------------------------------\n";
				str += "\n";
				for each (var method:Object in this.methods)
				{
					str += method.name;
					str += "(";
					if (method.parameters)
					{
						numParameters = method.parameters.length;
						for (i = 0; i < numParameters; i++)
						{
							if (i > 0)
								str += ", ";
							str += method.parameters[i];
						}
					}
					str += ")";
					if (method.returnType)
						str += ":" + method.returnType;
					if (method.description)
						str += "\n" + method.description;
					str += "\n\n";
				}

				str += "----------------------------------------\n";
				str += "events\n";
				str += "----------------------------------------\n";
				str += "\n";
				for each (var event:Object in this.events)
				{
					str += event.name;
					str += "(";
					if (event.parameters)
					{
						numParameters = event.parameters.length;
						for (i = 0; i < numParameters; i++)
						{
							if (i > 0)
								str += ", ";
							str += event.parameters[i];
						}
					}
					str += ")";
					if (event.description)
						str += "\n" + event.description;
					str += "\n\n";
				}

				return str;
			};
		}

	}

}

class PropertyDescriptor
{

	// Public Properties

	public var name:String;
	public var getter:Function;
	public var setter:Function;
	public var type:String;
	public var description:String;

	// Constructor

	public function PropertyDescriptor(name:String, getter:Function, setter:Function, type:String = null, description:String = null)
	{
		this.name = name;
		this.getter = getter;
		this.setter = setter;
		this.type = type;
		this.description = description;
	}

}

class MethodDescriptor
{

	// Public Properties

	public var name:String;
	public var method:Function;
	public var parameters:Array;
	public var returnType:String;
	public var description:String;

	// Constructor

	public function MethodDescriptor(name:String, method:Function, parameters:Array = null, returnType:String = null, description:String = null)
	{
		this.name = name;
		this.method = method;
		this.parameters = parameters;
		this.returnType = returnType;
		this.description = description;
	}

}

class EventDescriptor
{

	// Public Properties

	public var name:String;
	public var parameters:Array;
	public var description:String;

	// Constructor

	public function EventDescriptor(name:String, parameters:Array = null, description:String = null)
	{
		this.name = name;
		this.parameters = parameters;
		this.description = description;
	}

}

final class Cerealizer
{

	// Private Static Properties

	private static var _references:Array;
	private static var _tokens:String;
	private static var _tokenCount:int;
	private static var _tokenIndex:int;

	// Public Static Methods

	public static function serialize(value:*) : *
	{
		Cerealizer._references = new Array();
		var serializedValue:* = Cerealizer._serializeValue(value);
		Cerealizer._references = null;
		return serializedValue;
	}

	public static function deserialize(serializedValue:*) : *
	{
		var value:*;

		try
		{
			Cerealizer._references = new Array();
			Cerealizer._tokens = serializedValue as String;
			Cerealizer._tokenCount = Cerealizer._tokens ? Cerealizer._tokens.length : 0;
			Cerealizer._tokenIndex = 0;

			value = Cerealizer._deserializeNext();

			if (Cerealizer._tokenIndex < Cerealizer._tokenCount)
				throw new Error("Unexpected token.");
		}
		catch (e:Error)
		{
			throw new Error("Deserialize error at index " + Cerealizer._tokenIndex + ": " + e.message);
		}
		finally
		{
			Cerealizer._references = null;
			Cerealizer._tokens = null;
			Cerealizer._tokenCount = 0;
			Cerealizer._tokenIndex = 0;
		}

		return value;
	}

	// Private Static Methods

	private static function _serializeValue(value:*) : String
	{
		if (value == null)
			return "";

		switch (typeof(value))
		{
			case "number":
				return Cerealizer._serializeNumber(value);
			case "boolean":
				return Cerealizer._serializeBoolean(value);
			case "string":
				return Cerealizer._serializeString(value);
			case "object":
				var ref:String = Cerealizer._serializeReference(value);
				if (ref)
					return ref;
				if (value is Array)
					return Cerealizer._serializeArray(value);
				else
					return Cerealizer._serializeObject(value);
			default:
				return "";
		}
	}

	private static function _serializeNumber(num:Number) : String
	{
		return "#" + String(num) + "#";
	}

	private static function _serializeBoolean(bool:Boolean) : String
	{
		return bool ? "t" : "f";
	}

	private static function _serializeString(str:String) : String
	{
		return "\"" + escape(str) + "\"";
	}

	private static function _serializeArray(arr:Array) : String
	{
		Cerealizer._references.push(arr);

		var str:String = "";

		str += "[";
		var length:int = arr.length;
		for (var i:int = 0; i < length; i++)
		{
			if (i > 0)
				str += ",";
			str += Cerealizer._serializeValue(arr[i]);
		}
		str += "]";

		return str;
	}

	private static function _serializeObject(obj:Object) : String
	{
		Cerealizer._references.push(obj);

		var str:String = "";

		str += "{";
		var i:int = 0;
		for (var p:String in obj)
		{
			if (i > 0)
				str += ",";
			str += escape(p) + ":" + Cerealizer._serializeValue(obj[p]);
			i++;
		}
		str += "}";

		return str;
	}

	private static function _serializeReference(ref:*) : String
	{
		var index:int = Cerealizer._references.indexOf(ref);
		if (index >= 0)
			return "@" + index + "@";
		return null;
	}

	private static function _deserializeNext() : *
	{
		if (Cerealizer._tokenIndex >= Cerealizer._tokenCount)
			return null;

		switch (Cerealizer._tokens.charAt(Cerealizer._tokenIndex))
		{
			case "#":
				return Cerealizer._deserializeNumber();
			case "t":
			case "f":
				return Cerealizer._deserializeBoolean();
			case "\"":
				return Cerealizer._deserializeString();
			case "[":
				return Cerealizer._deserializeArray();
			case "{":
				return Cerealizer._deserializeObject();
			case "@":
				return Cerealizer._deserializeReference();
			default:
				return null;
		}
	}

	private static function _deserializeNumber() : Number
	{
		Cerealizer._tokenIndex++;  // eat #

		var endIndex:int = Cerealizer._tokens.indexOf("#", Cerealizer._tokenIndex);
		if (endIndex < 0)
			throw new Error("Expecting closing #.");
		if (endIndex == Cerealizer._tokenIndex)
			throw new Error("Expecting number.");

		var num:Number = Number(Cerealizer._tokens.substring(Cerealizer._tokenIndex, endIndex));
		Cerealizer._tokenIndex = endIndex + 1;
		return num;
	}

	private static function _deserializeBoolean() : Boolean
	{
		return (Cerealizer._tokens.charAt(Cerealizer._tokenIndex++) == "t");
	}

	private static function _deserializeString() : String
	{
		Cerealizer._tokenIndex++;  // eat "

		var endIndex:int = Cerealizer._tokens.indexOf("\"", Cerealizer._tokenIndex);
		if (endIndex < 0)
			throw new Error("Expecting closing quote.");

		var str:String = unescape(Cerealizer._tokens.substring(Cerealizer._tokenIndex, endIndex));
		Cerealizer._tokenIndex = endIndex + 1;
		return str;
	}

	private static function _deserializeArray() : Array
	{
		Cerealizer._tokenIndex++;  // eat [

		if (Cerealizer._tokenIndex >= Cerealizer._tokenCount)
			throw new Error("Expecting closing brace.");

		var arr:Array = new Array();
		Cerealizer._references.push(arr);

		var token:String = Cerealizer._tokens.charAt(Cerealizer._tokenIndex);
		if (token == "]")
		{
			Cerealizer._tokenIndex++;
			return arr;
		}

		while (true)
		{
			arr.push(Cerealizer._deserializeNext());

			if (Cerealizer._tokenIndex >= Cerealizer._tokenCount)
				throw new Error("Expecting closing brace.");

			token = Cerealizer._tokens.charAt(Cerealizer._tokenIndex++);
			if (token == "]")
				break;
			if (token != ",")
				throw new Error("Expecting comma or closing brace.");
		}

		return arr;
	}

	private static function _deserializeObject() : Object
	{
		Cerealizer._tokenIndex++;  // eat {

		if (Cerealizer._tokenIndex >= Cerealizer._tokenCount)
			throw new Error("Expecting closing bracket.");

		var obj:Object = new Object();
		Cerealizer._references.push(obj);

		var token:String = Cerealizer._tokens.charAt(Cerealizer._tokenIndex);
		if (token == "}")
		{
			Cerealizer._tokenIndex++;
			return obj;
		}

		var colonIndex:int;
		var propertyName:String;
		while (true)
		{
			colonIndex = Cerealizer._tokens.indexOf(":", Cerealizer._tokenIndex);
			if (colonIndex < 0)
				throw new Error("Expecting colon.");

			propertyName = unescape(Cerealizer._tokens.substring(Cerealizer._tokenIndex, colonIndex));
			Cerealizer._tokenIndex = colonIndex + 1;

			obj[propertyName] = Cerealizer._deserializeNext();

			if (Cerealizer._tokenIndex >= Cerealizer._tokenCount)
				throw new Error("Expecting closing bracket.");

			token = Cerealizer._tokens.charAt(Cerealizer._tokenIndex++);
			if (token == "}")
				break;
			if (token != ",")
				throw new Error("Expecting comma or closing bracket.");
		}

		return obj;
	}

	private static function _deserializeReference() : *
	{
		Cerealizer._tokenIndex++;  // eat @

		var endIndex:int = Cerealizer._tokens.indexOf("@", Cerealizer._tokenIndex);
		if (endIndex < 0)
			throw new Error("Expecting closing @.");
		if (endIndex == Cerealizer._tokenIndex)
			throw new Error("Expecting integer reference.");

		var referenceIndex:Number = Math.round(Number(Cerealizer._tokens.substring(Cerealizer._tokenIndex, endIndex)));
		if ((referenceIndex != referenceIndex) || (referenceIndex < 0) || (referenceIndex >= Cerealizer._references.length))
			throw new Error("Invalid reference.");

		Cerealizer._tokenIndex = endIndex + 1;

		return Cerealizer._references[referenceIndex];
	}

}
