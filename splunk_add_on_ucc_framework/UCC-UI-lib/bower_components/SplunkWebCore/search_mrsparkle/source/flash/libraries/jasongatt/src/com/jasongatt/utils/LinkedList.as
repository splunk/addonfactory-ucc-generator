package com.jasongatt.utils
{

	import flash.utils.Dictionary;

	public class LinkedList
	{

		// Private Properties

		private var _length:int = 0;

		private var _nodeMap:Dictionary;
		private var _head:ListNode;
		private var _tail:ListNode;

		// Constructor

		public function LinkedList()
		{
			this._nodeMap = new Dictionary();
		}

		// Public Getters/Setters

		public function get length() : int
		{
			return this._length;
		}

		// Public Methods

		public function addFirst(value:*) : void
		{
			if (value == null)
				throw new TypeError("Parameter value must be non-null.");

			var node:ListNode = this._nodeMap[value];
			if (!node)
			{
				node = this._nodeMap[value] = new ListNode(value);
				this._length++;
				this._addBefore(node, this._head);
			}
			else if (node != this._head)
			{
				this._remove(node);
				this._addBefore(node, this._head);
			}
		}

		public function addLast(value:*) : void
		{
			if (value == null)
				throw new TypeError("Parameter value must be non-null.");

			var node:ListNode = this._nodeMap[value];
			if (!node)
			{
				node = this._nodeMap[value] = new ListNode(value);
				this._length++;
				this._addAfter(node, this._tail);
			}
			else if (node != this._tail)
			{
				this._remove(node);
				this._addAfter(node, this._tail);
			}
		}

		public function addBefore(value:*, nextValue:*) : void
		{
			if (value == null)
				throw new TypeError("Parameter value must be non-null.");
			if (nextValue == null)
				throw new TypeError("Parameter nextValue must be non-null.");

			var nextNode:ListNode = this._nodeMap[nextValue];
			if (!nextNode)
				throw new ArgumentError("The supplied nextValue must be contained in this list.");

			var node:ListNode = this._nodeMap[value];
			if (!node)
			{
				node = this._nodeMap[value] = new ListNode(value);
				this._length++;
				this._addBefore(node, nextNode);
			}
			else if (node != nextNode)
			{
				this._remove(node);
				this._addBefore(node, nextNode);
			}
		}

		public function addAfter(value:*, previousValue:*) : void
		{
			if (value == null)
				throw new TypeError("Parameter value must be non-null.");
			if (previousValue == null)
				throw new TypeError("Parameter previousValue must be non-null.");

			var previousNode:ListNode = this._nodeMap[previousValue];
			if (!previousNode)
				throw new ArgumentError("The supplied previousValue must be contained in this list.");

			var node:ListNode = this._nodeMap[value];
			if (!node)
			{
				node = this._nodeMap[value] = new ListNode(value);
				this._length++;
				this._addAfter(node, previousNode);
			}
			else if (node != previousNode)
			{
				this._remove(node);
				this._addAfter(node, previousNode);
			}
		}

		public function remove(value:*) : void
		{
			if (value == null)
				throw new TypeError("Parameter value must be non-null.");

			var node:ListNode = this._nodeMap[value];
			if (!node)
				return;

			delete this._nodeMap[value];
			this._length--;
			this._remove(node);
		}

		public function removeFirst() : *
		{
			var node:ListNode = this._head;
			if (!node)
				return;

			delete this._nodeMap[node.value];
			this._length--;
			this._remove(node);

			return node.value;
		}

		public function removeLast() : *
		{
			var node:ListNode = this._tail;
			if (!node)
				return;

			delete this._nodeMap[node.value];
			this._length--;
			this._remove(node);

			return node.value;
		}

		public function removePrevious(value:*) : *
		{
			if (value == null)
				throw new TypeError("Parameter value must be non-null.");

			var node:ListNode = this._nodeMap[value];
			if (!node)
				return null;

			node = node.prevNode;
			if (!node)
				return null;

			delete this._nodeMap[node.value];
			this._length--;
			this._remove(node);

			return node.value;
		}

		public function removeNext(value:*) : *
		{
			if (value == null)
				throw new TypeError("Parameter value must be non-null.");

			var node:ListNode = this._nodeMap[value];
			if (!node)
				return null;

			node = node.nextNode;
			if (!node)
				return null;

			delete this._nodeMap[node.value];
			this._length--;
			this._remove(node);

			return node.value;
		}

		public function getFirst() : *
		{
			var node:ListNode = this._head;
			return node ? node.value : null;
		}

		public function getLast() : *
		{
			var node:ListNode = this._tail;
			return node ? node.value : null;
		}

		public function getPrevious(value:*) : *
		{
			if (value == null)
				throw new TypeError("Parameter value must be non-null.");

			var node:ListNode = this._nodeMap[value];
			if (!node)
				return null;

			node = node.prevNode;
			if (!node)
				return null;

			return node.value;
		}

		public function getNext(value:*) : *
		{
			if (value == null)
				throw new TypeError("Parameter value must be non-null.");

			var node:ListNode = this._nodeMap[value];
			if (!node)
				return null;

			node = node.nextNode;
			if (!node)
				return null;

			return node.value;
		}

		public function contains(value:*) : Boolean
		{
			if (value == null)
				throw new TypeError("Parameter value must be non-null.");

			return (this._nodeMap[value] != null);
		}

		public function toArray() : Array
		{
			var length:int = this._length;
			var a:Array = new Array(length);
			for (var i:int = 0, node:ListNode = this._head; i < length; i++, node = node.nextNode)
				a[i] = node.value;
			return a;
		}

		public function toString() : String
		{
			var a:Array = this.toArray();
			return a.toString();
		}

		// Private Methods

		private function _addBefore(node:ListNode, nextNode:ListNode) : void
		{
			if (!nextNode)
			{
				this._head = this._tail = node;
			}
			else if (nextNode == this._head)
			{
				node.nextNode = nextNode;
				nextNode.prevNode = node;
				this._head = node;
			}
			else
			{
				node.prevNode = nextNode.prevNode;
				node.nextNode = nextNode;
				nextNode.prevNode.nextNode = node;
				nextNode.prevNode = node;
			}
		}

		private function _addAfter(node:ListNode, prevNode:ListNode) : void
		{
			if (!prevNode)
			{
				this._head = this._tail = node;
			}
			else if (prevNode == this._tail)
			{
				node.prevNode = prevNode;
				prevNode.nextNode = node;
				this._tail = node;
			}
			else
			{
				node.nextNode = prevNode.nextNode;
				node.prevNode = prevNode;
				prevNode.nextNode.prevNode = node;
				prevNode.nextNode = node;
			}
		}

		private function _remove(node:ListNode) : void
		{
			if (node.prevNode)
				node.prevNode.nextNode = node.nextNode;
			else
				this._head = node.nextNode;

			if (node.nextNode)
				node.nextNode.prevNode = node.prevNode;
			else
				this._tail = node.prevNode;

			node.prevNode = node.nextNode = null;
		}

	}

}

class ListNode
{

	// Public Properties

	public var value:*;
	public var prevNode:ListNode;
	public var nextNode:ListNode;

	// Constructor

	public function ListNode(value:*)
	{
		this.value = value;
	}

}
