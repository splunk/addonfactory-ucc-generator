package com.splunk.particles.controls
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.PropertyChangedEvent;
	import com.jasongatt.core.ValidateEvent;
	import com.jasongatt.core.ValidatePass;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Size;
	import com.jasongatt.utils.NumberUtil;
	import com.jasongatt.utils.PointUtil;
	import com.splunk.particles.collectors.ICollector;
	import com.splunk.particles.emitters.IEmitter;
	import com.splunk.properties.PropertyManager;
	import flash.display.DisplayObject;
	import flash.display.Graphics;
	import flash.display.Sprite;
	import flash.display.Stage;
	import flash.events.MouseEvent;
	import flash.geom.Matrix;
	import flash.geom.Point;

	public class LinkSourcesHandle extends LayoutSprite
	{

		// Public Static Constants

		public static const RENDER_HANDLE:ValidatePass = new ValidatePass(LinkSourcesHandle, "renderHandle", 3.1);

		// Private Properties

		private var _target:ObservableProperty;
		private var _color:ObservableProperty;

		private var _propertyManager:PropertyManager;

		private var _linkHandle:LinkHandle;
		private var _unlinkHandles:Array;

		private var _stage:Stage;
		private var _linkPosition:Point;
		private var _linkTarget:LayoutSprite;

		// Constructor

		public function LinkSourcesHandle(propertyManager:PropertyManager = null)
		{
			this._target = new ObservableProperty(this, "target", LayoutSprite, null, this._target_changed);
			this._color = new ObservableProperty(this, "color", uint, 0x000000, this.invalidates(LinkSourcesHandle.RENDER_HANDLE));

			this._propertyManager = propertyManager;

			this._linkHandle = new LinkHandle();
			this._linkHandle.visible = false;
			this._linkHandle.addEventListener(MouseEvent.MOUSE_DOWN, this._linkHandle_mouseDown);

			this._unlinkHandles = new Array();

			this.mouseEnabled = false;

			this.addChild(this._linkHandle);
		}

		// Public Getters/Setters

		public function get target() : LayoutSprite
		{
			return this._target.value;
		}
		public function set target(value:LayoutSprite) : void
		{
			this._target.value = value;
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
			this.validatePreceding(LinkSourcesHandle.RENDER_HANDLE);

			if (this.isValid(LinkSourcesHandle.RENDER_HANDLE))
				return;

			var graphics:Graphics = this.graphics;
			graphics.clear();

			var linkHandle:LinkHandle = this._linkHandle;
			var linkGraphics:Graphics = linkHandle.graphics;
			linkGraphics.clear();
			linkHandle.visible = false;

			var unlinkHandles:Array = this._unlinkHandles;
			var numUnlinkHandles:int = unlinkHandles.length;
			var unlinkHandle:UnlinkHandle;
			var sourcesCount:int = 0;
			var i:int;

			var target:LayoutSprite = this._target.value;
			var collector:ICollector = target as ICollector;
			if (target && collector)
			{
				var color:uint = this._color.value;

				var p1:Point = PointUtil.round(this.globalToLocal(target.localToGlobal(new Point(-10, 10))));
				var p2:Point;

				var sources:Array = collector.sources;
				var numSources:int = sources ? sources.length : 0;
				var source:LayoutSprite;
				var sourceWidth:Number;
				var unlinkGraphics:Graphics;

				for (i = 0; i < numSources; i++)
				{
					source = sources[i] as LayoutSprite;
					if (source)
					{
						sourceWidth = NumberUtil.maxMin(source.width, source.maximumWidth, source.minimumWidth);
						if (sourceWidth != sourceWidth)
							sourceWidth = -20;

						if (sourcesCount < numUnlinkHandles)
						{
							unlinkHandle = unlinkHandles[sourcesCount];
						}
						else
						{
							unlinkHandle = new UnlinkHandle();
							unlinkHandle.addEventListener(MouseEvent.CLICK, this._unlinkHandle_click);
							unlinkHandles.push(unlinkHandle);
							this.addChildAt(unlinkHandle, 0);
						}

						unlinkHandle.source = source;

						p2 = PointUtil.round(this.globalToLocal(source.localToGlobal(new Point(sourceWidth + 10, 10))));

						unlinkGraphics = unlinkHandle.graphics;
						unlinkGraphics.clear();
						unlinkGraphics.beginFill(0x000000, 0);
						unlinkGraphics.drawRect(-8, -8, 16, 16);
						unlinkGraphics.endFill();
						unlinkGraphics.lineStyle(1, color, 0.25);
						unlinkGraphics.drawCircle(0, 0, 3);

						unlinkHandle.x = p2.x;
						unlinkHandle.y = p2.y;

						graphics.lineStyle(1, color, 0.25);
						this._drawCurve(graphics, p1, p2);

						sourcesCount++;
					}
				}

				var linkPosition:Point = this._linkPosition;
				if (linkPosition)
				{
					var linkTarget:LayoutSprite = this._linkTarget;
					if (linkTarget)
					{
						var linkTargetWidth:Number = NumberUtil.maxMin(linkTarget.width, linkTarget.maximumWidth, linkTarget.minimumWidth);
						if (linkTargetWidth != linkTargetWidth)
							linkTargetWidth = -20;

						linkPosition = linkTarget.localToGlobal(new Point(linkTargetWidth + 10, 10));
					}

					linkPosition = PointUtil.round(this.globalToLocal(linkPosition));

					if (linkTarget)
						graphics.lineStyle(1, color, 1);
					else
						graphics.lineStyle(1, color, 0.5);
					this._drawCurve(graphics, p1, linkPosition);

					if (linkTarget)
						graphics.drawCircle(linkPosition.x, linkPosition.y, 3);
				}

				linkGraphics.beginFill(0x000000, 0);
				linkGraphics.drawRect(-8, -8, 16, 16);
				linkGraphics.endFill();
				linkGraphics.lineStyle(1, color, 1);
				linkGraphics.drawRect(-3, -3, 6, 6);

				linkHandle.x = p1.x;
				linkHandle.y = p1.y;
				linkHandle.visible = true;
			}

			for (i = unlinkHandles.length - 1; i >= sourcesCount; i--)
			{
				unlinkHandle = unlinkHandles.pop();
				this.removeChild(unlinkHandle);
			}

			this.setValid(LinkSourcesHandle.RENDER_HANDLE);
		}

		// Protected Methods

		protected override function measureOverride(availableSize:Size) : Size
		{
			return new Size();
		}

		protected override function renderOverride(renderMatrix:Matrix) : Matrix
		{
			this.invalidate(LinkSourcesHandle.RENDER_HANDLE);

			return renderMatrix;
		}

		// Private Methods

		private function _drawCurve(graphics:Graphics, p1:Point, p2:Point) : void
		{
			var d:Number = Point.distance(p1, p2);

			var p3:Point = new Point(p1.x - d * 0.1, p1.y);
			var p4:Point = new Point(p2.x + NumberUtil.maxMin(d * 0.5, (p1.x - p2.x) * 0.5, d * 0.2), p2.y);
			var p5:Point = new Point((p3.x + p4.x) / 2, (p3.y + p4.y) / 2);

			graphics.moveTo(p1.x, p1.y);
			graphics.curveTo(p3.x, p3.y, p5.x, p5.y);
			graphics.curveTo(p4.x, p4.y, p2.x, p2.y);
		}

		private function _updatePropertyManager() : void
		{
			var collector:ICollector = this._target.value as ICollector;
			if (!collector)
				return;

			var propertyManager:PropertyManager = this._propertyManager;
			if (!propertyManager || propertyManager.isParsing)
				return;

			var path:String = propertyManager.getPropertyPath(collector);
			if (!path)
				return;

			var sources:Array = collector.sources;
			if (sources)
			{
				var sourcePaths:Array = new Array();
				var sourcePath:String;
				for each (var source:Object in sources)
				{
					sourcePath = propertyManager.getPropertyPath(source);
					if (sourcePath)
						sourcePaths.push("@" + sourcePath);
				}

				propertyManager.setValue(path + ".sources", "[" + sourcePaths.join(",") + "]");
			}
			else
			{
				propertyManager.clearValue(path + ".sources");
			}
		}

		private function _target_changed(e:ChangedEvent) : void
		{
			var pce:PropertyChangedEvent = e as PropertyChangedEvent;
			if (!pce)
				return;

			var oldSources:Array;
			var newSources:Array;
			var source:*;

			if (pce.source == this._target)
			{
				var oldTarget:* = pce.oldValue;
				if (oldTarget is LayoutSprite)
					oldTarget.removeEventListener(ValidateEvent.INVALIDATED, this._target_invalidated);
				if (oldTarget is ICollector)
					oldSources = oldTarget.sources;

				var newTarget:* = pce.newValue;
				if (newTarget is LayoutSprite)
					newTarget.addEventListener(ValidateEvent.INVALIDATED, this._target_invalidated, false, int.MAX_VALUE);
				if (newTarget is ICollector)
					newSources = newTarget.sources;

				this.invalidate(LinkSourcesHandle.RENDER_HANDLE);
			}
			else if ((pce.source == this._target.value) && (pce.propertyName == "sources"))
			{
				oldSources = pce.oldValue as Array;
				newSources = pce.newValue as Array;

				this.invalidate(LinkSourcesHandle.RENDER_HANDLE);
			}

			for each (source in oldSources)
			{
				if (source is LayoutSprite)
					source.removeEventListener(ValidateEvent.INVALIDATED, this._source_invalidated);
			}

			for each (source in newSources)
			{
				if (source is LayoutSprite)
					source.addEventListener(ValidateEvent.INVALIDATED, this._source_invalidated, false, int.MAX_VALUE);
			}
		}

		private function _target_invalidated(e:ValidateEvent) : void
		{
			switch (e.pass)
			{
				case LayoutSprite.RENDER:
					this.invalidate(LinkSourcesHandle.RENDER_HANDLE);
					break;
			}
		}

		private function _source_invalidated(e:ValidateEvent) : void
		{
			switch (e.pass)
			{
				case LayoutSprite.RENDER:
					this.invalidate(LinkSourcesHandle.RENDER_HANDLE);
					break;
			}
		}

		private function _unlinkHandle_click(e:MouseEvent) : void
		{
			var unlinkHandle:UnlinkHandle = e.target as UnlinkHandle;
			if (!unlinkHandle)
				return;

			var collector:ICollector = this._target.value as ICollector;
			if (!collector)
				return;

			var sources:Array = collector.sources;
			if (!sources)
				return;

			var index:int = sources.indexOf(unlinkHandle.source);
			if (index < 0)
				return;

			sources.splice(index, 1);

			collector.sources = sources;

			this._updatePropertyManager();
		}

		private function _linkHandle_mouseDown(e:MouseEvent) : void
		{
			var stage:Stage = this.stage;
			if (!stage)
				return;

			this._stage = stage;
			this._linkPosition = new Point(e.stageX, e.stageY);

			stage.addEventListener(MouseEvent.MOUSE_MOVE, this._stage_mouseMove, false, int.MAX_VALUE);
			stage.addEventListener(MouseEvent.MOUSE_OVER, this._stage_mouseOver, false, int.MAX_VALUE);
			stage.addEventListener(MouseEvent.MOUSE_OUT, this._stage_mouseOut, false, int.MAX_VALUE);
			stage.addEventListener(MouseEvent.MOUSE_UP, this._stage_mouseUp, false, int.MAX_VALUE);

			this.invalidate(LinkSourcesHandle.RENDER_HANDLE);
		}

		private function _stage_mouseMove(e:MouseEvent) : void
		{
			this._linkPosition = new Point(e.stageX, e.stageY);

			this.invalidate(LinkSourcesHandle.RENDER_HANDLE);
		}

		private function _stage_mouseOver(e:MouseEvent) : void
		{
			var target:DisplayObject = e.target as DisplayObject;
			while (target && !(target is Stage))
			{
				if ((target is IEmitter) && (target is LayoutSprite) && (target != this._target.value))
				{
					if (this._linkTarget != target)
					{
						this._linkTarget = LayoutSprite(target);
						this.invalidate(LinkSourcesHandle.RENDER_HANDLE);
					}
					return;
				}
				target = target.parent;
			}

			if (this._linkTarget != null)
			{
				this._linkTarget = null;
				this.invalidate(LinkSourcesHandle.RENDER_HANDLE);
			}
		}

		private function _stage_mouseOut(e:MouseEvent) : void
		{
			var target:DisplayObject = e.relatedObject as DisplayObject;
			while (target && !(target is Stage))
			{
				if ((target is IEmitter) && (target is LayoutSprite) && (target != this._target.value))
				{
					if (this._linkTarget != target)
					{
						this._linkTarget = LayoutSprite(target);
						this.invalidate(LinkSourcesHandle.RENDER_HANDLE);
					}
					return;
				}
				target = target.parent;
			}

			if (this._linkTarget != null)
			{
				this._linkTarget = null;
				this.invalidate(LinkSourcesHandle.RENDER_HANDLE);
			}
		}

		private function _stage_mouseUp(e:MouseEvent) : void
		{
			var stage:Stage = this._stage;
			if (!stage)
				return;

			var linkTarget:LayoutSprite = this._linkTarget;
			if (linkTarget)
			{
				var collector:ICollector = this._target.value as ICollector;
				if (collector)
				{
					var sources:Array = collector.sources;
					if (sources)
					{
						if (sources.indexOf(linkTarget) < 0)
						{
							collector.sources = sources.concat(linkTarget);

							this._updatePropertyManager();
						}
					}
					else
					{
						collector.sources = [ linkTarget ];

						this._updatePropertyManager();
					}
				}
			}

			this._stage = null;
			this._linkPosition = null;
			this._linkTarget = null;

			stage.removeEventListener(MouseEvent.MOUSE_MOVE, this._stage_mouseMove);
			stage.removeEventListener(MouseEvent.MOUSE_OVER, this._stage_mouseOver);
			stage.removeEventListener(MouseEvent.MOUSE_OUT, this._stage_mouseOut);
			stage.removeEventListener(MouseEvent.MOUSE_UP, this._stage_mouseUp);

			this.invalidate(LinkSourcesHandle.RENDER_HANDLE);
		}

	}

}

import com.jasongatt.layout.LayoutSprite;
import com.splunk.controls.CursorUtils;
import com.splunk.controls.ICursor;
import flash.display.DisplayObject;
import flash.display.Sprite;

class LinkHandle extends Sprite implements ICursor
{

	// Private Static Properties

	private static var _cursor:DisplayObject;

	// Private Static Methods

	private static function _getCursor() : DisplayObject
	{
		var cursor:DisplayObject = LinkHandle._cursor;
		if (!cursor)
		{
			cursor = LinkHandle._cursor = CursorUtils.createBitmapCursor([
				2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,1,1,1,1,1,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,1,1,2,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,1,2,2,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,2,0,0,2,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,2,0,0,0,2,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,0,0,0,0,0,2,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				0,0,0,0,0,0,2,1,1,2,0,0,0,0,0,2,2,2,2,0,0,0,2,2,2,2,0,0,
				0,0,0,0,0,0,0,2,1,1,2,0,0,0,2,1,1,1,1,2,0,2,1,1,1,1,2,0,
				0,0,0,0,0,0,0,2,1,1,2,0,0,2,1,1,2,2,2,2,2,2,2,2,2,1,1,2,
				0,0,0,0,0,0,0,0,2,2,0,0,0,2,1,2,0,2,1,1,1,1,1,2,0,2,1,2,
				0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,1,2,2,2,2,2,2,2,2,2,1,1,2,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,1,1,1,2,0,2,1,1,1,1,2,0,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,2,0,0,0,2,2,2,2,0,0,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
				], [0x00000000,0xFFFFFFFF,0xFF000000], 0, 0);
		}
		return cursor;
	}

	// Private Properties

	private var _cursor:DisplayObject;

	// Constructor

	public function LinkHandle()
	{
		this._cursor = LinkHandle._getCursor();

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

class UnlinkHandle extends Sprite implements ICursor
{

	// Private Static Properties

	private static var _cursor:DisplayObject;

	// Private Static Methods

	private static function _getCursor() : DisplayObject
	{
		var cursor:DisplayObject = UnlinkHandle._cursor;
		if (!cursor)
		{
			cursor = UnlinkHandle._cursor = CursorUtils.createBitmapCursor([
				2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,1,1,1,1,1,1,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,1,1,1,1,1,2,2,2,2,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,1,1,2,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,1,2,2,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,1,2,0,0,2,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,2,0,0,0,2,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				2,0,0,0,0,0,2,1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				0,0,0,0,0,0,2,1,1,2,0,0,0,0,0,2,2,2,2,2,0,0,0,2,2,2,0,0,
				0,0,0,0,0,0,0,2,1,1,2,0,0,0,2,1,1,1,2,0,0,0,2,1,1,1,2,0,
				0,0,0,0,0,0,0,2,1,1,2,0,0,2,1,1,2,2,0,0,0,2,2,2,2,1,1,2,
				0,0,0,0,0,0,0,0,2,2,0,0,0,2,1,2,0,0,0,0,0,0,0,0,0,2,1,2,
				0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,1,2,2,2,2,0,0,0,2,2,1,1,2,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,1,1,1,2,0,0,0,2,1,1,1,2,0,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,2,2,0,0,0,2,2,2,2,2,0,0,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
				0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
				], [0x00000000,0xFFFFFFFF,0xFF000000], 0, 0);
		}
		return cursor;
	}

	// Public Properties

	public var source:LayoutSprite;

	// Private Properties

	private var _cursor:DisplayObject;

	// Constructor

	public function UnlinkHandle()
	{
		this._cursor = UnlinkHandle._getCursor();

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
