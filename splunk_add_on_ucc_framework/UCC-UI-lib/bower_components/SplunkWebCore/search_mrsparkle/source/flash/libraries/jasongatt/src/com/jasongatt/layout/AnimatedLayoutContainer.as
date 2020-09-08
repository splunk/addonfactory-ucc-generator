package com.jasongatt.layout
{

	import com.jasongatt.utils.RectangleUtil;
	import flash.display.DisplayObject;
	import flash.events.Event;
	import flash.geom.Rectangle;
	import flash.utils.Dictionary;

	public class AnimatedLayoutContainer extends LayoutContainer
	{

		// Private Properties

		private var _convergeRatio:Number = 0.5;

		private var _animationInfo:Dictionary;
		private var _isAnimating:Boolean = false;

		// Constructor

		public function AnimatedLayoutContainer()
		{
			this._animationInfo = new Dictionary();
		}

		// Public Getters/Setters

		public function get convergeRatio() : Number
		{
			return this._convergeRatio;
		}
		public function set convergeRatio(value:Number) : void
		{
			if (value != value)
				return;
			if (value < 0)
				value = 0;
			else if (value > 1)
				value = 1;
			this._convergeRatio = value;
		}

		// Protected Methods

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			var size:Size = super.layoutOverride(layoutSize);

			var needsAnimation:Boolean = false;

			for each (var info:AnimationInfo in this._animationInfo)
			{
				info.targetBounds = info.child.layoutBounds;
				if (info.currentBounds && !RectangleUtil.approxEqual(info.currentBounds, info.targetBounds, 0.25))
				{
					needsAnimation = true;
					info.child.layout(info.currentBounds);
				}
				else
				{
					info.currentBounds = info.targetBounds;
				}
			}

			if (needsAnimation)
			{
				if (!this._isAnimating)
				{
					this._isAnimating = true;
					this.addEventListener(Event.ENTER_FRAME, this._self_enterFrame, false, int.MAX_VALUE);
				}
			}
			else
			{
				if (this._isAnimating)
				{
					this._isAnimating = false;
					this.removeEventListener(Event.ENTER_FRAME, this._self_enterFrame);
				}
			}

			return size;
		}

		protected override function onChildAdded(child:DisplayObject) : void
		{
			var layoutChild:LayoutSprite = child as LayoutSprite;
			if (layoutChild)
				this._animationInfo[layoutChild] = new AnimationInfo(layoutChild);

			super.onChildAdded(child);
		}

		protected override function onChildRemoved(child:DisplayObject) : void
		{
			var layoutChild:LayoutSprite = child as LayoutSprite;
			if (layoutChild)
				delete this._animationInfo[layoutChild];

			super.onChildRemoved(child);
		}

		// Private Methods

		private function _self_enterFrame(e:Event) : void
		{
			var p:Number = this._convergeRatio;

			for each (var info:AnimationInfo in this._animationInfo)
			{
				if (info.currentBounds && (info.currentBounds != info.targetBounds))
					info.currentBounds = RectangleUtil.interpolate(info.currentBounds, info.targetBounds, p);
			}

			this.invalidate(LayoutSprite.LAYOUT);
		}

	}

}

import com.jasongatt.layout.LayoutSprite;
import flash.geom.Rectangle;

class AnimationInfo
{

	// Public Properties

	public var child:LayoutSprite;
	public var targetBounds:Rectangle;
	public var currentBounds:Rectangle;

	// Constructor

	public function AnimationInfo(child:LayoutSprite)
	{
		this.child = child;
	}

}
