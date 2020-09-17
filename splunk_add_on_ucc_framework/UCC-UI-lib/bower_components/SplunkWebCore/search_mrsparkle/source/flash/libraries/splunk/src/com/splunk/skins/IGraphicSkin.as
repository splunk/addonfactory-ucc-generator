package com.splunk.skins
{

	import com.jasongatt.layout.Size;
	import flash.display.Graphics;

	public interface IGraphicSkin extends ISkin
	{

		// Methods

		function getPreferredSize(availableSize:Size) : Size;
		function draw(graphics:Graphics, x:Number, y:Number, width:Number, height:Number, state:String = null) : void;

	}

}
