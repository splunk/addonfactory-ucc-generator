package com.splunk.controls
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Margin;
	import com.jasongatt.layout.Size;
	import com.jasongatt.utils.MarginUtil;
	import com.splunk.skins.IBorderSkin;
	import com.splunk.skins.IGraphicSkin;
	import com.splunk.skins.ISkin;
	import com.splunk.skins.IStyleSkin;
	import com.splunk.skins.TextInputSkin;
	import com.splunk.utils.Style;
	import flash.display.DisplayObject;
	import flash.display.Graphics;
	import flash.display.Stage;
	import flash.events.Event;
	import flash.events.FocusEvent;
	import flash.events.KeyboardEvent;
	import flash.events.TextEvent;
	import flash.geom.Rectangle;
	import flash.text.TextField;
	import flash.text.TextFieldAutoSize;
	import flash.text.TextFieldType;
	import flash.text.TextFormat;
	import flash.text.TextLineMetrics;
	import flash.ui.Keyboard;

	[Event(name="valueChanged", type="flash.events.Event")]

	public class TextInput extends AbstractControl
	{

		// Public Static Constants

		public static const VALUE_CHANGED:String = "valueChanged";

		// Private Properties

		private var _value:ObservableProperty;

		private var _textField:TextField;

		private var _cachedSkin:ISkin;
		private var _cachedTextSkin:ISkin;
		private var _cachedState:String;
		private var _cachedBorder:Margin;

		// Constructor

		public function TextInput()
		{
			this._value = new ObservableProperty(this, "value", String, "", this._value_changed);

			this._textField = new TextField();
			this._textField.type = TextFieldType.INPUT;
			this._textField.defaultTextFormat = new TextFormat("_sans", 12);
			this._textField.addEventListener(FocusEvent.FOCUS_OUT, this._textField_focusOut);
			this._textField.addEventListener(KeyboardEvent.KEY_DOWN, this._textField_keyDown);
			//this._textField.addEventListener(Event.CHANGE , this._textField_change);
			//this._textField.addEventListener(TextEvent.LINK , this._textField_link);
			//this._textField.addEventListener(Event.SCROLL, this._textField_scroll);
			//this._textField.addEventListener(TextEvent.TEXT_INPUT , this._textField_textInput);

			this.skin = new TextInputSkin();

			this.addChild(this._textField);
		}

		// Public Getters/Setters

		public function get value() : String
		{
			return this._value.value;
		}
		public function set value(value:String) : void
		{
			this._value.value = this._textField.text = value ? value : "";
		}

		public function get alwaysShowSelection() : Boolean
		{
			return this._textField.alwaysShowSelection;
		}
		public function set alwaysShowSelection(value:Boolean) : void
		{
			this._textField.alwaysShowSelection = value;
		}

		public function get bottomScrollV() : int
		{
			return this._textField.bottomScrollV;
		}

		public function get caretIndex() : int
		{
			return this._textField.caretIndex;
		}

		public function get displayAsPassword() : Boolean
		{
			return this._textField.displayAsPassword;
		}
		public function set displayAsPassword(value:Boolean) : void
		{
			this._textField.displayAsPassword = value;
		}

		public function get length() : int
		{
			return this._textField.length;
		}

		public function get maxChars() : int
		{
			return this._textField.maxChars;
		}
		public function set maxChars(value:int) : void
		{
			this._textField.maxChars = value;
		}

		public function get maxScrollH() : int
		{
			return this._textField.maxScrollH;
		}

		public function get maxScrollV() : int
		{
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

		public function get multiline() : Boolean
		{
			return this._textField.multiline;
		}
		public function set multiline(value:Boolean) : void
		{
			this._textField.multiline = value;
		}

		public function get numLines() : int
		{
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

		public function get scrollH() : int
		{
			return this._textField.scrollH;
		}
		public function set scrollH(value:int) : void
		{
			this._textField.scrollH = value;
		}

		public function get scrollV() : int
		{
			return this._textField.scrollV;
		}
		public function set scrollV(value:int) : void
		{
			this._textField.scrollV = value;
		}

		public function get selectionBeginIndex() : int
		{
			return this._textField.selectionBeginIndex;
		}

		public function get selectionEndIndex() : int
		{
			return this._textField.selectionEndIndex;
		}

		public function get textHeight() : Number
		{
			return this._textField.textHeight;
		}

		public function get textWidth() : Number
		{
			return this._textField.textWidth;
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
			return this._textField.wordWrap;
		}
		public function set wordWrap(value:Boolean) : void
		{
			this._textField.wordWrap = value;
		}

		// Public Methods

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

		protected override function updateSkinOverride(skin:ISkin) : void
		{
			this._cachedSkin = skin;
			this._cachedTextSkin = skin ? skin.getChildSkin("text") : null;
		}

		protected override function updateStateOverride(state:String) : void
		{
			this.invalidate(LayoutSprite.LAYOUT);

			var textField:TextField = this._textField;

			var propertyNames:Array = [ "alwaysShowSelection", "autoSize", "background", "border", "displayAsPassword", "maxChars", "mouseWheelEnabled", "multiline", "restrict", "scrollH", "scrollV", "selectable", "useRichTextClipboard", "type", "wordWrap" ];
			var propertyName:String;
			var propertyValues:Object = new Object();

			for each (propertyName in propertyNames)
				propertyValues[propertyName] = textField[propertyName];

			var textStyle:Style;
			var textStyleSkin:IStyleSkin = this._cachedTextSkin as IStyleSkin;
			if (textStyleSkin)
				textStyle = textStyleSkin.getStyle(state);
			Style.applyStyle(textField, textStyle);

			for each (propertyName in propertyNames)
				textField[propertyName] = propertyValues[propertyName];

			var style:Style;
			var styleSkin:IStyleSkin = this._cachedSkin as IStyleSkin;
			if (styleSkin)
				style = styleSkin.getStyle(state);
			Style.applyStyle(this, style);

			this._cachedState = state;
		}

		protected override function measureOverride(availableSize:Size) : Size
		{
			var availableWidth:Number = Math.floor(availableSize.width);
			var availableHeight:Number = Math.floor(availableSize.height);

			var measuredSize:Size = new Size();

			var graphicSkin:IGraphicSkin = this._cachedSkin as IGraphicSkin;
			var skinSize:Size = graphicSkin ? graphicSkin.getPreferredSize(new Size(availableWidth, availableHeight)) : new Size();

			var borderSkin:IBorderSkin = this._cachedSkin as IBorderSkin;
			var border:Margin = borderSkin ? MarginUtil.round(borderSkin.getBorderMargin()) : new Margin();
			var borderX:Number = border.left + border.right;
			var borderY:Number = border.top + border.bottom;

			availableWidth = Math.max(availableWidth - borderX, 0);
			availableHeight = Math.max(availableHeight - borderY, 0);

			var textField:TextField = this._textField;
			var htmlText:String = textField.htmlText;
			textField.autoSize = TextFieldAutoSize.LEFT;
			textField.text = "measure";

			measuredSize.width = Math.round(Math.max(borderX, skinSize.width, 0));
			measuredSize.height = Math.round(Math.max(Math.min(textField.height, availableHeight) + borderY, skinSize.height, 0));

			textField.autoSize = TextFieldAutoSize.NONE;
			textField.htmlText = htmlText;

			this._cachedBorder = border;

			return measuredSize;
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			var layoutWidth:Number = Math.round(layoutSize.width);
			var layoutHeight:Number = Math.round(layoutSize.height);

			var border:Margin = this._cachedBorder;

			var textField:TextField = this._textField;
			textField.x = border.left;
			textField.y = border.top;
			textField.width = Math.max(layoutWidth - border.left - border.right, 0);
			textField.height = Math.max(layoutHeight - border.top - border.bottom, 0);

			var graphics:Graphics = this.graphics;
			graphics.clear();

			var graphicSkin:IGraphicSkin = this._cachedSkin as IGraphicSkin;
			if (graphicSkin)
				graphicSkin.draw(graphics, 0, 0, layoutWidth, layoutHeight, this._cachedState);

			return layoutSize;
		}

		// Private Methods

		private function _value_changed(e:ChangedEvent) : void
		{
			this.dispatchEvent(new Event(TextInput.VALUE_CHANGED));
		}

		private function _textField_focusOut(e:FocusEvent) : void
		{
			this._value.value = this._textField.text;
		}

		private function _textField_keyDown(e:KeyboardEvent) : void
		{
			switch (e.keyCode)
			{
				case Keyboard.ENTER:
					var stage:Stage = this.stage;
					if (stage && !e.shiftKey)
						stage.focus = null;
					break;
			}
		}

	}

}
