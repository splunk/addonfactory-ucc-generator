package com.splunk.services.properties
{

	import com.splunk.services.SplunkRequest;
	import com.splunk.services.SplunkResponse;
	import com.splunk.services.events.ServiceErrorEvent;
	import com.splunk.services.events.ServiceErrorType;
	import com.splunk.services.events.ServiceEvent;
	import com.splunk.services.events.ServiceProgressEvent;
	import com.splunk.services.namespaces.atom;
	import flash.events.EventDispatcher;

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
	 * Dispatched after the load operation is complete.
	 * 
	 * @eventType com.splunk.services.events.ServiceEvent.COMPLETE
	 * 
	 * @see #value
	 * @see #load()
	 */
	[Event(name="complete", type="com.splunk.services.events.ServiceEvent")]

	/**
	 * Dispatched if the connection is closed before the load operation is
	 * complete.
	 * 
	 * @eventType com.splunk.services.events.ServiceEvent.CLOSE
	 * 
	 * @see #close()
	 */
	[Event(name="close", type="com.splunk.services.events.ServiceEvent")]

	/**
	 * Dispatched if an error occurs that terminates the load operation.
	 * 
	 * @eventType com.splunk.services.events.ServiceErrorEvent.ERROR
	 * 
	 * @see #load()
	 */
	[Event(name="error", type="com.splunk.services.events.ServiceErrorEvent")]

	/**
	 * The Key class is used to retrieve a key from a particular stanza.
	 */
	public class Key extends EventDispatcher
	{

		// Private Properties

		private var _stanza:Stanza;
		private var _name:String;
		private var _value:String;

		private var _isOpen:Boolean = false;
		private var _loadResponse:SplunkResponse;

		// Constructor

		/**
		 * Creates a new Key object.
		 * 
		 * @param stanza The Stanza instance from which to retrieve a key.
		 * @param name The name of the key to retrieve.
		 * @param value The initial value of the key.
		 * 
		 * @throws TypeError The value of the stanza parameter is null or the
		 * value of the name parameter is empty.
		 * 
		 * @see Stanza
		 */
		public function Key(stanza:Stanza, name:String, value:String = null)
		{
			if (!stanza)
				throw new TypeError("Parameter stanza must be non-null.");
			if (!name)
				throw new TypeError("Parameter name must be non-empty.");

			this._stanza = stanza;
			this._name = name;
			this._value = value;
		}

		// Public Getters/Setters

		/**
		 * The Stanza instance that this Key object connects to. This value
		 * corresponds to the value of the stanza parameter specified in the
		 * constructor.
		 * 
		 * @see Stanza
		 */
		public function get stanza() : Stanza
		{
			return this._stanza;
		}

		/**
		 * The name of this key. This value corresponds to the value of the name
		 * parameter specified in the constructor.
		 */
		public function get name() : String
		{
			return this._name;
		}

		/**
		 * The value of this key. This property is populated when the object is
		 * created or when the load operation is complete.
		 */
		public function get value() : String
		{
			return this._value;
		}

		// Public Methods

		/**
		 * Loads a key from the associated Stanza instance. If a key is already
		 * loading, the load operation is closed.
		 */
		public function load() : void
		{
			// close previous load operation
			this.close();

			// create request
			var request:SplunkRequest = new SplunkRequest("properties/" + this._stanza.file.name + "/" + this._stanza.name + "/" + this._name);

			// create loadResponse
			this._loadResponse = new SplunkResponse(this._stanza.file.service);
			this._loadResponse.addEventListener(ServiceEvent.OPEN, this._load_open);
			this._loadResponse.addEventListener(ServiceProgressEvent.PROGRESS, this._load_progress);
			this._loadResponse.addEventListener(ServiceEvent.COMPLETE, this._load_complete);
			this._loadResponse.addEventListener(ServiceErrorEvent.ERROR, this._load_error);

			// load
			this._loadResponse.load(request);
		}

		/**
		 * Closes the load operation in progress.
		 */
		public function close() : void
		{
			// close loadResponse
			if (this._loadResponse)
			{
				this._loadResponse.close();
				this._loadResponse = null;
			}

			// reset properties
			this._value = null;

			// notify close
			if (this._isOpen)
			{
				this._isOpen = false;
				this.dispatchEvent(new ServiceEvent(ServiceEvent.CLOSE));
			}
		}

		// Private Methods

		private function _load_open(e:ServiceEvent) : void
		{
			this._isOpen = true;
			this.dispatchEvent(e);
		}

		private function _load_progress(e:ServiceProgressEvent) : void
		{
			this.dispatchEvent(e);
		}

		private function _load_complete(e:ServiceEvent) : void
		{
			var response:SplunkResponse = this._loadResponse;
			this._loadResponse = null;
			if (response.status == 200)
			{
				this._value = String(response.data);

				this.dispatchEvent(e);
			}
			else
			{
				this.dispatchEvent(new ServiceErrorEvent(ServiceErrorEvent.ERROR, false, false, "Invalid response status=" + response.status, ServiceErrorType.HTTP_STATUS));
			}
		}

		private function _load_error(e:ServiceErrorEvent) : void
		{
			this._isOpen = false;
			this._loadResponse = null;
			this.dispatchEvent(e);
		}

	}

}
