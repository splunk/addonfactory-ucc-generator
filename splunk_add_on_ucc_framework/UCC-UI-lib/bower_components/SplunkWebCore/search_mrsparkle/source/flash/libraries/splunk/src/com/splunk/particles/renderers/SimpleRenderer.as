package com.splunk.particles.renderers
{

	import com.jasongatt.core.ObservableProperty;
	import com.splunk.palettes.color.IColorPalette;
	import com.splunk.particles.IParticle;
	import com.splunk.particles.IParticle2D;
	import flash.display.Graphics;
	import flash.geom.Point;
	import flash.utils.Dictionary;

	public class SimpleRenderer extends AbstractRenderer
	{

		// Private Properties

		private var _fieldName:ObservableProperty;
		private var _particleColorPalette:ObservableProperty;
		private var _particleSize:ObservableProperty;
		private var _defaultParticleColor:ObservableProperty;

		// Constructor

		public function SimpleRenderer()
		{
			this._fieldName = new ObservableProperty(this, "fieldName", String, null, this.invalidates(AbstractRenderer.RENDER_PARTICLES));
			this._particleColorPalette = new ObservableProperty(this, "particleColorPalette", IColorPalette, null, this.invalidates(AbstractRenderer.RENDER_PARTICLES));
			this._particleSize = new ObservableProperty(this, "particleSize", Number, 5, this.invalidates(AbstractRenderer.RENDER_PARTICLES));
			this._defaultParticleColor = new ObservableProperty(this, "defaultParticleColor", uint, 0x000000, this.invalidates(AbstractRenderer.RENDER_PARTICLES));
		}

		// Public Getters/Setters

		public function get fieldName() : String
		{
			return this._fieldName.value;
		}
		public function set fieldName(value:String) : void
		{
			this._fieldName.value = value;
		}

		public function get particleColorPalette() : IColorPalette
		{
			return this._particleColorPalette.value;
		}
		public function set particleColorPalette(value:IColorPalette) : void
		{
			this._particleColorPalette.value = value;
		}

		public function get particleSize() : Number
		{
			return this._particleSize.value;
		}
		public function set particleSize(value:Number) : void
		{
			this._particleSize.value = value;
		}

		public function get defaultParticleColor() : uint
		{
			return this._defaultParticleColor.value;
		}
		public function set defaultParticleColor(value:uint) : void
		{
			this._defaultParticleColor.value = value;
		}

		// Protected Methods

		protected override function renderParticlesOverride(particles:Array, layoutWidth:Number, layoutHeight:Number) : void
		{
			var fieldName:String = this._fieldName.value;
			var particleColorPalette:IColorPalette = this._particleColorPalette.value;
			var particleSize:Number = Math.max(this._particleSize.value, 0);
			var defaultParticleColor:uint = this._defaultParticleColor.value;

			var particle:IParticle;
			var particle2D:IParticle2D;
			var position:Point;
			var metadata:Dictionary;
			var alpha:Number;
			var scale:Number;
			var data:Object;
			var fieldValue:*;
			var fieldValueString:String;
			var color:uint;

			var graphics:Graphics = this.graphics;
			graphics.clear();

			for each (particle in particles)
			{
				particle2D = particle as IParticle2D;
				if (particle2D)
				{
					position = particle2D.position;
					metadata = particle2D.metadata;
					alpha = (metadata.alpha is Number) ? metadata.alpha : 1;
					scale = (metadata.scale is Number) ? metadata.scale : 1;
					data = metadata.data;
					fieldValue = (data && fieldName) ? data[fieldName] : null;
					fieldValueString = (fieldValue != null) ? String(fieldValue) : null;

					color = (particleColorPalette && fieldValueString) ? particleColorPalette.getColor(fieldValueString, 0, 1) : defaultParticleColor;

					graphics.beginFill(color, alpha);
					graphics.drawCircle(Math.round(position.x), Math.round(position.y), (particleSize * scale) / 2);
					graphics.endFill();
				}
			}
		}

	}

}
