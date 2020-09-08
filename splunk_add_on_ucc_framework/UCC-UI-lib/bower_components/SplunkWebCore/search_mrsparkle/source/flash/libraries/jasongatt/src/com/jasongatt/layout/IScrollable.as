package com.jasongatt.layout
{

	import com.jasongatt.core.IObservable;

	public interface IScrollable extends IObservable
	{

		// Getters/Setters

		function get scrollPosition() : Number;
		function set scrollPosition(value:Number) : void;

		function get scrollSize() : Number;

		function get contentSize() : Number;

		// Methods

		function getLineSize(lineCount:Number = 1) : Number;

		function getPageSize(pageCount:Number = 1) : Number;

	}

}
