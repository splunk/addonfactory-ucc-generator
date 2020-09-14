package com.jasongatt.controls
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.ValidatePass;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Size;
	import com.jasongatt.utils.NumberUtil;
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display.DisplayObject;
	import flash.display.PixelSnapping;
	import flash.display.Sprite;
	import flash.events.Event;
	import flash.events.TextEvent;
	import flash.filters.BlurFilter;
	import flash.geom.Matrix;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	import flash.text.AntiAliasType;
	import flash.text.GridFitType;
	import flash.text.StyleSheet;
	import flash.text.TextField;
	import flash.text.TextFieldAutoSize;
	import flash.text.TextFieldType;
	import flash.text.TextFormat;
	import flash.text.TextLineMetrics;

	public class TextBlock extends LayoutSprite
	{

		// Public Static Constants

		public static const RENDER_TEXT:ValidatePass = new ValidatePass(TextBlock, "renderText", 2.1);

		// Private Properties

		private var _useBitmapRendering:ObservableProperty;
		private var _useBitmapSmoothing:ObservableProperty;
		private var _bitmapSmoothingSharpness:ObservableProperty;
		private var _bitmapSmoothingQuality:ObservableProperty;
		private var _overflowMode:ObservableProperty;

		private var _alwaysShowSelection:ObservableProperty;
		private var _antiAliasType:ObservableProperty;
		private var _background:ObservableProperty;
		private var _backgroundColor:ObservableProperty;
		private var _border:ObservableProperty;
		private var _borderColor:ObservableProperty;
		//bottomScrollV
		//caretIndex
		private var _condenseWhite:ObservableProperty;
		private var _defaultTextFormat:ObservableProperty;
		private var _displayAsPassword:ObservableProperty;
		private var _embedFonts:ObservableProperty;
		private var _gridFitType:ObservableProperty;
		private var _htmlText:ObservableProperty;
		//length
		private var _maxChars:ObservableProperty;
		//maxScrollH
		//maxScrollV
		//mouseWheelEnabled
		//numLines
		//restrict
		private var _scrollH:ObservableProperty;
		private var _scrollV:ObservableProperty;
		private var _selectable:ObservableProperty;
		//selectionBeginIndex
		//selectionEndIndex
		private var _sharpness:ObservableProperty;
		private var _styleSheet:ObservableProperty;
		private var _text:ObservableProperty;
		private var _textColor:ObservableProperty;
		//textHeight
		//textWidth
		private var _thickness:ObservableProperty;
		//type
		//useRichTextClipboard
		private var _wordWrap:ObservableProperty;

		private var _useHtmlText:Boolean = false;

		private var _textField:TextField;
		private var _textFieldScaleSprite:Sprite;
		private var _textFieldDrawSprite:Sprite;
		private var _bitmaps:Array;
		private var _bitmapSprite:Sprite;
		private var _bitmapSmoothingFilter:BlurFilter;

		// Constructor

		public function TextBlock()
		{
			this._textField = new TextField();
			this._textField.autoSize = TextFieldAutoSize.LEFT;
			this._textField.multiline = true;
			this._textField.addEventListener(Event.CHANGE , this._textField_change);
			this._textField.addEventListener(TextEvent.LINK , this._textField_link);
			this._textField.addEventListener(Event.SCROLL, this._textField_scroll);
			this._textField.addEventListener(TextEvent.TEXT_INPUT , this._textField_textInput);

			this._useBitmapRendering = new ObservableProperty(this, "useBitmapRendering", Boolean, false, this.invalidates(LayoutSprite.MEASURE));
			this._useBitmapSmoothing = new ObservableProperty(this, "useBitmapSmoothing", Boolean, false, this.invalidates(LayoutSprite.MEASURE));
			this._bitmapSmoothingSharpness = new ObservableProperty(this, "bitmapSmoothingSharpness", Number, 3, this.invalidates(LayoutSprite.MEASURE));
			this._bitmapSmoothingQuality = new ObservableProperty(this, "bitmapSmoothingQuality", int, 1, this.invalidates(TextBlock.RENDER_TEXT));
			this._overflowMode = new ObservableProperty(this, "overflowMode", String, OverflowMode.DEFAULT, this.invalidates(LayoutSprite.MEASURE));

			this._alwaysShowSelection = new ObservableProperty(this, "alwaysShowSelection", Boolean, this._textField.alwaysShowSelection, this.invalidates(TextBlock.RENDER_TEXT));
			this._antiAliasType = new ObservableProperty(this, "antiAliasType", String, this._textField.antiAliasType, this.invalidates(LayoutSprite.MEASURE));
			this._background = new ObservableProperty(this, "background", Boolean, this._textField.background, this.invalidates(TextBlock.RENDER_TEXT));
			this._backgroundColor = new ObservableProperty(this, "backgroundColor", uint, this._textField.backgroundColor, this.invalidates(TextBlock.RENDER_TEXT));
			this._border = new ObservableProperty(this, "border", Boolean, this._textField.border, this.invalidates(TextBlock.RENDER_TEXT));
			this._borderColor = new ObservableProperty(this, "borderColor", uint, this._textField.borderColor, this.invalidates(TextBlock.RENDER_TEXT));
			//bottomScrollV
			//caretIndex
			this._condenseWhite = new ObservableProperty(this, "condenseWhite", Boolean, this._textField.condenseWhite, this.invalidates(LayoutSprite.MEASURE));
			this._defaultTextFormat = new ObservableProperty(this, "defaultTextFormat", TextFormat, null, this.invalidates(LayoutSprite.MEASURE));
			this._displayAsPassword = new ObservableProperty(this, "displayAsPassword", Boolean, this._textField.displayAsPassword, this.invalidates(LayoutSprite.MEASURE));
			this._embedFonts = new ObservableProperty(this, "embedFonts", Boolean, this._textField.embedFonts, this.invalidates(LayoutSprite.MEASURE));
			this._gridFitType = new ObservableProperty(this, "gridFitType", String, this._textField.gridFitType, this.invalidates(LayoutSprite.MEASURE));
			this._htmlText = new ObservableProperty(this, "htmlText", String, this._textField.htmlText, this.invalidates(LayoutSprite.MEASURE));
			//length
			this._maxChars = new ObservableProperty(this, "maxChars", int, this._textField.maxChars, this.invalidates(LayoutSprite.MEASURE));
			//maxScrollH
			//maxScrollV
			//mouseWheelEnabled
			//numLines
			//restrict
			this._scrollH = new ObservableProperty(this, "scrollH", int, this._textField.scrollH, this.invalidates(TextBlock.RENDER_TEXT));
			this._scrollV = new ObservableProperty(this, "scrollV", int, this._textField.scrollV, this.invalidates(TextBlock.RENDER_TEXT));
			this._selectable = new ObservableProperty(this, "selectable", Boolean, this._textField.selectable, this.invalidates(TextBlock.RENDER_TEXT));
			//selectionBeginIndex
			//selectionEndIndex
			this._sharpness = new ObservableProperty(this, "sharpness", Number, this._textField.sharpness, this.invalidates(LayoutSprite.MEASURE));
			this._styleSheet = new ObservableProperty(this, "styleSheet", StyleSheet, this._textField.styleSheet, this.invalidates(LayoutSprite.MEASURE));
			this._text = new ObservableProperty(this, "text", String, this._textField.text, this.invalidates(LayoutSprite.MEASURE));
			this._textColor = new ObservableProperty(this, "textColor", uint, this._textField.textColor, this.invalidates(LayoutSprite.MEASURE));
			//textHeight
			//textWidth
			this._thickness = new ObservableProperty(this, "thickness", Number, this._textField.thickness, this.invalidates(LayoutSprite.MEASURE));
			//type
			//useRichTextClipboard
			this._wordWrap = new ObservableProperty(this, "wordWrap", Boolean, this._textField.wordWrap, this.invalidates(LayoutSprite.MEASURE));

			this.addEventListener(Event.ADDED, this._self_added, false, int.MAX_VALUE);
			this.addEventListener(Event.REMOVED, this._self_removed, false, int.MAX_VALUE);
		}

		// Public Getters/Setters

		public function get useBitmapRendering() : Boolean
		{
			return this._useBitmapRendering.value;
		}
		public function set useBitmapRendering(value:Boolean) : void
		{
			this._useBitmapRendering.value = value;
		}

		public function get useBitmapSmoothing() : Boolean
		{
			return this._useBitmapSmoothing.value;
		}
		public function set useBitmapSmoothing(value:Boolean) : void
		{
			this._useBitmapSmoothing.value = value;
		}

		public function get bitmapSmoothingSharpness() : Number
		{
			return this._bitmapSmoothingSharpness.value;
		}
		public function set bitmapSmoothingSharpness(value:Number) : void
		{
			if (value != value)
				value = 1;
			this._bitmapSmoothingSharpness.value = NumberUtil.minMax(value, 1, 8);
		}

		public function get bitmapSmoothingQuality() : int
		{
			return this._bitmapSmoothingQuality.value;
		}
		public function set bitmapSmoothingQuality(value:int) : void
		{
			this._bitmapSmoothingQuality.value = NumberUtil.minMax(value, 0, 15);
		}

		public function get overflowMode() : String
		{
			return this._overflowMode.value;
		}
		public function set overflowMode(value:String) : void
		{
			switch (value)
			{
				case OverflowMode.DEFAULT:
				case OverflowMode.SCROLL:
				case OverflowMode.ELLIPSIS_MIDDLE:
				case OverflowMode.ELLIPSIS_END:
					break;
				default:
					value = OverflowMode.DEFAULT;
					break;
			}
			this._overflowMode.value = value;
		}

		public function get alwaysShowSelection() : Boolean
		{
			return this._alwaysShowSelection.value;
		}
		public function set alwaysShowSelection(value:Boolean) : void
		{
			this._alwaysShowSelection.value = value;
		}

		public function get antiAliasType() : String
		{
			return this._antiAliasType.value;
		}
		public function set antiAliasType(value:String) : void
		{
			switch (value)
			{
				case AntiAliasType.NORMAL:
				case AntiAliasType.ADVANCED:
					break;
				default:
					value = AntiAliasType.NORMAL;
					break;
			}
			this._antiAliasType.value = value;
		}

		public function get background() : Boolean
		{
			return this._background.value;
		}
		public function set background(value:Boolean) : void
		{
			this._background.value = value;
		}

		public function get backgroundColor() : uint
		{
			return this._backgroundColor.value;
		}
		public function set backgroundColor(value:uint) : void
		{
			this._backgroundColor.value = value;
		}

		public function get border() : Boolean
		{
			return this._border.value;
		}
		public function set border(value:Boolean) : void
		{
			this._border.value = value;
		}

		public function get borderColor() : uint
		{
			return this._borderColor.value;
		}
		public function set borderColor(value:uint) : void
		{
			this._borderColor.value = value;
		}

		public function get bottomScrollV() : int
		{
			this.validate(LayoutSprite.MEASURE);
			return this._textField.bottomScrollV;
		}

		public function get caretIndex() : int
		{
			this.validate(LayoutSprite.MEASURE);
			return this._textField.caretIndex;
		}

		public function get condenseWhite() : Boolean
		{
			return this._condenseWhite.value;
		}
		public function set condenseWhite(value:Boolean) : void
		{
			this._condenseWhite.value = value;
		}

		public function get defaultTextFormat() : TextFormat
		{
			return this._defaultTextFormat.value;
		}
		public function set defaultTextFormat(value:TextFormat) : void
		{
			this._defaultTextFormat.value = value;
		}

		public function get displayAsPassword() : Boolean
		{
			return this._displayAsPassword.value;
		}
		public function set displayAsPassword(value:Boolean) : void
		{
			this._displayAsPassword.value = value;
		}

		public function get embedFonts() : Boolean
		{
			return this._embedFonts.value;
		}
		public function set embedFonts(value:Boolean) : void
		{
			this._embedFonts.value = value;
		}

		public function get gridFitType() : String
		{
			return this._gridFitType.value;
		}
		public function set gridFitType(value:String) : void
		{
			switch (value)
			{
				case GridFitType.NONE:
				case GridFitType.PIXEL:
				case GridFitType.SUBPIXEL:
					break;
				default:
					value = GridFitType.NONE;
					break;
			}
			this._gridFitType.value = value;
		}

		public function get htmlText() : String
		{
			if (this._useHtmlText)
				return this._htmlText.value;
			this.validate(LayoutSprite.MEASURE);
			return this._textField.htmlText;
		}
		public function set htmlText(value:String) : void
		{
			this._useHtmlText = true;
			this._htmlText.value = value ? value : "";
		}

		public function get length() : int
		{
			this.validate(LayoutSprite.MEASURE);
			return this._textField.length;
		}

		public function get maxChars() : int
		{
			return this._maxChars.value;
		}
		public function set maxChars(value:int) : void
		{
			this._maxChars.value = value;
		}

		public function get maxScrollH() : int
		{
			this.validate(LayoutSprite.MEASURE);
			return this._textField.maxScrollH;
		}

		public function get maxScrollV() : int
		{
			this.validate(LayoutSprite.MEASURE);
			return this._textField.maxScrollV;
		}

		public function get mouseWheelEnabled() : Boolean
		{
			return this._textField.mouseWheelEnabled;
		}
		public function set mouseWheelEnabled(value:Boolean) : void
		{
			this._textField.mouseWheelEnabled = value;
		}

		public function get numLines() : int
		{
			this.validate(LayoutSprite.MEASURE);
			return this._textField.numLines;
		}

		public function get restrict() : String
		{
			return this._textField.restrict;
		}
		public function set restrict(value:String) : void
		{
			this._textField.restrict = value;
		}

		// wrong
		public function get scrollH() : int
		{
			return this._scrollH.value;
		}
		public function set scrollH(value:int) : void
		{
			this._scrollH.value = value;
		}

		// wrong
		public function get scrollV() : int
		{
			return this._scrollV.value;
		}
		public function set scrollV(value:int) : void
		{
			this._scrollV.value = value;
		}

		public function get selectable() : Boolean
		{
			return this._selectable.value;
		}
		public function set selectable(value:Boolean) : void
		{
			this._selectable.value = value;
		}

		public function get selectionBeginIndex() : int
		{
			this.validate(LayoutSprite.MEASURE);
			return this._textField.selectionBeginIndex;
		}

		public function get selectionEndIndex() : int
		{
			this.validate(LayoutSprite.MEASURE);
			return this._textField.selectionEndIndex;
		}

		public function get sharpness() : Number
		{
			return this._sharpness.value;
		}
		public function set sharpness(value:Number) : void
		{
			this._sharpness.value = value;
		}

		public function get styleSheet() : StyleSheet
		{
			return this._styleSheet.value;
		}
		public function set styleSheet(value:StyleSheet) : void
		{
			if (value != this._styleSheet.value)
				this._styleSheet.value = value;
			else if (value)
				this.invalidate(LayoutSprite.MEASURE);
		}

		public function get text() : String
		{
			if (!this._useHtmlText)
				return this._text.value;
			this.validate(LayoutSprite.MEASURE);
			return this._textField.text;
		}
		public function set text(value:String) : void
		{
			this._useHtmlText = false;
			this._text.value = value ? value : "";
		}

		public function get textColor() : uint
		{
			return this._textColor.value;
		}
		public function set textColor(value:uint) : void
		{
			this._textColor.value = value;
		}

		public function get textHeight() : Number
		{
			this.validate(LayoutSprite.MEASURE);
			return this._textField.textHeight;
		}

		public function get textWidth() : Number
		{
			this.validate(LayoutSprite.MEASURE);
			return this._textField.textWidth;
		}

		public function get thickness() : Number
		{
			return this._thickness.value;
		}
		public function set thickness(value:Number) : void
		{
			this._thickness.value = value;
		}

		public function get type() : String
		{
			return this._textField.type;
		}
		public function set type(value:String) : void
		{
			switch (value)
			{
				case TextFieldType.DYNAMIC:
				case TextFieldType.INPUT:
					break;
				default:
					value = TextFieldType.DYNAMIC;
					break;
			}
			this._textField.type = value;
		}

		public function get useRichTextClipboard() : Boolean
		{
			return this._textField.useRichTextClipboard;
		}
		public function set useRichTextClipboard(value:Boolean) : void
		{
			this._textField.useRichTextClipboard = value;
		}

		public function get wordWrap() : Boolean
		{
			return this._wordWrap.value;
		}
		public function set wordWrap(value:Boolean) : void
		{
			this._wordWrap.value = value;
		}

		// Public Methods

		public function renderText() : void
		{
			this.validatePreceding(TextBlock.RENDER_TEXT);

			if (this.isValid(TextBlock.RENDER_TEXT))
				return;

			var textField:TextField = this._textField;

			textField.alwaysShowSelection = this._alwaysShowSelection.value;
			textField.background = this._background.value;
			textField.backgroundColor = this._backgroundColor.value;
			textField.border = this._border.value;
			textField.borderColor = this._borderColor.value;
			//textField.scrollH = this._scrollH.value;
			//textField.scrollV = this._scrollV.value;
			textField.selectable = this._selectable.value;

			this._renderBitmap();

			this.setValid(TextBlock.RENDER_TEXT);
		}

		// these are wrong, need to figure out solution

		public function appendText(newText:String) : void
		{
			this._textField.appendText(newText);
		}

		public function getCharBoundaries(charIndex:int) : Rectangle
		{
			return this._textField.getCharBoundaries(charIndex);
		}

		public function getCharIndexAtPoint(x:Number, y:Number) : int
		{
			return this._textField.getCharIndexAtPoint(x, y);
		}

		public function getFirstCharInParagraph(charIndex:int) : int
		{
			return this._textField.getFirstCharInParagraph(charIndex);
		}

		public function getImageReference(id:String) : DisplayObject
		{
			return this._textField.getImageReference(id);
		}

		public function getLineIndexAtPoint(x:Number, y:Number) : int
		{
			return this._textField.getLineIndexAtPoint(x, y);
		}

		public function getLineIndexOfChar(charIndex:int) : int
		{
			return this._textField.getLineIndexOfChar(charIndex);
		}

		public function getLineLength(lineIndex:int) : int
		{
			return this._textField.getLineLength(lineIndex);
		}

		public function getLineMetrics(lineIndex:int) : TextLineMetrics
		{
			return this._textField.getLineMetrics(lineIndex);
		}

		public function getLineOffset(lineIndex:int) : int
		{
			return this._textField.getLineOffset(lineIndex);
		}

		public function getLineText(lineIndex:int) : String
		{
			return this._textField.getLineText(lineIndex);
		}

		public function getParagraphLength(charIndex:int) : int
		{
			return this._textField.getParagraphLength(charIndex);
		}

		public function getTextFormat(beginIndex:int = -1, endIndex:int = -1) : TextFormat
		{
			return this._textField.getTextFormat(beginIndex, endIndex);
		}

		public function replaceSelectedText(value:String) : void
		{
			this._textField.replaceSelectedText(value);
		}

		public function replaceText(beginIndex:int, endIndex:int, newText:String) : void
		{
			this._textField.replaceText(beginIndex, endIndex, newText);
		}

		public function setSelection(beginIndex:int, endIndex:int) : void
		{
			this._textField.setSelection(beginIndex, endIndex);
		}

		public function setTextFormat(format:TextFormat, beginIndex:int = -1, endIndex:int = -1) : void
		{
			this._textField.setTextFormat(format, beginIndex, endIndex);
		}

		// Protected Methods

		//	antiAliasType			String		read-write	invalidates(LayoutSprite.MEASURE)
		//	condenseWhite			Boolean		read-write	invalidates(LayoutSprite.MEASURE)
		//	defaultTextFormat		TextFormat	read-write	invalidates(LayoutSprite.MEASURE)
		//	displayAsPassword		Boolean		read-write	invalidates(LayoutSprite.MEASURE)
		//	embedFonts			Boolean		read-write	invalidates(LayoutSprite.MEASURE)
		//	gridFitType			String		read-write	invalidates(LayoutSprite.MEASURE)
		//	htmlText			String		read-write	invalidates(LayoutSprite.MEASURE)
		//	maxChars			int		read-write	invalidates(LayoutSprite.MEASURE)
		//	sharpness			Number		read-write	invalidates(LayoutSprite.MEASURE)
		//	styleSheet			StyleSheet	read-write	invalidates(LayoutSprite.MEASURE)
		//	text				String		read-write	invalidates(LayoutSprite.MEASURE)
		//	textColor			uint		read-write	invalidates(LayoutSprite.MEASURE)
		//	thickness			Number		read-write	invalidates(LayoutSprite.MEASURE)
		//	wordWrap			Boolean		read-write	invalidates(LayoutSprite.MEASURE)

		//	alwaysShowSelection		Boolean		read-write	invalidates(TextBlock.RENDER_TEXT)
		//	background			Boolean		read-write	invalidates(TextBlock.RENDER_TEXT)
		//	backgroundColor			uint		read-write	invalidates(TextBlock.RENDER_TEXT)
		//	border				Boolean		read-write	invalidates(TextBlock.RENDER_TEXT)
		//	borderColor			uint		read-write	invalidates(TextBlock.RENDER_TEXT)
		//	scrollH				int		read-write	invalidates(TextBlock.RENDER_TEXT)
		//	scrollV				int		read-write	invalidates(TextBlock.RENDER_TEXT)
		//	selectable			Boolean		read-write	invalidates(TextBlock.RENDER_TEXT)

		//	bottomScrollV			int		read-only	validate(LayoutSprite.MEASURE)
		//	caretIndex			int		read-only	validate(LayoutSprite.MEASURE)
		//	length				int		read-only	validate(LayoutSprite.MEASURE)
		//	maxScrollH			int		read-only	validate(LayoutSprite.MEASURE)
		//	maxScrollV			int		read-only	validate(LayoutSprite.MEASURE)
		//	numLines			int		read-only	validate(LayoutSprite.MEASURE)
		//	selectionBeginIndex		int		read-only	validate(LayoutSprite.MEASURE)
		//	selectionEndIndex		int		read-only	validate(LayoutSprite.MEASURE)
		//	textHeight			Number		read-only	validate(LayoutSprite.MEASURE)
		//	textWidth			Number		read-only	validate(LayoutSprite.MEASURE)

		//	mouseWheelEnabled		Boolean		read-write	direct
		//	restrict			String		read-write	direct
		//	type				String		read-write	direct
		//	useRichTextClipboard		Boolean		read-write	direct

		//	autoSize			String		read-write	X (always left)
		//	multiline			Boolean		read-write	X (always multiline)

		protected override function measureOverride(availableSize:Size) : Size
		{
			this.invalidate(TextBlock.RENDER_TEXT);

			var textField:TextField = this._textField;

			// remove textField from display list so we can measure system fonts correctly if a transform is applied
			// textField is added back to the display list after measuring
			if (textField.parent == this)
				this.removeChild(textField);

			var scrollH:int = textField.scrollH;
			var scrollV:int = textField.scrollV;

			if (this._useBitmapRendering.value)
			{
				if (!this._bitmaps)
				{
					this._textFieldScaleSprite = new Sprite();
					this._textFieldScaleSprite.addChild(textField);

					this._textFieldDrawSprite = new Sprite();
					this._textFieldDrawSprite.addChild(this._textFieldScaleSprite);

					this._bitmaps = new Array();
					this._bitmapSprite = new Sprite();
					this._bitmapSmoothingFilter = new BlurFilter(2, 2);

					this.addChild(this._bitmapSprite);
				}

				var smoothingSharpness:Number = this._useBitmapSmoothing.value ? this._bitmapSmoothingSharpness.value : 1;
				this._textFieldScaleSprite.scaleX = this._textFieldScaleSprite.scaleY = smoothingSharpness;
				this._bitmapSprite.scaleX = this._bitmapSprite.scaleY = 1 / smoothingSharpness;
			}
			else
			{
				if (this._bitmaps)
				{
					for each (var bitmap:Bitmap in this._bitmaps)
						bitmap.bitmapData.dispose();

					this.removeChild(this._bitmapSprite);

					this._bitmaps = null;
					this._bitmapSprite = null;
					this._bitmapSmoothingFilter = null;

					this._textFieldScaleSprite.removeChild(textField);
					this._textFieldScaleSprite = null;
					this._textFieldDrawSprite = null;
				}
			}

			var defaultTextFormat:TextFormat = this._defaultTextFormat.value;

			textField.scrollH = 0;
			textField.scrollV = 0;
			textField.wordWrap = false;
			textField.autoSize = TextFieldAutoSize.LEFT;

			textField.antiAliasType = this._antiAliasType.value;
			textField.condenseWhite = this._condenseWhite.value;
			textField.textColor = this._textColor.value;
			textField.defaultTextFormat = defaultTextFormat ? defaultTextFormat : new TextFormat();
			textField.displayAsPassword = this._displayAsPassword.value;
			textField.embedFonts = this._embedFonts.value;
			textField.gridFitType = this._gridFitType.value;
			textField.maxChars = this._maxChars.value;
			textField.sharpness = this._sharpness.value;
			textField.styleSheet = this._styleSheet.value;
			textField.thickness = this._thickness.value;

			if (this._useHtmlText)
				textField.htmlText = this._htmlText.value;
			else
				textField.text = this._text.value;

			var width:Number = textField.width;
			var height:Number = textField.height;

			if (width > availableSize.width)
			{
				if (this._wordWrap.value)
				{
					textField.wordWrap = true;
					width = textField.width = availableSize.width;
					height = textField.height;
				}
			}

			switch (this._overflowMode.value)
			{
				case OverflowMode.ELLIPSIS_MIDDLE:
					this._insertEllipsisMiddle(textField, availableSize.width, availableSize.height);
					width = textField.width;
					height = textField.height;
					textField.autoSize = TextFieldAutoSize.NONE;
					break;
				case OverflowMode.ELLIPSIS_END:
					this._insertEllipsisEnd(textField, availableSize.width, availableSize.height);
					width = textField.width;
					height = textField.height;
					textField.autoSize = TextFieldAutoSize.NONE;
					break;
				case OverflowMode.SCROLL:
					textField.autoSize = TextFieldAutoSize.NONE;
					if (width > availableSize.width)
						width = textField.width = availableSize.width;
					if (height > availableSize.height)
						height = textField.height = availableSize.height;
					textField.scrollH = scrollH;
					textField.scrollV = scrollV;
					break;
				default:
					textField.autoSize = TextFieldAutoSize.NONE;
					break;
			}

			if (!textField.parent)
				this.addChild(textField);

			return new Size(width, height);
		}

		// Private Methods

		private function _insertEllipsisMiddle(textField:TextField, maxWidth:Number, maxHeight:Number) : void
		{
			if ((textField.width <= maxWidth) && ((textField.height <= maxHeight) || (this._getNumLines(textField) <= 1)))
				return;

			var htmlText:String = textField.htmlText;
			var length:int = textField.text.length;
			var low:int = 0;
			var high:int = length - 1;
			var mid:int;
			var bestText:String = "";

			while (low <= high)
			{
				mid = Math.ceil((low + high) / 2);

				textField.htmlText = htmlText;
				textField.replaceText(Math.ceil(mid / 2), length - Math.floor(mid / 2), "...");

				if ((textField.width <= maxWidth) && ((textField.height <= maxHeight) || (this._getNumLines(textField) <= 1)))
				{
					bestText = textField.htmlText;
					low = mid + 1;
				}
				else
				{
					high = mid - 1;
				}
			}

			textField.htmlText = bestText;
		}

		private function _insertEllipsisEnd(textField:TextField, maxWidth:Number, maxHeight:Number) : void
		{
			if ((textField.width <= maxWidth) && ((textField.height <= maxHeight) || (this._getNumLines(textField) <= 1)))
				return;

			var htmlText:String = textField.htmlText;
			var length:int = textField.text.length;
			var low:int = 0;
			var high:int = length - 1;
			var mid:int;
			var bestText:String = "";

			while (low <= high)
			{
				mid = Math.ceil((low + high) / 2);

				textField.htmlText = htmlText;
				textField.replaceText(mid, length, "...");

				if ((textField.width <= maxWidth) && ((textField.height <= maxHeight) || (this._getNumLines(textField) <= 1)))
				{
					bestText = textField.htmlText;
					low = mid + 1;
				}
				else
				{
					high = mid - 1;
				}
			}

			textField.htmlText = bestText;
		}

		private function _renderBitmap() : void
		{
			var bitmaps:Array = this._bitmaps;
			if (!bitmaps)
				return;

			var numBitmaps:int = bitmaps.length;
			var bitmapIndex:int = 0;
			var bitmap:Bitmap;
			var bitmapData:BitmapData;
			var bitmapSprite:Sprite = this._bitmapSprite;

			var textFieldDrawSprite:Sprite = this._textFieldDrawSprite;
			var width:int = Math.ceil(textFieldDrawSprite.width);
			var height:int = Math.ceil(textFieldDrawSprite.height);

			// take tiled snapshots if dimensions are at least 1 pixel
			if ((width > 0) && (height > 0))
			{
				var maxTileSize:int = 2880;
				var tileWidth:Number;
				var tileHeight:Number;
				var x:int;
				var y:int;

				var smoothingFilter:BlurFilter;
				var smoothingQuality:int = this._useBitmapSmoothing.value ? this._bitmapSmoothingQuality.value : 0;
				if (smoothingQuality > 0)
				{
					smoothingFilter = this._bitmapSmoothingFilter;
					smoothingFilter.quality = smoothingQuality;
				}

				for (y = 0; y < height; y += maxTileSize)
				{
					for (x = 0; x < width; x += maxTileSize)
					{
						tileWidth = Math.min(width - x, maxTileSize);
						tileHeight = Math.min(height - y, maxTileSize);

						if (bitmapIndex < numBitmaps)
						{
							bitmap = bitmaps[bitmapIndex];
							bitmapData = bitmap.bitmapData;
							if ((bitmapData.width == tileWidth) && (bitmapData.height == tileHeight))
							{
								bitmapData.fillRect(bitmapData.rect, 0x00000000);
							}
							else
							{
								bitmapData.dispose();
								bitmapData = bitmap.bitmapData = new BitmapData(tileWidth, tileHeight, true, 0x00000000);
								bitmap.smoothing = true;  // must be set after bitmapData is assigned, or it doesn't work
							}
						}
						else
						{
							bitmap = new Bitmap();
							bitmapData = bitmap.bitmapData = new BitmapData(tileWidth, tileHeight, true, 0x00000000);
							bitmap.smoothing = true;  // must be set after bitmapData is assigned, or it doesn't work
							bitmaps.push(bitmap);
							bitmapSprite.addChild(bitmap);
						}

						bitmapData.draw(textFieldDrawSprite, new Matrix(1, 0, 0, 1, -x, -y));

						if (smoothingFilter)
							bitmapData.applyFilter(bitmapData, bitmapData.rect, new Point(), smoothingFilter);

						bitmap.x = x;
						bitmap.y = y;

						bitmapIndex++;
					}
				}
			}

			// remove unused bitmaps
			for (var i:int = bitmaps.length - 1; i >= bitmapIndex; i--)
			{
				bitmap = bitmaps.pop();
				bitmap.bitmapData.dispose();
				bitmapSprite.removeChild(bitmap);
			}
		}

		private function _getNumLines(textField:TextField) : int
		{
			var numLines:int = textField.numLines;
			if (numLines > 0)
			{
				var lastLine:String = textField.getLineText(numLines - 1);
				if (!lastLine)
					numLines--;
			}
			return numLines;
		}

		private function _self_added(e:Event) : void
		{
			if (e.target != this)
				e.stopImmediatePropagation();
		}

		private function _self_removed(e:Event) : void
		{
			if (e.target != this)
				e.stopImmediatePropagation();
		}

		private function _textField_change(e:Event) : void
		{
			this.dispatchEvent(e);
		}

		private function _textField_link(e:TextEvent) : void
		{
			this.dispatchEvent(e);
		}

		private function _textField_scroll(e:Event) : void
		{
			this.dispatchEvent(e);
		}

		private function _textField_textInput(e:TextEvent) : void
		{
			this.dispatchEvent(e);
		}

	}

}
