package com.splunk.particles.renderers
{

	import com.jasongatt.core.ValidatePass;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Size;
	import com.jasongatt.utils.DisplayListDepthSort;
	import com.jasongatt.utils.LinkedList;
	import com.splunk.particles.collectors.ICollector;
	import com.splunk.particles.events.UpdateEvent;

	public /*abstract*/ class AbstractRenderer extends LayoutSprite
	{

		// Public Static Constants

		public static const PROCESS_PARTICLES:ValidatePass = new ValidatePass(AbstractRenderer, "processParticles", 0.1, new DisplayListDepthSort());
		public static const RENDER_PARTICLES:ValidatePass = new ValidatePass(AbstractRenderer, "renderParticles", 2.1);

		// Private Properties

		private var _collectors:LinkedList;
		private var _particles:Array;
		private var _layoutWidth:Number = 0;
		private var _layoutHeight:Number = 0;

		// Constructor

		public function AbstractRenderer()
		{
			this._collectors = new LinkedList();
			this._particles = new Array();
		}

		// Public Methods

		public function addCollector(collector:ICollector) : void
		{
			if (!collector)
				throw new TypeError("Parameter collector must be non-null.");

			var collectors:LinkedList = this._collectors;
			if (!collectors.contains(collector))
				collector.addEventListener(UpdateEvent.COLLECTOR_UPDATED, this._collector_collectorUpdated);

			collectors.addLast(collector);

			this.invalidate(AbstractRenderer.PROCESS_PARTICLES);
		}

		public function removeCollector(collector:ICollector) : void
		{
			if (!collector)
				throw new TypeError("Parameter collector must be non-null.");

			var collectors:LinkedList = this._collectors;
			if (!collectors.contains(collector))
				return;

			collector.removeEventListener(UpdateEvent.COLLECTOR_UPDATED, this._collector_collectorUpdated);

			collectors.remove(collector);

			this.invalidate(AbstractRenderer.PROCESS_PARTICLES);
		}

		public function processParticles(particles:Array = null) : void
		{
			this.validatePreceding(AbstractRenderer.PROCESS_PARTICLES);

			if (this.isValid(AbstractRenderer.PROCESS_PARTICLES))
			{
				if (!particles)
					return;
				this.invalidate(AbstractRenderer.PROCESS_PARTICLES);
			}

			this.invalidate(AbstractRenderer.RENDER_PARTICLES);

			particles = particles ? particles.concat() : new Array();

			var collectors:Array = this._collectors.toArray();
			for each (var collector:ICollector in collectors)
				particles = particles.concat(collector.particles);

			this.processParticlesOverride(particles);

			this._particles = particles;

			this.setValid(AbstractRenderer.PROCESS_PARTICLES);
		}

		public function renderParticles() : void
		{
			this.validatePreceding(AbstractRenderer.RENDER_PARTICLES);

			if (this.isValid(AbstractRenderer.RENDER_PARTICLES))
				return;

			this.renderParticlesOverride(this._particles, this._layoutWidth, this._layoutHeight);

			this.setValid(AbstractRenderer.RENDER_PARTICLES);
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
			this.invalidate(AbstractRenderer.RENDER_PARTICLES);

			this._layoutWidth = Math.round(layoutSize.width);
			this._layoutHeight = Math.round(layoutSize.height);

			return layoutSize;
		}

		protected function processParticlesOverride(particles:Array) : void
		{
		}

		protected function renderParticlesOverride(particles:Array, layoutWidth:Number, layoutHeight:Number) : void
		{
		}

		// Private Methods

		private function _collector_collectorUpdated(e:UpdateEvent) : void
		{
			this.invalidate(AbstractRenderer.PROCESS_PARTICLES);
		}

	}

}
