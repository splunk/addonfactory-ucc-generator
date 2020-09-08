package com.jasongatt.controls
{

	import com.jasongatt.core.IObservable;
	import com.jasongatt.core.ObservableProperty;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.text.TextFormat;

	[Event(name="changed", type="com.jasongatt.core.ChangedEvent")]

	public class ObservableTextFormat extends TextFormat implements IObservable
	{

		// Private Properties

		private var _align:ObservableProperty;
		private var _blockIndent:ObservableProperty;
		private var _bold:ObservableProperty;
		private var _bullet:ObservableProperty;
		private var _color:ObservableProperty;
		private var _font:ObservableProperty;
		private var _indent:ObservableProperty;
		private var _italic:ObservableProperty;
		private var _kerning:ObservableProperty;
		private var _leading:ObservableProperty;
		private var _leftMargin:ObservableProperty;
		private var _letterSpacing:ObservableProperty;
		private var _rightMargin:ObservableProperty;
		private var _size:ObservableProperty;
		private var _tabStops:ObservableProperty;
		private var _target:ObservableProperty;
		private var _underline:ObservableProperty;
		private var _url:ObservableProperty;

		private var _eventDispatcher:EventDispatcher;

		// Constructor

		public function ObservableTextFormat(textFormat:TextFormat = null)
		{
			if (textFormat)
			{
				super.align = textFormat.align;
				super.blockIndent = textFormat.blockIndent;
				super.bold = textFormat.bold;
				super.bullet = textFormat.bullet;
				super.color = textFormat.color;
				super.font = textFormat.font;
				super.indent = textFormat.indent;
				super.italic = textFormat.italic;
				super.kerning = textFormat.kerning;
				super.leading = textFormat.leading;
				super.leftMargin = textFormat.leftMargin;
				super.letterSpacing = textFormat.letterSpacing;
				super.rightMargin = textFormat.rightMargin;
				super.size = textFormat.size;
				super.tabStops = textFormat.tabStops;
				super.target = textFormat.target;
				super.underline = textFormat.underline;
				super.url = textFormat.url;
			}

			this._align = new ObservableProperty(this, "align", String, super.align);
			this._blockIndent = new ObservableProperty(this, "blockIndent", Object, super.blockIndent);
			this._bold = new ObservableProperty(this, "bold", Object, super.bold);
			this._bullet = new ObservableProperty(this, "bullet", Object, super.bullet);
			this._color = new ObservableProperty(this, "color", Object, super.color);
			this._font = new ObservableProperty(this, "font", String, super.font);
			this._indent = new ObservableProperty(this, "indent", Object, super.indent);
			this._italic = new ObservableProperty(this, "italic", Object, super.italic);
			this._kerning = new ObservableProperty(this, "kerning", Object, super.kerning);
			this._leading = new ObservableProperty(this, "leading", Object, super.leading);
			this._leftMargin = new ObservableProperty(this, "leftMargin", Object, super.leftMargin);
			this._letterSpacing = new ObservableProperty(this, "letterSpacing", Object, super.letterSpacing);
			this._rightMargin = new ObservableProperty(this, "rightMargin", Object, super.rightMargin);
			this._size = new ObservableProperty(this, "size", Object, super.size);
			this._tabStops = new ObservableProperty(this, "tabStops", Array, super.tabStops);
			this._target = new ObservableProperty(this, "target", String, super.target);
			this._underline = new ObservableProperty(this, "underline", Object, super.underline);
			this._url = new ObservableProperty(this, "url", String, super.url);

			this._eventDispatcher = new EventDispatcher(this);
		}

		// Public Getters/Setters

		public override function get align() : String
		{
			return this._align.value;
		}
		public override function set align(value:String) : void
		{
			try
			{
				super.align = value;
			}
			catch (e:Error)
			{
				super.align = null;
			}
			this._align.value = super.align;
		}

		public override function get blockIndent() : Object
		{
			return this._blockIndent.value;
		}
		public override function set blockIndent(value:Object) : void
		{
			try
			{
				super.blockIndent = value;
			}
			catch (e:Error)
			{
				super.blockIndent = null;
			}
			this._blockIndent.value = super.blockIndent;
		}

		public override function get bold() : Object
		{
			return this._bold.value;
		}
		public override function set bold(value:Object) : void
		{
			try
			{
				super.bold = value;
			}
			catch (e:Error)
			{
				super.bold = null;
			}
			this._bold.value = super.bold;
		}

		public override function get bullet() : Object
		{
			return this._bullet.value;
		}
		public override function set bullet(value:Object) : void
		{
			try
			{
				super.bullet = value;
			}
			catch (e:Error)
			{
				super.bullet = null;
			}
			this._bullet.value = super.bullet;
		}

		public override function get color() : Object
		{
			return this._color.value;
		}
		public override function set color(value:Object) : void
		{
			try
			{
				super.color = value;
			}
			catch (e:Error)
			{
				super.color = null;
			}
			this._color.value = super.color;
		}

		public override function get font() : String
		{
			return this._font.value;
		}
		public override function set font(value:String) : void
		{
			try
			{
				super.font = value;
			}
			catch (e:Error)
			{
				super.font = null;
			}
			this._font.value = super.font;
		}

		public override function get indent() : Object
		{
			return this._indent.value;
		}
		public override function set indent(value:Object) : void
		{
			try
			{
				super.indent = value;
			}
			catch (e:Error)
			{
				super.indent = null;
			}
			this._indent.value = super.indent;
		}

		public override function get italic() : Object
		{
			return this._italic.value;
		}
		public override function set italic(value:Object) : void
		{
			try
			{
				super.italic = value;
			}
			catch (e:Error)
			{
				super.italic = null;
			}
			this._italic.value = super.italic;
		}

		public override function get kerning() : Object
		{
			return this._kerning.value;
		}
		public override function set kerning(value:Object) : void
		{
			try
			{
				super.kerning = value;
			}
			catch (e:Error)
			{
				super.kerning = null;
			}
			this._kerning.value = super.kerning;
		}

		public override function get leading() : Object
		{
			return this._leading.value;
		}
		public override function set leading(value:Object) : void
		{
			try
			{
				super.leading = value;
			}
			catch (e:Error)
			{
				super.leading = null;
			}
			this._leading.value = super.leading;
		}

		public override function get leftMargin() : Object
		{
			return this._leftMargin.value;
		}
		public override function set leftMargin(value:Object) : void
		{
			try
			{
				super.leftMargin = value;
			}
			catch (e:Error)
			{
				super.leftMargin = null;
			}
			this._leftMargin.value = super.leftMargin;
		}

		public override function get letterSpacing() : Object
		{
			return this._letterSpacing.value;
		}
		public override function set letterSpacing(value:Object) : void
		{
			try
			{
				super.letterSpacing = value;
			}
			catch (e:Error)
			{
				super.letterSpacing = null;
			}
			this._letterSpacing.value = super.letterSpacing;
		}

		public override function get rightMargin() : Object
		{
			return this._rightMargin.value;
		}
		public override function set rightMargin(value:Object) : void
		{
			try
			{
				super.rightMargin = value;
			}
			catch (e:Error)
			{
				super.rightMargin = null;
			}
			this._rightMargin.value = super.rightMargin;
		}

		public override function get size() : Object
		{
			return this._size.value;
		}
		public override function set size(value:Object) : void
		{
			try
			{
				super.size = value;
			}
			catch (e:Error)
			{
				super.size = null;
			}
			this._size.value = super.size;
		}

		public override function get tabStops() : Array
		{
			return this._tabStops.value;
		}
		public override function set tabStops(value:Array) : void
		{
			try
			{
				super.tabStops = value;
			}
			catch (e:Error)
			{
				super.tabStops = null;
			}
			this._tabStops.value = super.tabStops;
		}

		public override function get target() : String
		{
			return this._target.value;
		}
		public override function set target(value:String) : void
		{
			try
			{
				super.target = value;
			}
			catch (e:Error)
			{
				super.target = null;
			}
			this._target.value = super.target;
		}

		public override function get underline() : Object
		{
			return this._underline.value;
		}
		public override function set underline(value:Object) : void
		{
			try
			{
				super.underline = value;
			}
			catch (e:Error)
			{
				super.underline = null;
			}
			this._underline.value = super.underline;
		}

		public override function get url() : String
		{
			return this._url.value;
		}
		public override function set url(value:String) : void
		{
			try
			{
				super.url = value;
			}
			catch (e:Error)
			{
				super.url = null;
			}
			this._url.value = super.url;
		}

		// Public Methods

		public function addEventListener(type:String, listener:Function, useCapture:Boolean = false, priority:int = 0, useWeakReference:Boolean = false) : void
		{
			this._eventDispatcher.addEventListener(type, listener, useCapture, priority, useWeakReference);
		}

		public function removeEventListener(type:String, listener:Function, useCapture:Boolean = false) : void
		{
			this._eventDispatcher.removeEventListener(type, listener, useCapture);
		}

		public function dispatchEvent(event:Event) : Boolean
		{
			return this._eventDispatcher.dispatchEvent(event);
		}

		public function hasEventListener(type:String) : Boolean
		{
			return this._eventDispatcher.hasEventListener(type);
		}

		public function willTrigger(type:String) : Boolean
		{
			return this._eventDispatcher.willTrigger(type);
		}

	}

}
