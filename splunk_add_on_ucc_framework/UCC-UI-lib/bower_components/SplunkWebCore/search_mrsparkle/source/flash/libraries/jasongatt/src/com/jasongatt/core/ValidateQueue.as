package com.jasongatt.core
{

	import com.jasongatt.utils.ErrorUtil;
	import com.jasongatt.utils.ISort;
	import flash.display.Shape;
	import flash.events.Event;
	import flash.events.TimerEvent;
	import flash.utils.Dictionary;
	import flash.utils.Timer;

	public final class ValidateQueue
	{

		// Private Static Properties

		private static var _isValidating:Boolean = false;

		private static var _passesDictionary:Dictionary = new Dictionary();
		private static var _passesArray:Array = new Array();
		private static var _timer:Timer = new Timer(0, 0);
		private static var _beacon:Shape = new Shape();  // simultaneous beacon in case timer is slower than enter frame (IE)
		private static var _validateIndex:int = -1;

		// Public Static Getters/Setters

		public static function get isValidating() : Boolean
		{
			return ValidateQueue._isValidating;
		}

		// Public Static Methods

		public static function enqueue(target:IValidate, pass:ValidatePass) : void
		{
			if (!target)
				throw new TypeError("Parameter target must be non-null.");
			if (!pass)
				throw new TypeError("Parameter pass must be non-null.");

			var targetsDictionary:Dictionary = ValidateQueue._passesDictionary[pass];
			if (!targetsDictionary)
			{
				targetsDictionary = ValidateQueue._passesDictionary[pass] = new Dictionary();

				var passesArray:Array = ValidateQueue._passesArray;
				var numPasses:int = passesArray.length;
				var passPriority:Number = pass.priority;
				var passAdded:Boolean = false;
				var pass2:ValidatePass;
				for (var i:int = 0; i < numPasses; i++)
				{
					pass2 = passesArray[i];
					if (passPriority < pass2.priority)
					{
						passesArray.splice(i, 0, pass);
						if (i <= ValidateQueue._validateIndex)
							ValidateQueue._validateIndex++;
						passAdded = true;
						break;
					}
				}
				if (!passAdded)
					passesArray.push(pass);

				if (passesArray.length == 1)
				{
					ValidateQueue._beacon.addEventListener(Event.ENTER_FRAME, ValidateQueue._beacon_enterFrame);
					ValidateQueue._timer.addEventListener(TimerEvent.TIMER, ValidateQueue._timer_tick);
					ValidateQueue._timer.start();
				}
			}

			targetsDictionary[target] = target;
		}

		public static function dequeue(target:IValidate, pass:ValidatePass) : void
		{
			if (!target)
				throw new TypeError("Parameter target must be non-null.");
			if (!pass)
				throw new TypeError("Parameter pass must be non-null.");

			var targetsDictionary:Dictionary = ValidateQueue._passesDictionary[pass];
			if (!targetsDictionary)
				return;

			delete targetsDictionary[target];
		}

		public static function contains(target:IValidate, pass:ValidatePass) : Boolean
		{
			if (!target)
				throw new TypeError("Parameter target must be non-null.");
			if (!pass)
				throw new TypeError("Parameter pass must be non-null.");

			var targetsDictionary:Dictionary = ValidateQueue._passesDictionary[pass];
			if (!targetsDictionary)
				return false;

			if (!targetsDictionary[target])
				return false;

			return true;
		}

		public static function validateAll() : Boolean
		{
			if (ValidateQueue._isValidating)
				return false;

			ValidateQueue._isValidating = true;

			var passesDictionary:Dictionary = ValidateQueue._passesDictionary;
			var passesArray:Array = ValidateQueue._passesArray;
			var pass:ValidatePass;
			var passTargetSort:ISort;
			var targetsDictionary:Dictionary;
			var targetsArray:Array;
			var target:IValidate;
			var i:int;

			// validate passes
			i = ValidateQueue._validateIndex = 0;
			while (i < passesArray.length)
			{
				pass = passesArray[i];
				passTargetSort = pass.targetSort;
				targetsDictionary = passesDictionary[pass];

				targetsArray = new Array();
				for each (target in targetsDictionary)
					targetsArray.push(target);

				if (passTargetSort)
				{
					try
					{
						passTargetSort.sort(targetsArray);
					}
					catch (e:Error)
					{
						ErrorUtil.asyncThrow(e);
					}
				}

				for each (target in targetsArray)
				{
					try
					{
						target.validate(pass);
					}
					catch (e:Error)
					{
						ErrorUtil.asyncThrow(e);
					}
				}

				i = ++ValidateQueue._validateIndex;
			}
			ValidateQueue._validateIndex = -1;

			// dequeue passes that contain no targets
			var hasTargets:Boolean = false;
			for (i = passesArray.length - 1; i >= 0; i--)
			{
				pass = passesArray[i];

				hasTargets = false;
				targetsDictionary = passesDictionary[pass];
				for each (target in targetsDictionary)
				{
					hasTargets = true;
					break;
				}

				if (!hasTargets)
				{
					delete passesDictionary[pass];
					passesArray.splice(i, 1);
				}
			}

			// stop validating if no passes are enqueued
			if (passesArray.length == 0)
			{
				ValidateQueue._beacon.removeEventListener(TimerEvent.TIMER, ValidateQueue._beacon_enterFrame);
				ValidateQueue._timer.removeEventListener(TimerEvent.TIMER, ValidateQueue._timer_tick);
				ValidateQueue._timer.reset();
			}

			ValidateQueue._isValidating = false;

			return true;
		}

		// Private Static Methods

		private static function _timer_tick(e:TimerEvent) : void
		{
			ValidateQueue.validateAll();
			e.updateAfterEvent();
		}

		private static function _beacon_enterFrame(e:Event) : void
		{
			ValidateQueue.validateAll();
		}

	}

}
