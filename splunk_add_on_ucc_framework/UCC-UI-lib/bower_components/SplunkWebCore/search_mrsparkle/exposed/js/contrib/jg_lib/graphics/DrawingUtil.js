/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("../Class");
	var Point = require("../geom/Point");

	return Class(module.id, function(DrawingUtil)
	{

		// Public Static Methods

		DrawingUtil.drawRectangle = function(target, x, y, width, height)
		{
			if (target == null)
				throw new Error("Parameter target must be non-null.");

			var x2 = x + width;
			var y2 = y + height;

			target.moveTo(x, y);
			target.lineTo(x2, y);
			target.lineTo(x2, y2);
			target.lineTo(x, y2);
			target.lineTo(x, y);
		};

		DrawingUtil.drawEllipse = function(target, x, y, radius, radiusY)
		{
			if (target == null)
				throw new Error("Parameter target must be non-null.");

			x += radius;

			target.moveTo(x, y);
			DrawingUtil.arcTo(target, x, y, 0, 360, radius, radiusY);
		};

		DrawingUtil.arcTo = function(target, startX, startY, startAngle, arcAngle, radius, radiusY)
		{
			if (target == null)
				throw new Error("Parameter target must be non-null.");

			if (arcAngle > 360)
				arcAngle = 360;
			else if (arcAngle < -360)
				arcAngle = -360;

			if (radiusY == null)
				radiusY = radius;

			var segs = Math.ceil(Math.abs(arcAngle) / 45);
			var segAngle = arcAngle / segs;
			var theta = (segAngle / 180) * Math.PI;
			var cosThetaMid = Math.cos(theta / 2);
			var angle = (startAngle / 180) * Math.PI;
			var angleMid;
			var ax = startX - Math.cos(angle) * radius;
			var ay = startY - Math.sin(angle) * radiusY;
			var bx;
			var by;
			var cx;
			var cy;

			for (var i = 0; i < segs; i++)
			{
				angle += theta;
				angleMid = angle - (theta / 2);
				bx = ax + Math.cos(angle) * radius;
				by = ay + Math.sin(angle) * radiusY;
				cx = ax + Math.cos(angleMid) * (radius / cosThetaMid);
				cy = ay + Math.sin(angleMid) * (radiusY / cosThetaMid);
				target.curveTo(cx, cy, bx, by);
			}

			return new Point(bx, by);
		};

	});

});
