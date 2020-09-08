package com.splunk.particles.renderers
{

	import com.jasongatt.core.ObservableProperty;
	import com.splunk.controls.Label;
	import com.splunk.palettes.color.IColorPalette;
	import com.splunk.particles.IParticle;
	import com.splunk.particles.IParticle2D;
	import com.splunk.utils.Style;
	import flash.geom.ColorTransform;
	import flash.geom.Point;
	import flash.utils.Dictionary;

	public class LabelRenderer extends AbstractRenderer
	{

		// Private Properties

		private var _fieldName:ObservableProperty;
		private var _labelColorPalette:ObservableProperty;
		private var _labelStyle:ObservableProperty;
		private var _defaultLabelColor:ObservableProperty;

		private var _labels:Dictionary;

		// Constructor

		public function LabelRenderer()
		{
			this._fieldName = new ObservableProperty(this, "fieldName", String, null, this.invalidates(AbstractRenderer.PROCESS_PARTICLES));
			this._labelColorPalette = new ObservableProperty(this, "labelColorPalette", IColorPalette, null, this.invalidates(AbstractRenderer.RENDER_PARTICLES));
			this._labelStyle = new ObservableProperty(this, "labelStyle", Style, null, this.invalidates(AbstractRenderer.PROCESS_PARTICLES));
			this._defaultLabelColor = new ObservableProperty(this, "defaultLabelColor", uint, 0x000000, this.invalidates(AbstractRenderer.RENDER_PARTICLES));

			this._labels = new Dictionary();
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

		public function get labelColorPalette() : IColorPalette
		{
			return this._labelColorPalette.value;
		}
		public function set labelColorPalette(value:IColorPalette) : void
		{
			this._labelColorPalette.value = value;
		}

		public function get labelStyle() : Style
		{
			return this._labelStyle.value;
		}
		public function set labelStyle(value:Style) : void
		{
			this._labelStyle.value = value;
		}

		public function get defaultLabelColor() : uint
		{
			return this._defaultLabelColor.value;
		}
		public function set defaultLabelColor(value:uint) : void
		{
			this._defaultLabelColor.value = value;
		}

		// Protected Methods

		protected override function processParticlesOverride(particles:Array) : void
		{
			var fieldName:String = this._fieldName.value;
			var labelStyle:Style = this._labelStyle.value;

			var oldLabels:Dictionary = this._labels;
			var newLabels:Dictionary = this._labels = new Dictionary();
			var label:Label;

			var particle:IParticle;
			var particle2D:IParticle2D;
			var metadata:Dictionary;
			var data:Object;
			var fieldValue:*;

			for each (particle in particles)
			{
				particle2D = particle as IParticle2D;
				if (particle2D)
				{
					metadata = particle2D.metadata;
					data = metadata.data;
					fieldValue = (data && fieldName) ? data[fieldName] : null;

					label = oldLabels[particle2D];
					if (label)
					{
						delete oldLabels[particle2D];
					}
					else
					{
						label = new Label();
						this.addChild(label);
					}

					newLabels[particle2D] = label;

					label.text = (fieldValue != null) ? String(fieldValue) : "";
					Style.applyStyle(label, labelStyle);
				}
			}

			for each (label in oldLabels)
				this.removeChild(label);
		}

		protected override function renderParticlesOverride(particles:Array, layoutWidth:Number, layoutHeight:Number) : void
		{
			var fieldName:String = this._fieldName.value;
			var labelColorPalette:IColorPalette = this._labelColorPalette.value;
			var labelStyle:Style = this._labelStyle.value;
			var defaultLabelColor:uint = this._defaultLabelColor.value;

			var particle:IParticle;
			var particle2D:IParticle2D;
			var position:Point;
			var metadata:Dictionary;
			var alpha:Number;
			var scale:Number;
			var data:Object;
			var fieldValue:*;
			var fieldValueString:String;
			var colorTransform:ColorTransform;

			var labels:Dictionary = this._labels;
			var label:Label;

			var labelStyleHasAlpha:Boolean = (labelStyle && (labelStyle.alpha is Number));
			var labelStyleHasScaleX:Boolean = (labelStyle && (labelStyle.scaleX is Number));
			var labelStyleHasScaleY:Boolean = (labelStyle && (labelStyle.scaleY is Number));

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

					label = labels[particle2D];
					if (label)
					{
						colorTransform = new ColorTransform();
						colorTransform.color = (labelColorPalette && fieldValueString) ? labelColorPalette.getColor(fieldValueString, 0, 1) : defaultLabelColor;

						label.transform.colorTransform = colorTransform;

						if (!labelStyleHasAlpha)
							label.alpha = alpha;
						if (!labelStyleHasScaleX)
							label.scaleX = scale;
						if (!labelStyleHasScaleY)
							label.scaleY = scale;

						label.x = Math.round(position.x - (label.measuredWidth * label.scaleX) / 2);
						label.y = Math.round(position.y - (label.measuredHeight * label.scaleY) / 2);
					}
				}
			}
		}

	}

}
