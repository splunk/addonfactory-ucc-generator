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
	 * @see #keys
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
	 * The Stanza class is used to retrieve a stanza from a particular
	 * configuration file.
	 */
	public class Stanza extends EventDispatcher
	{

		// Private Properties

		private var _file:ConfigFile;
		private var _name:String;
		private var _keys:Object;

		private var _isOpen:Boolean = false;
		private var _loadResponse:SplunkResponse;

		// Constructor

		/**
		 * Creates a new Stanza object.
		 * 
		 * @param file The ConfigFile instance from which to retrieve a stanza.
		 * @param name The name of the stanza to retrieve.
		 * 
		 * @throws TypeError The value of the file parameter is null or the
		 * value of the name parameter is empty.
		 * 
		 * @see ConfigFile
		 */
		public function Stanza(file:ConfigFile, name:String)
		{
			if (!file)
				throw new TypeError("Parameter file must be non-null.");
			if (!name)
				throw new TypeError("Parameter name must be non-empty.");

			this._file = file;
			this._name = name;
		}

		// Public Getters/Setters

		/**
		 * The ConfigFile instance that this Stanza object connects to. This
		 * value corresponds to the value of the file parameter specified in the
		 * constructor.
		 * 
		 * @see ConfigFile
		 */
		public function get file() : ConfigFile
		{
			return this._file;
		}

		/**
		 * The name of this stanza. This value corresponds to the value of the
		 * name parameter specified in the constructor.
		 */
		public function get name() : String
		{
			return this._name;
		}

		/**
		 * The list of Key objects received from the load operation. This
		 * property is populated only when the load operation is complete.
		 * 
		 * @see Key
		 */
		public function get keys() : Object
		{
			return this._keys;
		}

		// Public Methods

		/**
		 * Loads a stanza from the associated ConfigFile instance. If a stanza
		 * is already loading, the load operation is closed.
		 */
		public function load() : void
		{
			// close previous load operation
			this.close();

			// create request
			var request:SplunkRequest = new SplunkRequest("properties/" + this._file.name + "/" + this._name);

			// create loadResponse
			this._loadResponse = new SplunkResponse(this._file.service);
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
			// close keys
			if (this._keys)
			{
				for each (var key:Key in this._keys)
					key.close();
			}

			// close loadResponse
			if (this._loadResponse)
			{
				this._loadResponse.close();
				this._loadResponse = null;
			}

			// reset properties
			this._keys = null;

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

					var keys:Array = new Array();

					var entryNodes:XMLList = root.atom::entry;
					var keyName:String;
					var keyValue:String;
					for each (var entryNode:XML in entryNodes)
					{
						keyName = entryNode.atom::title.toString();
						keyValue = entryNode.atom::content.toString();
						keys[keyName] = new Key(this, keyName, keyValue);
					}

					this._keys = keys;

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
