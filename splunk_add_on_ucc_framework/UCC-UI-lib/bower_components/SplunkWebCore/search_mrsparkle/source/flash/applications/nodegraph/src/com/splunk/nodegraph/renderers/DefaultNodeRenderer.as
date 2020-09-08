package com.splunk.nodegraph.renderers
{
	
	import flare.vis.data.DataSprite;
	import flare.vis.data.NodeSprite;
	import flare.vis.data.render.IRenderer;
	
	import flash.display.Graphics;
	
	public class DefaultNodeRenderer implements IRenderer
	{
		
		public var lineColor:uint = 0x000000;
		
		public function DefaultNodeRenderer(lineColor:uint = 0x000000)
		{
			this.lineColor = lineColor;
		}
		
		public function render(d:DataSprite) : void
		{
			var node:NodeSprite = d as NodeSprite;
			if (node == null)
				return;
			
			var graphics:Graphics = node.graphics;
			
			graphics.clear();
			
			var p:Number = Math.min(node.inDegree / 10, 1);
			var r:uint = 0xFF * p;
			var g:uint = 0x00;
			var b:uint = 0xFF * (1 - p);
			
			var size:Number = 20;
			
			graphics.lineStyle(1, this.lineColor, 1);
			graphics.beginFill(r << 16 | g << 8 | b, 1);
			graphics.drawRect(-size / 2, -size / 2, size, size);
		}
		
	}
	
}
