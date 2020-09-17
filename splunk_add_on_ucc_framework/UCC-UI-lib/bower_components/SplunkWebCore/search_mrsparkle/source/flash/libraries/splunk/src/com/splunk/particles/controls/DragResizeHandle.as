package com.splunk.particles.controls
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.ValidateEvent;
	import com.jasongatt.core.ValidatePass;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Size;
	import com.jasongatt.utils.NumberUtil;
	import com.jasongatt.utils.PointUtil;
	import com.splunk.controls.Cursors;
	import com.splunk.properties.PropertyManager;
	import flash.display.DisplayObjectContainer;
	import flash.display.Graphics;
	import flash.display.Sprite;
	import flash.display.Stage;
	import flash.events.MouseEvent;
	import flash.geom.Matrix;
	import flash.geom.Point;

	public class DragResizeHandle extends LayoutSprite
	{

		// Public Static Constants

		public static const RENDER_HANDLE:ValidatePass = new ValidatePass(DragResizeHandle, "renderHandle", 3.1);

		// Private Properties

		private var _target:LayoutSprite;
		private var _color:ObservableProperty;

		private var _propertyManager:PropertyManager;

		private var _dragHandle:Handle;
		private var _resizeHandleN:Handle;
		private var _resizeHandleNE:Handle;
		private var _resizeHandleE:Handle;
		private var _resizeHandleSE:Handle;
		private var _resizeHandleS:Handle;
		private var _resizeHandleSW:Handle;
		private var _resizeHandleW:Handle;
		private var _resizeHandleNW:Handle;

		private var _stage:Stage;
		private var _activeHandle:Handle;
		private var _mousePosition:Point;
		private var _targetBoundsTL:Point;
		private var _targetBoundsBR:Point;

		// Constructor

		public function DragResizeHandle(propertyManager:PropertyManager = null)
		{
			this._color = new ObservableProperty(this, "color", uint, 0x000000, this.invalidates(DragResizeHandle.RENDER_HANDLE));

			this._propertyManager = propertyManager;

			this._dragHandle = new Handle(Cursors.MOVE);
			this._dragHandle.visible = false;

			this._resizeHandleN = new Handle(Cursors.RESIZE_N);
			this._resizeHandleN.visible = false;

			this._resizeHandleNE = new Handle(Cursors.RESIZE_NE);
			this._resizeHandleNE.visible = false;

			this._resizeHandleE = new Handle(Cursors.RESIZE_E);
			this._resizeHandleE.visible = false;

			this._resizeHandleSE = new Handle(Cursors.RESIZE_SE);
			this._resizeHandleSE.visible = false;

			this._resizeHandleS = new Handle(Cursors.RESIZE_S);
			this._resizeHandleS.visible = false;

			this._resizeHandleSW = new Handle(Cursors.RESIZE_SW);
			this._resizeHandleSW.visible = false;

			this._resizeHandleW = new Handle(Cursors.RESIZE_W);
			this._resizeHandleW.visible = false;

			this._resizeHandleNW = new Handle(Cursors.RESIZE_NW);
			this._resizeHandleNW.visible = false;

			this.addChild(this._dragHandle);
			this.addChild(this._resizeHandleS);
			this.addChild(this._resizeHandleSW);
			this.addChild(this._resizeHandleW);
			this.addChild(this._resizeHandleNW);
			this.addChild(this._resizeHandleN);
			this.addChild(this._resizeHandleNE);
			this.addChild(this._resizeHandleE);
			this.addChild(this._resizeHandleSE);

			this.addEventListener(MouseEvent.MOUSE_DOWN, this._self_mouseDown, false, int.MAX_VALUE);
		}

		// Public Getters/Setters

		public function get target() : LayoutSprite
		{
			return this._target;
		}
		public function set target(value:LayoutSprite) : void
		{
			if (this._target == value)
				return;

			if (this._target)
				this._target.removeEventListener(ValidateEvent.INVALIDATED, this._target_invalidated);

			this._target = value;

			if (this._target)
				this._target.addEventListener(ValidateEvent.INVALIDATED, this._target_invalidated);

			this.invalidate(DragResizeHandle.RENDER_HANDLE);
		}

		public function get color() : uint
		{
			return this._color.value;
		}
		public function set color(value:uint) : void
		{
			this._color.value = value;
		}

		// Public Methods

		public function renderHandle() : void
		{
			this.validatePreceding(DragResizeHandle.RENDER_HANDLE);

			if (this.isValid(DragResizeHandle.RENDER_HANDLE))
				return;

			this._dragHandle.visible = false;
			this._resizeHandleN.visible = false;
			this._resizeHandleNE.visible = false;
			this._resizeHandleE.visible = false;
			this._resizeHandleSE.visible = false;
			this._resizeHandleS.visible = false;
			this._resizeHandleSW.visible = false;
			this._resizeHandleW.visible = false;
			this._resizeHandleNW.visible = false;

			var target:LayoutSprite = this._target;
			if (target)
			{
				var width:Number = NumberUtil.maxMin(target.width, target.maximumWidth, target.minimumWidth);
				var height:Number = NumberUtil.maxMin(target.height, target.maximumHeight, target.minimumHeight);
				if ((width == width) && (height == height))
				{
					var color:uint = this._color.value;

					var p1:Point = this.globalToLocal(target.localToGlobal(new Point(0, 0)));
					var p2:Point = this.globalToLocal(target.localToGlobal(new Point(width, 0)));
					var p3:Point = this.globalToLocal(target.localToGlobal(new Point(width, height)));
					var p4:Point = this.globalToLocal(target.localToGlobal(new Point(0, height)));

					var left:Number = Math.round(Math.min(p1.x, p2.x, p3.x, p4.x));
					var right:Number = Math.round(Math.max(p1.x, p2.x, p3.x, p4.x));
					var top:Number = Math.round(Math.min(p1.y, p2.y, p3.y, p4.y));
					var bottom:Number = Math.round(Math.max(p1.y, p2.y, p3.y, p4.y));

					var graphics:Graphics;

					graphics = this._dragHandle.graphics;
					graphics.clear();
					graphics.lineStyle(1, color, 1);
					graphics.beginFill(0x000000, 0);
					graphics.drawRect(0, 0, right - left, bottom - top);
					graphics.endFill();

					this._dragHandle.x = left;
					this._dragHandle.y = top;
					this._dragHandle.visible = true;

					graphics = this._resizeHandleN.graphics;
					graphics.clear();
					graphics.beginFill(0x000000, 0);
					graphics.drawRect(-5, -5, 10, 10);
					graphics.endFill();
					graphics.beginFill(color, 1);
					graphics.drawRect(-2, -2, 5, 5);
					graphics.endFill();

					this._resizeHandleN.x = Math.round((left + right) / 2);
					this._resizeHandleN.y = top;
					this._resizeHandleN.visible = true;

					graphics = this._resizeHandleNE.graphics;
					graphics.clear();
					graphics.beginFill(0x000000, 0);
					graphics.drawRect(-5, -5, 10, 10);
					graphics.endFill();
					graphics.beginFill(color, 1);
					graphics.drawRect(-2, -2, 5, 5);
					graphics.endFill();

					this._resizeHandleNE.x = right;
					this._resizeHandleNE.y = top;
					this._resizeHandleNE.visible = true;

					graphics = this._resizeHandleE.graphics;
					graphics.clear();
					graphics.beginFill(0x000000, 0);
					graphics.drawRect(-5, -5, 10, 10);
					graphics.endFill();
					graphics.beginFill(color, 1);
					graphics.drawRect(-2, -2, 5, 5);
					graphics.endFill();

					this._resizeHandleE.x = right;
					this._resizeHandleE.y = Math.round((top + bottom) / 2);
					this._resizeHandleE.visible = true;

					graphics = this._resizeHandleSE.graphics;
					graphics.clear();
					graphics.beginFill(0x000000, 0);
					graphics.drawRect(-5, -5, 10, 10);
					graphics.endFill();
					graphics.beginFill(color, 1);
					graphics.drawRect(-2, -2, 5, 5);
					graphics.endFill();

					this._resizeHandleSE.x = right;
					this._resizeHandleSE.y = bottom;
					this._resizeHandleSE.visible = true;

					graphics = this._resizeHandleS.graphics;
					graphics.clear();
					graphics.beginFill(0x000000, 0);
					graphics.drawRect(-5, -5, 10, 10);
					graphics.endFill();
					graphics.beginFill(color, 1);
					graphics.drawRect(-2, -2, 5, 5);
					graphics.endFill();

					this._resizeHandleS.x = Math.round((left + right) / 2);
					this._resizeHandleS.y = bottom;
					this._resizeHandleS.visible = true;

					graphics = this._resizeHandleSW.graphics;
					graphics.clear();
					graphics.beginFill(0x000000, 0);
					graphics.drawRect(-5, -5, 10, 10);
					graphics.endFill();
					graphics.beginFill(color, 1);
					graphics.drawRect(-2, -2, 5, 5);
					graphics.endFill();

					this._resizeHandleSW.x = left;
					this._resizeHandleSW.y = bottom;
					this._resizeHandleSW.visible = true;

					graphics = this._resizeHandleW.graphics;
					graphics.clear();
					graphics.beginFill(0x000000, 0);
					graphics.drawRect(-5, -5, 10, 10);
					graphics.endFill();
					graphics.beginFill(color, 1);
					graphics.drawRect(-2, -2, 5, 5);
					graphics.endFill();

					this._resizeHandleW.x = left;
					this._resizeHandleW.y = Math.round((top + bottom) / 2);
					this._resizeHandleW.visible = true;

					graphics = this._resizeHandleNW.graphics;
					graphics.clear();
					graphics.beginFill(0x000000, 0);
					graphics.drawRect(-5, -5, 10, 10);
					graphics.endFill();
					graphics.beginFill(color, 1);
					graphics.drawRect(-2, -2, 5, 5);
					graphics.endFill();

					this._resizeHandleNW.x = left;
					this._resizeHandleNW.y = top;
					this._resizeHandleNW.visible = true;
				}
			}

			this.setValid(DragResizeHandle.RENDER_HANDLE);
		}

		// Protected Methods

		protected override function measureOverride(availableSize:Size) : Size
		{
			return new Size();
		}

		protected override function renderOverride(renderMatrix:Matrix) : Matrix
		{
			this.invalidate(DragResizeHandle.RENDER_HANDLE);

			return renderMatrix;
		}

		// Private Methods

		private function _updatePropertyManager() : void
		{
			var target:LayoutSprite = this._target;
			if (!target)
				return;

			var propertyManager:PropertyManager = this._propertyManager;
			if (!propertyManager || propertyManager.isParsing)
				return;

			var path:String = propertyManager.getPropertyPath(target);
			if (!path)
				return;

			propertyManager.setValue(path + ".x", String(target.x));
			propertyManager.setValue(path + ".y", String(target.y));
			propertyManager.setValue(path + ".width", String(target.width));
			propertyManager.setValue(path + ".height", String(target.height));
		}

		private function _self_mouseDown(e:MouseEvent) : void
		{
			var stage:Stage = this.stage;
			var activeHandle:Handle = e.target as Handle;
			var target:LayoutSprite = this._target;
			var targetParent:DisplayObjectContainer = target ? target.parent : null;
			if (!stage || !activeHandle || !targetParent)
				return;

			var width:Number = NumberUtil.maxMin(target.width, target.maximumWidth, target.minimumWidth);
			var height:Number = NumberUtil.maxMin(target.height, target.maximumHeight, target.minimumHeight);

			this._stage = stage;
			this._activeHandle = activeHandle;
			this._mousePosition = new Point(e.stageX, e.stageY);
			this._targetBoundsTL = targetParent.localToGlobal(new Point(target.x, target.y));
			this._targetBoundsBR = targetParent.localToGlobal(new Point(target.x + width, target.y + height));

			stage.addEventListener(MouseEvent.MOUSE_MOVE, this._stage_mouseMove, false, int.MAX_VALUE);
			stage.addEventListener(MouseEvent.MOUSE_UP, this._stage_mouseUp, false, int.MAX_VALUE);
		}

		private function _stage_mouseMove(e:MouseEvent) : void
		{
			var target:LayoutSprite = this._target;
			var targetParent:DisplayObjectContainer = target ? target.parent : null;
			if (!targetParent)
				return;

			var dx:Number = e.stageX - this._mousePosition.x;
			var dy:Number = e.stageY - this._mousePosition.y;
			var minimumWidth:Number = Math.round(Math.max(target.minimumWidth, 20));
			var minimumHeight:Number = Math.round(Math.max(target.minimumHeight, 20));
			var maximumWidth:Number = Math.round(Math.max(target.maximumWidth, minimumWidth));
			var maximumHeight:Number = Math.round(Math.max(target.maximumHeight, minimumHeight));

			var targetBoundsTL:Point = this._targetBoundsTL;
			var targetBoundsBR:Point = this._targetBoundsBR;

			switch (this._activeHandle)
			{
				case this._dragHandle:
					targetBoundsTL = PointUtil.round(targetParent.globalToLocal(new Point(targetBoundsTL.x + dx, targetBoundsTL.y + dy)));
					targetBoundsBR = PointUtil.round(targetParent.globalToLocal(new Point(targetBoundsBR.x + dx, targetBoundsBR.y + dy)));
					break;
				case this._resizeHandleN:
					targetBoundsTL = PointUtil.round(targetParent.globalToLocal(new Point(targetBoundsTL.x, targetBoundsTL.y + dy)));
					targetBoundsBR = PointUtil.round(targetParent.globalToLocal(new Point(targetBoundsBR.x, targetBoundsBR.y)));
					targetBoundsTL.x = NumberUtil.minMax(targetBoundsTL.x, targetBoundsBR.x - maximumWidth, targetBoundsBR.x - minimumWidth);
					targetBoundsTL.y = NumberUtil.minMax(targetBoundsTL.y, targetBoundsBR.y - maximumHeight, targetBoundsBR.y - minimumHeight);
					break;
				case this._resizeHandleNE:
					targetBoundsTL = PointUtil.round(targetParent.globalToLocal(new Point(targetBoundsTL.x, targetBoundsTL.y + dy)));
					targetBoundsBR = PointUtil.round(targetParent.globalToLocal(new Point(targetBoundsBR.x + dx, targetBoundsBR.y)));
					targetBoundsBR.x = NumberUtil.maxMin(targetBoundsBR.x, targetBoundsTL.x + maximumWidth, targetBoundsTL.x + minimumWidth);
					targetBoundsTL.y = NumberUtil.minMax(targetBoundsTL.y, targetBoundsBR.y - maximumHeight, targetBoundsBR.y - minimumHeight);
					break;
				case this._resizeHandleE:
					targetBoundsTL = PointUtil.round(targetParent.globalToLocal(new Point(targetBoundsTL.x, targetBoundsTL.y)));
					targetBoundsBR = PointUtil.round(targetParent.globalToLocal(new Point(targetBoundsBR.x + dx, targetBoundsBR.y)));
					targetBoundsBR.x = NumberUtil.maxMin(targetBoundsBR.x, targetBoundsTL.x + maximumWidth, targetBoundsTL.x + minimumWidth);
					targetBoundsBR.y = NumberUtil.maxMin(targetBoundsBR.y, targetBoundsTL.y + maximumHeight, targetBoundsTL.y + minimumHeight);
					break;
				case this._resizeHandleSE:
					targetBoundsTL = PointUtil.round(targetParent.globalToLocal(new Point(targetBoundsTL.x, targetBoundsTL.y)));
					targetBoundsBR = PointUtil.round(targetParent.globalToLocal(new Point(targetBoundsBR.x + dx, targetBoundsBR.y + dy)));
					targetBoundsBR.x = NumberUtil.maxMin(targetBoundsBR.x, targetBoundsTL.x + maximumWidth, targetBoundsTL.x + minimumWidth);
					targetBoundsBR.y = NumberUtil.maxMin(targetBoundsBR.y, targetBoundsTL.y + maximumHeight, targetBoundsTL.y + minimumHeight);
					break;
				case this._resizeHandleS:
					targetBoundsTL = PointUtil.round(targetParent.globalToLocal(new Point(targetBoundsTL.x, targetBoundsTL.y)));
					targetBoundsBR = PointUtil.round(targetParent.globalToLocal(new Point(targetBoundsBR.x, targetBoundsBR.y + dy)));
					targetBoundsBR.x = NumberUtil.maxMin(targetBoundsBR.x, targetBoundsTL.x + maximumWidth, targetBoundsTL.x + minimumWidth);
					targetBoundsBR.y = NumberUtil.maxMin(targetBoundsBR.y, targetBoundsTL.y + maximumHeight, targetBoundsTL.y + minimumHeight);
					break;
				case this._resizeHandleSW:
					targetBoundsTL = PointUtil.round(targetParent.globalToLocal(new Point(targetBoundsTL.x + dx, targetBoundsTL.y)));
					targetBoundsBR = PointUtil.round(targetParent.globalToLocal(new Point(targetBoundsBR.x, targetBoundsBR.y + dy)));
					targetBoundsTL.x = NumberUtil.minMax(targetBoundsTL.x, targetBoundsBR.x - maximumWidth, targetBoundsBR.x - minimumWidth);
					targetBoundsBR.y = NumberUtil.maxMin(targetBoundsBR.y, targetBoundsTL.y + maximumHeight, targetBoundsTL.y + minimumHeight);
					break;
				case this._resizeHandleW:
					targetBoundsTL = PointUtil.round(targetParent.globalToLocal(new Point(targetBoundsTL.x + dx, targetBoundsTL.y)));
					targetBoundsBR = PointUtil.round(targetParent.globalToLocal(new Point(targetBoundsBR.x, targetBoundsBR.y)));
					targetBoundsTL.x = NumberUtil.minMax(targetBoundsTL.x, targetBoundsBR.x - maximumWidth, targetBoundsBR.x - minimumWidth);
					targetBoundsTL.y = NumberUtil.minMax(targetBoundsTL.y, targetBoundsBR.y - maximumHeight, targetBoundsBR.y - minimumHeight);
					break;
				case this._resizeHandleNW:
					targetBoundsTL = PointUtil.round(targetParent.globalToLocal(new Point(targetBoundsTL.x + dx, targetBoundsTL.y + dy)));
					targetBoundsBR = PointUtil.round(targetParent.globalToLocal(new Point(targetBoundsBR.x, targetBoundsBR.y)));
					targetBoundsTL.x = NumberUtil.minMax(targetBoundsTL.x, targetBoundsBR.x - maximumWidth, targetBoundsBR.x - minimumWidth);
					targetBoundsTL.y = NumberUtil.minMax(targetBoundsTL.y, targetBoundsBR.y - maximumHeight, targetBoundsBR.y - minimumHeight);
					break;
				default:
					return;
			}

			if (PointUtil.hasNaN(targetBoundsTL) || PointUtil.hasNaN(targetBoundsBR) || PointUtil.hasInfinity(targetBoundsTL) || PointUtil.hasInfinity(targetBoundsBR))
				return;

			target.x = targetBoundsTL.x;
			target.y = targetBoundsTL.y;
			target.width = targetBoundsBR.x - targetBoundsTL.x;
			target.height = targetBoundsBR.y - targetBoundsTL.y;
		}

		private function _stage_mouseUp(e:MouseEvent) : void
		{
			var stage:Stage = this._stage;
			if (!stage)
				return;

			this._stage = null;
			this._activeHandle = null;
			this._mousePosition = null;
			this._targetBoundsTL = null;
			this._targetBoundsBR = null;

			stage.removeEventListener(MouseEvent.MOUSE_MOVE, this._stage_mouseMove);
			stage.removeEventListener(MouseEvent.MOUSE_UP, this._stage_mouseUp);

			this._updatePropertyManager();
		}

		private function _target_invalidated(e:ValidateEvent) : void
		{
			switch (e.pass)
			{
				case LayoutSprite.RENDER:
					this.invalidate(DragResizeHandle.RENDER_HANDLE);
					break;
			}
		}

	}

}

import com.splunk.controls.ICursor;
import flash.display.DisplayObject;
import flash.display.Sprite;

class Handle extends Sprite implements ICursor
{

	// Private Properties

	private var _cursor:DisplayObject;

	// Constructor

	public function Handle(cursor:DisplayObject = null)
	{
		this._cursor = cursor;

		this.buttonMode = true;
		this.tabEnabled = false;
		this.tabChildren = false;
	}

	// Public Getters/Setters

	public function get cursor() : DisplayObject
	{
		return this._cursor;
	}

}
