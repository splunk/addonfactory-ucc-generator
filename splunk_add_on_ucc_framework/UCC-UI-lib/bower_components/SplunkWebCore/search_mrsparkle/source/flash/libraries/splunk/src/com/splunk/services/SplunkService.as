package com.splunk.services
{

	import com.splunk.services.events.ServiceErrorEvent;
	import com.splunk.services.events.ServiceErrorType;
	import com.splunk.services.events.ServiceEvent;
	import flash.errors.IllegalOperationError;
	import flash.events.EventDispatcher;
	import flash.net.URLRequestMethod;

	/**
	 * Dispatched when a service connection has been established.
	 * 
	 * @eventType com.splunk.services.events.ServiceEvent.CONNECT
	 * 
	 * @see #authenticate()
	 * @see #loadSession()
	 */
	[Event(name="connect", type="com.splunk.services.events.ServiceEvent")]

	/**
	 * Dispatched when the service connection is closed.
	 * 
	 * @eventType com.splunk.services.events.ServiceEvent.CLOSE
	 * 
	 * @see #close()
	 */
	[Event(name="close", type="com.splunk.services.events.ServiceEvent")]

	/**
	 * Dispatched if an error occurs that terminates the service connection.
	 * 
	 * @eventType com.splunk.services.events.ServiceErrorEvent.ERROR
	 * 
	 * @see #authenticate()
	 * @see #loadSession()
	 */
	[Event(name="error", type="com.splunk.services.events.ServiceErrorEvent")]

	/**
	 * The SplunkService class connects to a Splunkd server. The default
	 * assumption is that this class is connecting to the Splunk UI server, and
	 * not directly to the Splunkd engine.
	 */
	public class SplunkService extends EventDispatcher
	{

		// Private Properties

		private var _hostPath:String = "http://localhost:8000";
		private var _basePath:String = "/splunkd/services";
		private var _sessionKey:String;
		private var _isConnected:Boolean = false;

		private var _loadSessionKey:String;
		private var _connectResponse:SplunkResponse;

		// Constructor

		/**
		 * Creates a new SplunkService object.
		 * 
		 * @param hostPath The complete host URI (excluding path) of the Splunk
		 * server with which to connect.
		 * @param basePath The base URI path to prepend to relative URIs.
		 */
		public function SplunkService(hostPath:String = "http://localhost:8000", basePath:String = "/splunkd/services")
		{
			if (hostPath != null)
				this._hostPath = hostPath;
			if (basePath != null)
				this._basePath = basePath;
		}

		// Public Getters/Setters

		/**
		 * The complete host URI (excluding path) of the Splunk server with
		 * which to connect. This value corresponds to the value of the hostPath
		 * parameter specified in the constructor.
		 */
		public function get hostPath() : String
		{
			return this._hostPath;
		}

		/**
		 * The base URI path to prepend to relative URIs. This value corresponds
		 * to the value of the basePath parameter specified in the constructor.
		 */
		public function get basePath() : String
		{
			return this._basePath;
		}

		/**
		 * The session identifier for a currently connected SplunkService
		 * object.
		 */
		public function get sessionKey() : String
		{
			return this._sessionKey;
		}

		/**
		 * Indicates whether this SplunkService object is currently connected.
		 */
		public function get isConnected() : Boolean
		{
			return this._isConnected;
		}

		// Public Methods

		/**
		 * Authenticates with the Splunk server specified in the hostPath
		 * property, using login credentials. If a service is already connected,
		 * the connection is closed.
		 * 
		 * @param username The username of a Splunk user.
		 * @param password The password associated with the username.
		 * 
		 * @throws TypeError The value of the username or password parameter is
		 * null.
		 */
		public function authenticate(username:String, password:String) : void
		{
			// validate arguments
			if (username == null)
				throw new TypeError("Parameter username must be non-null.");
			if (password == null)
				throw new TypeError("Parameter password must be non-null.");

			// close previous connection
			this.close();

			// create variables
			var variables:Object = new Object();
			variables.username = username;
			variables.password = password;

			// create request
			var request:SplunkRequest = new SplunkRequest("auth/login");
			request.variables = variables;
			request.method = URLRequestMethod.POST;
			request.requiresAuthentication = false;

			// create connectResponse
			this._connectResponse = new SplunkResponse(this);
			this._connectResponse.addEventListener(ServiceEvent.COMPLETE, this._authenticate_complete);
			this._connectResponse.addEventListener(ServiceErrorEvent.ERROR, this._authenticate_error);

			// load
			this._connectResponse.load(request);
		}

		/**
		 * Connects to an existing authenticated session. This method is used if
		 * there is a managing service that has already obtained a session key.
		 * If a service is already connected, the connection is closed.
		 * 
		 * @param sessionKey The authentication token to use.
		 * @param validate Whether to validate the sessionKey by sending a
		 * request to the server.
		 */
		public function loadSession(sessionKey:String, validate:Boolean = true) : void
		{
			// close previous connection
			this.close();

			// store properties for this request
			this._loadSessionKey = sessionKey;

			if (validate)
			{
				// create variables
				var variables:Object = new Object();
				if (sessionKey)
					variables.authtoken = sessionKey;

				// create request
				var request:SplunkRequest = new SplunkRequest("search/jobs");
				request.variables = variables;
				request.requiresAuthentication = false;

				// create connectResponse
				this._connectResponse = new SplunkResponse(this);
				this._connectResponse.addEventListener(ServiceEvent.COMPLETE, this._loadSession_complete);
				this._connectResponse.addEventListener(ServiceErrorEvent.ERROR, this._loadSession_error);

				// load
				this._connectResponse.load(request);
			}
			else
			{
				this._sessionKey = this._loadSessionKey;
				this._isConnected = true;

				this.dispatchEvent(new ServiceEvent(ServiceEvent.CONNECT));
			}
		}

		/**
		 * Closes the service connection.
		 */
		public function close() : void
		{
			// close connectResponse
			if (this._connectResponse)
			{
				this._connectResponse.close();
				this._connectResponse = null;
			}

			// reset properties
			this._sessionKey = null;
			this._loadSessionKey = null;

			// notify close
			if (this._isConnected)
			{
				this._isConnected = false;
				this.dispatchEvent(new ServiceEvent(ServiceEvent.CLOSE));
			}
		}

		// Private Methods

		private function _authenticate_complete(e:ServiceEvent) : void
		{
			var response:SplunkResponse = this._connectResponse;
			this._connectResponse = null;
			if (response.status == 200)
			{
				var root:XML;
				try
				{
					root = new XML(response.data);
					var sid:String = root.sessionKey;
					if (sid)
					{
						this._sessionKey = sid;
						this._isConnected = true;
						this.dispatchEvent(new ServiceEvent(ServiceEvent.CONNECT));
					}
					else
					{
						this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, "Data parse error: sessionKey not found.", ServiceErrorType.DATA));
					}
				}
				catch (error:Error)
				{
					this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, error.message, ServiceErrorType.DATA));
				}
				finally
				{
					// workaround for XML memory leak
					if (root)
						root.replace("*", null);
				}
			}
			else
			{
				this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, "Invalid response status: status=" + response.status, ServiceErrorType.HTTP_STATUS));
			}
		}

		private function _authenticate_error(e:ServiceErrorEvent) : void
		{
			this._connectResponse = null;
			this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, e.text, e.errorType, e.messages));
		}

		private function _loadSession_complete(e:ServiceEvent) : void
		{
			var response:SplunkResponse = this._connectResponse;
			this._connectResponse = null;
			if (response.status == 200)
			{
				this._sessionKey = this._loadSessionKey;
				this._isConnected = true;
				this.dispatchEvent(new ServiceEvent(ServiceEvent.CONNECT));
			}
			else
			{
				this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, "Invalid response status: status=" + response.status, ServiceErrorType.HTTP_STATUS));
			}
		}

		private function _loadSession_error(e:ServiceErrorEvent) : void
		{
			this._connectResponse = null;
			this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, e.text, e.errorType, e.messages));
		}

	}

}
