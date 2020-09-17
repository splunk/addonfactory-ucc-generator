package com.jasongatt.layout
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.ValidatePass;
	import flash.display.DisplayObject;

	public class GroupLayout extends LayoutSprite
	{

		// Private Properties

		private var _padding:ObservableProperty;

		private var _layoutPolicy:GroupLayoutPolicy;

		// Constructor

		public function GroupLayout()
		{
			this._padding = new ObservableProperty(this, "padding", Margin, new Margin(), this.invalidates(LayoutSprite.MEASURE));

			this._layoutPolicy = new GroupLayoutPolicy;
		}

		// Public Getters/Setters

		public function get padding() : Margin
		{
			return this._padding.value.clone();
		}
		public function set padding(value:Margin) : void
		{
			value = value ? value.clone() : new Margin();
			if (!value.equals(this._padding.value))
				this._padding.value = value;
		}

		// Protected Methods

		protected override function measureOverride(availableSize:Size) : Size
		{
			this._layoutPolicy.padding = this._padding.value;
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

		protected override function onChildInvalidated(child:DisplayObject, pass:ValidatePass) : void
		{
			this._layoutPolicy.onChildInvalidated(this, child, pass);
		}

	}

}
