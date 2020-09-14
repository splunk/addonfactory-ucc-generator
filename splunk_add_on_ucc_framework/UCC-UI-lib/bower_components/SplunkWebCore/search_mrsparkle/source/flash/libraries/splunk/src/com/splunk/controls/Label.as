package com.splunk.controls
{

	import com.jasongatt.controls.TextBlock;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Size;
	import com.jasongatt.utils.MatrixUtil;
	import flash.geom.Matrix;
	import flash.text.TextFormat;

	public class Label extends TextBlock
	{

		// Private Properties

		private var _rotation:ObservableProperty;
		private var _layoutTransform:ObservableProperty;

		// Constructor

		public function Label()
		{
			this._rotation = new ObservableProperty(this, "rotation", Number, 0, this.invalidates(LayoutSprite.MEASURE));
			this._layoutTransform = new ObservableProperty(this, "layoutTransform", Matrix, new Matrix(), this.invalidates(LayoutSprite.MEASURE));

			this.useBitmapRendering = true;
			this.selectable = false;
			this.defaultTextFormat = new TextFormat("_sans", 12);
			this.snap = true;

			this.mouseChildren = false;
			this.tabChildren = false;
		}

		// Public Getters/Setters

		public override function get rotation() : Number
		{
			return this._rotation.value;
		}
		public override function set rotation(value:Number) : void
		{
			this._rotation.value = value;
		}

		public override function get layoutTransform() : Matrix
		{
			return this._layoutTransform.value.clone();
		}
		public override function set layoutTransform(value:Matrix) : void
		{
			value = value ? value.clone() : new Matrix();
			if (!MatrixUtil.equal(value, this._layoutTransform.value))
				this._layoutTransform.value = value;
		}

		// Public Methods

		public override function measure(availableSize:Size = null) : void
		{
			var layoutTransform:Matrix = this._layoutTransform.value;

			var rotation:Number = this._rotation.value;
			if (rotation != 0)
			{
				var matrix:Matrix = new Matrix();
				matrix.rotate(rotation * Math.PI / 180);
				matrix.concat(layoutTransform);
				layoutTransform = matrix;
			}

			super.layoutTransform = layoutTransform;

			super.measure(availableSize);
		}

	}

}
