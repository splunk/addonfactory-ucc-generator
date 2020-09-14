package com.splunk.services.events
{

	import flash.events.Event;

	/**
	 * An object dispatches a ServiceEvent object when a service operation
	 * occurs.
	 */
	public class ServiceEvent extends Event
	{

		// Public Static Constants

		/**
		 * Defines the value of the <code>type</code> property of an
		 * <code>open</code> event object.
		 * 
		 * <p>This event has the following properties:</p>
		 * <table class=innertable>
		 * <tr><th>Property</th><th>Value</th></tr>
		 * <tr><td><code>bubbles</code></td><td><code>false</code></td></tr>
		 * <tr><td><code>cancelable</code></td><td><code>false</code>; there is no default behavior to cancel.</td></tr>
		 * <tr><td><code>currentTarget</code></td><td>The object that is actively processing the Event object with an event listener.</td></tr>
		 * <tr><td><code>target</code></td><td>The object that has opened a connection.</td></tr>
		 * </table>
		 * 
		 * @eventType open
		 */
		public static const OPEN:String = "open";

		/**
		 * Defines the value of the <code>type</code> property of a
		 * <code>connect</code> event object.
		 * 
		 * <p>This event has the following properties:</p>
		 * <table class=innertable>
		 * <tr><th>Property</th><th>Value</th></tr>
		 * <tr><td><code>bubbles</code></td><td><code>false</code></td></tr>
		 * <tr><td><code>cancelable</code></td><td><code>false</code>; there is no default behavior to cancel.</td></tr>
		 * <tr><td><code>currentTarget</code></td><td>The object that is actively processing the Event object with an event listener.</td></tr>
		 * <tr><td><code>target</code></td><td>The object that has established a connection.</td></tr>
		 * </table>
		 * 
		 * @eventType connect
		 */
		public static const CONNECT:String = "connect";

		/**
		 * Defines the value of the <code>type</code> property of a
		 * <code>complete</code> event object.
		 * 
		 * <p>This event has the following properties:</p>
		 * <table class=innertable>
		 * <tr><th>Property</th><th>Value</th></tr>
		 * <tr><td><code>bubbles</code></td><td><code>false</code></td></tr>
		 * <tr><td><code>cancelable</code></td><td><code>false</code>; there is no default behavior to cancel.</td></tr>
		 * <tr><td><code>currentTarget</code></td><td>The object that is actively processing the Event object with an event listener.</td></tr>
		 * <tr><td><code>target</code></td><td>The object that has completed loading.</td></tr>
		 * </table>
		 * 
		 * @eventType complete
		 */
		public static const COMPLETE:String = "complete";

		/**
		 * Defines the value of the <code>type</code> property of a
		 * <code>close</code> event object.
		 * 
		 * <p>This event has the following properties:</p>
		 * <table class=innertable>
		 * <tr><th>Property</th><th>Value</th></tr>
		 * <tr><td><code>bubbles</code></td><td><code>false</code></td></tr>
		 * <tr><td><code>cancelable</code></td><td><code>false</code>; there is no default behavior to cancel.</td></tr>
		 * <tr><td><code>currentTarget</code></td><td>The object that is actively processing the Event object with an event listener.</td></tr>
		 * <tr><td><code>target</code></td><td>The object whose connection has been closed.</td></tr>
		 * </table>
		 * 
		 * @eventType close
		 */
		public static const CLOSE:String = "close";

		/**
		 * Defines the value of the <code>type</code> property of a
		 * <code>status</code> event object.
		 * 
		 * <p>This event has the following properties:</p>
		 * <table class=innertable>
		 * <tr><th>Property</th><th>Value</th></tr>
		 * <tr><td><code>bubbles</code></td><td><code>false</code></td></tr>
		 * <tr><td><code>cancelable</code></td><td><code>false</code>; there is no default behavior to cancel.</td></tr>
		 * <tr><td><code>currentTarget</code></td><td>The object that is actively processing the Event object with an event listener.</td></tr>
		 * <tr><td><code>target</code></td><td>The object whose status has changed.</td></tr>
		 * </table>
		 * 
		 * @eventType status
		 */
		public static const STATUS:String = "status";

		/**
		 * Defines the value of the <code>type</code> property of a
		 * <code>done</code> event object.
		 * 
		 * <p>This event has the following properties:</p>
		 * <table class=innertable>
		 * <tr><th>Property</th><th>Value</th></tr>
		 * <tr><td><code>bubbles</code></td><td><code>false</code></td></tr>
		 * <tr><td><code>cancelable</code></td><td><code>false</code>; there is no default behavior to cancel.</td></tr>
		 * <tr><td><code>currentTarget</code></td><td>The object that is actively processing the Event object with an event listener.</td></tr>
		 * <tr><td><code>target</code></td><td>The object whose process is done.</td></tr>
		 * </table>
		 * 
		 * @eventType done
		 */
		public static const DONE:String = "done";

		/**
		 * Defines the value of the <code>type</code> property of a
		 * <code>control</code> event object.
		 * 
		 * <p>This event has the following properties:</p>
		 * <table class=innertable>
		 * <tr><th>Property</th><th>Value</th></tr>
		 * <tr><td><code>bubbles</code></td><td><code>false</code></td></tr>
		 * <tr><td><code>cancelable</code></td><td><code>false</code>; there is no default behavior to cancel.</td></tr>
		 * <tr><td><code>currentTarget</code></td><td>The object that is actively processing the Event object with an event listener.</td></tr>
		 * <tr><td><code>target</code></td><td>The object that has had a control action dispatched.</td></tr>
		 * </table>
		 * 
		 * @eventType control
		 */
		public static const CONTROL:String = "control";

		/**
		 * Defines the value of the <code>type</code> property of a
		 * <code>pause</code> event object.
		 * 
		 * <p>This event has the following properties:</p>
		 * <table class=innertable>
		 * <tr><th>Property</th><th>Value</th></tr>
		 * <tr><td><code>bubbles</code></td><td><code>false</code></td></tr>
		 * <tr><td><code>cancelable</code></td><td><code>false</code>; there is no default behavior to cancel.</td></tr>
		 * <tr><td><code>currentTarget</code></td><td>The object that is actively processing the Event object with an event listener.</td></tr>
		 * <tr><td><code>target</code></td><td>The object that has been paused.</td></tr>
		 * </table>
		 * 
		 * @eventType pause
		 */
		public static const PAUSE:String = "pause";

		/**
		 * Defines the value of the <code>type</code> property of an
		 * <code>unpause</code> event object.
		 * 
		 * <p>This event has the following properties:</p>
		 * <table class=innertable>
		 * <tr><th>Property</th><th>Value</th></tr>
		 * <tr><td><code>bubbles</code></td><td><code>false</code></td></tr>
		 * <tr><td><code>cancelable</code></td><td><code>false</code>; there is no default behavior to cancel.</td></tr>
		 * <tr><td><code>currentTarget</code></td><td>The object that is actively processing the Event object with an event listener.</td></tr>
		 * <tr><td><code>target</code></td><td>The object that has been unpaused.</td></tr>
		 * </table>
		 * 
		 * @eventType unpause
		 */
		public static const UNPAUSE:String = "unpause";

		/**
		 * Defines the value of the <code>type</code> property of a
		 * <code>finalize</code> event object.
		 * 
		 * <p>This event has the following properties:</p>
		 * <table class=innertable>
		 * <tr><th>Property</th><th>Value</th></tr>
		 * <tr><td><code>bubbles</code></td><td><code>false</code></td></tr>
		 * <tr><td><code>cancelable</code></td><td><code>false</code>; there is no default behavior to cancel.</td></tr>
		 * <tr><td><code>currentTarget</code></td><td>The object that is actively processing the Event object with an event listener.</td></tr>
		 * <tr><td><code>target</code></td><td>The object that has been finalized.</td></tr>
		 * </table>
		 * 
		 * @eventType finalize
		 */
		public static const FINALIZE:String = "finalize";

		// Constructor

		/**
		 * Creates a new ServiceEvent object that contains information about
		 * service events.
		 * 
		 * @param type The type of the event.
		 * @param bubbles Determines whether the Event object participates in
		 * the bubbling stage of the event flow.
		 * @param cancelable Determines whether the Event object can be
		 * cancelled.
		 */
		public function ServiceEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false)
		{
			super(type, bubbles, cancelable);
		}

		// Public Methods

		/**
		 * Creates a copy of this ServiceEvent object and sets the value of each
		 * property to match that of the original.
		 * 
		 * @return A new ServiceEvent object with property values that match
		 * those of the original.
		 */
		public override function clone() : Event
		{
			return new ServiceEvent(this.type, this.bubbles, this.cancelable);
		}

		/**
		 * Returns a string that contains all the properties of this
		 * ServiceEvent object. The string is in the following format:
		 * 
		 * <p><code>[ServiceEvent type=value bubbles=value cancelable=value eventPhase=value]</code></p>
		 * 
		 * @return A string that contains all the properties of this
		 * ServiceEvent object.
		 */
		public override function toString() : String
		{
			return this.formatToString("ServiceEvent", "type", "bubbles", "cancelable", "eventPhase");
		}

	}

}
