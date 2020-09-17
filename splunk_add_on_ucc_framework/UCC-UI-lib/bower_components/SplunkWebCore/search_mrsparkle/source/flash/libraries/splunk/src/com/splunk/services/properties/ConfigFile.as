package com.splunk.services.properties
{

	import com.splunk.services.SplunkRequest;
	import com.splunk.services.SplunkResponse;
	import com.splunk.services.SplunkService;
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
	 * @see #stanzas
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
	 * The ConfigFile class is used to retrieve a configuration file from a
	 * particular Splunk server.
	 */
	public class ConfigFile extends EventDispatcher
	{

		// Private Properties

		private var _service:SplunkService;
		private var _name:String;
		private var _stanzas:Object;

		private var _isOpen:Boolean = false;
		private var _loadResponse:SplunkResponse;

		// Constructor

		/**
		 * Creates a new ConfigFile object.
		 * 
		 * @param service The SplunkService instance from which to retrieve a
		 * configuration file.
		 * @param name The name of the configuration file to retrieve.
		 * 
		 * @throws TypeError The value of the service parameter is null or the
		 * value of the name parameter is empty.
		 * 
		 * @see com.splunk.services.SplunkService
		 */
		public function ConfigFile(service:SplunkService, name:String)
		{
			if (!service)
				throw new TypeError("Parameter service must be non-null.");
			if (!name)
				throw new TypeError("Parameter name must be non-empty.");

			this._service = service;
			this._name = name;
		}

		// Public Getters/Setters

		/**
		 * The SplunkService instance that this ConfigFile object connects to.
		 * This value corresponds to the value of the service parameter
		 * specified in the constructor.
		 * 
		 * @see com.splunk.services.SplunkService
		 */
		public function get service() : SplunkService
		{
			return this._service;
		}

		/**
		 * The name of this configuration file. This value corresponds to the
		 * value of the name parameter specified in the constructor.
		 */
		public function get name() : String
		{
			return this._name;
		}

		/**
		 * The list of Stanza objects received from the load operation. This
		 * property is populated only when the load operation is complete.
		 * 
		 * @see Stanza
		 */
		public function get stanzas() : Object
		{
			return this._stanzas;
		}

		// Public Methods

		/**
		 * Loads a configuration file from the associated SplunkService
		 * instance. If a file is already loading, the load operation is closed.
		 */
		public function load() : void
		{
			// close previous load operation
			this.close();

			// create request
			var request:SplunkRequest = new SplunkRequest("properties/" + this._name);

			// create loadResponse
			this._loadResponse = new SplunkResponse(this._service);
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
			// close stanzas
			if (this._stanzas)
			{
				for each (var stanza:Stanza in this._stanzas)
					stanza.close();
			}

			// close loadResponse
			if (this._loadResponse)
			{
				this._loadResponse.close();
				this._loadResponse = null;
			}

			// reset properties
			this._stanzas = null;

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
				var root:XML;
				try
				{
					root = new XML(response.data);

					var stanzas:Object = new Object();

					var entryNodes:XMLList = root.atom::entry;
					var stanzaName:String;
					for each (var entryNode:XML in entryNodes)
					{
						stanzaName = entryNode.atom::title.toString();
						stanzas[stanzaName] = new Stanza(this, stanzaName);
					}

					this._stanzas = stanzas;

					this.dispatchEvent(e);
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
