package com.jasongatt.layout
{

	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.core.ValidatePass;
	import flash.display.DisplayObject;
	import flash.events.EventDispatcher;
	import flash.geom.Matrix;

	public /*abstract*/ class AbstractLayoutPolicy extends ObservableObject implements ILayoutPolicy
	{

		// Constructor

		public function AbstractLayoutPolicy()
		{
		}

		// Public Methods

		public function measure(parent:LayoutSprite, availableSize:Size) : Size
		{
			return new Size(0, 0);
		}

		public function layout(parent:LayoutSprite, layoutSize:Size) : Size
		{
			return layoutSize;
		}

		public function render(parent:LayoutSprite, renderMatrix:Matrix) : Matrix
		{
			return renderMatrix;
		}

		public function onChildAdded(parent:LayoutSprite, child:DisplayObject) : void
		{
		}

		public function onChildRemoved(parent:LayoutSprite, child:DisplayObject) : void
		{
		}

		public function onChildOrderChanged(parent:LayoutSprite) : void
		{
		}

		public function onChildInvalidated(parent:LayoutSprite, child:DisplayObject, pass:ValidatePass) : void
		{
		}

	}

}
