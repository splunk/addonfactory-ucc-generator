package com.splunk.nodegraph.renderers
{
	
	import flare.vis.data.DataSprite;
	import flare.vis.data.EdgeSprite;
	import flare.vis.data.render.IRenderer;
	
	import flash.display.Graphics;
	import flash.geom.Matrix;
	import flash.geom.Point;
	
	public class DefaultEdgeRenderer implements IRenderer
	{
		
		public var color:uint = 0xCCCCCC;
		
		public function DefaultEdgeRenderer()
		{
		}
		
		public function render(d:DataSprite) : void
		{
			var edge:EdgeSprite = d as EdgeSprite;
			if (edge == null)
				return;
			
			var graphics:Graphics = edge.graphics;
			
			graphics.clear();
			
			graphics.lineStyle(1, this.color, 1);
			
			var p1:Point = new Point(edge.x1, edge.y1);
			var p2:Point = new Point(edge.x2, edge.y2);
			var p3:Point = p2.subtract(p1);
			var length:Number = p3.length;
			var angle:Number = Math.atan2(p3.y, p3.x);
			
			var spacing:Number = 5;
			for (var i:Number = spacing; i < length; i += spacing)
				drawArrow(graphics, Point.interpolate(p2, p1, i / length), angle);
		}
		
		private function drawArrow(graphics:Graphics, p:Point, angle:Number) : void
		{
			var size:Number = 2;
			
			var p1:Point = new Point(0, 0);
			var p2:Point = new Point(size, size);
			var p3:Point = new Point(0, size * 2);
			
			var m:Matrix = new Matrix();
			m.rotate(angle);
			
			p1 = m.transformPoint(p1);
			p2 = m.transformPoint(p2);
			p3 = m.transformPoint(p3);
			
			p1 = p1.add(p);
			p2 = p2.add(p);
			p3 = p3.add(p);
			
			graphics.moveTo(p1.x, p1.y);
			graphics.lineTo(p2.x, p2.y);
			graphics.lineTo(p3.x, p3.y);
		}
		
	}
	
}
