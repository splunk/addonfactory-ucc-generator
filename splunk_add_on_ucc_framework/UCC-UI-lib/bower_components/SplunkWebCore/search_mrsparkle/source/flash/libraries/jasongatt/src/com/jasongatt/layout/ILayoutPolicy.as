package com.jasongatt.layout
{

	import com.jasongatt.core.ValidatePass;
	import flash.display.DisplayObject;
	import flash.geom.Matrix;

	public interface ILayoutPolicy
	{

		// Methods

		function measure(parent:LayoutSprite, availableSize:Size) : Size;
		function layout(parent:LayoutSprite, layoutSize:Size) : Size;
		function render(parent:LayoutSprite, renderMatrix:Matrix) : Matrix;
		function onChildAdded(parent:LayoutSprite, child:DisplayObject) : void;
		function onChildRemoved(parent:LayoutSprite, child:DisplayObject) : void;
		function onChildOrderChanged(parent:LayoutSprite) : void;
		function onChildInvalidated(parent:LayoutSprite, child:DisplayObject, pass:ValidatePass) : void;

	}

}
