package com.splunk.nodegraph.expressions
{
	
	public /*abstract*/ class AbstractExpression
	{
		
		// Private Properties
		
		private var _minChildren:int;
		private var _maxChildren:int;
		private var _children:Array;
		
		// Constructor
		
		public function AbstractExpression(minChildren:int = 0, maxChildren:int = -1)
		{
			this._minChildren = minChildren;
			this._maxChildren = maxChildren;
			this._children = new Array();
		}
		
		// Public Getters/Setters
		
		public function get minChildren() : int
		{
			return this._minChildren;
		}
		
		public function get maxChildren() : int
		{
			return this._maxChildren;
		}
		
		public function get numChildren() : int
		{
			return this._children.length;
		}
		
		// Public Methods
		
		public function addChild(child:AbstractExpression) : int
		{
			return this.addChildAt(this._children.length, child);
		}
		
		public function addChildAt(index:int, child:AbstractExpression) : int
		{
			if (child == null)
				throw new TypeError("Parameter child must be non-null.");
			if ((index < 0) || (index > this._children.length))
				throw new RangeError("The supplied index is out of bounds.");
			if (this._children.length == this._maxChildren)
			{
				if (this._maxChildren == 0)
					throw new ArgumentError("This expression cannot have any children.");
				else if (this._maxChildren == 1)
					throw new ArgumentError("This expression can have no more than 1 child.");
				else
					throw new ArgumentError("This expression can have no more than " + this._maxChildren + " children.");
			}
			
			this._children.splice(index, 0, child);
			return this._children.length;
		}
		
		public function addChildren(children:Array) : int
		{
			for each (var child:AbstractExpression in children)
				this.addChild(child);
			return this._children.length;
		}
		
		public function removeChild(child:AbstractExpression) : int
		{
			var index:int = this.indexOf(child);
			if (index >= 0)
				this.removeChildAt(index);
			return index;
		}
		
		public function removeChildAt(index:int) : AbstractExpression
		{
			if ((index < 0) || (index >= this._children.length))
				throw new RangeError("The supplied index is out of bounds.");
			
			var child:AbstractExpression = this._children[index];
			this._children.splice(index, 1);
			return child;
		}
		
		public function removeChildren() : Array
		{
			var children:Array = this._children;
			this._children = new Array();
			return children;
		}
		
		public function getChildAt(index:int) : AbstractExpression
		{
			if ((index < 0) || (index >= this._children.length))
				throw new RangeError("The supplied index is out of bounds.");
			
			return this._children[index];
		}
		
		public function getChildren() : Array
		{
			return this._children.concat();
		}
		
		public function setChildAt(index:int, child:AbstractExpression) : AbstractExpression
		{
			if ((index < 0) || (index >= this._children.length))
				throw new RangeError("The supplied index is out of bounds.");
			if (child == null)
				throw new TypeError("Parameter child must be non-null.");
			
			var oldChild:AbstractExpression = this._children[index];
			this._children[index] = child;
			return oldChild;
		}
		
		public function setChildren(children:Array) : Array
		{
			var oldChildren:Array = this.removeChildren();
			this.addChildren(children);
			return oldChildren;
		}
		
		public function indexOf(child:AbstractExpression) : int
		{
			if (child == null)
				throw new TypeError("Parameter child must be non-null.");
			
			return this._children.indexOf(child);
		}
		
		public function lastIndexOf(child:AbstractExpression) : int
		{
			if (child == null)
				throw new TypeError("Parameter child must be non-null.");
			
			return this._children.lastIndexOf(child);
		}
		
		public function contains(child:AbstractExpression) : Boolean
		{
			if (child == null)
				throw new TypeError("Parameter child must be non-null.");
			
			return (this._children.indexOf(child) >= 0);
		}
		
		public function eval(o:Object) : *
		{
			if (this._children.length < this._minChildren)
			{
				if (this._minChildren == this._maxChildren)
					throw new Error("This expression must have " + this._minChildren + " children.");
				else
					throw new Error("This expression must have at least " + this._minChildren + " children.");
			}
			
			return this.evalChildren(this.getChildren(), o);
		}
		
		public function toString() : String
		{
			if (this._children.length < this._minChildren)
				return "";
			
			return this.toStringChildren(this.getChildren());
		}
		
		// Protected Methods
		
		protected function safeAddChildren(...rest) : int
		{
			var children:Array = rest;
			
			var lastIndex:int = 0;
			for (var i:int = children.length - 1; i >= 0; i--)
			{
				if (children[i] != null)
				{
					lastIndex = i + 1;
					break;
				}
			}
			
			return this.addChildren(children.slice(0, lastIndex));
		}
		
		protected /*abstract*/ function evalChildren(children:Array, o:Object) : *
		{
			throw new Error("Must implement abstract method evalChildren().");
		}
		
		protected /*abstract*/ function toStringChildren(children:Array) : String
		{
			throw new Error("Must implement abstract method toStringChildren().");
		}
		
	}
	
}
