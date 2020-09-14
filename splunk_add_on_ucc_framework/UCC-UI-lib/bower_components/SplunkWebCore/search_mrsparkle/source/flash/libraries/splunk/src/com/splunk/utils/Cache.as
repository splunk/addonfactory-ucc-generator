package com.splunk.utils
{

	import flash.utils.Dictionary;

	public class Cache
	{

		// Private Properties

		private var _size:int;
		private var _replacementPolicy:IReplacementPolicy;

		private var _entryMap:Dictionary;
		private var _numEntries:int = 0;

		// Constructor

		public function Cache(size:int = 100, replacementPolicy:IReplacementPolicy = null)
		{
			if (size < 0)
				throw new RangeError("Parameter size must be non-negative.");

			this._size = size;
			this._replacementPolicy = replacementPolicy ? replacementPolicy : new LRUReplacementPolicy();

			this._entryMap = new Dictionary();
		}

		// Public Getters/Setters

		public function get size() : int
		{
			return this._size;
		}
		public function set size(value:int) : void
		{
			if (value < 0)
				throw new RangeError("Parameter size must be non-negative.");
			this._size = value;
			this._runReplacementPolicy();
		}

		public function get replacementPolicy() : IReplacementPolicy
		{
			return this._replacementPolicy;
		}

		// Public Methods

		public function contains(key:*) : Boolean
		{
			if (key == null)
				throw new TypeError("Parameter key must be non-null.");

			return (this._entryMap[key] != null);
		}

		public function getEntry(key:*) : *
		{
			if (key == null)
				throw new TypeError("Parameter key must be non-null.");

			var entry:Entry = this._entryMap[key];
			if (!entry)
				throw new ArgumentError("This cache does not contain an entry for the supplied key.");

			this._replacementPolicy.hit(key);

			return entry.value;
		}

		public function setEntry(key:*, value:*) : void
		{
			if (key == null)
				throw new TypeError("Parameter key must be non-null.");

			var entry:Entry = this._entryMap[key];
			if (!entry)
			{
				entry = this._entryMap[key] = new Entry(key, value);
				this._numEntries++;

				this._replacementPolicy.add(key);

				this._runReplacementPolicy();
			}
			else
			{
				entry.value = value;

				this._replacementPolicy.hit(key);
			}
		}

		public function clearEntry(key:*) : void
		{
			if (key == null)
				throw new TypeError("Parameter key must be non-null.");

			var entry:Entry = this._entryMap[key];
			if (!entry)
				return;

			delete this._entryMap[key];
			this._numEntries--;

			this._replacementPolicy.remove(key);
		}

		public function clearAll() : void
		{
			var replacementPolicy:IReplacementPolicy = this._replacementPolicy;
			for each (var entry:Entry in this._entryMap)
				replacementPolicy.remove(entry.key);
			this._entryMap = new Dictionary();
			this._numEntries = 0;
		}

		// Private Methods

		private function _runReplacementPolicy() : void
		{
			var replacementPolicy:IReplacementPolicy = this._replacementPolicy;
			var size:int = this._size;
			var entryMap:Dictionary = this._entryMap;
			var key:*;

			while (this._numEntries > size)
			{
				key = replacementPolicy.getStale();
				if ((key == null) || !entryMap[key])
					throw new Error("ReplacementPolicy synchronization error. The replacement policy for this cache was modified outside this cache. Another cache instance may be using the same replacement policy instance.");

				delete entryMap[key];
				this._numEntries--;

				replacementPolicy.remove(key);
			}
		}

	}

}

class Entry
{

	// Public Properties

	public var key:*;
	public var value:*;

	// Constructor

	public function Entry(key:*, value:*)
	{
		this.key = key;
		this.value = value;
	}

}
