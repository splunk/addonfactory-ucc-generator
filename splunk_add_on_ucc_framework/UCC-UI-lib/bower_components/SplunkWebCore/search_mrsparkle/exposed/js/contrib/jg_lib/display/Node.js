/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("../Class");
	var MPassTarget = require("../async/MPassTarget");
	var Pass = require("../async/Pass");
	var MEventTarget = require("../events/MEventTarget");
	var MListenerTarget = require("../events/MListenerTarget");
	var MObservableTarget = require("../events/MObservableTarget");
	var ArrayProperty = require("../properties/ArrayProperty");
	var MPropertyTarget = require("../properties/MPropertyTarget");
	var ObservableEnumProperty = require("../properties/ObservableEnumProperty");
	var ObservableProperty = require("../properties/ObservableProperty");
	var ArrayUtil = require("../utils/ArrayUtil");

	return Class(module.id, Object, function(Node, base)
	{

		Class.mixin(this, MEventTarget, MListenerTarget, MObservableTarget, MPropertyTarget, MPassTarget);

		// Public Properties

		this.visibility = new ObservableEnumProperty("visibility", String, [ "visible", "hidden", "collapsed" ])
			.setter(function(value)
			{
				this._setVisibility(value);
			});

		this.enabled = new ObservableProperty("enabled", Boolean, true)
			.setter(function(value)
			{
				this._setEnabled(value);
			});

		this.children = new ArrayProperty("children", Node)
			.getter(function()
			{
				return this.getChildren();
			})
			.setter(function(value)
			{
				var i, l;
				for (i = 0, l = value.length; i < l; i++)
					this.addChildAt(value[i], i);
				for (i = this.numChildren() - 1; i >= l; i--)
					this.removeChildAt(i);
			});

		this.contentProperty = "children";

		// Private Properties

		this._parent = null;
		this._parentInternal = null;
		this._parentChanging = false;
		this._document = null;
		this._documentInternal = null;
		this._documentChanging = false;
		this._visibility = "visible";
		this._visibilityInherited = "visible";
		this._visibilityChanging = false;
		this._enabled = true;
		this._enabledInherited = true;
		this._enabledChanging = false;
		this._children = null;

		// Constructor

		this.constructor = function()
		{
			this._children = [];
		};

		// Public Accessor Methods

		this.parent = function()
		{
			return this._parent;
		};

		this.document = function()
		{
			return this._document;
		};

		this.numChildren = function()
		{
			return this._children.length;
		};

		this.inFlow = function()
		{
			return ((this._documentInternal != null) && (this._visibility !== "collapsed") && (this._visibilityInherited !== "collapsed"));
		};

		this.isVisible = function()
		{
			return ((this._visibility === "visible") && (this._visibilityInherited === "visible"));
		};

		this.isEnabled = function()
		{
			return (this._enabled && this._enabledInherited);
		};

		// Public Methods

		this.invalidate = function(pass)
		{
			pass = Pass.resolve(this, pass);

			if (pass.isValid(this))
			{
				pass.invalidate(this);

				this.onInvalidated(pass);

				var parent = this._parent;
				if (parent)
					parent.onChildInvalidated(this, pass);
			}

			return this;
		};

		this.remove = function(dispose)
		{
			var parent = this._parent;
			if (parent)
			{
				parent.removeChild(this, dispose);
				return this;
			}

			if (dispose !== false)
				this.dispose();

			return this;
		};

		this.dispose = function()
		{
			this.listenOff();
			this.off();
			this.markValid();

			var children = this._children.concat();
			var child;
			for (var i = children.length - 1; i >= 0; i--)
			{
				child = children[i];
				if (child._parentInternal === this)
					child.dispose();
			}
		};

		this.addChild = function(child)
		{
			if (child == null)
				throw new Error("Parameter child must be non-null.");
			if (!(child instanceof Node))
				throw new Error("Parameter child must be of type " + Class.getName(Node) + ".");
			if (child._parentChanging || child._documentChanging)
				throw new Error("Recursive display list modification.");

			var hasChild = (child._parent === this);
			if (!hasChild && (child._parent || child._document))
				child.remove(false);

			var children = this._children;

			if (hasChild)
			{
				var newIndex = children.length - 1;
				if (newIndex < 0)
					throw new Error("Display list corrupted.");

				if (children[newIndex] === child)
					return this;

				var oldIndex = ArrayUtil.indexOf(children, child);
				if (oldIndex < 0)
					throw new Error("Display list corrupted.");

				try
				{
					children.splice(oldIndex, 1);
					this.reorderChildOverride(child, oldIndex, newIndex, children);
				}
				catch (e)
				{
					children.splice(oldIndex, 0, child);
					throw e;
				}

				children.push(child);

				this.onChildReordered(child, oldIndex, newIndex);

				return this;
			}

			var index = children.length;

			this.addChildOverride(child, index, children);

			children.push(child);

			child._setParent(this);

			var document = this._documentInternal;
			if (document)
				child._setDocument(document);

			return this;
		};

		this.addChildAt = function(child, index)
		{
			var children = this._children;
			if (child == null)
				throw new Error("Parameter child must be non-null.");
			if (!(child instanceof Node))
				throw new Error("Parameter child must be of type " + Class.getName(Node) + ".");
			if (index == null)
				throw new Error("Parameter index must be non-null.");
			if (!Class.isNumber(index))
				throw new Error("Parameter index must be of type Number.");
			if (!((index >= 0) && (index <= children.length)))
				throw new Error("Parameter index is out of bounds.");
			if (child._parentChanging || child._documentChanging)
				throw new Error("Recursive display list modification.");

			index = Math.floor(index);

			var hasChild = (child._parent === this);
			if (!hasChild && (child._parent || child._document))
				child.remove(false);

			if (hasChild)
			{
				index = Math.min(index, children.length - 1);
				if (index < 0)
					throw new Error("Display list corrupted.");

				if (children[index] === child)
					return this;

				var oldIndex = ArrayUtil.indexOf(children, child);
				if (oldIndex < 0)
					throw new Error("Display list corrupted.");

				try
				{
					children.splice(oldIndex, 1);
					this.reorderChildOverride(child, oldIndex, index, children);
				}
				catch (e)
				{
					children.splice(oldIndex, 0, child);
					throw e;
				}

				if (index < children.length)
					children.splice(index, 0, child);
				else
					children.push(child);

				this.onChildReordered(child, oldIndex, index);

				return this;
			}

			index = Math.min(index, children.length);

			this.addChildOverride(child, index, children);

			if (index < children.length)
				children.splice(index, 0, child);
			else
				children.push(child);

			child._setParent(this);

			var document = this._documentInternal;
			if (document)
				child._setDocument(document);

			return this;
		};

		this.removeChild = function(child, dispose)
		{
			if (child == null)
				throw new Error("Parameter child must be non-null.");
			if (!(child instanceof Node))
				throw new Error("Parameter child must be of type " + Class.getName(Node) + ".");
			if (child._parent !== this)
				throw new Error("Parameter child must be a child of this node.");
			if (child._parentChanging || child._documentChanging)
				throw new Error("Recursive display list modification.");

			child._setDocument(null);
			child._setParent(null);

			var children = this._children;
			var index = ArrayUtil.indexOf(children, child);
			if (index < 0)
				throw new Error("Display list corrupted.");

			children.splice(index, 1);

			this.removeChildOverride(child, index, children);

			if (dispose !== false)
				child.dispose();

			return this;
		};

		this.removeChildAt = function(index, dispose)
		{
			var children = this._children;
			if (index == null)
				throw new Error("Parameter index must be non-null.");
			if (!Class.isNumber(index))
				throw new Error("Parameter index must be of type Number.");
			if (!((index >= 0) && (index < children.length)))
				throw new Error("Parameter index is out of bounds.");

			index = Math.floor(index);

			var child = children[index];
			if (child._parentChanging || child._documentChanging)
				throw new Error("Recursive display list modification.");

			child._setDocument(null);
			child._setParent(null);

			if ((index >= children.length) || (children[index] !== child))
			{
				index = ArrayUtil.indexOf(children, child);
				if (index < 0)
					throw new Error("Display list corrupted.");
			}

			children.splice(index, 1);

			this.removeChildOverride(child, index, children);

			if (dispose !== false)
				child.dispose();

			return this;
		};

		this.hasChild = function(child)
		{
			if (child == null)
				throw new Error("Parameter child must be non-null.");
			if (!(child instanceof Node))
				throw new Error("Parameter child must be of type " + Class.getName(Node) + ".");

			return (child._parent === this);
		};

		this.setChildIndex = function(child, index)
		{
			var children = this._children;
			if (child == null)
				throw new Error("Parameter child must be non-null.");
			if (!(child instanceof Node))
				throw new Error("Parameter child must be of type " + Class.getName(Node) + ".");
			if (child._parent !== this)
				throw new Error("Parameter child must be a child of this node.");
			if (index == null)
				throw new Error("Parameter index must be non-null.");
			if (!Class.isNumber(index))
				throw new Error("Parameter index must be of type Number.");
			if (!((index >= 0) && (index < children.length)))
				throw new Error("Parameter index is out of bounds.");

			index = Math.floor(index);

			if (children[index] === child)
				return this;

			var oldIndex = ArrayUtil.indexOf(children, child);
			if (oldIndex < 0)
				throw new Error("Display list corrupted.");

			try
			{
				children.splice(oldIndex, 1);
				this.reorderChildOverride(child, oldIndex, index, children);
			}
			catch (e)
			{
				children.splice(oldIndex, 0, child);
				throw e;
			}

			if (index < children.length)
				children.splice(index, 0, child);
			else
				children.push(child);

			this.onChildReordered(child, oldIndex, index);

			return this;
		};

		this.getChildIndex = function(child)
		{
			if (child == null)
				throw new Error("Parameter child must be non-null.");
			if (!(child instanceof Node))
				throw new Error("Parameter child must be of type " + Class.getName(Node) + ".");

			return ArrayUtil.indexOf(this._children, child);
		};

		this.getChildAt = function(index)
		{
			var children = this._children;
			if (index == null)
				throw new Error("Parameter index must be non-null.");
			if (!Class.isNumber(index))
				throw new Error("Parameter index must be of type Number.");
			if (!((index >= 0) && (index < children.length)))
				throw new Error("Parameter index is out of bounds.");

			return children[Math.floor(index)];
		};

		this.getChildren = function()
		{
			return this._children.concat();
		};

		this.getBubbleTarget = function()
		{
			return this._parent;
		};

		this.getValidateDepth = function()
		{
			var parent = this._parent;
			return parent ? (parent.getValidateDepth() + 1) : 0;
		};

		// Protected Methods

		this.setVisibilityOverride = function(visibility)
		{
		};

		this.setEnabledOverride = function(enabled)
		{
		};

		this.addChildOverride = function(child, index, siblings)
		{
		};

		this.removeChildOverride = function(child, index, siblings)
		{
		};

		this.reorderChildOverride = function(child, oldIndex, newIndex, siblings)
		{
		};

		this.onAdded = function(parent)
		{
		};

		this.onRemoved = function(parent)
		{
		};

		this.onAddedToDocument = function(document)
		{
		};

		this.onRemovedFromDocument = function(document)
		{
		};

		this.onAddedToFlow = function()
		{
		};

		this.onRemovedFromFlow = function()
		{
		};

		this.onVisible = function()
		{
		};

		this.onHidden = function()
		{
		};

		this.onEnabled = function()
		{
		};

		this.onDisabled = function()
		{
		};

		this.onInvalidated = function(pass)
		{
		};

		this.onChildAdded = function(child)
		{
		};

		this.onChildRemoved = function(child)
		{
		};

		this.onChildReordered = function(child, oldIndex, newIndex)
		{
		};

		this.onChildInvalidated = function(child, pass)
		{
		};

		// Private Methods

		this._setParent = function(parent)
		{
			if (this._parentChanging || this._documentChanging)
				throw new Error("Recursive display list modification.");

			var oldValue = this._parentInternal;
			var newValue = parent || null;

			if ((oldValue && newValue) || (!oldValue && !newValue))
				return;

			this._parentInternal = newValue;

			try
			{
				this._parentChanging = true;

				if (newValue)
				{
					this._parent = newValue;

					if ((newValue._visibility === "collapsed") || (newValue._visibilityInherited === "collapsed"))
						this._setVisibility("collapsed", true);
					else if ((newValue._visibility === "hidden") || (newValue._visibilityInherited === "hidden"))
						this._setVisibility("hidden", true);

					if (!newValue._enabled || !newValue._enabledInherited)
						this._setEnabled(false, true);

					this.onAdded(newValue);
					newValue.onChildAdded(this);
				}
				else
				{
					oldValue.onChildRemoved(this);
					this.onRemoved(oldValue);

					this._setEnabled(true, true);
					this._setVisibility("visible", true);

					this._parent = newValue;
				}
			}
			finally
			{
				if (this._parent !== newValue)
					this._parentInternal = oldValue;

				this._parentChanging = false;
			}
		};

		this._setDocument = function(document)
		{
			if (this._parentChanging || this._documentChanging)
				throw new Error("Recursive display list modification.");

			var oldValue = this._documentInternal;
			var newValue = document || null;

			if ((oldValue && newValue) || (!oldValue && !newValue))
				return;

			this._documentInternal = newValue;

			try
			{
				this._documentChanging = true;

				var children = this._children.concat();
				var child;
				var i, l;

				if (newValue)
				{
					this._document = newValue;

					for (i = 0, l = children.length; i < l; i++)
					{
						child = children[i];
						if (child._parentInternal === this)
							child._setDocument(newValue);
					}

					this.onAddedToDocument(newValue);

					if ((this._visibility !== "collapsed") && (this._visibilityInherited !== "collapsed"))
						this.onAddedToFlow();
				}
				else
				{
					if ((this._visibility !== "collapsed") && (this._visibilityInherited !== "collapsed"))
						this.onRemovedFromFlow();

					this.onRemovedFromDocument(oldValue);

					for (i = children.length - 1; i >= 0; i--)
					{
						child = children[i];
						if (child._parentInternal === this)
							child._setDocument(newValue);
					}

					this._document = newValue;
				}
			}
			finally
			{
				if (this._document !== newValue)
					this._documentInternal = oldValue;

				this._documentChanging = false;
			}
		};

		this._setVisibility = function(visibility, isInherited)
		{
			if (this._visibilityChanging)
				throw new Error("Recursive visibility modification.");

			var oldValue;
			if ((this._visibility === "collapsed") || (this._visibilityInherited === "collapsed"))
				oldValue = "collapsed";
			else if ((this._visibility === "hidden") || (this._visibilityInherited === "hidden"))
				oldValue = "hidden";
			else
				oldValue = "visible";

			if (isInherited === true)
				this._visibilityInherited = visibility;
			else
				this._visibility = visibility;

			var newValue;
			if ((this._visibility === "collapsed") || (this._visibilityInherited === "collapsed"))
				newValue = "collapsed";
			else if ((this._visibility === "hidden") || (this._visibilityInherited === "hidden"))
				newValue = "hidden";
			else
				newValue = "visible";

			if (oldValue === newValue)
				return;

			try
			{
				this._visibilityChanging = true;

				var children = this._children.concat();
				var child;
				var i, l;

				if ((newValue === "visible") || (oldValue === "collapsed"))
				{
					this.setVisibilityOverride(newValue);

					for (i = 0, l = children.length; i < l; i++)
					{
						child = children[i];
						if (child._parentInternal === this)
							child._setVisibility(newValue, true);
					}

					if ((oldValue === "collapsed") && this._documentInternal)
						this.onAddedToFlow();
					if (newValue === "visible")
						this.onVisible();
				}
				else
				{
					if (oldValue === "visible")
						this.onHidden();
					if ((newValue === "collapsed") && this._documentInternal)
						this.onRemovedFromFlow();

					for (i = children.length - 1; i >= 0; i--)
					{
						child = children[i];
						if (child._parentInternal === this)
							child._setVisibility(newValue, true);
					}

					this.setVisibilityOverride(newValue);
				}
			}
			finally
			{
				this._visibilityChanging = false;
			}
		};

		this._setEnabled = function(enabled, isInherited)
		{
			if (this._enabledChanging)
				throw new Error("Recursive enabled modification.");

			var oldValue = (this._enabled && this._enabledInherited);

			if (isInherited === true)
				this._enabledInherited = enabled;
			else
				this._enabled = enabled;

			var newValue = (this._enabled && this._enabledInherited);

			if (oldValue === newValue)
				return;

			try
			{
				this._enabledChanging = true;

				var children = this._children.concat();
				var child;
				var i, l;

				if (newValue)
				{
					this.setEnabledOverride(newValue);

					for (i = 0, l = children.length; i < l; i++)
					{
						child = children[i];
						if (child._parentInternal === this)
							child._setEnabled(newValue, true);
					}

					this.onEnabled();
				}
				else
				{
					this.onDisabled();

					for (i = children.length - 1; i >= 0; i--)
					{
						child = children[i];
						if (child._parentInternal === this)
							child._setEnabled(newValue, true);
					}

					this.setEnabledOverride(newValue);
				}
			}
			finally
			{
				this._enabledChanging = false;
			}
		};

	});

});
