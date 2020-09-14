package com.jasongatt.core
{

	import flash.events.EventDispatcher;

	[Event(name="changed", type="com.jasongatt.core.ChangedEvent")]

	public class ObservableObject extends EventDispatcher implements IObservable
	{

		// Constructor

		public function ObservableObject()
		{
		}

	}

}
