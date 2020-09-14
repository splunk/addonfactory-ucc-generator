package com.splunk.utils
{

	import flash.geom.Rectangle;

	public final class LayoutUtil
	{

		// Public Static Methods

		public static function unoverlap(elementBounds:Array, orientation:String = "y", containingBounds:Rectangle = null, overflowMode:String = "center") : Array
		{
			if (!elementBounds)
				throw new TypeError("Parameter elementBounds must be non-null.");

			var numBounds:int = elementBounds.length;
			var unoverlappedBounds:Array = new Array(numBounds);

			if (numBounds == 0)
				return unoverlappedBounds;

			var boundsList1:Array = new Array(numBounds);
			var boundsList2:Array = new Array(numBounds);
			var bounds1:ElementBounds;
			var bounds2:ElementBounds;
			var bounds:Rectangle;
			var hasMerge:Boolean;
			var isOrientationX:Boolean = (orientation == "x");
			var containingBoundsMin:Number;
			var containingBoundsMax:Number;
			var i:int;

			if (isOrientationX)
			{
				for (i = 0; i < numBounds; i++)
				{
					bounds = elementBounds[i];
					boundsList1[i] = boundsList2[i] = new ElementBounds(bounds.x, bounds.x + bounds.width);
				}

				if (containingBounds)
				{
					containingBoundsMin = containingBounds.x;
					containingBoundsMax = containingBounds.x + containingBounds.width;
				}
			}
			else
			{
				for (i = 0; i < numBounds; i++)
				{
					bounds = elementBounds[i];
					boundsList1[i] = boundsList2[i] = new ElementBounds(bounds.y, bounds.y + bounds.height);
				}

				if (containingBounds)
				{
					containingBoundsMin = containingBounds.y;
					containingBoundsMax = containingBounds.y + containingBounds.height;
				}
			}

			boundsList2.sort(ElementBounds.getStableComparator(boundsList1));

			do
			{
				hasMerge = false;

				if (boundsList2.length > 1)
				{
					for (i = boundsList2.length - 1; i >= 1; i--)
					{
						bounds1 = boundsList2[i - 1];
						if (containingBounds)
							bounds1.normalize(containingBoundsMin, containingBoundsMax, overflowMode);

						bounds2 = boundsList2[i];
						if (containingBounds)
							bounds2.normalize(containingBoundsMin, containingBoundsMax, overflowMode);

						if (bounds1.max > bounds2.min)
						{
							boundsList2[i - 1] = ElementBounds.merge(bounds1, bounds2);
							boundsList2.splice(i, 1);
							hasMerge = true;
						}
					}
				}
				else if (containingBounds)
				{
					bounds1 = boundsList2[0];
					bounds1.normalize(containingBoundsMin, containingBoundsMax, overflowMode);
				}
			} while (hasMerge);

			var position:Number;
			for each (bounds1 in boundsList2)
			{
				if (bounds1.childBounds)
				{
					position = bounds1.min;
					for each (bounds2 in bounds1.childBounds)
					{
						bounds2.min = position;
						position += bounds2.length;
						bounds2.max = position;
					}
				}
			}

			if (isOrientationX)
			{
				for (i = 0; i < numBounds; i++)
				{
					bounds = elementBounds[i];
					bounds1 = boundsList1[i];
					unoverlappedBounds[i] = new Rectangle(bounds1.min, bounds.y, bounds.width, bounds.height);
				}
			}
			else
			{
				for (i = 0; i < numBounds; i++)
				{
					bounds = elementBounds[i];
					bounds1 = boundsList1[i];
					unoverlappedBounds[i] = new Rectangle(bounds.x, bounds1.min, bounds.width, bounds.height);
				}
			}

			return unoverlappedBounds;
		}

	}

}

class ElementBounds
{

	// Public Static Methods

	public static function merge(bounds1:ElementBounds, bounds2:ElementBounds) : ElementBounds
	{
		var childBounds:Array = new Array();

		if (bounds1.childBounds)
			childBounds = childBounds.concat(bounds1.childBounds);
		else
			childBounds.push(bounds1);

		if (bounds2.childBounds)
			childBounds = childBounds.concat(bounds2.childBounds);
		else
			childBounds.push(bounds2);

		var center:Number = 0;
		var length:Number = 0;
		for each (var bounds:ElementBounds in childBounds)
		{
			center += (bounds.min + bounds.max) / 2;
			length += bounds.length;
		}
		center /= childBounds.length;

		bounds = new ElementBounds(center - length / 2, center + length / 2);
		bounds.childBounds = childBounds;

		return bounds;
	}

	public static function getStableComparator(orderedBounds:Array) : Function
	{
		var comparator:Function = function(bounds1:ElementBounds, bounds2:ElementBounds) : Number
		{
			var center1:Number = (bounds1.min + bounds1.max) / 2;
			var center2:Number = (bounds2.min + bounds2.max) / 2;
			if (center1 < center2)
				return -1;
			if (center1 > center2)
				return 1;
			var index1:int = orderedBounds.indexOf(bounds1);
			var index2:int = orderedBounds.indexOf(bounds2);
			if (index1 < index2)
				return -1;
			if (index1 > index2)
				return 1;
			return 0;
		};
		return comparator;
	}

	// Public Properties

	public var min:Number;
	public var max:Number;
	public var length:Number;
	public var childBounds:Array;

	// Constructor

	public function ElementBounds(min:Number, max:Number)
	{
		this.min = min;
		this.max = max;
		this.length = (max - min);
	}

	// Public Methods

	public function normalize(min:Number, max:Number, overflowMode:String) : void
	{
		if ((max - min) < this.length)
		{
			var center:Number = (min + max) / 2;
			this.min = center - this.length / 2;
			this.max = center + this.length / 2;
		}
		else if (max < this.max)
		{
			this.min = max - this.length;
			this.max = max;
		}
		else if (min > this.min)
		{
			this.min = min;
			this.max = min + this.length;
		}
	}

}
