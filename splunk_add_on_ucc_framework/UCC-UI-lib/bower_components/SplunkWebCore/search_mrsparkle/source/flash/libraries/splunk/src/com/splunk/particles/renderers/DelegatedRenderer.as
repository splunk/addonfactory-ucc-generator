package com.splunk.particles.renderers
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.ValidatePass;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Size;
	import com.splunk.particles.IParticle;
	import flash.display.DisplayObject;
	import flash.geom.Rectangle;
	import flash.utils.Dictionary;

	public class DelegatedRenderer extends AbstractRenderer
	{

		// Private Properties

		private var _defaultRenderer:ObservableProperty;

		private var _renderers:Dictionary;

		// Constructor

		public function DelegatedRenderer()
		{
			this._defaultRenderer = new ObservableProperty(this, "defaultRenderer", AbstractRenderer, null, this.invalidates(AbstractRenderer.PROCESS_PARTICLES));

			this._renderers = new Dictionary();
		}

		// Public Getters/Setters

		public function get defaultRenderer() : AbstractRenderer
		{
			return this._defaultRenderer.value;
		}
		public function set defaultRenderer(value:AbstractRenderer) : void
		{
			this._defaultRenderer.value = value;
		}

		// Protected Methods

		protected override function processParticlesOverride(particles:Array) : void
		{
			var defaultRenderer:AbstractRenderer = this._defaultRenderer.value;

			var particle:IParticle;
			var renderer:AbstractRenderer;
			var rendererParticles:Array;
			var rendererParticlesMap:Dictionary = new Dictionary();
			var renderers:Array = new Array();

			if (defaultRenderer)
			{
				rendererParticlesMap[defaultRenderer] = new Array();
				renderers.push(defaultRenderer);
			}

			for each (particle in particles)
			{
				renderer = particle.metadata.renderer as AbstractRenderer;
				if (!renderer)
					renderer = defaultRenderer;

				if (renderer)
				{
					rendererParticles = rendererParticlesMap[renderer];
					if (!rendererParticles)
					{
						rendererParticles = rendererParticlesMap[renderer] = new Array();
						renderers.push(renderer);
					}
					rendererParticles.push(particle);
				}
			}

			var oldRenderers:Dictionary = this._renderers;
			var newRenderers:Dictionary = this._renderers = new Dictionary();

			for each (renderer in renderers)
			{
				delete oldRenderers[renderer];
				newRenderers[renderer] = renderer;
			}

			for each (renderer in oldRenderers)
			{
				if (renderer.parent == this)
					this.removeChild(renderer);
			}

			for each (renderer in renderers)
			{
				if (renderer.parent != this)
					this.addChild(renderer);
			}

			for each (renderer in renderers)
			{
				rendererParticles = rendererParticlesMap[renderer];
				renderer.processParticles(rendererParticles);
			}
		}

		protected override function measureOverride(availableSize:Size) : Size
		{
			var measureSize:Size = new Size();
			var childSize:Size = availableSize.clone();
			var numChildren:int = this.numChildren;
			var child:LayoutSprite;
			for (var i:int = 0; i < numChildren; i++)
			{
				child = this.getChildAt(i) as LayoutSprite;
				if (child)
				{
					child.measure(childSize);
					measureSize.width = Math.max(measureSize.width, child.measuredWidth);
					measureSize.height = Math.max(measureSize.height, child.measuredHeight);
				}
			}
			measureSize.width = Math.min(measureSize.width, availableSize.width);
			measureSize.height = Math.min(measureSize.height, availableSize.height);
			return measureSize;
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			var childBounds:Rectangle = new Rectangle(0, 0, layoutSize.width, layoutSize.height);
			var numChildren:Number = this.numChildren;
			var child:LayoutSprite;
			for (var i:int = 0; i < numChildren; i++)
			{
				child = this.getChildAt(i) as LayoutSprite;
				if (child)
					child.layout(childBounds);
			}
			return super.layoutOverride(layoutSize);
		}

		protected override function onChildAdded(child:DisplayObject) : void
		{
			this.invalidate(LayoutSprite.MEASURE);
		}

		protected override function onChildRemoved(child:DisplayObject) : void
		{
			this.invalidate(LayoutSprite.MEASURE);
		}

		protected override function onChildInvalidated(child:DisplayObject, pass:ValidatePass) : void
		{
			switch (pass)
			{
				case AbstractRenderer.PROCESS_PARTICLES:
					this.invalidate(AbstractRenderer.PROCESS_PARTICLES);
					break;
				case LayoutSprite.MEASURE:
					this.invalidate(LayoutSprite.MEASURE);
					break;
			}
		}

	}

}
