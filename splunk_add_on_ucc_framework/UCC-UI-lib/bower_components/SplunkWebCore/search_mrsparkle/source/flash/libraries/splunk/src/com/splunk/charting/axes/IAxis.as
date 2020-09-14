package com.splunk.charting.axes
{

	import com.jasongatt.core.IObservable;

	[Event(name="setValues", type="com.splunk.charting.axes.AxisEvent")]
	[Event(name="setRange", type="com.splunk.charting.axes.AxisEvent")]
	[Event(name="setExtendedRange", type="com.splunk.charting.axes.AxisEvent")]

	public interface IAxis extends IObservable
	{

		// Getters/Setters

		function get minimum() : Number;
		function set minimum(value:Number) : void;

		function get maximum() : Number;
		function set maximum(value:Number) : void;

		function get containedMinimum() : Number;

		function get containedMaximum() : Number;

		function get extendedMinimum() : Number;

		function get extendedMaximum() : Number;

		function get actualMinimum() : Number;

		function get actualMaximum() : Number;

		// Methods

		function register(target:Object) : void;

		function unregister(target:Object) : void;

		function setValues(target:Object, values:Array) : void;

		function setRange(target:Object, absolute1:Number, absolute2:Number = NaN) : void;

		function setExtendedRange(target:Object, absolute1:Number, absolute2:Number = NaN) : void;

		function valueToAbsolute(value:*) : Number;

		function absoluteToValue(absolute:Number) : *;

		function absoluteToRelative(absolute:Number) : Number;

		function relativeToAbsolute(relative:Number) : Number;

	}

}
