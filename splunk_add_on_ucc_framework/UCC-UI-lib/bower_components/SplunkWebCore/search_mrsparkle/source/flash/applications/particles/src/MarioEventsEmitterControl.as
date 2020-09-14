package
{

	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Size;
	import com.splunk.particles.controls.EventsEmitterControl;
	import flash.display.BitmapData;
	import flash.display.Graphics;
	import flash.geom.Matrix;
	import flash.geom.Point;
	import flash.geom.Rectangle;

	public class MarioEventsEmitterControl extends EventsEmitterControl
	{

		// Private Properties

		private var _marioMode:Boolean = false;

		private var _pipeImage1:BitmapData;
		private var _pipeImage2:BitmapData;
		private var _plantImage1:BitmapData;
		private var _plantImage2:BitmapData;
		private var _plantCanvas:BitmapData;
		private var _tick:int = 0;

		// Constructor

		public function MarioEventsEmitterControl()
		{
			this._pipeImage1 = new mario_pipe_fill_1(0, 0);
			this._pipeImage2 = new mario_pipe_fill_2(0, 0);
			this._plantImage1 = new mario_plant_1(0, 0);
			this._plantImage2 = new mario_plant_2(0, 0);
			this._plantCanvas = new BitmapData(this._plantImage1.width, this._plantImage1.height, true, 0x00000000);
		}

		// Public Getters/Setters

		public function get marioMode() : Boolean
		{
			return this._marioMode;
		}
		public function set marioMode(value:Boolean) : void
		{
			if (this._marioMode != value)
			{
				this._marioMode = value;
				if (value)
				{
					this._tick = 0;
					this.minimumWidth = 64;
					this.maximumWidth = 64;
					this.minimumHeight = 64;
				}
				else
				{
					this.minimumWidth = 0;
					this.maximumWidth = Infinity;
					this.minimumHeight = 0;
				}
				this.invalidate(LayoutSprite.LAYOUT);
			}
		}

		// Public Methods

		public override function updateEmitter(time:Number) : void
		{
			super.updateEmitter(time);

			if (this._marioMode)
				this._updateMario();
		}

		// Protected Methods

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			layoutSize = super.layoutOverride(layoutSize);

			if (this._marioMode)
			{
				var layoutWidth:Number = Math.round(layoutSize.width);
				var layoutHeight:Number = Math.round(layoutSize.height);

				var graphics:Graphics = this.graphics;
				graphics.clear();
				graphics.beginFill(0x000000, 0);
				graphics.drawRect(0, 0, layoutWidth, layoutHeight);
				graphics.endFill();

				var x1:Number = 0;
				var x2:Number = 4;
				var x3:Number = layoutWidth - 4;
				var x4:Number = layoutWidth;
				var y1:Number = 0;
				var y2:Number = layoutHeight - 30;
				var y3:Number = layoutHeight;

				var plantWidth:Number = this._plantCanvas.width;
				var plantHeight:Number = this._plantCanvas.height;
				var plantX:Number = Math.round((x1 + x4 - plantWidth) / 2);
				var plantY:Number = y3;

				graphics.beginFill(0x000000, 1);
				graphics.moveTo(x2, y1);
				graphics.lineTo(x3, y1);
				graphics.lineTo(x3, y2);
				graphics.lineTo(x4, y2);
				graphics.lineTo(x4, y3);
				graphics.lineTo(x1, y3);
				graphics.lineTo(x1, y2);
				graphics.lineTo(x2, y2);
				graphics.lineTo(x2, y1);
				graphics.endFill();

				graphics.beginBitmapFill(this._pipeImage2, new Matrix(1, 0, 0, 1, x2 + 2, y1 + 2));
				graphics.drawRect(x2 + 2, y1 + 2, x3 - x2 - 4, y2 - y1 - 2);
				graphics.endFill();

				graphics.beginBitmapFill(this._pipeImage1, new Matrix(1, 0, 0, 1, x1 + 2, y2 + 2));
				graphics.drawRect(x1 + 2, y2 + 2, x4 - x1 - 4, y3 - y2 - 4);
				graphics.endFill();

				graphics.beginFill(0x47A710);
				graphics.drawRect(x1 + 2, y2 + 4, 10, 2);
				graphics.endFill();

				graphics.beginFill(0x47A710);
				graphics.drawRect(x1 + 24, y2 + 4, 38, 2);
				graphics.endFill();

				graphics.beginFill(0x97E800);
				graphics.drawRect(x1 + 2, y2 + 2, 60, 2);
				graphics.endFill();

				graphics.beginBitmapFill(this._plantCanvas, new Matrix(1, 0, 0, 1, plantX, plantY));
				graphics.drawRect(plantX, plantY, plantWidth, plantHeight);
				graphics.endFill();
			}

			return layoutSize;
		}

		// Private Methods

		private function _updateMario() : void
		{
			var ticksShow:int = 90;
			var ticksHold:int = 30;
			var ticksHide:int = 0;

			var plantCanvas:BitmapData = this._plantCanvas;
			var plantHeight:int = plantCanvas.height;

			var ticks1:int = ticksShow;
			var ticks2:int = ticks1 + plantHeight;
			var ticks3:int = ticks2 + ticksHold;
			var ticks4:int = ticks3 + plantHeight;
			var ticks5:int = ticks4 + ticksHide;
			var tick:int = this._tick;
			this._tick = ((tick + 1) < ticks5) ? tick + 1 : 0;

			var visibleHeight:int;
			if (tick < ticks1)
				visibleHeight = 0;
			else if (tick < ticks2)
				visibleHeight = tick - ticks1;
			else if (tick < ticks3)
				visibleHeight = plantHeight;
			else if (tick < ticks4)
				visibleHeight = ticks4 - tick;
			else
				visibleHeight = 0;

			plantCanvas.fillRect(plantCanvas.rect, 0x00000000);
			if (visibleHeight > 0)
			{
				var plantImage:BitmapData = ((Math.floor(tick / 6) % 2) == 0) ? this._plantImage1 : this._plantImage2;
				plantCanvas.copyPixels(plantImage, new Rectangle(0, plantHeight - visibleHeight, plantCanvas.width, visibleHeight), new Point());
			}
		}

	}

}
