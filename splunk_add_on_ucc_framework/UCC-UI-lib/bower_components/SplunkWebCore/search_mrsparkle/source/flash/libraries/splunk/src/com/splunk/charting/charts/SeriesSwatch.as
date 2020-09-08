package com.splunk.charting.charts
{

	import flash.display.Graphics;

	public class SeriesSwatch
	{

		// Private Properties

		private var _shapes:Array;
		private var _brushes:Array;
		private var _styles:Array;
		private var _aspectRatio:Number;

		// Constructor

		public function SeriesSwatch(shapes:Array, brushes:Array, styles:Array, aspectRatio:Number = 1)
		{
			this._shapes = shapes ? shapes.concat() : new Array();
			this._brushes = brushes ? brushes.concat() : new Array();
			this._styles = styles ? styles.concat() : new Array();
			this._aspectRatio = aspectRatio;
		}

		// Public Getters/Setters

		public function get shapes() : Array
		{
			return this._shapes.concat();
		}

		public function get brushes() : Array
		{
			return this._brushes.concat();
		}

		public function get styles() : Array
		{
			return this._styles.concat();
		}

		public function get aspectRatio() : Number
		{
			return this._aspectRatio;
		}

	}

}
