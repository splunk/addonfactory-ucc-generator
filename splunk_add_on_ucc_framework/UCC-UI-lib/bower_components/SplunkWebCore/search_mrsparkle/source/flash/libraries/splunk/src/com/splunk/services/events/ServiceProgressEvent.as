package com.splunk.services.events
{

	import flash.events.Event;
	import flash.events.ProgressEvent;

	/**
	 * An object dispatches a ServiceProgressEvent object as a service operation
	 * progresses.
	 */
	public class ServiceProgressEvent extends ProgressEvent
	{

		// Public Static Constants

		/**
		 * Defines the value of the <code>type</code> property of a
		 * <code>progress</code> event object.
		 * 
		 * <p>This event has the following properties:</p>
		 * <table class=innertable>
		 * <tr><th>Property</th><th>Value</th></tr>
		 * <tr><td><code>bubbles</code></td><td><code>false</code></td></tr>
		 * <tr><td><code>cancelable</code></td><td><code>false</code>; there is no default behavior to cancel.</td></tr>
		 * <tr><td><code>currentTarget</code></td><td>The object that is actively processing the Event object with an event listener.</td></tr>
		 * <tr><td><code>target</code></td><td>The object reporting progress.</td></tr>
		 * <tr><td><code>bytesLoaded</code></td><td>The number of items or bytes loaded at the time the listener processes the event.</td></tr>
		 * <tr><td><code>bytesTotal</code></td><td>The total number of items or bytes that ultimately will be loaded if the loading process succeeds.</td></tr>
		 * </table>
		 * 
		 * @eventType progress
		 */
		public static const PROGRESS:String = "progress";

		// Constructor

		/**
		 * Creates a new ServiceProgressEvent object that contains information
		 * about service progress events.
		 * 
		 * @param type The type of the event.
		 * @param bubbles Determines whether the Event object participates in
		 * the bubbling stage of the event flow.
		 * @param cancelable Determines whether the Event object can be
		 * cancelled.
		 * @param bytesLoaded The number of items or bytes loaded at the time
		 * the listener processes the event.
		 * @param bytesTotal The total number of items or bytes that will be
		 * loaded if the loading process succeeds.
		 */
		public function ServiceProgressEvent(type:String, bubbles:Boolean = false, cancelable:Boolean = false, bytesLoaded:Number = 0, bytesTotal:Number = 0)
		{
			super(type, bubbles, cancelable, bytesLoaded, bytesTotal);
		}

		// Public Methods

		/**
		 * Creates a copy of this ServiceProgressEvent object and sets the value
		 * of each property to match that of the original.
		 * 
		 * @return A new ServiceProgressEvent object with property values that
		 * match those of the original.
		 */
		public override function clone() : Event
		{
			return new ServiceProgressEvent(this.type, this.bubbles, this.cancelable, this.bytesLoaded, this.bytesTotal);
		}

		/**
		 * Returns a string that contains all the properties of this
		 * ServiceProgressEvent object. The string is in the following format:
		 * 
		 * <p><code>[ServiceEvent type=value bubbles=value cancelable=value eventPhase=value bytesLoaded=value bytesTotal=value]</code></p>
		 * 
		 * @return A string that contains all the properties of this
		 * ServiceProgressEvent object.
		 */
		public override function toString() : String
		{
			return this.formatToString("ServiceProgressEvent", "type", "bubbles", "cancelable", "eventPhase", "bytesLoaded", "bytesTotal");
		}

	}

}
