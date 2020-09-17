package com.splunk.utils
{

	import flash.utils.Dictionary;

	public class LRUReplacementPolicy implements IReplacementPolicy
	{

		// Private Properties

		private var _lruMap:Dictionary;
		private var _lruListHead:LRUNode;
		private var _lruListTail:LRUNode;

		// Constructor

		public function LRUReplacementPolicy()
		{
			this._lruMap = new Dictionary();
		}

		// Public Methods

		public function add(key:*) : void
		{
			if (key == null)
				throw new TypeError("Parameter key must be non-null.");

			var lruNode:LRUNode = this._lruMap[key];
			if (lruNode)
			{
				this.hit(key);
				return;
			}

			lruNode = this._lruMap[key] = new LRUNode(key);

			if (this._lruListHead)
			{
				lruNode.nextNode = this._lruListHead;
				this._lruListHead.prevNode = lruNode;
				this._lruListHead = lruNode;
			}
			else
			{
				this._lruListHead = this._lruListTail = lruNode;
			}
		}

		public function remove(key:*) : void
		{
			if (key == null)
				throw new TypeError("Parameter key must be non-null.");

			var lruNode:LRUNode = this._lruMap[key];
			if (!lruNode)
				return;

			if (lruNode.prevNode)
				lruNode.prevNode.nextNode = lruNode.nextNode;
			else
				this._lruListHead = lruNode.nextNode;

			if (lruNode.nextNode)
				lruNode.nextNode.prevNode = lruNode.prevNode;
			else
				this._lruListTail = lruNode.prevNode;

			delete this._lruMap[key];
		}

		public function hit(key:*) : void
		{
			if (key == null)
				throw new TypeError("Parameter key must be non-null.");

			var lruNode:LRUNode = this._lruMap[key];
			if (!lruNode || (lruNode == this._lruListHead))
				return;

			if (lruNode == this._lruListTail)
			{
				this._lruListTail = lruNode.prevNode;
				this._lruListTail.nextNode = null;
			}
			else
			{
				lruNode.prevNode.nextNode = lruNode.nextNode;
				lruNode.nextNode.prevNode = lruNode.prevNode;
			}

			lruNode.prevNode = null;
			lruNode.nextNode = this._lruListHead;
			this._lruListHead.prevNode = lruNode;
			this._lruListHead = lruNode;
		}

		public function getStale() : *
		{
			var lruNode:LRUNode = this._lruListTail;
			if (!lruNode)
				return null;

			return lruNode.key;
		}

	}

}

class LRUNode
{

	// Public Properties

	public var key:*;
	public var prevNode:LRUNode;
	public var nextNode:LRUNode;

	// Constructor

	public function LRUNode(key:*)
	{
		this.key = key;
	}

}
