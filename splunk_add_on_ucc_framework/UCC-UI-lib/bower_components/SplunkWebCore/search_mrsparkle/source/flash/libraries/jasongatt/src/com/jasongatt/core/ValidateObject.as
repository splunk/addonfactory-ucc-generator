package com.jasongatt.core
{

	import com.jasongatt.utils.ErrorUtil;
	import flash.errors.IllegalOperationError;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.utils.Dictionary;

	[Event(name="invalidated", type="com.jasongatt.core.ValidateEvent")]
	[Event(name="validated", type="com.jasongatt.core.ValidateEvent")]

	public class ValidateObject implements IValidate
	{

		// Private Properties

		private var _target:IValidate;
		private var _eventDispatcher:EventDispatcher;
		private var _invalidPasses:Dictionary;
		private var _validatingPasses:Dictionary;
		private var _invalidateListeners:Dictionary;
		private var _validateListeners:Dictionary;
		private var _precedingPasses:Array;
		private var _precedingPassMinPriority:Number;
		private var _precedingPassMaxPriority:Number;

		// Constructor

		public function ValidateObject(target:IValidate = null)
		{
			if (target && (target != this))
			{
				this._target = target;
			}
			else
			{
				this._target = this;
				this._eventDispatcher = new EventDispatcher(this);
			}

			this._invalidPasses = new Dictionary();
			this._validatingPasses = new Dictionary();
			this._invalidateListeners = new Dictionary();
			this._validateListeners = new Dictionary();
		}

		// Public Methods

		public function invalidate(pass:ValidatePass) : Boolean
		{
			if (!pass)
				throw new TypeError("Parameter pass must be non-null.");

			if (this._invalidPasses[pass])
				return false;

			if (!(this._target is pass.targetType))
				throw new TypeError("Incompatible pass targetType.");

			var precedingPasses:Array = this._precedingPasses;
			if (precedingPasses)
			{
				var passPriority:int = pass.priority;
				if ((passPriority > this._precedingPassMinPriority) && (passPriority < this._precedingPassMaxPriority))
				{
					var passAdded:Boolean = false;
					var numPrecedingPasses:int = precedingPasses.length;
					var precedingPass:ValidatePass;
					for (var i:int = 0; i < numPrecedingPasses; i++)
					{
						precedingPass = precedingPasses[i];
						if (passPriority < precedingPass.priority)
						{
							precedingPasses.splice(i, 0, pass);
							passAdded = true;
							break;
						}
					}
					if (!passAdded)
						precedingPasses.push(pass);
				}
			}

			this._invalidPasses[pass] = pass;
			ValidateQueue.enqueue(this._target, pass);
			this._target.dispatchEvent(new ValidateEvent(ValidateEvent.INVALIDATED, false, false, pass));

			return true;
		}

		public function validate(pass:ValidatePass = null) : Boolean
		{
			// TODO: handle validate all
			if (!pass)
			{
				trace("Support for null passes is not implemented.");
				return false;
			}

			if (this._validatingPasses[pass])
				return false;

			this._target.validatePreceding(pass);

			if (!this._invalidPasses[pass])
				return false;

			this._validatingPasses[pass] = true;

			var success:Boolean = false;
			try
			{
				this._target[pass.methodName]();
				success = true;
			}
			catch (e:Error)
			{
				ErrorUtil.asyncThrow(e);
			}

			this._target.setValid(pass);

			return success;
		}

		public function validatePreceding(pass:ValidatePass) : Boolean
		{
			if (!pass)
				throw new TypeError("Parameter pass must be non-null.");

			if (ValidateQueue.isValidating)
				return false;

			if (this._precedingPasses)
				return false;

			var precedingPasses:Array = this._precedingPasses = new Array();
			var precedingPassMaxPriority:Number = this._precedingPassMaxPriority = pass.priority;
			var precedingPass:ValidatePass;
			var invalidPasses:Dictionary = this._invalidPasses;

			for each (precedingPass in invalidPasses)
			{
				if (precedingPass.priority < precedingPassMaxPriority)
					precedingPasses.push(precedingPass);
			}
			precedingPasses.sortOn("priority", Array.NUMERIC);

			var target:IValidate = this._target;
			while (precedingPasses.length > 0)
			{
				precedingPass = precedingPasses.shift();
				this._precedingPassMinPriority = precedingPass.priority;
				if (invalidPasses[precedingPass])
					target.validate(precedingPass);
			}

			this._precedingPasses = null;

			return true;
		}

		public function setValid(pass:ValidatePass = null) : Boolean
		{
			// TODO: handle setValid all
			if (!pass)
			{
				trace("Support for null passes is not implemented.");
				return false;
			}

			if (!this._invalidPasses[pass])
				return false;

			delete this._invalidPasses[pass];
			delete this._validatingPasses[pass];
			ValidateQueue.dequeue(this._target, pass);
			this._target.dispatchEvent(new ValidateEvent(ValidateEvent.VALIDATED, false, false, pass));

			return true;
		}

		public function isValid(pass:ValidatePass = null) : Boolean
		{
			if (!pass)
			{
				for each (pass in this._invalidPasses)
					return false;
				return true;
			}

			return !this._invalidPasses[pass];
		}

		public function invalidates(pass:ValidatePass) : Function
		{
			if (!pass)
				throw new TypeError("Parameter pass must be non-null.");

			var listener:Function = this._invalidateListeners[pass];
			if (listener == null)
			{
				var target:IValidate = this._target;
				if (!(target is pass.targetType))
					throw new TypeError("Incompatible pass targetType.");
				listener = this._invalidateListeners[pass] = function(... args) : void
				{
					target.invalidate(pass);
				};
			}
			return listener;
		}

		public function validates(pass:ValidatePass = null) : Function
		{
			var key:Object = pass ? pass : this;
			var listener:Function = this._validateListeners[key];
			if (listener == null)
			{
				var target:IValidate = this._target;
				if (pass && !(target is pass.targetType))
					throw new TypeError("Incompatible pass targetType.");
				listener = this._validateListeners[key] = function(... args) : void
				{
					target.validate(pass);
				};
			}
			return listener;
		}

		public function addEventListener(type:String, listener:Function, useCapture:Boolean = false, priority:int = 0, useWeakReference:Boolean = false) : void
		{
			var eventDispatcher:EventDispatcher = this._eventDispatcher;
			if (!eventDispatcher)
				throw new IllegalOperationError("Must use a separate instance of IEventDispatcher.");

			eventDispatcher.addEventListener(type, listener, useCapture, priority, useWeakReference);
		}

		public function removeEventListener(type:String, listener:Function, useCapture:Boolean = false) : void
		{
			var eventDispatcher:EventDispatcher = this._eventDispatcher;
			if (!eventDispatcher)
				throw new IllegalOperationError("Must use a separate instance of IEventDispatcher.");

			eventDispatcher.removeEventListener(type, listener, useCapture);
		}

		public function dispatchEvent(event:Event) : Boolean
		{
			var eventDispatcher:EventDispatcher = this._eventDispatcher;
			if (!eventDispatcher)
				throw new IllegalOperationError("Must use a separate instance of IEventDispatcher.");

			return eventDispatcher.dispatchEvent(event);
		}

		public function hasEventListener(type:String) : Boolean
		{
			var eventDispatcher:EventDispatcher = this._eventDispatcher;
			if (!eventDispatcher)
				throw new IllegalOperationError("Must use a separate instance of IEventDispatcher.");

			return eventDispatcher.hasEventListener(type);
		}

		public function willTrigger(type:String) : Boolean
		{
			var eventDispatcher:EventDispatcher = this._eventDispatcher;
			if (!eventDispatcher)
				throw new IllegalOperationError("Must use a separate instance of IEventDispatcher.");

			return eventDispatcher.willTrigger(type);
		}

	}

}
