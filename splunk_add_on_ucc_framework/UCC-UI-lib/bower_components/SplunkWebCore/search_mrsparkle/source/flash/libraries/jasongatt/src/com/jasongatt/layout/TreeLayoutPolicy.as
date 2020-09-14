package com.jasongatt.layout
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.ValidatePass;
	import flash.display.DisplayObject;
	import flash.geom.Rectangle;
	import flash.utils.Dictionary;

	public class TreeLayoutPolicy extends AbstractLayoutPolicy
	{

		// Private Properties

		private var _breadthSpacing:ObservableProperty;
		private var _depthSpacing:ObservableProperty;

		private var _parentMap:Dictionary;
		private var _treeMap:Dictionary;

		// Constructor

		public function TreeLayoutPolicy()
		{
			this._breadthSpacing = new ObservableProperty(this, "breadthSpacing", Number, 10);
			this._depthSpacing = new ObservableProperty(this, "depthSpacing", Number, 10);

			this._parentMap = new Dictionary();
			this._treeMap = new Dictionary(true);
		}

		// Public Getters/Setters

		public function get breadthSpacing() : Number
		{
			return this._breadthSpacing.value;
		}
		public function set breadthSpacing(value:Number) : void
		{
			this._breadthSpacing.value = value;
		}

		public function get depthSpacing() : Number
		{
			return this._depthSpacing.value;
		}
		public function set depthSpacing(value:Number) : void
		{
			this._depthSpacing.value = value;
		}

		// Public Methods

		public function getParent(child:LayoutSprite) : LayoutSprite
		{
			if (!child)
				throw new TypeError("Parameter child must be non-null.");

			var parent:LayoutSprite = this._parentMap[child];
			return parent ? parent : null;
		}

		public function setParent(child:LayoutSprite, parent:LayoutSprite) : void
		{
			if (!child)
				throw new TypeError("Parameter child must be non-null.");

			if (!parent)
			{
				if (!this._parentMap[child])
					return;

				delete this._parentMap[child];
			}
			else
			{
				if (this._parentMap[child] == parent)
					return;

				this._parentMap[child] = parent;
			}

			this.dispatchEvent(new ChangedEvent(ChangedEvent.CHANGED, false, false, this));
		}

		public override function measure(parent:LayoutSprite, availableSize:Size) : Size
		{
			var tree:TreeNode = this._treeMap[parent] = new TreeNode();

			var numChildren:Number = parent.numChildren;
			var child:LayoutSprite;
			var node:TreeNode;
			var nodeList:Array = new Array();
			var nodeMap:Dictionary = new Dictionary();
			var i:int;
			var parentMap:Dictionary = this._parentMap;
			var parentSprite:LayoutSprite;
			var parentNode:TreeNode;

			for (i = 0; i < numChildren; i++)
			{
				child = parent.getChildAt(i) as LayoutSprite;
				if (child)
				{
					node = new TreeNode(child);
					nodeList.push(node);
					nodeMap[child] = node;
				}
			}

			for each (node in nodeList)
			{
				parentSprite = parentMap[node.sprite];
				if (parentSprite && parent.contains(parentSprite))
				{
					parentNode = nodeMap[parentSprite];
					parentNode.children.push(node);
				}
				else
				{
					tree.children.push(node);
				}
			}

			tree.measure(this._breadthSpacing.value, this._depthSpacing.value);
			return tree.measuredSize.clone();
		}

		public override function layout(parent:LayoutSprite, layoutSize:Size) : Size
		{
			var tree:TreeNode = this._treeMap[parent];
			if (tree)
			{
				tree.layout(new Rectangle(0, 0, layoutSize.width, layoutSize.height));

				//delete this._treeMap[parent];
			}

			return layoutSize;
		}

		public override function onChildAdded(parent:LayoutSprite, child:DisplayObject) : void
		{
			parent.invalidate(LayoutSprite.MEASURE);
		}

		public override function onChildRemoved(parent:LayoutSprite, child:DisplayObject) : void
		{
			parent.invalidate(LayoutSprite.MEASURE);
		}

		public override function onChildOrderChanged(parent:LayoutSprite) : void
		{
			parent.invalidate(LayoutSprite.LAYOUT);
		}

		public override function onChildInvalidated(parent:LayoutSprite, child:DisplayObject, pass:ValidatePass) : void
		{
			switch (pass)
			{
				case LayoutSprite.MEASURE:
					parent.invalidate(LayoutSprite.MEASURE);
					break;
			}
		}

	}

}

import com.jasongatt.layout.LayoutSprite;
import com.jasongatt.layout.Size;
import flash.geom.Rectangle;

class TreeNode
{

	// Public Properties

	public var sprite:LayoutSprite;
	public var children:Array;
	public var measuredSize:Size;
	public var breadthSpacing:Number;
	public var depthSpacing:Number;

	// Constructor

	public function TreeNode(sprite:LayoutSprite = null)
	{
		this.sprite = sprite;
		this.children = new Array();
		this.measuredSize = new Size();
	}

	// Public Methods

	public function measure(breadthSpacing:Number, depthSpacing:Number) : void
	{
		var size:Size = new Size();

		var sprite:LayoutSprite = this.sprite;
		if (sprite)
		{
			sprite.measure(new Size(Infinity, Infinity));

			size.width = sprite.measuredWidth;
			size.height = sprite.measuredHeight;
		}

		var children:Array = this.children;
		var numChildren:int = children.length;
		if (numChildren > 0)
		{
			if (sprite)
				size.height += depthSpacing;

			var childrenSize:Size = new Size();
			var child:TreeNode;
			var i:int;
			for (i = 0; i < numChildren; i++)
			{
				child = children[i];

				if (i > 0)
					childrenSize.width += breadthSpacing;

				child.measure(breadthSpacing, depthSpacing);

				childrenSize.width += child.measuredSize.width;
				childrenSize.height = Math.max(child.measuredSize.height, childrenSize.height);
			}

			size.width = Math.max(size.width, childrenSize.width);
			size.height += childrenSize.height;
		}

		this.measuredSize = size;
		this.breadthSpacing = breadthSpacing;
		this.depthSpacing = depthSpacing;
	}

	public function layout(layoutBounds:Rectangle) : void
	{
		var childBounds:Rectangle = layoutBounds.clone();

		var sprite:LayoutSprite = this.sprite;
		if (sprite)
		{
			var spriteBounds:Rectangle = new Rectangle(layoutBounds.x, layoutBounds.y, sprite.measuredWidth, sprite.measuredHeight);
			spriteBounds.x += (layoutBounds.width - spriteBounds.width) / 2;
			sprite.layout(spriteBounds);

			childBounds.y += spriteBounds.height + this.depthSpacing;
		}

		var breadthSpacing:Number = this.breadthSpacing;
		for each (var child:TreeNode in this.children)
		{
			childBounds.width = child.measuredSize.width;
			childBounds.height = child.measuredSize.height;
			child.layout(childBounds);
			childBounds.x += childBounds.width + breadthSpacing;
		}
	}

}
