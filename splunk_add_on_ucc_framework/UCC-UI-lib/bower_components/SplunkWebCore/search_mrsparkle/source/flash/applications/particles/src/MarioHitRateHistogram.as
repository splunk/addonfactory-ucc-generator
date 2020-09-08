package
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Size;
	import com.jasongatt.motion.clocks.ClockEvent;
	import com.jasongatt.motion.clocks.FrameClock;
	import com.jasongatt.motion.clocks.IClock;
	import com.jasongatt.utils.LinkedList;
	import flash.display.BitmapData;
	import flash.display.Graphics;
	import flash.geom.Matrix;

	public class MarioHitRateHistogram extends LayoutSprite
	{

		// Private Properties

		private var _marioMode:Boolean = false;
		private var _columnColor:ObservableProperty;
		private var _columnSize:ObservableProperty;
		private var _clock:IClock;

		private var _bricksImage:BitmapData;
		private var _buckets:LinkedList;
		private var _defaultClock:FrameClock;
		private var _layoutWidth:Number = 0;
		private var _layoutHeight:Number = 0;
		private var _time:Number = 0;

		// Constructor

		public function MarioHitRateHistogram()
		{
			this._columnColor = new ObservableProperty(this, "columnColor", uint, 0x000000, this.invalidates(LayoutSprite.RENDER));
			this._columnSize = new ObservableProperty(this, "columnSize", Number, 5, this.invalidates(LayoutSprite.RENDER));

			this._bricksImage = new mario_bricks(0, 0);

			this._buckets = new LinkedList();

			this._defaultClock = new FrameClock(true);
			this._defaultClock.addEventListener(ClockEvent.TICK, this._clock_tick);
		}

		// Public Getter/Setters

		public function get marioMode() : Boolean
		{
			return this._marioMode;
		}
		public function set marioMode(value:Boolean) : void
		{
			this._marioMode = value;
			this.invalidate(LayoutSprite.RENDER);
		}

		public function get columnColor() : uint
		{
			return this._columnColor.value;
		}
		public function set columnColor(value:uint) : void
		{
			this._columnColor.value = value;
		}

		public function get columnSize() : Number
		{
			return this._columnSize.value;
		}
		public function set columnSize(value:Number) : void
		{
			this._columnSize.value = value;
		}

		public function get clock() : IClock
		{
			return this._clock;
		}
		public function set clock(value:IClock) : void
		{
			if (this._clock == value)
				return;

			if (this._clock)
			{
				this._clock.removeEventListener(ClockEvent.TICK, this._clock_tick);
			}
			else
			{
				this._defaultClock.removeEventListener(ClockEvent.TICK, this._clock_tick);
				this._defaultClock.stop();
			}

			this._clock = value;

			if (this._clock)
			{
				this._clock.addEventListener(ClockEvent.TICK, this._clock_tick, false, 0, true);
			}
			else
			{
				this._defaultClock.addEventListener(ClockEvent.TICK, this._clock_tick);
				this._defaultClock.start();
			}
		}

		// Public Methods

		public function hit() : void
		{
			var time:Number = Math.floor(this._time);

			var bucket:Bucket = this._buckets.getLast();
			if (!bucket || (time > bucket.time))
			{
				bucket = new Bucket(time);
				this._buckets.addLast(bucket);
			}

			bucket.count++;

			this.invalidate(LayoutSprite.RENDER);
		}

		// Protected Methods

		protected override function measureOverride(availableSize:Size) : Size
		{
			var availableWidth:Number = availableSize.width;
			var availableHeight:Number = availableSize.height;

			var finiteWidth:Boolean = (availableWidth != Infinity);
			var finiteHeight:Boolean = (availableHeight != Infinity);

			if (finiteWidth && finiteHeight)
				return new Size(availableWidth, availableHeight);
			if (finiteWidth)
				return new Size(availableWidth, availableWidth);
			if (finiteHeight)
				return new Size(availableHeight, availableHeight);
			return new Size(200, 200);
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			this._layoutWidth = Math.round(layoutSize.width);
			this._layoutHeight = Math.round(layoutSize.height);

			return layoutSize;
		}

		protected override function renderOverride(renderMatrix:Matrix) : Matrix
		{
			var marioMode:Boolean = this._marioMode;
			var columnColor:uint = this._columnColor.value;
			var columnSize:Number = marioMode ? 15 : Math.max(this._columnSize.value, 1);

			var layoutWidth:Number = this._layoutWidth;
			var layoutHeight:Number = this._layoutHeight;

			var latestTime:Number = this._time;
			var earliestTime:Number = latestTime - (layoutWidth / (columnSize + 1)) + 1;

			var buckets:LinkedList = this._buckets;
			var bucketsArray:Array = buckets.toArray();
			var bucket:Bucket;
			var maxBucketCount:int = 0;
			for each (bucket in bucketsArray)
			{
				if (bucket.count > maxBucketCount)
					maxBucketCount = bucket.count;
			}

			var columnSizeY:Number = columnSize * Math.min(layoutHeight / (maxBucketCount * columnSize), 1);

			var x1:Number;
			var x2:Number;
			var y1:Number;
			var y2:Number = layoutHeight;

			var bricksMatrix:Matrix;

			var graphics:Graphics = this.graphics;
			graphics.clear();

			for each (bucket in bucketsArray)
			{
				x1 = layoutWidth - (columnSize + 1) * (latestTime - bucket.time + 1);
				x2 = x1 + columnSize;
				y1 = layoutHeight - (bucket.count * columnSizeY);

				if ((x2 < 0) || (x1 > layoutWidth))
				{
					buckets.remove(bucket);
					continue;
				}

				x1 = Math.round(x1);
				x2 = Math.round(x2);
				y1 = Math.round(y1);

				if (y1 >= y2)
					y1 = y2 - 1;

				if (marioMode)
				{
					if (!bricksMatrix)
						bricksMatrix = new Matrix(1, 0, 0, 1, x1, 0);
					graphics.beginBitmapFill(this._bricksImage, bricksMatrix);
				}
				else
				{
					graphics.beginFill(columnColor, 1);
				}
				graphics.drawRect(x1, y1, x2 - x1, y2 - y1);
				graphics.endFill();
			}

			return renderMatrix;
		}

		// Private Methods

		private function _clock_tick(e:ClockEvent) : void
		{
			this._time += e.time;

			this.invalidate(LayoutSprite.RENDER);
		}

	}

}

class Bucket
{

	// Public Properties

	public var time:Number;
	public var count:int;

	// Constructor

	public function Bucket(time:Number)
	{
		this.time = time;
		this.count = 0;
	}

}
