package com.splunk.services
{

	import com.splunk.services.events.ServiceErrorEvent;
	import com.splunk.services.events.ServiceErrorType;
	import com.splunk.services.events.ServiceEvent;
	import com.splunk.services.events.ServiceProgressEvent;
	import flash.events.ErrorEvent;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.events.HTTPStatusEvent;
	import flash.events.IOErrorEvent;
	import flash.events.ProgressEvent;
	import flash.events.SecurityErrorEvent;
	import flash.net.URLLoader;
	import flash.net.URLRequest;
	import flash.net.URLVariables;

	/**
	 * Dispatched when a load operation starts.
	 * 
	 * @eventType com.splunk.services.events.ServiceEvent.OPEN
	 * 
	 * @see #load()
	 */
	[Event(name="open", type="com.splunk.services.events.ServiceEvent")]

	/**
	 * Dispatched as the load operation progresses.
	 * 
	 * @eventType com.splunk.services.events.ServiceProgressEvent.PROGRESS
	 * 
	 * @see #load()
	 */
	[Event(name="progress", type="com.splunk.services.events.ServiceProgressEvent")]

	/**
	 * Dispatched after the response is received and status or data information
	 * is available.
	 * 
	 * @eventType com.splunk.services.events.ServiceEvent.COMPLETE
	 * 
	 * @see #status
	 * @see #data
	 * @see #load()
	 */
	[Event(name="complete", type="com.splunk.services.events.ServiceEvent")]

	/**
	 * Dispatched if the connection is closed before a response is received.
	 * 
	 * @eventType com.splunk.services.events.ServiceEvent.CLOSE
	 * 
	 * @see #close()
	 */
	[Event(name="close", type="com.splunk.services.events.ServiceEvent")]

	/**
	 * Dispatched if an error occurs that terminates the response.
	 * 
	 * @eventType com.splunk.services.events.ServiceErrorEvent.ERROR
	 * 
	 * @see #load()
	 */
	[Event(name="error", type="com.splunk.services.events.ServiceErrorEvent")]

	/**
	 * The SplunkResponse class loads response information from a SplunkService.
	 * The response will be in the form of an HTTP status code and raw text
	 * data. Status and data information are available only after the
	 * <code>complete</code> event is dispatched.
	 * 
	 * @see SplunkService
	 */
	public class SplunkResponse extends EventDispatcher
	{

		// Private Properties

		private var _service:SplunkService;
		private var _status:int = 0;
		private var _messages:Array;
		private var _data:Object;

		private var _httpStatus:int = 0;
		private var _isOpen:Boolean = false;
		private var _loader:URLLoader;

		// Constructor

		/**
		 * Creates a new SplunkResponse object.
		 * 
		 * @param service The SplunkService instance to connect to.
		 * 
		 * @throws TypeError The value of the service parameter is null.
		 * 
		 * @see SplunkService
		 */
		public function SplunkResponse(service:SplunkService)
		{
			if (!service)
				throw new TypeError("Parameter service must be non-null.");

			this._service = service;
		}

		// Public Getters/Setters

		/**
		 * The SplunkService instance that this SplunkResponse object connects
		 * to. This value corresponds to the value of the service parameter
		 * specified in the constructor.
		 * 
		 * @see SplunkService
		 */
		public function get service() : SplunkService
		{
			return this._service;
		}

		/**
		 * The HTTP status code received from the load operation. This property
		 * is populated only when the load operation is complete or when an
		 * error occurs and an HTTP status code could be established. If no HTTP
		 * status code was received, this value defaults to <code>0</code>.
		 */
		public function get status() : int
		{
			return this._status;
		}

		/**
		 * The list of SplunkMessage objects received from the load operation.
		 * This property is populated only when the load operation is complete
		 * or when an error occurs and message information was received.
		 * 
		 * @see SplunkMessage
		 */
		public function get messages() : Array
		{
			return this._messages ? this._messages.concat() : null;
		}

		/**
		 * The data received from the load operation. This property is populated
		 * only when the load operation is complete. The format of the data is
		 * raw text.
		 */
		public function get data() : Object
		{
			return this._data;
		}

		// Public Methods

		/**
		 * Sends the specified request to a SplunkService and loads the
		 * response. If a response is already loading, it is closed.
		 * 
		 * @param request A SplunkRequest object specifying the path and
		 * variables to the response.
		 * 
		 * @throws TypeError The value of the request parameter is null.
		 * 
		 * @see SplunkRequest
		 */
		public function load(request:SplunkRequest) : void
		{
			// validate arguments
			if (!request)
				throw new TypeError("Parameter request must be non-null.");

			// close previous load operation
			this.close();

			// check that service is connected if requiresAuthentication
			if (request.requiresAuthentication && !this._service.isConnected)
			{
				this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, "Service not connected.", ServiceErrorType.CONNECTION));
				return;
			}

			// try loading (some operations can throw errors, so we will catch
			// these and dispatch them as error events)
			try
			{
				var hostPath:String = this._service.hostPath;
				var basePath:String = this._service.basePath;
				var sessionKey:String = this._service.sessionKey;

				var path:String = request.path;
				var variables:Object = request.variables;
				var method:String = request.method;
				var requiresAuthentication:Boolean = request.requiresAuthentication;

				// construct url
				var url:String;
				if (path)
				{
					if (path.substring(0, 1) == "/")
						url = hostPath + path;
					else
						url = hostPath + basePath + "/" + path;
				}
				else
				{
					url = hostPath + basePath;
				}

				// construct url variables
				var data:URLVariables = new URLVariables();
				var hasData:Boolean = false;
				if (variables)
				{
					for (var name:String in variables)
					{
						data[name] = variables[name];
						hasData = true;
					}
				}
				if (requiresAuthentication && sessionKey)
				{
					data.authtoken = sessionKey;
					hasData = true;
				}

				// construct url request
				var urlRequest:URLRequest = new URLRequest(url);
				if (hasData)
					urlRequest.data = data;
				urlRequest.method = method;

				// create loader
				this._loader = new URLLoader();
				this._loader.addEventListener(HTTPStatusEvent.HTTP_STATUS, this._load_httpStatus);
				this._loader.addEventListener(Event.OPEN, this._load_open);
				this._loader.addEventListener(ProgressEvent.PROGRESS, this._load_progress);
				this._loader.addEventListener(Event.COMPLETE, this._load_complete);
				this._loader.addEventListener(IOErrorEvent.IO_ERROR, this._load_error);
				this._loader.addEventListener(SecurityErrorEvent.SECURITY_ERROR, this._load_error);

				// load
				this._loader.load(urlRequest);
			}
			catch (error:Error)
			{
				// clean up
				this.close();

				// dispatch error event
				var errorType:String = (error is SecurityError) ? ServiceErrorType.SECURITY : ServiceErrorType.IO;
				this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, error.message, errorType));
			}
		}

		/**
		 * Closes the load operation in progress.
		 */
		public function close() : void
		{
			// close loader
			if (this._loader)
			{
				this._loader.close();
				this._loader = null;
			}

			// reset properties
			this._status = 0;
			this._messages = null;
			this._data = null;
			this._httpStatus = 0;

			// notify close
			if (this._isOpen)
			{
				this._isOpen = false;
				this.dispatchEvent(new ServiceEvent(ServiceEvent.CLOSE));
			}
		}

		// Private Methods

		private function _load_httpStatus(e:HTTPStatusEvent) : void
		{
			this._httpStatus = e.status;
		}

		private function _load_open(e:Event) : void
		{
			this._isOpen = true;
			this.dispatchEvent(new ServiceEvent(ServiceEvent.OPEN));
		}

		private function _load_progress(e:ProgressEvent) : void
		{
			this.dispatchEvent(new ServiceProgressEvent(ServiceProgressEvent.PROGRESS, false, false, e.bytesLoaded, e.bytesTotal));
		}

		private function _load_complete(e:Event) : void
		{
			var data:* = this._loader.data;
			var messages:Array = new Array();
			this._isOpen = false;
			this._loader = null;

			// check for http status and messages
			if ((data is String) && (data.length < 1000))
			{
				var root:XML;
				try
				{
					root = new XML(data);

					var messagesNode:XML = root.messages[0];
					if (messagesNode)
					{
						for each (var msgNode:XML in messagesNode.msg)
							messages.push(new SplunkMessage(msgNode.@type.toString(), msgNode.toString()));
					}

					var metaNode:XML = root.meta.(@["http-equiv"] == "status")[0];
					if (metaNode)
					{
						var content:String = metaNode.@content.toString();
						if (content)
						{
							var status:int;
							var message:String;

							var splitIndex:int = content.indexOf(";");
							if (splitIndex > 0)
							{
								status = int(content.substring(0, splitIndex));
								message = content.substring(splitIndex + 1, content.length);
							}
							else
							{
								status = int(content);
								message = (messages.length > 0) ? messages[0].message : "";
							}

							if ((status < 200) || (status >= 400))
							{
								var text:String = message ? status + " - " + message : String(status);
								this._status = status;
								this._messages = messages;
								this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, text, ServiceErrorType.HTTP_STATUS, messages));
								return;
							}
						}
					}
				}
				catch(error:Error)
				{
					// ignore
				}
				finally
				{
					// workaround for XML memory leak
					if (root)
						root.replace("*", null);
				}
			}

			this._status = (this._httpStatus == 0) ? 200 : this._httpStatus;
			this._messages = messages;
			this._data = data;
			this.dispatchEvent(new ServiceEvent(ServiceEvent.COMPLETE));
		}

		private function _load_error(e:ErrorEvent) : void
		{
			this._isOpen = false;
			this._loader = null;
			this._status = this._httpStatus;
			this._messages = new Array();
			var errorType:String = (e is SecurityErrorEvent) ? ServiceErrorType.SECURITY : ServiceErrorType.IO;
			this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, e.text, errorType));
		}

	}

}
