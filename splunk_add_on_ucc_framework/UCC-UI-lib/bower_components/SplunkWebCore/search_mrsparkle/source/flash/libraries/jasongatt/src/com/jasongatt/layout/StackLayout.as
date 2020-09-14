package com.jasongatt.layout
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.ValidatePass;
	import flash.display.DisplayObject;

	public class StackLayout extends LayoutSprite
	{

		// Private Properties

		private var _orientation:ObservableProperty;

		private var _layoutPolicy:StackLayoutPolicy;

		// Constructor

		public function StackLayout()
		{
			this._orientation = new ObservableProperty(this, "orientation", String, Orientation.Y, this.invalidates(LayoutSprite.MEASURE));

			this._layoutPolicy = new StackLayoutPolicy();
		}

		// Public Getters/Setters

		public function get orientation() : String
		{
			return this._orientation.value;
		}
		public function set orientation(value:String) : void
		{
			switch (value)
			{
				case Orientation.X:
				case Orientation.Y:
					break;
				default:
					value = Orientation.Y;
					break;
			}
			this._orientation.value = value;
		}

		// Protected Methods

		protected override function measureOverride(availableSize:Size) : Size
		{
			this._layoutPolicy.orientation = this._orientation.value;
			return this._layoutPolicy.measure(this, availableSize);
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			return this._layoutPolicy.layout(this, layoutSize);
		}

		protected override function onChildAdded(child:DisplayObject) : void
		{
			this._layoutPolicy.onChildAdded(this, child);
		}

		protected override function onChildRemoved(child:DisplayObject) : void
		{
			this._layoutPolicy.onChildRemoved(this, child);
		}

		protected override function onChildOrderChanged() : void
		{
			this._layoutPolicy.onChildOrderChanged(this);
		}

		protected override function onChildInvalidated(child:DisplayObject, pass:ValidatePass) : void
		{
			this._layoutPolicy.onChildInvalidated(this, child, pass);
		}

	}

}
