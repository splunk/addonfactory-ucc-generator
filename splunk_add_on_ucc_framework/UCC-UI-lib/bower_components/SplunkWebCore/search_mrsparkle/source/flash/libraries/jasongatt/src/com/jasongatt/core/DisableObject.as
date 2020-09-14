package com.jasongatt.core
{

	import com.jasongatt.utils.LinkedList;
	import flash.display.DisplayObject;
	import flash.display.Stage;
	import flash.errors.IllegalOperationError;
	import flash.events.Event;
	import flash.events.EventDispatcher;
	import flash.utils.Dictionary;

	[Event(name="disabled", type="com.jasongatt.core.DisableEvent")]
	[Event(name="enabled", type="com.jasongatt.core.DisableEvent")]

	public class DisableObject implements IDisable
	{

		// Private Properties

		private var _isEnabled:Boolean = true;

		private var _target:IDisable;
		private var _targetDisplayObject:DisplayObject;
		private var _eventDispatcher:EventDispatcher;
		private var _disableKeys:Dictionary;
		private var _ancestors:LinkedList;

		// Constructor

		public function DisableObject(target:IDisable = null)
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

			this._disableKeys = new Dictionary();

			this._targetDisplayObject = this._target as DisplayObject;
			if (this._targetDisplayObject)
			{
				this._targetDisplayObject.addEventListener(Event.ADDED, this._target_added, false, int.MAX_VALUE);
				this._targetDisplayObject.addEventListener(Event.REMOVED, this._target_removed, false, int.MAX_VALUE);
			}
		}

		// Public Getters/Setters

		public function get isEnabled() : Boolean
		{
			return this._isEnabled;
		}
		public function set isEnabled(value:Boolean) : void
		{
			if (value)
				this._target.enable();
			else
				this._target.disable();
		}

		// Public Methods

		public function disable(key:* = null) : Boolean
		{
			if (key == null)
				key = this._target;

			this._disableKeys[key] = true;

			if (!this._isEnabled)
				return false;

			this._isEnabled = false;
			this._target.dispatchEvent(new DisableEvent(DisableEvent.DISABLED));
			return true;
		}

		public function enable(key:* = null) : Boolean
		{
			if (this._isEnabled)
				return false;

			if (key == null)
				key = this._target;

			delete this._disableKeys[key];
			for (key in this._disableKeys)
				return false;

			this._isEnabled = true;
			this._target.dispatchEvent(new DisableEvent(DisableEvent.ENABLED));
			return true;
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

		// Private Methods

		private function _target_added(e:Event) : void
		{
			var target:DisplayObject = e.target as DisplayObject;
			if (!target || (target != this._targetDisplayObject))
				return;

			if (this._ancestors)  // should never happen unless duplicate added events are dispatched
				return;

			var ancestors:LinkedList = new LinkedList();

			var parent:DisplayObject = target.parent;
			while (parent && !(parent is Stage))
			{
				ancestors.addFirst(parent);

				if (parent is IDisable)
					break;

				parent = parent.parent;
			}

			var rootAncestor:DisplayObject = ancestors.getFirst();
			if (!rootAncestor)
				return;

			this._ancestors = ancestors;

			rootAncestor.addEventListener(Event.ADDED, this._ancestor_added, false, int.MAX_VALUE);
			rootAncestor.addEventListener(Event.REMOVED, this._ancestor_removed, false, int.MAX_VALUE);

			var rootDisableAncestor:IDisable = rootAncestor as IDisable;
			if (rootDisableAncestor)
			{
				rootDisableAncestor.addEventListener(DisableEvent.DISABLED, this._ancestor_disabled, false, int.MAX_VALUE);
				rootDisableAncestor.addEventListener(DisableEvent.ENABLED, this._ancestor_enabled, false, int.MAX_VALUE);
				if (!rootDisableAncestor.isEnabled)
					this._target.disable(rootDisableAncestor);
			}
		}

		private function _target_removed(e:Event) : void
		{
			var target:DisplayObject = e.target as DisplayObject;
			if (!target || (target != this._targetDisplayObject))
				return;

			var ancestors:LinkedList = this._ancestors;
			if (!ancestors)
				return;

			this._ancestors = null;

			var rootAncestor:DisplayObject = ancestors.getFirst();
			rootAncestor.removeEventListener(Event.ADDED, this._ancestor_added);
			rootAncestor.removeEventListener(Event.REMOVED, this._ancestor_removed);

			var rootDisableAncestor:IDisable = rootAncestor as IDisable;
			if (rootDisableAncestor)
			{
				rootDisableAncestor.removeEventListener(DisableEvent.DISABLED, this._ancestor_disabled);
				rootDisableAncestor.removeEventListener(DisableEvent.ENABLED, this._ancestor_enabled);
				if (!rootDisableAncestor.isEnabled)
					this._target.enable(rootDisableAncestor);
			}
		}

		private function _ancestor_added(e:Event) : void
		{
			var target:DisplayObject = e.target as DisplayObject;
			if (!target)
				return;

			var ancestors:LinkedList = this._ancestors;
			if (!ancestors)
				return;

			var rootAncestor:DisplayObject = ancestors.getFirst();
			if (rootAncestor != target)
				return;

			if (rootAncestor is IDisable)
				return;

			var parent:DisplayObject = rootAncestor.parent;
			while (parent && !(parent is Stage))
			{
				ancestors.addFirst(parent);

				if (parent is IDisable)
					break;

				parent = parent.parent;
			}

			var newRootAncestor:DisplayObject = ancestors.getFirst();
			if (newRootAncestor == rootAncestor)
				return;

			rootAncestor.removeEventListener(Event.ADDED, this._ancestor_added);
			rootAncestor.removeEventListener(Event.REMOVED, this._ancestor_removed);

			newRootAncestor.addEventListener(Event.ADDED, this._ancestor_added, false, int.MAX_VALUE);
			newRootAncestor.addEventListener(Event.REMOVED, this._ancestor_removed, false, int.MAX_VALUE);

			var rootDisableAncestor:IDisable = newRootAncestor as IDisable;
			if (rootDisableAncestor)
			{
				rootDisableAncestor.addEventListener(DisableEvent.DISABLED, this._ancestor_disabled, false, int.MAX_VALUE);
				rootDisableAncestor.addEventListener(DisableEvent.ENABLED, this._ancestor_enabled, false, int.MAX_VALUE);
				if (!rootDisableAncestor.isEnabled)
					this._target.disable(rootDisableAncestor);
			}
		}

		private function _ancestor_removed(e:Event) : void
		{
			var target:DisplayObject = e.target as DisplayObject;
			if (!target)
				return;

			var ancestors:LinkedList = this._ancestors;
			if (!ancestors)
				return;

			if (!ancestors.contains(target))
				return;

			var rootAncestor:DisplayObject = ancestors.getFirst();
			if (rootAncestor == target)
				return;

			var newRootAncestor:DisplayObject = rootAncestor;
			while (newRootAncestor && (newRootAncestor != target))
			{
				ancestors.removeFirst();
				newRootAncestor = ancestors.getFirst();
			}

			if (newRootAncestor)
			{
				newRootAncestor.addEventListener(Event.ADDED, this._ancestor_added, false, int.MAX_VALUE);
				newRootAncestor.addEventListener(Event.REMOVED, this._ancestor_removed, false, int.MAX_VALUE);
			}
			else  // should never happen unless there is some fatal flaw in the ancestors LinkedList
			{
				this._ancestors = null;
			}

			rootAncestor.removeEventListener(Event.ADDED, this._ancestor_added);
			rootAncestor.removeEventListener(Event.REMOVED, this._ancestor_removed);

			var rootDisableAncestor:IDisable = rootAncestor as IDisable;
			if (rootDisableAncestor)
			{
				rootDisableAncestor.removeEventListener(DisableEvent.DISABLED, this._ancestor_disabled);
				rootDisableAncestor.removeEventListener(DisableEvent.ENABLED, this._ancestor_enabled);
				if (!rootDisableAncestor.isEnabled)
					this._target.enable(rootDisableAncestor);
			}
		}

		private function _ancestor_disabled(e:DisableEvent) : void
		{
			var target:IDisable = e.target as IDisable;
			if (!target)
				return;

			this._target.disable(target);
		}

		private function _ancestor_enabled(e:DisableEvent) : void
		{
			var target:IDisable = e.target as IDisable;
			if (!target)
				return;

			this._target.enable(target);
		}

	}

}
