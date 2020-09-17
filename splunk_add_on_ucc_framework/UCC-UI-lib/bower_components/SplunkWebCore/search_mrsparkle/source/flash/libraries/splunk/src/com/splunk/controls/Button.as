package com.splunk.controls
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Size;
	import com.splunk.skins.ButtonSkin;
	import com.splunk.skins.IGraphicSkin;
	import com.splunk.skins.ISkin;
	import com.splunk.skins.IStyleSkin;
	import com.splunk.utils.Style;
	import flash.display.Graphics;

	public class Button extends AbstractButton
	{

		// Private Properties

		private var _useBoundsHitTest:ObservableProperty;

		private var _cachedSkin:ISkin;
		private var _cachedState:String;

		// Constructor

		public function Button()
		{
			this._useBoundsHitTest = new ObservableProperty(this, "useBoundsHitTest", Boolean, false, this.invalidates(LayoutSprite.LAYOUT));

			this.skin = new ButtonSkin();
		}

		// Public Getters/Setters

		public function get useBoundsHitTest() : Boolean
		{
			return this._useBoundsHitTest.value;
		}
		public function set useBoundsHitTest(value:Boolean) : void
		{
			this._useBoundsHitTest.value = value;
		}

		// Protected Methods

		protected override function updateSkinOverride(skin:ISkin) : void
		{
			this._cachedSkin = skin;
		}

		protected override function updateStateOverride(state:String) : void
		{
			this.invalidate(LayoutSprite.LAYOUT);

			var style:Style;
			var styleSkin:IStyleSkin = this._cachedSkin as IStyleSkin;
			if (styleSkin)
				style = styleSkin.getStyle(state);
			Style.applyStyle(this, style);

			this._cachedState = state;
		}

		protected override function measureOverride(availableSize:Size) : Size
		{
			var measuredSize:Size = super.measureOverride(availableSize);

			var graphicSkin:IGraphicSkin = this._cachedSkin as IGraphicSkin;
			if (graphicSkin)
			{
				if (this.numChildren > 0)
					availableSize = measuredSize;
				var skinSize:Size = graphicSkin.getPreferredSize(availableSize);
				measuredSize.width = Math.max(measuredSize.width, skinSize.width);
				measuredSize.height = Math.max(measuredSize.height, skinSize.height);
			}

			return measuredSize;
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			var layoutWidth:Number = Math.round(layoutSize.width);
			var layoutHeight:Number = Math.round(layoutSize.height);

			var graphics:Graphics = this.graphics;
			graphics.clear();

			if (this._useBoundsHitTest.value)
			{
				graphics.beginFill(0x000000, 0);
				graphics.drawRect(0, 0, layoutWidth, layoutHeight);
				graphics.endFill();
			}

			var graphicSkin:IGraphicSkin = this._cachedSkin as IGraphicSkin;
			if (graphicSkin)
				graphicSkin.draw(graphics, 0, 0, layoutWidth, layoutHeight, this._cachedState);

			return super.layoutOverride(layoutSize);
		}

	}

}
