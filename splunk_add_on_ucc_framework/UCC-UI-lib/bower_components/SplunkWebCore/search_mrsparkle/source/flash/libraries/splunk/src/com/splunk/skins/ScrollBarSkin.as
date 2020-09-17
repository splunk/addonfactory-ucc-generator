package com.splunk.skins
{

	import com.jasongatt.core.ObservableObject;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.graphics.brushes.GradientFillBrush;
	import com.jasongatt.graphics.shapes.RectangleShape;
	import com.jasongatt.graphics.shapes.TriangleShape;
	import com.jasongatt.layout.Margin;
	import com.splunk.utils.Style;
	import flash.display.GradientType;
	import flash.geom.Matrix;
	import flash.geom.Point;

	public class ScrollBarSkin extends ObservableObject implements IStyleSkin
	{

		// Private Properties

		private var _style:ObservableProperty;
		private var _disabledStyle:ObservableProperty;
		private var _arrowUpSkin:ObservableProperty;
		private var _arrowDownSkin:ObservableProperty;
		private var _arrowLeftSkin:ObservableProperty;
		private var _arrowRightSkin:ObservableProperty;
		private var _thumbVerticalSkin:ObservableProperty;
		private var _thumbHorizontalSkin:ObservableProperty;
		private var _trackVerticalSkin:ObservableProperty;
		private var _trackHorizontalSkin:ObservableProperty;

		// Constructor

		public function ScrollBarSkin()
		{
			var arrowUpSkin:IconButtonSkin = new IconButtonSkin();
			arrowUpSkin.upIconShape = new TriangleShape(new Point(0, 0.7), new Point(1, 0.7), new Point(0.5, 0.2));
			arrowUpSkin.upIconShape["snap"] = true;
			arrowUpSkin.upShape = new RectangleShape();
			arrowUpSkin.upStyle = new Style();
			arrowUpSkin.upStyle.margin = new Margin(1, 0, 0, 0);
			arrowUpSkin.defaultWidth = arrowUpSkin.defaultHeight = 16;

			var arrowDownSkin:IconButtonSkin = new IconButtonSkin();
			arrowDownSkin.upIconShape = new TriangleShape(new Point(0, 0.3), new Point(1, 0.3), new Point(0.5, 0.8));
			arrowDownSkin.upIconShape["snap"] = true;
			arrowDownSkin.upShape = new RectangleShape();
			arrowDownSkin.upStyle = new Style();
			arrowDownSkin.upStyle.margin = new Margin(1, 0, 0, 0);
			arrowDownSkin.defaultWidth = arrowDownSkin.defaultHeight = 16;

			var arrowLeftSkin:IconButtonSkin = new IconButtonSkin();
			arrowLeftSkin.upIconShape = new TriangleShape(new Point(0.7, 0), new Point(0.7, 1), new Point(0.2, 0.5));
			arrowLeftSkin.upIconShape["snap"] = true;
			arrowLeftSkin.upShape = new RectangleShape();
			arrowLeftSkin.upStyle = new Style();
			arrowLeftSkin.upStyle.margin = new Margin(0, 0, 1, 0);
			arrowLeftSkin.defaultWidth = arrowLeftSkin.defaultHeight = 16;

			var arrowRightSkin:IconButtonSkin = new IconButtonSkin();
			arrowRightSkin.upIconShape = new TriangleShape(new Point(0.3, 0), new Point(0.3, 1), new Point(0.8, 0.5));
			arrowRightSkin.upIconShape["snap"] = true;
			arrowRightSkin.upShape = new RectangleShape();
			arrowRightSkin.upStyle = new Style();
			arrowRightSkin.upStyle.margin = new Margin(0, 0, 1, 0);
			arrowRightSkin.defaultWidth = arrowRightSkin.defaultHeight = 16;

			var thumbVerticalSkin:ButtonSkin = new ButtonSkin();
			thumbVerticalSkin.upBrush = new GradientFillBrush(GradientType.LINEAR, [ 0xABABAB, 0x8A8A8A ], [ 1, 1 ], [ 0, 255 ]);
			thumbVerticalSkin.upShape = new RectangleShape();
			thumbVerticalSkin.upStyle = new Style();
			thumbVerticalSkin.upStyle.margin = new Margin(1, 0, 1, 1);
			thumbVerticalSkin.overBrush = new GradientFillBrush(GradientType.LINEAR, [ 0x969696, 0x747474 ], [ 1, 1 ], [ 0, 255 ]);
			thumbVerticalSkin.downBrush = new GradientFillBrush(GradientType.LINEAR, [ 0x747474, 0x969696 ], [ 1, 1 ], [ 0, 255 ]);
			thumbVerticalSkin.disabledBrush = new GradientFillBrush(GradientType.LINEAR, [ 0xDDDDDD, 0xBCBCBC ], [ 1, 1 ], [ 0, 255 ]);
			thumbVerticalSkin.defaultWidth = thumbVerticalSkin.defaultHeight = 16;

			var thumbHorizontalSkin:ButtonSkin = new ButtonSkin();
			thumbHorizontalSkin.upBrush = new GradientFillBrush(GradientType.LINEAR, [ 0xABABAB, 0x8A8A8A ], [ 1, 1 ], [ 0, 255 ]);
			thumbHorizontalSkin.upBrush["tileTransform"] = new Matrix(0, 1, -1, 0);
			thumbHorizontalSkin.upShape = new RectangleShape();
			thumbHorizontalSkin.upStyle = new Style();
			thumbHorizontalSkin.upStyle.margin = new Margin(1, 1, 1, 0);
			thumbHorizontalSkin.overBrush = new GradientFillBrush(GradientType.LINEAR, [ 0x969696, 0x747474 ], [ 1, 1 ], [ 0, 255 ]);
			thumbHorizontalSkin.overBrush["tileTransform"] = new Matrix(0, 1, -1, 0);
			thumbHorizontalSkin.downBrush = new GradientFillBrush(GradientType.LINEAR, [ 0x747474, 0x969696 ], [ 1, 1 ], [ 0, 255 ]);
			thumbHorizontalSkin.downBrush["tileTransform"] = new Matrix(0, 1, -1, 0);
			thumbHorizontalSkin.disabledBrush = new GradientFillBrush(GradientType.LINEAR, [ 0xDDDDDD, 0xBCBCBC ], [ 1, 1 ], [ 0, 255 ]);
			thumbHorizontalSkin.disabledBrush["tileTransform"] = new Matrix(0, 1, -1, 0);
			thumbHorizontalSkin.defaultWidth = thumbHorizontalSkin.defaultHeight = 16;

			var trackVerticalSkin:ButtonSkin = new ButtonSkin();
			trackVerticalSkin.upBrush = new GradientFillBrush(GradientType.LINEAR, [ 0xD5D5CF, 0xEDEDE7 ], [ 1, 1 ], [ 0, 255 ]);
			trackVerticalSkin.upShape = new RectangleShape();
			trackVerticalSkin.overBrush = null;
			trackVerticalSkin.downBrush = new GradientFillBrush(GradientType.LINEAR, [ 0xB3B3B3, 0xC8C8C8 ], [ 1, 1 ], [ 0, 255 ]);
			trackVerticalSkin.disabledBrush = new GradientFillBrush(GradientType.LINEAR, [ 0xE5E5E5, 0xFAFAFA ], [ 1, 1 ], [ 0, 255 ]);
			trackVerticalSkin.defaultWidth = 17;
			trackVerticalSkin.defaultHeight = 16;

			var trackHorizontalSkin:ButtonSkin = new ButtonSkin();
			trackHorizontalSkin.upBrush = new GradientFillBrush(GradientType.LINEAR, [ 0xD5D5CF, 0xEDEDE7 ], [ 1, 1 ], [ 0, 255 ]);
			trackHorizontalSkin.upBrush["tileTransform"] = new Matrix(0, 1, -1, 0);
			trackHorizontalSkin.upShape = new RectangleShape();
			trackHorizontalSkin.overBrush = null;
			trackHorizontalSkin.downBrush = new GradientFillBrush(GradientType.LINEAR, [ 0xB3B3B3, 0xC8C8C8 ], [ 1, 1 ], [ 0, 255 ]);
			trackHorizontalSkin.downBrush["tileTransform"] = new Matrix(0, 1, -1, 0);
			trackHorizontalSkin.disabledBrush = new GradientFillBrush(GradientType.LINEAR, [ 0xE5E5E5, 0xFAFAFA ], [ 1, 1 ], [ 0, 255 ]);
			trackHorizontalSkin.disabledBrush["tileTransform"] = new Matrix(0, 1, -1, 0);
			trackHorizontalSkin.defaultWidth = 16;
			trackHorizontalSkin.defaultHeight = 17;

			this._style = new ObservableProperty(this, "style", Style, null);
			this._disabledStyle = new ObservableProperty(this, "disabledStyle", Style, null);
			this._arrowUpSkin = new ObservableProperty(this, "arrowUpSkin", ISkin, arrowUpSkin);
			this._arrowDownSkin = new ObservableProperty(this, "arrowDownSkin", ISkin, arrowDownSkin);
			this._arrowLeftSkin = new ObservableProperty(this, "arrowLeftSkin", ISkin, arrowLeftSkin);
			this._arrowRightSkin = new ObservableProperty(this, "arrowRightSkin", ISkin, arrowRightSkin);
			this._thumbVerticalSkin = new ObservableProperty(this, "thumbVerticalSkin", ISkin, thumbVerticalSkin);
			this._thumbHorizontalSkin = new ObservableProperty(this, "thumbHorizontalSkin", ISkin, thumbHorizontalSkin);
			this._trackVerticalSkin = new ObservableProperty(this, "trackVerticalSkin", ISkin, trackVerticalSkin);
			this._trackHorizontalSkin = new ObservableProperty(this, "trackHorizontalSkin", ISkin, trackHorizontalSkin);
		}

		// Public Getters/Setters

		public function get style() : Style
		{
			return this._style.value;
		}
		public function set style(value:Style) : void
		{
			this._style.value = value;
		}

		public function get disabledStyle() : Style
		{
			return this._disabledStyle.value;
		}
		public function set disabledStyle(value:Style) : void
		{
			this._disabledStyle.value = value;
		}

		public function get arrowUpSkin() : ISkin
		{
			return this._arrowUpSkin.value;
		}
		public function set arrowUpSkin(value:ISkin) : void
		{
			this._arrowUpSkin.value = value;
		}

		public function get arrowDownSkin() : ISkin
		{
			return this._arrowDownSkin.value;
		}
		public function set arrowDownSkin(value:ISkin) : void
		{
			this._arrowDownSkin.value = value;
		}

		public function get arrowLeftSkin() : ISkin
		{
			return this._arrowLeftSkin.value;
		}
		public function set arrowLeftSkin(value:ISkin) : void
		{
			this._arrowLeftSkin.value = value;
		}

		public function get arrowRightSkin() : ISkin
		{
			return this._arrowRightSkin.value;
		}
		public function set arrowRightSkin(value:ISkin) : void
		{
			this._arrowRightSkin.value = value;
		}

		public function get thumbVerticalSkin() : ISkin
		{
			return this._thumbVerticalSkin.value;
		}
		public function set thumbVerticalSkin(value:ISkin) : void
		{
			this._thumbVerticalSkin.value = value;
		}

		public function get thumbHorizontalSkin() : ISkin
		{
			return this._thumbHorizontalSkin.value;
		}
		public function set thumbHorizontalSkin(value:ISkin) : void
		{
			this._thumbHorizontalSkin.value = value;
		}

		public function get trackVerticalSkin() : ISkin
		{
			return this._trackVerticalSkin.value;
		}
		public function set trackVerticalSkin(value:ISkin) : void
		{
			this._trackVerticalSkin.value = value;
		}

		public function get trackHorizontalSkin() : ISkin
		{
			return this._trackHorizontalSkin.value;
		}
		public function set trackHorizontalSkin(value:ISkin) : void
		{
			this._trackHorizontalSkin.value = value;
		}

		// Public Methods

		public function getChildSkin(name:String) : ISkin
		{
			switch (name)
			{
				case "arrowUp":
					return this._arrowUpSkin.value;
				case "arrowDown":
					return this._arrowDownSkin.value;
				case "arrowLeft":
					return this._arrowLeftSkin.value;
				case "arrowRight":
					return this._arrowRightSkin.value;
				case "thumbVertical":
					return this._thumbVerticalSkin.value;
				case "thumbHorizontal":
					return this._thumbHorizontalSkin.value;
				case "trackVertical":
					return this._trackVerticalSkin.value;
				case "trackHorizontal":
					return this._trackHorizontalSkin.value;
				default:
					return null;
			}
		}

		public function getStyle(state:String = null) : Style
		{
			var style:Style = this._style.value;
			var disabledStyle:Style = (state == "disabled") ? this._disabledStyle.value : null;

			return Style.mergeStyles(style, disabledStyle);
		}

	}

}
