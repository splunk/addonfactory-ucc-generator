package com.jasongatt.layout
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.DisableEvent;
	import com.jasongatt.core.DisableObject;
	import com.jasongatt.core.IDisable;
	import com.jasongatt.core.IObservable;
	import com.jasongatt.core.IValidate;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.PropertyChangedEvent;
	import com.jasongatt.core.ValidateEvent;
	import com.jasongatt.core.ValidateObject;
	import com.jasongatt.core.ValidatePass;
	import com.jasongatt.core.ValidateQueue;
	import com.jasongatt.utils.DisplayListDepthSort;
	import com.jasongatt.utils.MatrixUtil;
	import com.jasongatt.utils.NumberUtil;
	import com.jasongatt.utils.RectangleUtil;
	import com.jasongatt.utils.SizeUtil;
	import flash.display.DisplayObject;
	import flash.display.DisplayObjectContainer;
	import flash.display.Graphics;
	import flash.display.Shape;
	import flash.display.Sprite;
	import flash.display.Stage;
	import flash.display.StageAlign;
	import flash.display.StageScaleMode;
	import flash.events.Event;
	import flash.geom.Matrix;
	import flash.geom.Point;
	import flash.geom.Rectangle;

	[Event(name="changed", type="com.jasongatt.core.ChangedEvent")]
	[Event(name="invalidated", type="com.jasongatt.core.ValidateEvent")]
	[Event(name="validated", type="com.jasongatt.core.ValidateEvent")]
	[Event(name="disabled", type="com.jasongatt.core.DisableEvent")]
	[Event(name="enabled", type="com.jasongatt.core.DisableEvent")]

	public class LayoutSprite extends Sprite implements IObservable, IValidate, IDisable
	{

		// Public Static Constants

		public static const MEASURE:ValidatePass = new ValidatePass(LayoutSprite, "measure", 1, new DisplayListDepthSort());
		public static const LAYOUT:ValidatePass = new ValidatePass(LayoutSprite, "layout", 2, new DisplayListDepthSort());
		public static const RENDER:ValidatePass = new ValidatePass(LayoutSprite, "render", 3, new DisplayListDepthSort());

		// Private Properties

		private var _x:ObservableProperty;
		private var _y:ObservableProperty;
		private var _scaleX:ObservableProperty;
		private var _scaleY:ObservableProperty;
		private var _rotation:ObservableProperty;
		private var _visibility:ObservableProperty;
		private var _mask:ObservableProperty;
		private var _clip:ObservableProperty;
		private var _snap:ObservableProperty;
		private var _width:ObservableProperty;
		private var _height:ObservableProperty;
		private var _minimumWidth:ObservableProperty;
		private var _minimumHeight:ObservableProperty;
		private var _maximumWidth:ObservableProperty;
		private var _maximumHeight:ObservableProperty;
		private var _margin:ObservableProperty;
		private var _alignmentX:ObservableProperty;
		private var _alignmentY:ObservableProperty;
		private var _layoutTransform:ObservableProperty;
		private var _renderTransform:ObservableProperty;
		private var _renderTransformOrigin:ObservableProperty;
		private var _renderTransformOriginMode:ObservableProperty;

		private var _validateObject:ValidateObject;
		private var _disableObject:DisableObject;
		private var _mouseEnabled:Boolean;
		private var _mouseChildren:Boolean;
		private var _tabEnabled:Boolean;
		private var _tabChildren:Boolean;

		private var _cachedCollapsed:Boolean;
		private var _cachedMinimumWidth:Number;
		private var _cachedMinimumHeight:Number;
		private var _cachedMaximumWidth:Number;
		private var _cachedMaximumHeight:Number;
		private var _cachedMargin:Margin;
		private var _cachedMarginX:Number;
		private var _cachedMarginY:Number;
		private var _cachedLayoutTransform:Matrix;
		private var _layoutTransformOffsetX:Number = 0;
		private var _layoutTransformOffsetY:Number = 0;
		private var _untransformedActualWidth:Number = 0;
		private var _untransformedActualHeight:Number = 0;
		private var _untransformedMeasuredWidth:Number = 0;
		private var _untransformedMeasuredHeight:Number = 0;
		private var _unclippedMeasuredWidth:Number = 0;
		private var _unclippedMeasuredHeight:Number = 0;
		private var _measuredWidth:Number = 0;
		private var _measuredHeight:Number = 0;

		private var _availableSize:Size;
		private var _layoutBounds:Rectangle;
		private var _renderMatrix:Matrix;
		private var _actualBounds:Rectangle;
		private var _clippedBounds:Rectangle;
		private var _renderBounds:Rectangle;

		private var _useAvailableSize:Size;
		private var _useLayoutBounds:Rectangle;
		private var _useRenderMatrix:Matrix;

		private var _clipMask:Shape;
		private var _clipMaskOffset:int = 0;

		private var _layoutParent:LayoutSprite;
		private var _stageParent:Stage;

		// Constructor

		public function LayoutSprite()
		{
			this._validateObject = new ValidateObject(this);
			this._disableObject = new DisableObject(this);

			this._x = new ObservableProperty(this, "x", Number, 0, this.invalidates(LayoutSprite.RENDER));
			this._y = new ObservableProperty(this, "y", Number, 0, this.invalidates(LayoutSprite.RENDER));
			this._scaleX = new ObservableProperty(this, "scaleX", Number, 1, this.invalidates(LayoutSprite.RENDER));
			this._scaleY = new ObservableProperty(this, "scaleY", Number, 1, this.invalidates(LayoutSprite.RENDER));
			this._rotation = new ObservableProperty(this, "rotation", Number, 0, this.invalidates(LayoutSprite.RENDER));
			this._visibility = new ObservableProperty(this, "visibility", String, Visibility.VISIBLE, this._visibility_changed);
			this._mask = new ObservableProperty(this, "mask", DisplayObject, null, this.invalidates(LayoutSprite.RENDER));
			this._clip = new ObservableProperty(this, "clip", Boolean, false, this.invalidates(LayoutSprite.RENDER));
			this._snap = new ObservableProperty(this, "snap", Boolean, false, this.invalidates(LayoutSprite.LAYOUT));
			this._width = new ObservableProperty(this, "width", Number, Size.AUTO, this.invalidates(LayoutSprite.MEASURE));
			this._height = new ObservableProperty(this, "height", Number, Size.AUTO, this.invalidates(LayoutSprite.MEASURE));
			this._minimumWidth = new ObservableProperty(this, "minimumWidth", Number, 0, this.invalidates(LayoutSprite.MEASURE));
			this._minimumHeight = new ObservableProperty(this, "minimumHeight", Number, 0, this.invalidates(LayoutSprite.MEASURE));
			this._maximumWidth = new ObservableProperty(this, "maximumWidth", Number, Infinity, this.invalidates(LayoutSprite.MEASURE));
			this._maximumHeight = new ObservableProperty(this, "maximumHeight", Number, Infinity, this.invalidates(LayoutSprite.MEASURE));
			this._margin = new ObservableProperty(this, "margin", Margin, new Margin(), this.invalidates(LayoutSprite.MEASURE));
			this._alignmentX = new ObservableProperty(this, "alignmentX", Number, Alignment.AUTO, this.invalidates(LayoutSprite.LAYOUT));
			this._alignmentY = new ObservableProperty(this, "alignmentY", Number, Alignment.AUTO, this.invalidates(LayoutSprite.LAYOUT));
			this._layoutTransform = new ObservableProperty(this, "layoutTransform", Matrix, new Matrix(), this.invalidates(LayoutSprite.MEASURE));
			this._renderTransform = new ObservableProperty(this, "renderTransform", Matrix, new Matrix(), this.invalidates(LayoutSprite.RENDER));
			this._renderTransformOrigin = new ObservableProperty(this, "renderTransformOrigin", Point, new Point(), this.invalidates(LayoutSprite.RENDER));
			this._renderTransformOriginMode = new ObservableProperty(this, "renderTransformOriginMode", String, RenderTransformOriginMode.RELATIVE, this.invalidates(LayoutSprite.RENDER));

			this._availableSize = new Size();
			this._layoutBounds = new Rectangle();
			this._renderMatrix = new Matrix();
			this._actualBounds = new Rectangle();
			this._clippedBounds = new Rectangle();
			this._renderBounds = new Rectangle();

			super.mouseEnabled = this._mouseEnabled = true;
			super.mouseChildren = this._mouseChildren = true;
			super.tabEnabled = this._tabEnabled = false;
			super.tabChildren = this._tabChildren = true;

			this.addEventListener(Event.ADDED, this._self_added, false, int.MAX_VALUE);
			this.addEventListener(Event.REMOVED, this._self_removed, false, int.MAX_VALUE);
			this.addEventListener(ValidateEvent.INVALIDATED, this._self_invalidated, false, int.MAX_VALUE);
			this.addEventListener(DisableEvent.DISABLED, this._updateEnabled, false, int.MAX_VALUE);
			this.addEventListener(DisableEvent.ENABLED, this._updateEnabled, false, int.MAX_VALUE);

			this.invalidate(LayoutSprite.MEASURE);
		}

		// Public Getters/Setters

		public override function get x() : Number
		{
			return this._x.value;
		}
		public override function set x(value:Number) : void
		{
			this._x.value = value;
		}

		public override function get y() : Number
		{
			return this._y.value;
		}
		public override function set y(value:Number) : void
		{
			this._y.value = value;
		}

		public override function get scaleX() : Number
		{
			return this._scaleX.value;
		}
		public override function set scaleX(value:Number) : void
		{
			this._scaleX.value = value;
		}

		public override function get scaleY() : Number
		{
			return this._scaleY.value;
		}
		public override function set scaleY(value:Number) : void
		{
			this._scaleY.value = value;
		}

		public override function get rotation() : Number
		{
			return this._rotation.value;
		}
		public override function set rotation(value:Number) : void
		{
			this._rotation.value = value;
		}

		public override function get visible() : Boolean
		{
			return (this._visibility.value == Visibility.VISIBLE);
		}
		public override function set visible(value:Boolean) : void
		{
			if (value)
				this._visibility.value = Visibility.VISIBLE;
			else if (this._visibility.value == Visibility.VISIBLE)
				this._visibility.value = Visibility.HIDDEN;
		}

		public function get visibility() : String
		{
			return this._visibility.value;
		}
		public function set visibility(value:String) : void
		{
			switch (value)
			{
				case Visibility.VISIBLE:
				case Visibility.HIDDEN:
				case Visibility.COLLAPSED:
					break;
				default:
					value = Visibility.VISIBLE;
					break;
			}
			this._visibility.value = value;
		}

		public override function get mask() : DisplayObject
		{
			return this._mask.value;
		}
		public override function set mask(value:DisplayObject) : void
		{
			this._mask.value = value;
		}

		public function get clip() : Boolean
		{
			return this._clip.value;
		}
		public function set clip(value:Boolean) : void
		{
			this._clip.value = value;
		}

		public function get snap() : Boolean
		{
			return this._snap.value;
		}
		public function set snap(value:Boolean) : void
		{
			this._snap.value = value;
		}

		public override function get mouseEnabled() : Boolean
		{
			return super.mouseEnabled;
		}
		public override function set mouseEnabled(value:Boolean) : void
		{
			if (this._mouseEnabled != value)
			{
				this._mouseEnabled = value;
				this._updateEnabled();
			}
		}

		public override function get mouseChildren() : Boolean
		{
			return super.mouseChildren;
		}
		public override function set mouseChildren(value:Boolean) : void
		{
			if (this._mouseChildren != value)
			{
				this._mouseChildren = value;
				this._updateEnabled();
			}
		}

		public override function get tabEnabled() : Boolean
		{
			return super.tabEnabled;
		}
		public override function set tabEnabled(value:Boolean) : void
		{
			if (this._tabEnabled != value)
			{
				this._tabEnabled = value;
				this._updateEnabled();
			}
		}

		public override function get tabChildren() : Boolean
		{
			return super.tabChildren;
		}
		public override function set tabChildren(value:Boolean) : void
		{
			if (this._tabChildren != value)
			{
				this._tabChildren = value;
				this._updateEnabled();
			}
		}

		public function get isEnabled() : Boolean
		{
			return this._disableObject.isEnabled;
		}
		public function set isEnabled(value:Boolean) : void
		{
			this._disableObject.isEnabled = value;
		}

		public override function get width() : Number
		{
			return this._width.value;
		}
		public override function set width(value:Number) : void
		{
			this._width.value = value;
		}

		public override function get height() : Number
		{
			return this._height.value;
		}
		public override function set height(value:Number) : void
		{
			this._height.value = value;
		}

		public function get minimumWidth() : Number
		{
			return this._minimumWidth.value;
		}
		public function set minimumWidth(value:Number) : void
		{
			this._minimumWidth.value = value;
		}

		public function get minimumHeight() : Number
		{
			return this._minimumHeight.value;
		}
		public function set minimumHeight(value:Number) : void
		{
			this._minimumHeight.value = value;
		}

		public function get maximumWidth() : Number
		{
			return this._maximumWidth.value;
		}
		public function set maximumWidth(value:Number) : void
		{
			this._maximumWidth.value = value;
		}

		public function get maximumHeight() : Number
		{
			return this._maximumHeight.value;
		}
		public function set maximumHeight(value:Number) : void
		{
			this._maximumHeight.value = value;
		}

		public function get margin() : Margin
		{
			return this._margin.value.clone();
		}
		public function set margin(value:Margin) : void
		{
			value = value ? value.clone() : new Margin();
			if (!value.equals(this._margin.value))
				this._margin.value = value;
		}

		public function get alignmentX() : Number
		{
			return this._alignmentX.value;
		}
		public function set alignmentX(value:Number) : void
		{
			this._alignmentX.value = value;
		}

		public function get alignmentY() : Number
		{
			return this._alignmentY.value;
		}
		public function set alignmentY(value:Number) : void
		{
			this._alignmentY.value = value;
		}

		public function get layoutTransform() : Matrix
		{
			return this._layoutTransform.value.clone();
		}
		public function set layoutTransform(value:Matrix) : void
		{
			value = value ? value.clone() : new Matrix();
			if (!MatrixUtil.equal(value, this._layoutTransform.value))
				this._layoutTransform.value = value;
		}

		public function get renderTransform() : Matrix
		{
			return this._renderTransform.value.clone();
		}
		public function set renderTransform(value:Matrix) : void
		{
			value = value ? value.clone() : new Matrix();
			if (!MatrixUtil.equal(value, this._renderTransform.value))
				this._renderTransform.value = value;
		}

		public function get renderTransformOrigin() : Point
		{
			return this._renderTransformOrigin.value.clone();
		}
		public function set renderTransformOrigin(value:Point) : void
		{
			value = value ? value.clone() : new Point();
			if (!value.equals(this._renderTransformOrigin.value))
				this._renderTransformOrigin.value = value;
		}

		public function get renderTransformOriginMode() : String
		{
			return this._renderTransformOriginMode.value;
		}
		public function set renderTransformOriginMode(value:String) : void
		{
			switch (value)
			{
				case RenderTransformOriginMode.RELATIVE:
				case RenderTransformOriginMode.ABSOLUTE:
					break;
				default:
					value = RenderTransformOriginMode.RELATIVE;
					break;
			}
			this._renderTransformOriginMode.value = value;
		}

		public override function get numChildren() : int
		{
			return super.numChildren - this._clipMaskOffset;
		}

		public function get measuredWidth() : Number
		{
			return this._measuredWidth;
		}

		public function get measuredHeight() : Number
		{
			return this._measuredHeight;
		}

		public function get layoutBounds() : Rectangle
		{
			return this._layoutBounds.clone();
		}

		public function get actualBounds() : Rectangle
		{
			return this._actualBounds.clone();
		}

		public function get renderBounds() : Rectangle
		{
			return this._renderBounds.clone();
		}

		// Public Methods

		public function invalidate(pass:ValidatePass) : Boolean
		{
			return this._validateObject.invalidate(pass);
		}

		public function validate(pass:ValidatePass = null) : Boolean
		{
			return this._validateObject.validate(pass);
		}

		public function validatePreceding(pass:ValidatePass) : Boolean
		{
			return this._validateObject.validatePreceding(pass);
		}

		public function setValid(pass:ValidatePass = null) : Boolean
		{
			return this._validateObject.setValid(pass);
		}

		public function isValid(pass:ValidatePass = null) : Boolean
		{
			return this._validateObject.isValid(pass);
		}

		public function invalidates(pass:ValidatePass) : Function
		{
			return this._validateObject.invalidates(pass);
		}

		public function validates(pass:ValidatePass = null) : Function
		{
			return this._validateObject.validates(pass);
		}

		public function disable(key:* = null) : Boolean
		{
			return this._disableObject.disable(key);
		}

		public function enable(key:* = null) : Boolean
		{
			return this._disableObject.enable(key);
		}

		public function measure(availableSize:Size = null) : void
		{
			this.validatePreceding(LayoutSprite.MEASURE);

			if (!availableSize)
			{
				if (this._useAvailableSize)
					availableSize = this._useAvailableSize;
				else if (this._stageParent && (this._stageParent.scaleMode == StageScaleMode.NO_SCALE) && (this._stageParent.align == StageAlign.TOP_LEFT))
					availableSize = new Size(this._stageParent.stageWidth, this._stageParent.stageHeight);
				else
					availableSize = new Size(Infinity, Infinity);
			}
			else if (SizeUtil.hasNaN(availableSize))
			{
				throw new TypeError("NaN availableSize passed to measure.");
			}
			else
			{
				availableSize = this._useAvailableSize = new Size(Math.max(availableSize.width, 0), Math.max(availableSize.height, 0));
			}

			var collapsed:Boolean = (this._visibility.value == Visibility.COLLAPSED);
			if (collapsed)
				availableSize = new Size();

			if (this.isValid(LayoutSprite.MEASURE))
			{
				if (SizeUtil.approxEqual(availableSize, this._availableSize))
					return;
				this.invalidate(LayoutSprite.MEASURE);
			}

			this.invalidate(LayoutSprite.LAYOUT);

			if (collapsed)
			{
				this.measureOverride(new Size(0, 0));

				this._cachedCollapsed = true;
				this._cachedMinimumWidth = 0;
				this._cachedMinimumHeight = 0;
				this._cachedMaximumWidth = 0;
				this._cachedMaximumHeight = 0;
				this._cachedMargin = new Margin();
				this._cachedMarginX = 0;
				this._cachedMarginY = 0;
				this._cachedLayoutTransform = null;

				this._untransformedMeasuredWidth = 0;
				this._untransformedMeasuredHeight = 0;
				this._unclippedMeasuredWidth = 0;
				this._unclippedMeasuredHeight = 0;
				this._measuredWidth = 0;
				this._measuredHeight = 0;

				this._availableSize = availableSize;

				this.setValid(LayoutSprite.MEASURE);
				return;
			}

			var width:Number = this._width.value;
			var minimumWidth:Number = Math.max(this._minimumWidth.value, 0);
			var maximumWidth:Number;
			if (width == width)
				minimumWidth = maximumWidth = NumberUtil.maxMin(width, this._maximumWidth.value, minimumWidth);
			else
				maximumWidth = Math.max(this._maximumWidth.value, minimumWidth);

			var height:Number = this._height.value;
			var minimumHeight:Number = Math.max(this._minimumHeight.value, 0);
			var maximumHeight:Number;
			if (height == height)
				minimumHeight = maximumHeight = NumberUtil.maxMin(height, this._maximumHeight.value, minimumHeight);
			else
				maximumHeight = Math.max(this._maximumHeight.value, minimumHeight);

			var margin:Margin = this._margin.value;
			var marginX:Number = margin.left + margin.right;
			var marginY:Number = margin.top + margin.bottom;

			var layoutTransform:Matrix = this._layoutTransform.value;
			if (MatrixUtil.isIdentity(layoutTransform))
				layoutTransform = null;

			var availableWidth:Number = Math.max(availableSize.width - marginX, 0);
			var availableHeight:Number = Math.max(availableSize.height - marginY, 0);

			if (layoutTransform)
			{
				var untransformedSize:Size = this._untransformSize(new Size(availableWidth, availableHeight), layoutTransform);
				availableWidth = untransformedSize.width;
				availableHeight = untransformedSize.height;
			}

			availableWidth = NumberUtil.maxMin(availableWidth, maximumWidth, minimumWidth);
			availableHeight = NumberUtil.maxMin(availableHeight, maximumHeight, minimumHeight);

			var measuredSize:Size = this.measureOverride(new Size(availableWidth, availableHeight));
			var measuredWidth:Number = Math.max(measuredSize.width, minimumWidth);
			var measuredHeight:Number = Math.max(measuredSize.height, minimumHeight);

			var untransformedMeasuredWidth:Number = measuredWidth;
			var untransformedMeasuredHeight:Number = measuredHeight;

			var unclippedMeasuredWidth:Number = measuredWidth;
			var unclippedMeasuredHeight:Number = measuredHeight;

			measuredWidth = Math.min(measuredWidth, maximumWidth);
			measuredHeight = Math.min(measuredHeight, maximumHeight);

			if (layoutTransform)
			{
				var transformRect:Rectangle = this._transformRectangle(new Rectangle(0, 0, unclippedMeasuredWidth, unclippedMeasuredHeight), layoutTransform);
				unclippedMeasuredWidth = transformRect.width;
				unclippedMeasuredHeight = transformRect.height;

				if ((measuredWidth != untransformedMeasuredWidth) || (measuredHeight != untransformedMeasuredHeight))
				{
					transformRect = this._transformRectangle(new Rectangle(0, 0, measuredWidth, measuredHeight), layoutTransform);
					measuredWidth = transformRect.width;
					measuredHeight = transformRect.height;
				}
				else
				{
					measuredWidth = unclippedMeasuredWidth;
					measuredHeight = unclippedMeasuredHeight;
				}
			}

			measuredWidth = Math.max(measuredWidth + marginX, 0);
			measuredHeight = Math.max(measuredHeight + marginY, 0);

			var checksum:Number = untransformedMeasuredWidth + untransformedMeasuredHeight + unclippedMeasuredWidth + unclippedMeasuredHeight + measuredWidth + measuredHeight;
			if (checksum != checksum)
				throw new Error("NaN size generated during measure.");
			if (checksum == Infinity)
				throw new Error("Infinite size generated during measure.");

			this._cachedCollapsed = collapsed;
			this._cachedMinimumWidth = minimumWidth;
			this._cachedMinimumHeight = minimumHeight;
			this._cachedMaximumWidth = maximumWidth;
			this._cachedMaximumHeight = maximumHeight;
			this._cachedMargin = margin;
			this._cachedMarginX = marginX;
			this._cachedMarginY = marginY;
			this._cachedLayoutTransform = layoutTransform;

			this._untransformedMeasuredWidth = untransformedMeasuredWidth;
			this._untransformedMeasuredHeight = untransformedMeasuredHeight;
			this._unclippedMeasuredWidth = unclippedMeasuredWidth;
			this._unclippedMeasuredHeight = unclippedMeasuredHeight;
			this._measuredWidth = measuredWidth;
			this._measuredHeight = measuredHeight;

			this._availableSize = availableSize;

			this.setValid(LayoutSprite.MEASURE);
		}

		public function layout(layoutBounds:Rectangle = null) : void
		{
			this.validatePreceding(LayoutSprite.LAYOUT);

			if (!layoutBounds)
			{
				if (this._useLayoutBounds)
					layoutBounds = this._useLayoutBounds;
				else if (this._stageParent && (this._stageParent.scaleMode == StageScaleMode.NO_SCALE) && (this._stageParent.align == StageAlign.TOP_LEFT))
					layoutBounds = new Rectangle(0, 0, this._stageParent.stageWidth, this._stageParent.stageHeight);
				else
					layoutBounds = new Rectangle(0, 0, this._measuredWidth, this._measuredHeight);
			}
			else if (RectangleUtil.hasNaN(layoutBounds))
			{
				throw new TypeError("NaN layoutBounds passed to layout.");
			}
			else if (RectangleUtil.hasInfinity(layoutBounds))
			{
				throw new TypeError("Infinite layoutBounds passed to layout.");
			}
			else
			{
				layoutBounds = this._useLayoutBounds = new Rectangle(layoutBounds.x, layoutBounds.y, Math.max(layoutBounds.width, 0), Math.max(layoutBounds.height, 0));
			}

			var collapsed:Boolean = this._cachedCollapsed;
			if (collapsed)
				layoutBounds = new Rectangle();

			if (this.isValid(LayoutSprite.LAYOUT))
			{
				if (RectangleUtil.approxEqual(layoutBounds, this._layoutBounds))
					return;
				this.invalidate(LayoutSprite.LAYOUT);
			}

			this.invalidate(LayoutSprite.RENDER);

			if (collapsed)
			{
				this.layoutOverride(new Size(0, 0));

				this._actualBounds.x = 0;
				this._actualBounds.y = 0;
				this._actualBounds.width = 0;
				this._actualBounds.height = 0;

				this._clippedBounds.x = 0;
				this._clippedBounds.y = 0;
				this._clippedBounds.width = 0;
				this._clippedBounds.height = 0;

				this._layoutTransformOffsetX = 0;
				this._layoutTransformOffsetY = 0;
				this._untransformedActualWidth = 0;
				this._untransformedActualHeight = 0;

				this._layoutBounds = layoutBounds;

				this.setValid(LayoutSprite.LAYOUT);
				return;
			}

			var snap:Boolean = this._snap.value;
			var minimumWidth:Number = this._cachedMinimumWidth;
			var minimumHeight:Number = this._cachedMinimumHeight;
			var maximumWidth:Number = this._cachedMaximumWidth;
			var maximumHeight:Number = this._cachedMaximumHeight;
			var margin:Margin = this._cachedMargin;
			var marginX:Number = this._cachedMarginX;
			var marginY:Number = this._cachedMarginY;
			var layoutTransform:Matrix = this._cachedLayoutTransform;

			var layoutWidth:Number = Math.max(layoutBounds.width - marginX, 0);
			var layoutHeight:Number = Math.max(layoutBounds.height - marginY, 0);

			var actualWidth:Number = layoutWidth;
			var actualHeight:Number = layoutHeight;

			var maximumMeasuredWidth:Number = this._unclippedMeasuredWidth;
			var maximumMeasuredHeight:Number = this._unclippedMeasuredHeight;

			var alignmentX:Number = this._alignmentX.value;
			var alignmentY:Number = this._alignmentY.value;

			if ((actualWidth < maximumMeasuredWidth) || (alignmentX == alignmentX))
				actualWidth = maximumMeasuredWidth;
			if ((actualHeight < maximumMeasuredHeight) || (alignmentY == alignmentY))
				actualHeight = maximumMeasuredHeight;

			if (layoutTransform)
			{
				var untransformedSize:Size = this._untransformSize(new Size(actualWidth, actualHeight), layoutTransform);
				actualWidth = untransformedSize.width;
				actualHeight = untransformedSize.height;
				maximumMeasuredWidth = this._untransformedMeasuredWidth;
				maximumMeasuredHeight = this._untransformedMeasuredHeight;
				if ((actualWidth != 0) && (actualHeight != 0) && ((actualWidth < maximumMeasuredWidth) || (actualHeight < maximumMeasuredHeight)))
				{
					actualWidth = maximumMeasuredWidth;
					actualHeight = maximumMeasuredHeight;
				}
				else
				{
					if (actualWidth < maximumMeasuredWidth)
						actualWidth = maximumMeasuredWidth;
					if (actualHeight < maximumMeasuredHeight)
						actualHeight = maximumMeasuredHeight;
				}
			}

			actualWidth = NumberUtil.minMax(maximumMeasuredWidth, maximumWidth, actualWidth);
			actualHeight = NumberUtil.minMax(maximumMeasuredHeight, maximumHeight, actualHeight);

			var layoutSize:Size = this.layoutOverride(new Size(actualWidth, actualHeight));
			actualWidth = NumberUtil.maxMin(layoutSize.width, maximumWidth, minimumWidth);
			actualHeight = NumberUtil.maxMin(layoutSize.height, maximumHeight, minimumHeight);

			var untransformedActualWidth:Number = actualWidth;
			var untransformedActualHeight:Number = actualHeight;

			var layoutTransformOffsetX:Number = 0;
			var layoutTransformOffsetY:Number = 0;
			if (layoutTransform)
			{
				var transformRect:Rectangle = this._transformRectangle(new Rectangle(0, 0, actualWidth, actualHeight), layoutTransform);
				actualWidth = transformRect.width;
				actualHeight = transformRect.height;
				layoutTransformOffsetX = -transformRect.x;
				layoutTransformOffsetY = -transformRect.y;
			}

			if (alignmentX != alignmentX)
				alignmentX = (actualWidth > layoutWidth) ? Alignment.LEFT : Alignment.CENTER;
			if (alignmentY != alignmentY)
				alignmentY = (actualHeight > layoutHeight) ? Alignment.TOP : Alignment.CENTER;

			var actualX:Number = layoutBounds.x + margin.left + (layoutBounds.width - Math.max(actualWidth + marginX, 0)) * alignmentX;
			var actualY:Number = layoutBounds.y + margin.top + (layoutBounds.height - Math.max(actualHeight + marginY, 0)) * alignmentY;

			if (snap)
			{
				actualX = Math.round(actualX);
				actualY = Math.round(actualY);
				layoutTransformOffsetX = Math.round(layoutTransformOffsetX);
				layoutTransformOffsetY = Math.round(layoutTransformOffsetY);
			}

			var checksum:Number = Math.abs(actualX) + Math.abs(actualY) + actualWidth + actualHeight;
			if (checksum != checksum)
				throw new Error("NaN bounds generated during layout.");
			if (checksum == Infinity)
				throw new Error("Infinite bounds generated during layout.");

			this._actualBounds.x = actualX;
			this._actualBounds.y = actualY;
			this._actualBounds.width = actualWidth;
			this._actualBounds.height = actualHeight;

			if (actualWidth == minimumWidth)
			{
				this._clippedBounds.x = actualX;
				this._clippedBounds.width = actualWidth;
			}
			else
			{
				this._clippedBounds.x = Math.max(layoutBounds.x, layoutBounds.x + margin.left, actualX);
				this._clippedBounds.width = Math.min(layoutBounds.width, layoutWidth, actualWidth);
				if (snap)
					this._clippedBounds.x = Math.round(this._clippedBounds.x);
			}

			if (actualHeight == minimumHeight)
			{
				this._clippedBounds.y = actualY;
				this._clippedBounds.height = actualHeight;
			}
			else
			{
				this._clippedBounds.y = Math.max(layoutBounds.y, layoutBounds.y + margin.top, actualY);
				this._clippedBounds.height = Math.min(layoutBounds.height, layoutHeight, actualHeight);
				if (snap)
					this._clippedBounds.y = Math.round(this._clippedBounds.y);
			}

			this._layoutTransformOffsetX = layoutTransformOffsetX;
			this._layoutTransformOffsetY = layoutTransformOffsetY;

			this._untransformedActualWidth = untransformedActualWidth;
			this._untransformedActualHeight = untransformedActualHeight;

			this._layoutBounds = layoutBounds;

			this.setValid(LayoutSprite.LAYOUT);
		}

		public function render(renderMatrix:Matrix = null) : void
		{
			this.validatePreceding(LayoutSprite.RENDER);

			if (!renderMatrix)
			{
				if (this._useRenderMatrix)
					renderMatrix = this._useRenderMatrix;
				else
					renderMatrix = new Matrix();
			}
			else if (MatrixUtil.hasNaN(renderMatrix))
			{
				throw new TypeError("NaN renderMatrix passed to render.");
			}
			else if (MatrixUtil.hasInfinity(renderMatrix))
			{
				throw new TypeError("Infinite renderMatrix passed to render.");
			}
			else
			{
				renderMatrix = this._useRenderMatrix = renderMatrix.clone();
			}

			var collapsed:Boolean = this._cachedCollapsed;
			if (collapsed)
				renderMatrix = new Matrix();

			if (this.isValid(LayoutSprite.RENDER))
			{
				if (MatrixUtil.approxEqual(renderMatrix, this._renderMatrix))
					return;
				this.invalidate(LayoutSprite.RENDER);
			}

			var matrix:Matrix;

			if (collapsed)
			{
				matrix = new Matrix();
				super.transform.matrix = matrix;

				this.renderOverride(new Matrix());

				super.transform.matrix = matrix;
				super.visible = false;
				this._renderMask();

				this._renderBounds.x = 0;
				this._renderBounds.y = 0;
				this._renderBounds.width = 0;
				this._renderBounds.height = 0;

				this._renderMatrix = renderMatrix;

				this.setValid(LayoutSprite.RENDER);
				return;
			}

			var actualBounds:Rectangle = this._actualBounds;

			var layoutTransform:Matrix = this._cachedLayoutTransform;
			if (layoutTransform)
			{
				matrix = layoutTransform.clone();
				matrix.translate(this._layoutTransformOffsetX, this._layoutTransformOffsetY);
			}
			else
			{
				matrix = new Matrix();
			}

			var matrix2:Matrix = matrix.clone();
			matrix2.translate(actualBounds.x, actualBounds.y);
			super.transform.matrix = matrix2;

			var visibility:String = this._visibility.value;
			var renderTransform:Matrix = this._renderTransform.value.clone();
			var renderTransformOrigin:Point = this._renderTransformOrigin.value;
			var renderTransformOriginMode:String = this._renderTransformOriginMode.value;

			renderTransform.scale(this._scaleX.value, this._scaleY.value);
			renderTransform.rotate(this._rotation.value * Math.PI / 180);
			renderTransform.translate(this._x.value, this._y.value);
			renderTransform.concat(renderMatrix);
			renderTransform = this.renderOverride(renderTransform);

			var originX:Number = renderTransformOrigin.x;
			var originY:Number = renderTransformOrigin.y;
			if (renderTransformOriginMode != RenderTransformOriginMode.ABSOLUTE)
			{
				originX *= actualBounds.width;
				originY *= actualBounds.height;
			}

			matrix.translate(-originX, -originY);
			matrix.concat(renderTransform);
			matrix.translate(originX + actualBounds.x, originY + actualBounds.y);

			var checksum:Number = matrix.a + matrix.b + matrix.c + matrix.d + matrix.tx + matrix.ty;
			if (checksum != checksum)
				throw new Error("NaN transform generated during render.");
			if ((checksum == Infinity) || (checksum == -Infinity))
				throw new Error("Infinite transform generated during render.");

			super.transform.matrix = matrix;
			super.visible = (visibility == Visibility.VISIBLE);
			this._renderMask();

			this._renderBounds = this._transformRectangle(new Rectangle(0, 0, this._untransformedActualWidth, this._untransformedActualHeight), matrix);

			this._renderMatrix = renderMatrix;

			this.setValid(LayoutSprite.RENDER);
		}

		public override function addChild(child:DisplayObject) : DisplayObject
		{
			var wasChild:Boolean = (child.parent == this);
			var result:DisplayObject = super.addChild(child);
			if (wasChild)
				this.onChildOrderChanged();
			return result;
		}

		public override function addChildAt(child:DisplayObject, index:int) : DisplayObject
		{
			if (index >= 0)
				index += this._clipMaskOffset;
			var wasChild:Boolean = (child.parent == this);
			var result:DisplayObject = super.addChildAt(child, index);
			if (wasChild)
				this.onChildOrderChanged();
			return result;
		}

		public override function getChildAt(index:int) : DisplayObject
		{
			if (index >= 0)
				index += this._clipMaskOffset;
			return super.getChildAt(index);
		}

		public override function getChildByName(name:String) : DisplayObject
		{
			var child:DisplayObject = super.getChildByName(name);
			if (child == this._clipMask)
				child = null;
			return child;
		}

		public override function getChildIndex(child:DisplayObject) : int
		{
			return super.getChildIndex(child) - this._clipMaskOffset;
		}

		public override function removeChildAt(index:int) : DisplayObject
		{
			if (index >= 0)
				index += this._clipMaskOffset;
			return super.removeChildAt(index);
		}

		public override function setChildIndex(child:DisplayObject, index:int) : void
		{
			if (index >= 0)
				index += this._clipMaskOffset;
			super.setChildIndex(child, index);
			this.onChildOrderChanged();
		}

		public override function swapChildren(child1:DisplayObject, child2:DisplayObject) : void
		{
			super.swapChildren(child1, child2);
			this.onChildOrderChanged();
		}

		public override function swapChildrenAt(index1:int, index2:int) : void
		{
			if (index1 >= 0)
				index1 += this._clipMaskOffset;
			if (index2 >= 0)
				index2 += this._clipMaskOffset;
			super.swapChildrenAt(index1, index2);
			this.onChildOrderChanged();
		}

		// Protected Methods

		protected function measureOverride(availableSize:Size) : Size
		{
			var bounds:Rectangle = this.getBounds(this);
			return new Size(Math.max(bounds.x + bounds.width, 0), Math.max(bounds.y + bounds.height, 0));
		}

		protected function layoutOverride(layoutSize:Size) : Size
		{
			return layoutSize;
		}

		protected function renderOverride(renderMatrix:Matrix) : Matrix
		{
			return renderMatrix;
		}

		protected function onChildAdded(child:DisplayObject) : void
		{
		}

		protected function onChildRemoved(child:DisplayObject) : void
		{
		}

		protected function onChildOrderChanged() : void
		{
		}

		protected function onChildInvalidated(child:DisplayObject, pass:ValidatePass) : void
		{
		}

		// Private Methods

		private function _renderMask() : void
		{
			var mask:DisplayObject = this._mask.value;
			if (mask)
			{
				if (this._clipMask)
				{
					super.removeChild(this._clipMask);
					this._clipMask = null;
					this._clipMaskOffset = 0;
				}
				super.mask = mask;
			}
			else if (this._clip.value)
			{
				if (!this._clipMask)
				{
					this._clipMask = new Shape();
					this._clipMask.visible = false;
					this._clipMaskOffset = 1;
					super.addChildAt(this._clipMask, 0);
				}

				var actualBounds:Rectangle = this._actualBounds;
				var clippedBounds:Rectangle = this._clippedBounds;

				var graphics:Graphics = this._clipMask.graphics;
				graphics.clear();
				graphics.beginFill(0x000000, 1);
				graphics.drawRect(0, 0, clippedBounds.width, clippedBounds.height);
				graphics.endFill();

				var maskMatrix:Matrix;
				var layoutTransform:Matrix = this._cachedLayoutTransform;
				if (layoutTransform)
				{
					maskMatrix = layoutTransform.clone();
					maskMatrix.translate(this._layoutTransformOffsetX + actualBounds.x - clippedBounds.x, this._layoutTransformOffsetY + actualBounds.y - clippedBounds.y);
					maskMatrix.invert();
				}
				else
				{
					maskMatrix = new Matrix();
					maskMatrix.translate(clippedBounds.x - actualBounds.x, clippedBounds.y - actualBounds.y);
				}
				this._clipMask.transform.matrix = maskMatrix;

				super.mask = this._clipMask;
			}
			else
			{
				if (this._clipMask)
				{
					super.removeChild(this._clipMask);
					this._clipMask = null;
					this._clipMaskOffset = 0;
				}
				super.mask = null;
			}
		}

		private function _transformRectangle(rectangle:Rectangle, matrix:Matrix) : Rectangle
		{
			var left:Number = rectangle.x;
			var top:Number = rectangle.y;
			var right:Number = left + rectangle.width;
			var bottom:Number = top + rectangle.height;

			var p1:Point = new Point(left, top);
			var p2:Point = new Point(right, top);
			var p3:Point = new Point(right, bottom);
			var p4:Point = new Point(left, bottom);

			p1 = matrix.transformPoint(p1);
			p2 = matrix.transformPoint(p2);
			p3 = matrix.transformPoint(p3);
			p4 = matrix.transformPoint(p4);

			left = Math.min(p1.x, p2.x, p3.x, p4.x);
			top = Math.min(p1.y, p2.y, p3.y, p4.y);
			right = Math.max(p1.x, p2.x, p3.x, p4.x);
			bottom = Math.max(p1.y, p2.y, p3.y, p4.y);

			return new Rectangle(left, top, right - left, bottom - top);
		}

		private function _untransformSize(transformedSize:Size, transformMatrix:Matrix) : Size
		{
			var transformedWidth:Number = transformedSize.width;
			var transformedHeight:Number = transformedSize.height;
			if ((transformedWidth == 0) && (transformedHeight == 0))
				return new Size(0, 0);

			var hasInfiniteWidth:Boolean = (transformedWidth == Infinity);
			var hasInfiniteHeight:Boolean = (transformedHeight == Infinity);
			if (hasInfiniteWidth && hasInfiniteHeight)
				return new Size(Infinity, Infinity);

			if (!MatrixUtil.hasInverse(transformMatrix))
				return new Size(0, 0);

			if (hasInfiniteWidth)
				transformedWidth = transformedHeight;
			else if (hasInfiniteHeight)
				transformedHeight = transformedWidth;

			var untransformedWidth:Number = 0;
			var untransformedHeight:Number = 0;

			var a:Number = transformMatrix.a;
			var b:Number = transformMatrix.b;
			var c:Number = transformMatrix.c;
			var d:Number = transformMatrix.d;

			var isZeroA:Boolean = NumberUtil.approxZero(a);
			var isZeroB:Boolean = NumberUtil.approxZero(b);
			var isZeroC:Boolean = NumberUtil.approxZero(c);
			var isZeroD:Boolean = NumberUtil.approxZero(d);

			var sizeA:Number;
			var sizeB:Number;
			var sizeC:Number;
			var sizeD:Number;

			if (isZeroB || isZeroC)
			{
				sizeA = hasInfiniteWidth ? Infinity : Math.abs(transformedWidth / a);
				sizeD = hasInfiniteHeight ? Infinity : Math.abs(transformedHeight / d);
				if (isZeroB)
				{
					if (isZeroC)
					{
						untransformedWidth = sizeA;
						untransformedHeight = sizeD;
					}
					else
					{
						untransformedHeight = Math.min(0.5 * Math.abs(transformedWidth / c), sizeD);
						untransformedWidth = sizeA - ((c * untransformedHeight) / a);
					}
				}
				else
				{
					untransformedWidth = Math.min(0.5 * Math.abs(transformedHeight / b), sizeA);
					untransformedHeight = sizeD - ((b * untransformedWidth) / d);
				}
			}
			else if (isZeroA || isZeroD)
			{
				sizeC = hasInfiniteWidth ? Infinity : Math.abs(transformedWidth / c);
				sizeB = hasInfiniteHeight ? Infinity : Math.abs(transformedHeight / b);
				if (isZeroA)
				{
					if (isZeroD)
					{
						untransformedWidth = sizeB;
						untransformedHeight = sizeC;
					}
					else
					{
						untransformedHeight = Math.min(0.5 * Math.abs(transformedHeight / d), sizeC);
						untransformedWidth = sizeB - ((d * untransformedHeight) / b);
					}
				}
				else
				{
					untransformedWidth = Math.min(0.5 * Math.abs(transformedWidth / a), sizeB);
					untransformedHeight = sizeC - ((a * untransformedWidth) / c);
				}
			}
			else
			{
				sizeA = Math.abs(transformedWidth / a);
				sizeB = Math.abs(transformedHeight / b);
				sizeC = Math.abs(transformedWidth / c);
				sizeD = Math.abs(transformedHeight / d);
				untransformedWidth = Math.min(sizeB, sizeA) * 0.5;
				untransformedHeight = Math.min(sizeC, sizeD) * 0.5;
				if (((sizeA >= sizeB) && (sizeC <= sizeD)) || ((sizeA <= sizeB) && (sizeC >= sizeD)))
				{
					var rect:Rectangle = this._transformRectangle(new Rectangle(0, 0, untransformedWidth, untransformedHeight), transformMatrix);
					var scale:Number = Math.min((transformedWidth / rect.width), (transformedHeight / rect.height));
					if ((scale == scale) && (scale != Infinity))
					{
						untransformedWidth *= scale;
						untransformedHeight *= scale;
					}
				}
			}

			if (untransformedWidth != untransformedWidth)
				untransformedWidth = 0;
			if (untransformedHeight != untransformedHeight)
				untransformedHeight = 0;

			return new Size(untransformedWidth, untransformedHeight);
		}

		private function _updateEnabled(e:Event = null) : void
		{
			if (this._disableObject.isEnabled)
			{
				super.mouseEnabled = this._mouseEnabled;
				super.mouseChildren = this._mouseChildren;
				super.tabEnabled = this._tabEnabled;
				super.tabChildren = this._tabChildren;
			}
			else
			{
				super.mouseEnabled = false;
				super.mouseChildren = false;
				super.tabEnabled = false;
				super.tabChildren = false;
			}
		}

		private function _visibility_changed(e:ChangedEvent) : void
		{
			var propertyChangedEvent:PropertyChangedEvent = e as PropertyChangedEvent;
			if (!propertyChangedEvent)
				return;

			var oldValue:String = propertyChangedEvent.oldValue;
			var newValue:String = propertyChangedEvent.newValue;

			if ((oldValue == Visibility.COLLAPSED) || (newValue == Visibility.COLLAPSED))
				this.invalidate(LayoutSprite.MEASURE);
			else
				this.invalidate(LayoutSprite.RENDER);

			if (oldValue == Visibility.VISIBLE)
				this.dispatchEvent(new PropertyChangedEvent(ChangedEvent.CHANGED, false, false, this, "visible", true, false));
			else if (newValue == Visibility.VISIBLE)
				this.dispatchEvent(new PropertyChangedEvent(ChangedEvent.CHANGED, false, false, this, "visible", false, true));
		}

		private function _self_added(e:Event) : void
		{
			var target:DisplayObject = e.target as DisplayObject;
			if (!target)
				return;

			if (target == this._clipMask)
			{
				e.stopImmediatePropagation();
				return;
			}

			if (target == this)
			{
				var parent:DisplayObjectContainer = this.parent;
				if (!parent)
					return;

				this._layoutParent = parent as LayoutSprite;
				this._stageParent = parent as Stage;

				this._useAvailableSize = null;
				this._useLayoutBounds = null;
				this._useRenderMatrix = null;

				if (this._stageParent)
					this._stageParent.addEventListener(Event.RESIZE, this._stage_resize, false, int.MAX_VALUE);

				super.visible = false;

				this.invalidate(LayoutSprite.MEASURE);
				return;
			}

			if (target.parent == this)
			{
				this.onChildAdded(target);
				return;
			}
		}

		private function _self_removed(e:Event) : void
		{
			var target:DisplayObject = e.target as DisplayObject;
			if (!target)
				return;

			if (target == this._clipMask)
			{
				e.stopImmediatePropagation();
				return;
			}

			if (target == this)
			{
				if (this._stageParent)
					this._stageParent.removeEventListener(Event.RESIZE, this._stage_resize);

				this._layoutParent = null;
				this._stageParent = null;

				this._useAvailableSize = null;
				this._useLayoutBounds = null;
				this._useRenderMatrix = null;

				this.invalidate(LayoutSprite.MEASURE);
				return;
			}

			if (target.parent == this)
			{
				this.onChildRemoved(target);
				return;
			}
		}

		private function _self_invalidated(e:ValidateEvent) : void
		{
			if (this._layoutParent)
				this._layoutParent.onChildInvalidated(this, e.pass);
		}

		private function _stage_resize(e:Event) : void
		{
			this.invalidate(LayoutSprite.MEASURE);
			ValidateQueue.validateAll();
		}

	}

}
