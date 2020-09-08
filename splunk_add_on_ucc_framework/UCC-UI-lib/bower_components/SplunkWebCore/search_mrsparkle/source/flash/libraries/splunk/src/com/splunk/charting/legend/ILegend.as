package com.splunk.charting.legend
{

	import com.jasongatt.core.IObservable;

	[Event(name="setLabels", type="com.splunk.charting.legend.LegendEvent")]
	[Event(name="setSwatches", type="com.splunk.charting.legend.LegendEvent")]

	public interface ILegend extends IObservable
	{

		// Getters/Setters

		function get numLabels() : int;

		// Methods

		function register(target:Object) : void;
		function unregister(target:Object) : void;
		function setLabels(target:Object, labels:Array) : void;
		function setSwatches(target:Object, swatches:Array) : void;
		function getLabelIndex(label:String) : int;

	}

}
