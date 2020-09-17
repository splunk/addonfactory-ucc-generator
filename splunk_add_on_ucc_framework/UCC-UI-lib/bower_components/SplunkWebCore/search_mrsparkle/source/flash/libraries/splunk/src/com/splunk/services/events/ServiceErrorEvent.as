package com.splunk.services.events
{

	import flash.events.ErrorEvent;
	import flash.events.Event;

	/**
	 * An object dispatches a ServiceErrorEvent object when an error causes a
	 * service operation to fail.
	 */
	public class ServiceErrorEvent extends ErrorEvent
	{

		// Public Static Constants

		/**
		 * Defines the value of the <code>type</code> property of an
		 * <code>error</code> event object.
		 * 
		 * <p>This event has the following properties:</p>
		 * <table class=innertable>
		 * <tr><th>Property</th><th>Value</th></tr>
		 * <tr><td><code>bubbles</code></td><td><code>false</code></td></tr>
		 * <tr><td><code>cancelable</code></td><td><code>false</code>; there is no default behavior to cancel.</td></tr>
		 * <tr><td><code>currentTarget</code></td><td>The object that is actively processing the Event object with an event listener.</td></tr>
		 * <tr><td><code>target</code></td><td>The object experiencing an error.</td></tr>
		 * <tr><td><code>text</code></td><td>Text to be displayed as an error message.</td></tr>
		 * <tr><td><code>errorType</code></td><td>The specific type of error that occurred.</td></tr>
		 * </table>
		 * 
		 * @eventType error
		 */
		public static const ERROR:String = "error";

		/**
		 * Defines the value of the <code>type</code> property of a
		 * <code>controlError</code> event object.
		 * 
		 * <p>This event has the following properties:</p>
		 * <table class=innertable>
		 * <tr><th>Property</th><th>Value</th></tr>
		 * <tr><td><code>bubbles</code></td><td><code>false</code></td></tr>
		 * <tr><td><code>cancelable</code></td><td><code>false</code>; there is no default behavior to cancel.</td></tr>
		 * <tr><td><code>currentTarget</code></td><td>The object that is actively processing the Event object with an event listener.</td></tr>
		 * <tr><td><code>target</code></td><td>The object experiencing a control error.</td></tr>
		 * <tr><td><code>text</code></td><td>Text to be displayed as an error message.</td></tr>
		 * <tr><td><code>errorType</code></td><td>The specific type of error that occurred.</td></tr>
		 * </table>
		 * 
		 * @eventType controlError
		 */
		public static const CONTROL_ERROR:String = "controlError";

		// Private Properties

		private var _errorType:String;
		private var _messages:Array;

		// Constructor

		/**
		 * Creates a new ServiceErrorEvent object that contains information
		 * about service error events.
		 * 
		 * @param type The type of the event.
		 * @param bubbles Determines whether the Event object participates in
		 * the bubbling stage of the event flow.
		 * @param cancelable Determines whether the Event object can be
		 * cancelled.
		 * @param text Text to be displayed as an error message.
		 * @param errorType The specific type of error that occurred.
		 * @param messages The list of SplunkMessage objects describing the
		 * error that occurred.
		 */
		public function ServiceErrorEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, text:String = "", errorType:String = "", messages:Array = null)
		{
			super(type, bubbles, cancelable, text);

			this._errorType = errorType;
			this._messages = messages ? messages.concat() : new Array();
		}

		// Public Getters/Setters

		/**
		 * The specific type of error that occurred. The ServiceErrorType class
		 * defines the possible values for this property.
		 * 
		 * @see ServiceErrorType
		 */
		public function get errorType() : String
		{
			return this._errorType;
		}

		/**
		 * The list of SplunkMessage objects describing the error that occurred.
		 * 
		 * @see com.splunk.services.SplunkMessage
		 */
		public function get messages() : Array
		{
			return this._messages.concat();
		}

		// Public Methods

		/**
		 * Creates a copy of this ServiceErrorEvent object and sets the value of
		 * each property to match that of the original.
		 * 
		 * @return A new ServiceErrorEvent object with property values that
		 * match those of the original.
		 */
		public override function clone() : Event
		{
			return new ServiceErrorEvent(this.type, this.bubbles, this.cancelable, this.text, this.errorType, this.messages);
		}

		/**
		 * Returns a string that contains all the properties of this
		 * ServiceErrorEvent object. The string is in the following format:
		 * 
		 * <p><code>[ServiceErrorEvent type=value bubbles=value cancelable=value eventPhase=value text=value errorType=value messages=value]</code></p>
		 * 
		 * @return A string that contains all the properties of this
		 * ServiceErrorEvent object.
		 */
		public override function toString() : String
		{
			return this.formatToString("ServiceErrorEvent", "type", "bubbles", "cancelable", "eventPhase", "text", "errorType", "messages");
		}

	}

}
