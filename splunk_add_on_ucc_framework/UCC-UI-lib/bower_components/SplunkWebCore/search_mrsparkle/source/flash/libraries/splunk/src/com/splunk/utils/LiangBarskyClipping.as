package com.splunk.utils
{

	import flash.geom.Point;
	import flash.geom.Rectangle;

	public final class LiangBarskyClipping
	{

		// Private Static Properties

		private static var _t0:Number = 0;
		private static var _t1:Number = 1;

		// Public Static  Methods

		public static function clipLine(p0:Point, p1:Point, bounds:Rectangle) : Boolean
		{
			LiangBarskyClipping._t0 = 0;
			LiangBarskyClipping._t1 = 1;

			var dx:Number = p1.x - p0.x;
			var dy:Number = p1.y - p0.y;

			if (LiangBarskyClipping._pqClip(-dx, p0.x - bounds.x))
			{
				if (LiangBarskyClipping._pqClip(dx, bounds.x + bounds.width - p0.x))
				{
					if (LiangBarskyClipping._pqClip(-dy, p0.y - bounds.y))
					{
						if (LiangBarskyClipping._pqClip(dy, bounds.y + bounds.height - p0.y))
						{
							if (LiangBarskyClipping._t1 < 1)
							{
								p1.x = p0.x + LiangBarskyClipping._t1 * dx;
								p1.y = p0.y + LiangBarskyClipping._t1 * dy;
							}
							if (LiangBarskyClipping._t0 > 0)
							{
								p0.x = p0.x + LiangBarskyClipping._t0 * dx;
								p0.y = p0.y + LiangBarskyClipping._t0 * dy;
							}
							return true;
						}
					}
				}
			}
			return false;
		}

		// Private Static Methods

		private static function _pqClip(p:Number, q:Number) : Boolean
		{
			if (p == 0)
			{
				if (q < 0)
					return false;
			}
			else
			{
				var r:Number = q / p;
				if (p < 0)
				{
					if (r > LiangBarskyClipping._t1)
						return false;
					else if (r > LiangBarskyClipping._t0)
						LiangBarskyClipping._t0 = r;
				}
				else
				{
					if (r < LiangBarskyClipping._t0)
						return false;
					else if (r < LiangBarskyClipping._t1)
						LiangBarskyClipping._t1 = r;
				}
			}
			return true;
		}

	}

}
