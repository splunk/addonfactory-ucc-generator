package com.splunk.utils
{

	import flash.display.DisplayObjectContainer;
	import flash.display.InteractiveObject;
	import flash.display.Stage;
	import flash.events.Event;
	import flash.events.KeyboardEvent;
	import flash.events.MouseEvent;
	import flash.events.TimerEvent;
	import flash.geom.Point;
	import flash.utils.Dictionary;
	import flash.utils.getTimer;
	import flash.utils.Timer;

	public class VirtualMouse
	{

		// Private Properties

		private var _newStage:Stage;
		private var _newPosition:Point;

		private var _stage:Stage;
		private var _position:Point;
		private var _target:InteractiveObject;
		private var _localPosition:Point;
		private var _doubleClickSpeed:Number = 500;

		private var _downTarget:InteractiveObject;
		private var _upTarget:InteractiveObject;
		private var _upTime:int = 0;
		private var _upTimer:Timer;

		private var _ctrlKey:Boolean = false;
		private var _altKey:Boolean = false;
		private var _shiftKey:Boolean = false;
		private var _buttonDown:Boolean = false;
		private var _withinStage:Boolean = false;

		// Constructor

		public function VirtualMouse(stage:Stage = null)
		{
			this._newPosition = this._position = new Point();

			this._upTimer = new Timer(100);
			this._upTimer.addEventListener(TimerEvent.TIMER, this._upTimer_timer);

			this.stage = stage;
		}

		// Public Getters/Setters

		public function get stage() : Stage
		{
			return this._stage;
		}
		public function set stage(value:Stage) : void
		{
			if (this._newStage == value)
				return;

			if (this._newStage)
			{
				this._newStage.removeEventListener(KeyboardEvent.KEY_DOWN, this._stage_key);
				this._newStage.removeEventListener(KeyboardEvent.KEY_UP, this._stage_key);
			}

			this._newStage = value;

			if (this._newStage)
			{
				this._newStage.addEventListener(KeyboardEvent.KEY_DOWN, this._stage_key);
				this._newStage.addEventListener(KeyboardEvent.KEY_UP, this._stage_key);
			}

			this.update();
		}

		public function get x() : Number
		{
			return this._position.x;
		}

		public function get y() : Number
		{
			return this._position.y;
		}

		public function get target() : InteractiveObject
		{
			return this._target;
		}

		public function get buttonDown() : Boolean
		{
			return this._buttonDown;
		}

		public function get doubleClickSpeed() : Number
		{
			return this._doubleClickSpeed;
		}
		public function set doubleClickSpeed(value:Number) : void
		{
			this._doubleClickSpeed = value;
		}

		// Public Methods

		public function move(x:Number, y:Number) : void
		{
			this._newPosition = new Point(x, y);

			this.update();
		}

		public function press() : void
		{
			this.update();

			if (this._buttonDown)
				return;

			this._buttonDown = true;

			if (!this._target)
				return;

			this._downTarget = this._target;

			this._target.dispatchEvent(new MouseEvent(MouseEvent.MOUSE_DOWN, true, false, this._localPosition.x, this._localPosition.y, null, this._ctrlKey, this._altKey, this._shiftKey, this._buttonDown));
		}

		public function release() : void
		{
			this.update();

			if (!this._buttonDown)
				return;

			this._buttonDown = false;

			var upTarget:InteractiveObject = this._upTarget;
			var upTime:int = this._upTime;

			this._upTarget = null;
			this._upTime = 0;
			this._upTimer.reset();

			var downTarget:InteractiveObject = this._downTarget;
			if (!downTarget)
				return;

			this._downTarget = null;

			var target:InteractiveObject = this._target;
			if (!target)
				return;

			var clickCount:int = 0;
			if (target == downTarget)
			{
				clickCount++;

				var time:int = getTimer();
				if ((target == upTarget) && ((time - upTime) <= this._doubleClickSpeed))
				{
					clickCount++;
				}
				else
				{
					this._upTarget = target;
					this._upTime = time;
					this._upTimer.start();
				}
			}

			var localPosition:Point = this._localPosition;
			var ctrlKey:Boolean = this._ctrlKey;
			var altKey:Boolean = this._altKey;
			var shiftKey:Boolean = this._shiftKey;
			var buttonDown:Boolean = this._buttonDown;

			target.dispatchEvent(new MouseEvent(MouseEvent.MOUSE_UP, true, false, localPosition.x, localPosition.y, null, ctrlKey, altKey, shiftKey, buttonDown));
			if ((clickCount == 2) && target.doubleClickEnabled)
				target.dispatchEvent(new MouseEvent(MouseEvent.DOUBLE_CLICK, true, false, localPosition.x, localPosition.y, null, ctrlKey, altKey, shiftKey, buttonDown));
			else if (clickCount > 0)
				target.dispatchEvent(new MouseEvent(MouseEvent.CLICK, true, false, localPosition.x, localPosition.y, null, ctrlKey, altKey, shiftKey, buttonDown));
		}

		public function click() : void
		{
			this.press();
			this.release();
		}

		public function doubleClick() : void
		{
			this.click();
			this.click();
		}

		public function wheel(delta:int) : void
		{
			this.update();

			if (!this._target)
				return;

			this._target.dispatchEvent(new MouseEvent(MouseEvent.MOUSE_WHEEL, true, false, this._localPosition.x, this._localPosition.y, null, this._ctrlKey, this._altKey, this._shiftKey, this._buttonDown, delta));
		}

		public function update() : void
		{
			var newStage:Stage = this._newStage;
			var newPosition:Point = this._newPosition;
			var newTarget:InteractiveObject;
			var newLocalPosition:Point;

			var oldStage:Stage = this._stage;
			var oldPosition:Point = this._position;
			var oldTarget:InteractiveObject = this._target;
			var oldLocalPosition:Point = oldTarget ? oldTarget.globalToLocal(newPosition) : null;

			var ctrlKey:Boolean = this._ctrlKey;
			var altKey:Boolean = this._altKey;
			var shiftKey:Boolean = this._shiftKey;
			var buttonDown:Boolean = this._buttonDown;

			var notifyMouseMove:Boolean = false;
			var notifyMouseLeave:Boolean = false;

			if (newStage && (newPosition.x >= 0) && (newPosition.x <= newStage.stageWidth) && (newPosition.y >= 0) && (newPosition.y <= newStage.stageHeight))
			{
				this._withinStage = true;

				newTarget = this._getInteractiveObject(newPosition);
				if (newTarget)
					newLocalPosition = newTarget.globalToLocal(newPosition);

				if ((newPosition.x != oldPosition.x) || (newPosition.y != oldPosition.y))
					notifyMouseMove = true;
			}
			else if (this._withinStage)
			{
				this._withinStage = false;

				notifyMouseLeave = true;
			}

			this._stage = newStage;
			this._position = newPosition;
			this._target = newTarget;
			this._localPosition = newLocalPosition;

			if (newTarget && notifyMouseMove)
				newTarget.dispatchEvent(new MouseEvent(MouseEvent.MOUSE_MOVE, true, false, newLocalPosition.x, newLocalPosition.y, null, ctrlKey, altKey, shiftKey, buttonDown));

			if (newTarget != oldTarget)
			{
				var relatedObject:InteractiveObject;

				if (oldTarget && !(oldTarget is Stage))
				{
					relatedObject = (newTarget is Stage) ? null : newTarget;

					oldTarget.dispatchEvent(new MouseEvent(MouseEvent.MOUSE_OUT, true, false, oldLocalPosition.x, oldLocalPosition.y, relatedObject, ctrlKey, altKey, shiftKey, buttonDown));
					oldTarget.dispatchEvent(new MouseEvent(MouseEvent.ROLL_OUT, false, false, oldLocalPosition.x, oldLocalPosition.y, relatedObject, ctrlKey, altKey, shiftKey, buttonDown));
				}

				if (newTarget && !(newTarget is Stage))
				{
					relatedObject = (oldTarget is Stage) ? null : oldTarget;

					newTarget.dispatchEvent(new MouseEvent(MouseEvent.ROLL_OVER, false, false, newLocalPosition.x, newLocalPosition.y, relatedObject, ctrlKey, altKey, shiftKey, buttonDown));
					newTarget.dispatchEvent(new MouseEvent(MouseEvent.MOUSE_OVER, true, false, newLocalPosition.x, newLocalPosition.y, relatedObject, ctrlKey, altKey, shiftKey, buttonDown));
				}
			}

			if (oldStage && notifyMouseLeave)
				oldStage.dispatchEvent(new Event(Event.MOUSE_LEAVE, false, false));
		}

		// Private Methods

		private function _getInteractiveObject(position:Point) : InteractiveObject
		{
			var stage:Stage = this._newStage;
			if (!stage)
				return null;

			var objectsUnderPoint:Array = stage.getObjectsUnderPoint(position);

			var interactiveLists:Dictionary = new Dictionary();
			var interactiveObject:InteractiveObject;
			var interactiveList:InteractiveList;
			var parentObject:DisplayObjectContainer;
			var parentList:InteractiveList;

			for (var i:int = objectsUnderPoint.length - 1; i >= 0; i--)
			{
				interactiveObject = objectsUnderPoint[i] as InteractiveObject;
				if (!interactiveObject)
					continue;

				interactiveList = interactiveLists[interactiveObject] = new InteractiveList(interactiveObject);

				while (!(interactiveObject is Stage))
				{
					parentObject = interactiveObject.parent;
					if (!parentObject)
						break;

					parentList = interactiveLists[parentObject];
					if (parentList)
					{
						parentList.children.push(interactiveList);
						break;
					}

					parentList = interactiveLists[parentObject] = new InteractiveList(parentObject);
					parentList.children.push(interactiveList);

					interactiveObject = parentObject;
					interactiveList = parentList;
				}
			}

			parentList = interactiveLists[stage];
			interactiveObject = parentList ? parentList.getInteractiveObject() : null;

			if (!interactiveObject)
				interactiveObject = stage;

			return interactiveObject;
		}

		private function _upTimer_timer(e:TimerEvent) : void
		{
			if ((getTimer() - this._upTime) > this._doubleClickSpeed)
			{
				this._upTarget = null;
				this._upTime = 0;
				this._upTimer.reset();
			}
		}

		private function _stage_key(e:KeyboardEvent) : void
		{
			this._ctrlKey = e.ctrlKey;
			this._altKey = e.altKey;
			this._shiftKey = e.shiftKey;
		}

	}

}

import flash.display.DisplayObjectContainer;
import flash.display.InteractiveObject;
import flash.display.SimpleButton;

class InteractiveList
{

	// Public Properties

	public var target:InteractiveObject;
	public var children:Array;

	// Constructor

	public function InteractiveList(target:InteractiveObject)
	{
		this.target = target;
		this.children = new Array();
	}

	// Public Methods

	public function getInteractiveObject() : InteractiveObject
	{
		var interactiveObject:InteractiveObject = this.target;

		var displayObjectContainer:DisplayObjectContainer = interactiveObject as DisplayObjectContainer;
		if (displayObjectContainer && displayObjectContainer.mouseChildren && !(displayObjectContainer is SimpleButton))
		{
			var childInteractiveObject:InteractiveObject;
			for each (var childList:InteractiveList in this.children)
			{
				childInteractiveObject = childList.getInteractiveObject();
				if (childInteractiveObject)
					return childInteractiveObject;
			}
		}

		if (interactiveObject.mouseEnabled)
			return interactiveObject;

		return null;
	}

}
