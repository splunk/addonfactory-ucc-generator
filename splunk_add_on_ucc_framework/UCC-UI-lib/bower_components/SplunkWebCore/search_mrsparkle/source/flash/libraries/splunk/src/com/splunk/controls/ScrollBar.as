package com.splunk.controls
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.ValidateEvent;
	import com.jasongatt.core.ValidatePass;
	import com.jasongatt.layout.IScrollable;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Orientation;
	import com.jasongatt.layout.Size;
	import com.jasongatt.utils.NumberUtil;
	import com.splunk.skins.ISkin;
	import com.splunk.skins.IStyleSkin;
	import com.splunk.skins.ScrollBarSkin;
	import com.splunk.utils.Style;
	import flash.display.DisplayObject;
	import flash.display.Graphics;
	import flash.display.Shape;
	import flash.display.Sprite;
	import flash.display.Stage;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.geom.Point;
	import flash.geom.Rectangle;

	public class ScrollBar extends AbstractControl
	{

		// Private Properties

		private var _target:ObservableProperty;
		private var _orientation:ObservableProperty;

		private var _cachedTarget:IScrollable;
		private var _cachedOrientation:String;
		private var _cachedSkin:ISkin;

		private var _thumbButton:Button;
		private var _arrowButton1:Button;
		private var _arrowButton2:Button;
		private var _trackButton1:Button;
		private var _trackButton2:Button;
		private var _trackButton3:DummyButton;
		private var _trackSprite1:Sprite;
		private var _trackSprite2:Sprite;
		private var _trackSprite3:Sprite;
		private var _trackMask1:Shape;
		private var _trackMask2:Shape;
		private var _trackMask3:Shape;

		private var _stage:Stage;
		private var _pressMouse:Point;
		private var _pressThumb:Point;

		// Constructor

		public function ScrollBar()
		{
			this._target = new ObservableProperty(this, "target", IScrollable, null, this.invalidates(LayoutSprite.LAYOUT));
			this._orientation = new ObservableProperty(this, "orientation", String, Orientation.Y, this.invalidates(AbstractControl.UPDATE_SKIN));

			this._trackButton3 = new DummyButton();
			this._trackButton3.addEventListener(ValidateEvent.INVALIDATED, this._descendant_invalidated, false, int.MAX_VALUE);

			this._trackButton2 = new Button();
			this._trackButton2.autoRepeat = true;
			this._trackButton2.addEventListener(ValidateEvent.INVALIDATED, this._descendant_invalidated, false, int.MAX_VALUE);
			this._trackButton2.addEventListener(AbstractButton.BUTTON_DOWN, this._trackButton2_buttonDown, false, int.MAX_VALUE);

			this._trackButton1 = new Button();
			this._trackButton1.autoRepeat = true;
			this._trackButton1.addEventListener(ValidateEvent.INVALIDATED, this._descendant_invalidated, false, int.MAX_VALUE);
			this._trackButton1.addEventListener(AbstractButton.BUTTON_DOWN, this._trackButton1_buttonDown, false, int.MAX_VALUE);

			this._trackMask3 = new Shape();

			this._trackMask2 = new Shape();

			this._trackMask1 = new Shape();

			this._trackSprite3 = new Sprite();
			this._trackSprite3.mask = this._trackMask3;
			this._trackSprite3.addChild(this._trackButton3);

			this._trackSprite2 = new Sprite();
			this._trackSprite2.mask = this._trackMask2;
			this._trackSprite2.addChild(this._trackButton2);

			this._trackSprite1 = new Sprite();
			this._trackSprite1.mask = this._trackMask1;
			this._trackSprite1.addChild(this._trackButton1);

			this._arrowButton2 = new Button();
			this._arrowButton2.autoRepeat = true;
			this._arrowButton2.addEventListener(AbstractButton.BUTTON_DOWN, this._arrowButton2_buttonDown, false, int.MAX_VALUE);

			this._arrowButton1 = new Button();
			this._arrowButton1.autoRepeat = true;
			this._arrowButton1.addEventListener(AbstractButton.BUTTON_DOWN, this._arrowButton1_buttonDown, false, int.MAX_VALUE);

			this._thumbButton = new Button();
			this._thumbButton.minimumWidth = 10;
			this._thumbButton.minimumHeight = 10;
			this._thumbButton.stickyHighlighting = true;
			this._thumbButton.addEventListener(MouseEvent.MOUSE_DOWN, this._thumbButton_mouseDown, false, int.MAX_VALUE);

			this.skin = new ScrollBarSkin();

			this.addChild(this._trackMask3);
			this.addChild(this._trackMask2);
			this.addChild(this._trackMask1);
			this.addChild(this._trackSprite3);
			this.addChild(this._trackSprite2);
			this.addChild(this._trackSprite1);
			this.addChild(this._arrowButton2);
			this.addChild(this._arrowButton1);
			this.addChild(this._thumbButton);
		}

		// Public Getters/Setters

		public function get target() : IScrollable
		{
			return this._target.value;
		}
		public function set target(value:IScrollable) : void
		{
			this._target.value = value;
		}

		public function get orientation() : String
		{
			return this._orientation.value;
		}
		public function set orientation(value:String) : void
		{
			this._orientation.value = value;
		}

		// Protected Methods

		protected override function updateSkinOverride(skin:ISkin) : void
		{
			var orientation:String = this._orientation.value;

			if (!skin)
			{
				this._thumbButton.skin = null;
				this._arrowButton1.skin = null;
				this._arrowButton2.skin = null;
				this._trackButton1.skin = null;
				this._trackButton2.skin = null;
				this._trackButton3.skin = null;
			}
			else if (orientation == Orientation.X)
			{
				this._thumbButton.skin = skin.getChildSkin("thumbHorizontal");
				this._arrowButton1.skin = skin.getChildSkin("arrowLeft");
				this._arrowButton2.skin = skin.getChildSkin("arrowRight");
				this._trackButton1.skin = this._trackButton2.skin = this._trackButton3.skin = skin.getChildSkin("trackHorizontal");
			}
			else
			{
				this._thumbButton.skin = skin.getChildSkin("thumbVertical");
				this._arrowButton1.skin = skin.getChildSkin("arrowUp");
				this._arrowButton2.skin = skin.getChildSkin("arrowDown");
				this._trackButton1.skin = this._trackButton2.skin = this._trackButton3.skin = skin.getChildSkin("trackVertical");
			}

			this._thumbButton.updateSkin();
			this._arrowButton1.updateSkin();
			this._arrowButton2.updateSkin();
			this._trackButton1.updateSkin();
			this._trackButton2.updateSkin();
			this._trackButton3.updateSkin();

			this._cachedOrientation = orientation;
			this._cachedSkin = skin;
		}

		protected override function updateStateOverride(state:String) : void
		{
			var style:Style;
			var styleSkin:IStyleSkin = this._cachedSkin as IStyleSkin;
			if (styleSkin)
				style = styleSkin.getStyle(state);
			Style.applyStyle(this, style);
		}

		protected override function measureOverride(availableSize:Size) : Size
		{
			var availableWidth:Number = Math.floor(availableSize.width);
			var availableHeight:Number = Math.floor(availableSize.height);

			var measuredSize:Size = new Size();

			var childSize:Size = new Size(availableWidth, availableHeight);
			if (this._cachedOrientation == Orientation.X)
			{
				this._trackButton3.measure(childSize);
				this._trackButton2.measure(childSize);
				this._trackButton1.measure(childSize);

				childSize.width = Math.round(availableWidth / 2);
				this._arrowButton2.measure(childSize);

				childSize.width = Math.round(availableWidth - this._arrowButton2.measuredWidth);
				this._arrowButton1.measure(childSize);

				childSize.width = 0;
				this._thumbButton.measure(childSize);

				measuredSize.width = Math.round(Math.max(this._arrowButton1.measuredWidth + this._arrowButton2.measuredWidth, this._trackButton1.measuredWidth, this._trackButton2.measuredWidth, this._trackButton3.measuredWidth));
				measuredSize.height = Math.round(Math.max(this._thumbButton.measuredHeight, this._arrowButton1.measuredHeight, this._arrowButton2.measuredHeight, this._trackButton1.measuredHeight, this._trackButton2.measuredHeight, this._trackButton3.measuredHeight));
			}
			else
			{
				this._trackButton3.measure(childSize);
				this._trackButton2.measure(childSize);
				this._trackButton1.measure(childSize);

				childSize.height = Math.round(availableHeight / 2);
				this._arrowButton2.measure(childSize);

				childSize.height = Math.round(availableHeight - this._arrowButton2.measuredHeight);
				this._arrowButton1.measure(childSize);

				childSize.height = 0;
				this._thumbButton.measure(childSize);

				measuredSize.width = Math.round(Math.max(this._thumbButton.measuredWidth, this._arrowButton1.measuredWidth, this._arrowButton2.measuredWidth, this._trackButton1.measuredWidth, this._trackButton2.measuredWidth, this._trackButton3.measuredWidth));
				measuredSize.height = Math.round(Math.max(this._arrowButton1.measuredHeight + this._arrowButton2.measuredHeight, this._trackButton1.measuredHeight, this._trackButton2.measuredHeight, this._trackButton3.measuredHeight));
			}

			return measuredSize;
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			var layoutWidth:Number = Math.round(layoutSize.width);
			var layoutHeight:Number = Math.round(layoutSize.height);

			var thumbScale:Number = 1;
			var thumbPosition:Number = 0;
			var target:IScrollable = this._target.value;
			if (target)
			{
				var scrollPosition:Number = target.scrollPosition;
				var scrollSize:Number = target.scrollSize;
				var contentSize:Number = target.contentSize;
				if (contentSize > 0)
					thumbScale = NumberUtil.minMax(1 - scrollSize / contentSize, 0, 1);
				if (scrollSize > 0)
					thumbPosition = NumberUtil.minMax(scrollPosition / scrollSize, 0, 1);
			}

			var trackMaskGraphics1:Graphics = this._trackMask1.graphics;
			var trackMaskGraphics2:Graphics = this._trackMask2.graphics;
			var trackMaskGraphics3:Graphics = this._trackMask3.graphics;

			trackMaskGraphics1.clear();
			trackMaskGraphics2.clear();
			trackMaskGraphics3.clear();

			if (this._cachedOrientation == Orientation.X)
			{
				var trackX1:Number = Math.round(this._arrowButton1.measuredWidth);
				var trackX4:Number = Math.round(layoutWidth - this._arrowButton2.measuredWidth);
				var sizeX1:Number = trackX4 - trackX1;
				var sizeX2:Number = Math.round(Math.max(sizeX1 * thumbScale, this._thumbButton.measuredWidth));
				var trackX2:Number = Math.round(trackX1 + (sizeX1 - sizeX2) * thumbPosition);
				var trackX3:Number = trackX2 + sizeX2;

				this._trackButton3.layout(new Rectangle(0, 0, layoutWidth, layoutHeight));
				this._trackButton2.layout(new Rectangle(0, 0, layoutWidth, layoutHeight));
				this._trackButton1.layout(new Rectangle(0, 0, layoutWidth, layoutHeight));
				this._arrowButton2.layout(new Rectangle(trackX4, 0, Math.round(this._arrowButton2.measuredWidth), layoutHeight));
				this._arrowButton1.layout(new Rectangle(0, 0, Math.round(this._arrowButton1.measuredWidth), layoutHeight));
				this._thumbButton.layout(new Rectangle(trackX2, 0, trackX3 - trackX2, layoutHeight));
				this._thumbButton.visible = (sizeX1 >= sizeX2);

				trackMaskGraphics1.beginFill(0x000000);
				trackMaskGraphics1.drawRect(trackX1, 0, trackX2 - trackX1, layoutHeight);
				trackMaskGraphics1.endFill();

				trackMaskGraphics2.beginFill(0x000000);
				trackMaskGraphics2.drawRect(trackX3, 0, trackX4 - trackX3, layoutHeight);
				trackMaskGraphics2.endFill();

				trackMaskGraphics3.beginFill(0x000000);
				trackMaskGraphics3.drawRect(0, 0, trackX1, layoutHeight);
				trackMaskGraphics3.endFill();
				trackMaskGraphics3.beginFill(0x000000);
				trackMaskGraphics3.drawRect(trackX2, 0, trackX3 - trackX2, layoutHeight);
				trackMaskGraphics3.endFill();
				trackMaskGraphics3.beginFill(0x000000);
				trackMaskGraphics3.drawRect(trackX4, 0, layoutWidth - trackX4, layoutHeight);
				trackMaskGraphics3.endFill();
			}
			else
			{
				var trackY1:Number = Math.round(this._arrowButton1.measuredHeight);
				var trackY4:Number = Math.round(layoutHeight - this._arrowButton2.measuredHeight);
				var sizeY1:Number = trackY4 - trackY1;
				var sizeY2:Number = Math.round(Math.max(sizeY1 * thumbScale, this._thumbButton.measuredHeight));
				var trackY2:Number = Math.round(trackY1 + (sizeY1 - sizeY2) * thumbPosition);
				var trackY3:Number = trackY2 + sizeY2;

				this._trackButton3.layout(new Rectangle(0, 0, layoutWidth, layoutHeight));
				this._trackButton2.layout(new Rectangle(0, 0, layoutWidth, layoutHeight));
				this._trackButton1.layout(new Rectangle(0, 0, layoutWidth, layoutHeight));
				this._arrowButton2.layout(new Rectangle(0, trackY4, layoutWidth, Math.round(this._arrowButton2.measuredHeight)));
				this._arrowButton1.layout(new Rectangle(0, 0, layoutWidth, Math.round(this._arrowButton1.measuredHeight)));
				this._thumbButton.layout(new Rectangle(0, trackY2, layoutWidth, trackY3 - trackY2));
				this._thumbButton.visible = (sizeY1 >= sizeY2);

				trackMaskGraphics1.beginFill(0x000000);
				trackMaskGraphics1.drawRect(0, trackY1, layoutWidth, trackY2 - trackY1);
				trackMaskGraphics1.endFill();

				trackMaskGraphics2.beginFill(0x000000);
				trackMaskGraphics2.drawRect(0, trackY3, layoutWidth, trackY4 - trackY3);
				trackMaskGraphics2.endFill();

				trackMaskGraphics3.beginFill(0x000000);
				trackMaskGraphics3.drawRect(0, 0, layoutWidth, trackY1);
				trackMaskGraphics3.endFill();
				trackMaskGraphics3.beginFill(0x000000);
				trackMaskGraphics3.drawRect(0, trackY2, layoutWidth, trackY3 - trackY2);
				trackMaskGraphics3.endFill();
				trackMaskGraphics3.beginFill(0x000000);
				trackMaskGraphics3.drawRect(0, trackY4, layoutWidth, layoutHeight - trackY4);
				trackMaskGraphics3.endFill();
			}

			this._cachedTarget = target;

			return layoutSize;
		}

		protected override function onChildInvalidated(child:DisplayObject, pass:ValidatePass) : void
		{
			switch (pass)
			{
				case LayoutSprite.MEASURE:
					this.invalidate(LayoutSprite.MEASURE);
					break;
			}
		}

		// Private Methods

		private function _normalizeScroll() : void
		{
			var target:IScrollable = this._target.value;
			if (!target)
				return;

			target.scrollPosition = NumberUtil.minMax(target.scrollPosition, 0, target.scrollSize);
		}

		private function _descendant_invalidated(e:ValidateEvent) : void
		{
			switch (e.pass)
			{
				case LayoutSprite.MEASURE:
					this.invalidate(LayoutSprite.MEASURE);
					break;
			}
		}

		private function _thumbButton_mouseDown(e:MouseEvent) : void
		{
			var stage:Stage = this.stage;
			if (!stage)
				return;

			this._stage = stage;

			var thumbBounds:Rectangle = this._thumbButton.layoutBounds;

			this._pressMouse = this.globalToLocal(new Point(e.stageX, e.stageY));
			this._pressThumb = new Point(thumbBounds.x, thumbBounds.y);

			stage.addEventListener(MouseEvent.MOUSE_MOVE, this._stage_mouseMove, false, int.MAX_VALUE);
			stage.addEventListener(MouseEvent.MOUSE_UP, this._stage_mouseUp, false, int.MAX_VALUE);
		}

		private function _arrowButton1_buttonDown(e:Event) : void
		{
			var target:IScrollable = this._cachedTarget;
			if (!target)
				return;

			target.scrollPosition += target.getLineSize(-1);

			this._normalizeScroll();
		}

		private function _arrowButton2_buttonDown(e:Event) : void
		{
			var target:IScrollable = this._cachedTarget;
			if (!target)
				return;

			target.scrollPosition += target.getLineSize(1);

			this._normalizeScroll();
		}

		private function _trackButton1_buttonDown(e:Event) : void
		{
			var target:IScrollable = this._cachedTarget;
			if (!target)
				return;

			target.scrollPosition += target.getPageSize(-1);

			this._normalizeScroll();
		}

		private function _trackButton2_buttonDown(e:Event) : void
		{
			var target:IScrollable = this._cachedTarget;
			if (!target)
				return;

			target.scrollPosition += target.getPageSize(1);

			this._normalizeScroll();
		}

		private function _stage_mouseMove(e:MouseEvent) : void
		{
			var target:IScrollable = this._cachedTarget;
			if (!target)
				return;

			if (this._thumbButton.state != "down")
				return;

			var thumbBounds:Rectangle = this._thumbButton.layoutBounds;
			var arrow1Bounds:Rectangle = this._arrowButton1.layoutBounds;
			var arrow2Bounds:Rectangle = this._arrowButton2.layoutBounds;

			var currentMouse:Point = this.globalToLocal(new Point(e.stageX, e.stageY));
			var currentThumb:Point = new Point(this._pressThumb.x + (currentMouse.x - this._pressMouse.x), this._pressThumb.y + (currentMouse.y - this._pressMouse.y));

			if (this._cachedOrientation == Orientation.X)
			{
				var minX:Number = arrow1Bounds.x + arrow1Bounds.width;
				var maxX:Number = arrow2Bounds.x - thumbBounds.width;
				var sizeX:Number = maxX - minX;
				var positionX:Number;
				if (sizeX > 0)
					positionX = NumberUtil.minMax((currentThumb.x - minX) / sizeX, 0, 1);
				else if (currentThumb.x > maxX)
					positionX = 1;
				else
					positionX = 0;
				target.scrollPosition = target.scrollSize * positionX;
			}
			else
			{
				var minY:Number = arrow1Bounds.y + arrow1Bounds.height;
				var maxY:Number = arrow2Bounds.y - thumbBounds.height;
				var sizeY:Number = maxY - minY;
				var positionY:Number;
				if (sizeY > 0)
					positionY = NumberUtil.minMax((currentThumb.y - minY) / sizeY, 0, 1);
				else if (currentThumb.y > maxY)
					positionY = 1;
				else
					positionY = 0;
				target.scrollPosition = target.scrollSize * positionY;
			}
		}

		private function _stage_mouseUp(e:MouseEvent) : void
		{
			var stage:Stage = this._stage;
			if (!stage)
				return;

			this._stage = null;

			stage.removeEventListener(MouseEvent.MOUSE_MOVE, this._stage_mouseMove);
			stage.removeEventListener(MouseEvent.MOUSE_UP, this._stage_mouseUp);
		}

	}

}

import com.splunk.controls.Button;

class DummyButton extends Button
{

	// Constructor

	public function DummyButton()
	{
		super.mouseEnabled = false;
		super.mouseChildren = false;
		super.tabEnabled = false;
		super.tabChildren = false;
	}

	// Public Getters/Setters

	public override function set mouseEnabled(value:Boolean) : void
	{
		// READ-ONLY
	}

	public override function set mouseChildren(value:Boolean) : void
	{
		// READ-ONLY
	}

	public override function set tabEnabled(value:Boolean) : void
	{
		// READ-ONLY
	}

	public override function set tabChildren(value:Boolean) : void
	{
		// READ-ONLY
	}

}
