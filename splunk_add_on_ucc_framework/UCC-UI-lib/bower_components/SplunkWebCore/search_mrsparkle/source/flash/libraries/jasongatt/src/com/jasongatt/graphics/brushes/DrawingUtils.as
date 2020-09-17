package com.jasongatt.graphics.brushes
{

	import com.jasongatt.graphics.brushes.IBrush;
	import flash.geom.Point;

	public final class DrawingUtils
	{

		// Public Static Methods

		public static function arcTo(brush:IBrush, startX:Number, startY:Number, startAngle:Number, arcAngle:Number, radius:Number, radiusY:Number = NaN) : Point
		{
			if (arcAngle > 360)
				arcAngle = 360;
			else if (arcAngle < -360)
				arcAngle = -360;

			if (radiusY != radiusY)
				radiusY = radius;

			var segs:Number = Math.ceil(Math.abs(arcAngle) / 45);
			var segAngle:Number = arcAngle / segs;
			var theta:Number = (segAngle / 180) * Math.PI;
			var cosThetaMid:Number = Math.cos(theta / 2);
			var angle:Number = (startAngle / 180) * Math.PI;
			var angleMid:Number;
			var ax:Number = startX - Math.cos(angle) * radius;
			var ay:Number = startY - Math.sin(angle) * radiusY;
			var bx:Number;
			var by:Number;
			var cx:Number;
			var cy:Number;
			var i:int;

			for (i = 0; i < segs; i++)
			{
				angle += theta;
				angleMid = angle - (theta / 2);
				bx = ax + Math.cos(angle) * radius;
				by = ay + Math.sin(angle) * radiusY;
				cx = ax + Math.cos(angleMid) * (radius / cosThetaMid);
				cy = ay + Math.sin(angleMid) * (radiusY / cosThetaMid);
				brush.curveTo(cx, cy, bx, by);
			}

			return new Point(bx, by);
		}

		public static function drawRectangle(brush:IBrush, x:Number, y:Number, width:Number, height:Number) : void
		{
			var x2:Number = x + width;
			var y2:Number = y + height;

			brush.moveTo(x, y);
			brush.lineTo(x2, y);
			brush.lineTo(x2, y2);
			brush.lineTo(x, y2);
			brush.lineTo(x, y);
		}

		public static function drawEllipse(brush:IBrush, x:Number, y:Number, radiusX:Number, radiusY:Number) : void
		{
			x += radiusX;

			brush.moveTo(x, y);
			DrawingUtils.arcTo(brush, x, y, 0, 360, radiusX, radiusY);
		}

	}

}
