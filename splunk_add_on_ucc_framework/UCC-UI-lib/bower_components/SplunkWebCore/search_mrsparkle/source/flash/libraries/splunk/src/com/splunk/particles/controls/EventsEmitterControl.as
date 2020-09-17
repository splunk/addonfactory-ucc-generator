package com.splunk.particles.controls
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.ValidateEvent;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidFillBrush;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Size;
	import com.splunk.particles.IParticle;
	import com.splunk.particles.distributions.IDistribution2D;
	import com.splunk.particles.distributions.RectangleDistribution2D;
	import com.splunk.particles.distributions.VectorDistribution2D;
	import com.splunk.particles.emitters.EventsEmitter;
	import com.splunk.particles.emitters.IEmitter;
	import com.splunk.particles.events.DropEvent;
	import com.splunk.particles.events.ParticleEvent;
	import com.splunk.particles.events.UpdateEvent;
	import com.splunk.particles.initializers.PositionInitializer;
	import com.splunk.particles.initializers.VelocityInitializer;
	import flash.display.Graphics;
	import flash.events.ErrorEvent;
	import flash.geom.Point;

	[Event(name="emitted", type="com.splunk.particles.events.ParticleEvent")]
	[Event(name="emitterUpdated", type="com.splunk.particles.events.UpdateEvent")]
	[Event(name="dropped", type="com.splunk.particles.events.DropEvent")]
	[Event(name="error", type="flash.events.ErrorEvent")]

	public class EventsEmitterControl extends LayoutSprite implements IEmitter
	{

		// Private Properties

		private var _brush:ObservableProperty;

		private var _positionInitializer:PositionInitializer;
		private var _velocityInitializer:VelocityInitializer;
		private var _emitter:EventsEmitter;
		private var _layoutWidth:Number = 0;
		private var _layoutHeight:Number = 0;

		// Constructor

		public function EventsEmitterControl()
		{
			this._brush = new ObservableProperty(this, "brush", IBrush, new SolidFillBrush(0xB2B2B2), this.invalidates(LayoutSprite.LAYOUT));

			this._positionInitializer = new PositionInitializer(new RectangleDistribution2D());

			this._velocityInitializer = new VelocityInitializer(new VectorDistribution2D(200, 0.1, 90));

			this._emitter = new EventsEmitter();
			this._emitter.initializers = [ this._positionInitializer, this._velocityInitializer ];
			this._emitter.addEventListener(ParticleEvent.EMITTED, this._emitter_emitted, false, int.MAX_VALUE);
			this._emitter.addEventListener(UpdateEvent.EMITTER_UPDATED, this._emitter_emitterUpdated, false, int.MAX_VALUE);
			this._emitter.addEventListener(DropEvent.DROPPED, this._emitter_dropped, false, int.MAX_VALUE);
			this._emitter.addEventListener(ErrorEvent.ERROR, this._emitter_error, false, int.MAX_VALUE);

			this.addEventListener(ValidateEvent.VALIDATED, this._self_validated, false, int.MAX_VALUE);

			this.snap = true;
			this.width = 80;
			this.height = 20;
		}

		// Public Getters/Setters

		public function get brush() : IBrush
		{
			return this._brush.value;
		}
		public function set brush(value:IBrush) : void
		{
			this._brush.value = value;
		}

		public function get hostPath() : String
		{
			return this._emitter.hostPath;
		}
		public function set hostPath(value:String) : void
		{
			this._emitter.hostPath = value;
		}

		public function get basePath() : String
		{
			return this._emitter.basePath;
		}
		public function set basePath(value:String) : void
		{
			this._emitter.basePath = value;
		}

		public function get sessionKey() : String
		{
			return this._emitter.sessionKey;
		}
		public function set sessionKey(value:String) : void
		{
			this._emitter.sessionKey = value;
		}

		public function get jobID() : String
		{
			return this._emitter.jobID;
		}
		public function set jobID(value:String) : void
		{
			this._emitter.jobID = value;
		}

		public function get count() : int
		{
			return this._emitter.count;
		}
		public function set count(value:int) : void
		{
			this._emitter.count = value;
		}

		public function get bufferSize() : int
		{
			return this._emitter.bufferSize;
		}
		public function set bufferSize(value:int) : void
		{
			this._emitter.bufferSize = value;
		}

		public function get bufferTime() : Number
		{
			return this._emitter.bufferTime;
		}
		public function set bufferTime(value:Number) : void
		{
			this._emitter.bufferTime = value;
		}

		public function get dropThreshold() : int
		{
			return this._emitter.dropThreshold;
		}
		public function set dropThreshold(value:int) : void
		{
			this._emitter.dropThreshold = value;
		}

		public function get emitVelocity() : IDistribution2D
		{
			return this._velocityInitializer.distribution;
		}
		public function set emitVelocity(value:IDistribution2D) : void
		{
			this._velocityInitializer.distribution = value;
		}

		// Public Methods

		public function open() : void
		{
			this._emitter.open();
		}

		public function close() : void
		{
			this._emitter.close();
		}

		public function emit(particle:IParticle) : void
		{
			this._emitter.emit(particle);
		}

		public function updateEmitter(time:Number) : void
		{
			this._emitter.updateEmitter(time);
		}

		// Protected Methods

		protected override function measureOverride(availableSize:Size) : Size
		{
			return new Size();
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			var layoutWidth:Number = this._layoutWidth = Math.round(layoutSize.width);
			var layoutHeight:Number = this._layoutHeight = Math.round(layoutSize.height);

			var graphics:Graphics = this.graphics;
			graphics.clear();
			graphics.beginFill(0x000000, 0);
			graphics.drawRect(0, 0, layoutWidth, layoutHeight);
			graphics.endFill();

			var brush:IBrush = this._brush.value;
			if (brush)
			{
				var x1:Number = 0;
				var x2:Number = Math.min(15, Math.round(layoutWidth * 0.25));
				var x3:Number = layoutWidth - x2;
				var x4:Number = layoutWidth;
				var y1:Number = 0;
				var y2:Number = layoutHeight;

				brush.beginBrush(graphics);
				brush.moveTo(x2, y1);
				brush.lineTo(x3, y1);
				brush.lineTo(x4, y2);
				brush.lineTo(x1, y2);
				brush.lineTo(x2, y1);
				brush.endBrush();
			}

			return layoutSize;
		}

		// Private Methods

		private function _emitter_emitted(e:ParticleEvent) : void
		{
			e.particle.source = this;

			this.dispatchEvent(e);
		}

		private function _emitter_emitterUpdated(e:UpdateEvent) : void
		{
			this.dispatchEvent(e);
		}

		private function _emitter_dropped(e:DropEvent) : void
		{
			this.dispatchEvent(e);
		}

		private function _emitter_error(e:ErrorEvent) : void
		{
			this.dispatchEvent(e);
		}

		private function _self_validated(e:ValidateEvent) : void
		{
			if (e.pass != LayoutSprite.RENDER)
				return;

			var p1:Point = this.localToGlobal(new Point(0, 0));
			var p2:Point = this.localToGlobal(new Point(this._layoutWidth, 0));
			var p3:Point = this.localToGlobal(new Point(this._layoutWidth, this._layoutHeight));
			var p4:Point = this.localToGlobal(new Point(0, this._layoutHeight));

			var left:Number = Math.min(p1.x, p2.x, p3.x, p4.x);
			var right:Number = Math.max(p1.x, p2.x, p3.x, p4.x);
			var top:Number = Math.min(p1.y, p2.y, p3.y, p4.y);
			var bottom:Number = Math.max(p1.y, p2.y, p3.y, p4.y);

			var width:Number = right - left;
			var height:Number = bottom - top;

			left += Math.min(15, Math.round(width * 0.25));
			right -= Math.min(15, Math.round(width * 0.25));
			top = bottom - Math.min(15, Math.round(height * 0.25));

			this._positionInitializer.distribution = new RectangleDistribution2D(left, top, right - left, bottom - top);
		}

	}

}
