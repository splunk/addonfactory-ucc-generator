package com.splunk.services
{

	import flash.net.URLRequestMethod;

	/**
	 * The SplunkRequest class captures all of the information for a single
	 * request to a SplunkService. SplunkRequest objects are passed to the
	 * <code>load()</code> method of the SplunkResponse class.
	 * 
	 * @see SplunkResponse
	 */
	public class SplunkRequest
	{

		// Private Properties

		private var _path:String;
		private var _variables:Object;
		private var _method:String = URLRequestMethod.GET;
		private var _requiresAuthentication:Boolean = true;

		// Constructor

		/**
		 * Creates a new SplunkRequest object for use with a SplunkResponse
		 * instance.
		 * 
		 * @param path The URI path to be requested. If the path is relative and
		 * does not begin with a <code>'/'</code>, it will be prepended with the
		 * <code>basePath</code> property from a corresponding SplunkService
		 * instance. Otherwise, if it is absolute (starts with a
		 * <code>'/'</code>), the request will be made as-is to the root URI
		 * path.
		 */
		public function SplunkRequest(path:String = null)
		{
			this._path = path;
		}

		// Public Getters/Setters

		/**
		 * The URI path to be requested. If the path is relative and does not
		 * begin with a <code>'/'</code>, it will be prepended with the
		 * <code>basePath</code> property from a corresponding SplunkService
		 * instance. Otherwise, if it is absolute (starts with a
		 * <code>'/'</code>), the request will be made as-is to the root URI
		 * path.
		 */
		public function get path() : String
		{
			return this._path;
		}
		public function set path(value:String) : void
		{
			this._path = value;
		}

		/**
		 * An object of name/value pairs to be transmitted with the request.
		 */
		public function get variables() : Object
		{
			return this._variables;
		}
		public function set variables(value:Object) : void
		{
			this._variables = value;
		}

		/**
		 * Controls the HTTP form submission method.
		 * 
		 * <p>For SWF content running in Flash Player (in the browser), this
		 * property is limited to <code>GET</code> or <code>POST</code>
		 * operation, and valid values are <code>URLRequestMethod.GET</code> or
		 * <code>URLRequestMethod.POST</code>.</p>
		 * 
		 * @default URLRequestMethod.GET
		 */
		public function get method() : String
		{
			return this._method;
		}
		public function set method(value:String) : void
		{
			this._method = value;
		}

		/**
		 * Controls whether the request requires authentication. If
		 * <code>true</code>, the <code>sessionKey</code> from a corresponding
		 * SplunkService instance is transmitted with the request. If the
		 * SplunkService instance is not connected, the request will fail.
		 * 
		 * @default true
		 */
		public function get requiresAuthentication() : Boolean
		{
			return this._requiresAuthentication;
		}
		public function set requiresAuthentication(value:Boolean) : void
		{
			this._requiresAuthentication = value;
		}

	}

}
