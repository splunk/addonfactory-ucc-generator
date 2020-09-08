/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Node = require("./Node");
	var Class = require("../Class");
	var CSS = require("../CSS");
	var MDOMTarget = require("../events/MDOMTarget");
	var MEventTarget = require("../events/MEventTarget");
	var MKeyboardTarget = require("../events/MKeyboardTarget");
	var MListenerTarget = require("../events/MListenerTarget");
	var MMouseTarget = require("../events/MMouseTarget");
	var MObservableTarget = require("../events/MObservableTarget");
	var MResizeTarget = require("../events/MResizeTarget");
	var MPropertyTarget = require("../properties/MPropertyTarget");
	var ObservableProperty = require("../properties/ObservableProperty");
	var Global = require("../utils/Global");
	var ObjectUtil = require("../utils/ObjectUtil");

	var Element = Class(module.id, Node, function(Element, base)
	{

		Class.mixin(this, MDOMTarget, MKeyboardTarget, MMouseTarget, MResizeTarget);

		// Private Static Constants

		var _R_WHITESPACE_DELIMITER = /\s+/g;
		var _R_INPUT_TAG = /^(input|textarea|button|select|optgroup|option)$/i;

		// Public Properties

		this.className = new ObservableProperty("className", String, "")
			.writeFilter(function(value)
			{
				return value || "";
			})
			.onChange(function(e)
			{
				if (e.oldValue)
					this.removeClass(e.oldValue);
				if (e.newValue)
					this.addClass(e.newValue);
			});

		// Protected Properties

		this.element = null;

		// Private Properties

		this._classNamesInternal = null;

		// Constructor

		this.constructor = function(tagName)
		{
			if ((tagName != null) && !Class.isString(tagName))
				throw new Error("Parameter tagName must be of type String.");

			base.constructor.call(this);

			this.element = this.createElementOverride(tagName || "div");
			if (!this.element)
				throw new Error("Value returned from createElementOverride must be non-null.");

			var classNames = this.getClassNamesOverride();
			if (classNames)
				this.element.className = classNames;

			this.bindDOMElement(this.element);
		};

		// Public Methods

		this.appendTo = function(domElement)
		{
			if (domElement == null)
				throw new Error("Parameter domElement must be non-null.");
			if (((domElement.nodeType !== 1) && (domElement.nodeType !== 9)) || (domElement.appendChild == null))
				throw new Error("Parameter domElement must be a DOM Element.");

			var document = Document.getInstance();

			var parent = MDOMTarget.fromDOMElement(domElement);
			if (parent && (parent instanceof Node))
			{
				parent.addChild(this);
				return this;
			}

			var isParent = (this.element.parentNode === domElement);
			if (!isParent && (this.parent() || this.document()))
				this.remove(false);

			domElement.appendChild(this.element);

			if (!isParent)
				this._setDocument(document);

			return this;
		};

		this.remove = function(dispose)
		{
			var parent = this.parent();
			if (parent)
			{
				parent.removeChild(this, dispose);
				return this;
			}

			var document = this.document();
			if (document)
				this._setDocument(null);

			var parentNode = this.element.parentNode;
			if (parentNode)
				parentNode.removeChild(this.element);

			if (dispose !== false)
				this.dispose();

			return this;
		};

		this.dispose = function()
		{
			this.unbindDOMElement();

			base.dispose.call(this);
		};

		this.addClass = function(className)
		{
			if (className == null)
				throw new Error("Parameter className must be non-null.");
			if (!Class.isString(className))
				throw new Error("Parameter className must be of type String.");

			if (!className)
				return this;

			var oldValue = this.element.className || "";

			var newValue = oldValue ? (" " + oldValue + " ") : " ";
			var classNameList = className.split(_R_WHITESPACE_DELIMITER);
			for (var i = 0, l = classNameList.length; i < l; i++)
			{
				className = classNameList[i];
				if (className && (newValue.indexOf(" " + className + " ") < 0))
					newValue += className + " ";
			}
			newValue = newValue.substring(1, newValue.length - 1);

			if (oldValue === newValue)
				return this;

			this.element.className = newValue;

			return this;
		};

		this.removeClass = function(className)
		{
			if (className == null)
				throw new Error("Parameter className must be non-null.");
			if (!Class.isString(className))
				throw new Error("Parameter className must be of type String.");

			if (!className)
				return this;

			var oldValue = this.element.className || "";
			if (!oldValue)
				return this;

			var newValue = (" " + oldValue + " ");
			var classNameList = className.split(_R_WHITESPACE_DELIMITER);
			for (var i = 0, l = classNameList.length; i < l; i++)
			{
				className = classNameList[i];
				if (className)
					newValue = newValue.replace(" " + className + " ", " ");
			}
			newValue = newValue.substring(1, Math.max(newValue.length - 1, 1));

			if (oldValue === newValue)
				return this;

			this.element.className = newValue;

			return this;
		};

		this.hasClass = function(className)
		{
			if (className == null)
				throw new Error("Parameter className must be non-null.");
			if (!Class.isString(className))
				throw new Error("Parameter className must be of type String.");

			if (!className)
				return false;

			var curValue = this.element.className;
			if (!curValue)
				return false;

			curValue = (" " + curValue + " ");

			var classNameList = className.split(_R_WHITESPACE_DELIMITER);
			for (var i = 0, l = classNameList.length; i < l; i++)
			{
				className = classNameList[i];
				if (className && (curValue.indexOf(" " + className + " ") < 0))
					return false;
			}

			return true;
		};

		this.getBubbleTarget = function()
		{
			var bubbleTarget = this.parent();
			if (bubbleTarget)
				return bubbleTarget;

			var parentNode = this.element.parentNode;
			while (parentNode)
			{
				bubbleTarget = MDOMTarget.fromDOMElement(parentNode);
				if (bubbleTarget && bubbleTarget.isEventTarget)
					return bubbleTarget;

				parentNode = parentNode.parentNode;
			}

			return null;
		};

		this.getValidateDepth = function()
		{
			var depth = 0;
			var parentNode = this.element.parentNode;
			while (parentNode)
			{
				depth++;
				parentNode = parentNode.parentNode;
			}
			return depth;
		};

		// Protected Methods

		this.createElementOverride = function(tagName)
		{
			return Global.document.createElement(tagName);
		};

		this.getClassNamesOverride = function()
		{
			var cls = this.constructor;
			var proto = cls.prototype;
			var classNames = ObjectUtil.get(proto, "_classNamesInternal");
			if (classNames != null)
				return classNames;

			var baseClass = (cls !== Element) ? Class.getBaseClass(cls) : null;
			classNames = baseClass ? baseClass.prototype.getClassNamesOverride() : "";

			var className = Class.getName(cls);
			if (className)
			{
				className = CSS.formatClassName(className);
				classNames = classNames ? (classNames + " " + className) : className;
			}

			proto._classNamesInternal = classNames;
			return classNames;
		};

		this.setVisibilityOverride = function(visibility)
		{
			var style = this.element.style;
			switch (visibility)
			{
				case "collapsed":
					style.visibility = "hidden";
					style.display = "none";
					break;
				case "hidden":
					style.visibility = "hidden";
					style.display = "";
					break;
				default:
					style.visibility = "";
					style.display = "";
					break;
			}
		};

		this.setEnabledOverride = function(enabled)
		{
			if (_R_INPUT_TAG.test(this.element.tagName))
				this.element.disabled = !enabled;
		};

		this.addChildOverride = function(child, index, siblings)
		{
			if (!(child instanceof Element))
				throw new Error("Parameter child must be of type " + Class.getName(Element) + ".");

			if (index < siblings.length)
				this.element.insertBefore(child.element, siblings[index].element);
			else
				this.element.appendChild(child.element);
		};

		this.removeChildOverride = function(child, index, siblings)
		{
			var parentNode = child.element.parentNode;
			if (parentNode)
				parentNode.removeChild(child.element);
		};

		this.reorderChildOverride = function(child, oldIndex, newIndex, siblings)
		{
			if (newIndex < siblings.length)
				this.element.insertBefore(child.element, siblings[newIndex].element);
			else
				this.element.appendChild(child.element);
		};

	});

	var BodyElement = Class(module.id.replace(/Element$/, "BodyElement"), Element, function(BodyElement, base)
	{

		// Private Static Properties

		var _instance = null;
		var _instantiating = false;

		// Public Static Methods

		BodyElement.getInstance = function()
		{
			if (!_instance && !_instantiating)
			{
				try
				{
					_instantiating = true;

					_instance = new BodyElement();
					RootElement.getInstance();
				}
				finally
				{
					_instantiating = false;
				}
			}

			return _instance;
		};

		// Constructor

		this.constructor = function()
		{
			if (!_instantiating)
				throw new Error("Singleton class. Use " + Class.getName(BodyElement) + ".getInstance() to retrieve the instance of this class.");

			base.constructor.call(this);
		};

		// Public Methods

		this.dispose = function()
		{
			// noop
		};

		// Protected Methods

		this.createElementOverride = function(tagName)
		{
			var element = Global.document.body;
			if (!element)
				throw new Error("Body element not found.");

			return element;
		};

		this.getClassNamesOverride = function()
		{
			return "";
		};

	});

	var RootElement = Class(module.id.replace(/Element$/, "RootElement"), Element, function(RootElement, base)
	{

		// Private Static Properties

		var _instance = null;
		var _instantiating = false;

		// Public Static Methods

		RootElement.getInstance = function()
		{
			if (!_instance && !_instantiating)
			{
				try
				{
					_instantiating = true;

					_instance = new RootElement(BodyElement.getInstance());
					Document.getInstance();
				}
				finally
				{
					_instantiating = false;
				}
			}

			return _instance;
		};

		// Private Properties

		this._body = null;

		// Constructor

		this.constructor = function(body)
		{
			if (!_instantiating)
				throw new Error("Singleton class. Use " + Class.getName(RootElement) + ".getInstance() to retrieve the instance of this class.");

			base.constructor.call(this);

			this.addChild(body);
		};

		// Public Accessor Methods

		this.body = function()
		{
			return this._body;
		};

		// Public Methods

		this.dispose = function()
		{
			// noop
		};

		// Protected Methods

		this.createElementOverride = function(tagName)
		{
			var element = Global.document.documentElement;
			if (!element)
				throw new Error("Root element not found.");

			return element;
		};

		this.getClassNamesOverride = function()
		{
			return "";
		};

		this.addChildOverride = function(child, index, siblings)
		{
			if (!_instantiating)
				base.addChildOverride.call(this, child, index, siblings);

			if (!this._body && (child instanceof BodyElement))
				this._body = child;
		};

		this.removeChildOverride = function(child, index, siblings)
		{
			if (child === this._body)
				this._body = null;

			base.removeChildOverride.call(this, child, index, siblings);
		};

	});

	var Document = Class(module.id.replace(/Element$/, "Document"), Node, function(Document, base)
	{

		Class.mixin(this, MDOMTarget, MKeyboardTarget, MMouseTarget, MResizeTarget);

		// Private Static Properties

		var _instance = null;
		var _instantiating = false;

		// Public Static Methods

		Document.getInstance = function()
		{
			if (!_instance && !_instantiating)
			{
				try
				{
					_instantiating = true;

					_instance = new Document(RootElement.getInstance());
					Window.getInstance();
				}
				finally
				{
					_instantiating = false;
				}
			}

			return _instance;
		};

		// Public Properties

		this.title = new ObservableProperty("title", String, "")
			.writeFilter(function(value)
			{
				return value || "";
			})
			.setter(function(value)
			{
				this.element.title = value;
			});

		// Protected Properties

		this.element = null;

		// Private Properties

		this._window = null;
		this._root = null;

		// Constructor

		this.constructor = function(root)
		{
			if (!_instantiating)
				throw new Error("Singleton class. Use " + Class.getName(Document) + ".getInstance() to retrieve the instance of this class.");

			base.constructor.call(this);

			this.element = Global.document;
			if (!this.element)
				throw new Error("Document not found.");

			this.bindDOMElement(this.element);
			this.set(this.title, this.element.title);
			this._setDocument(this);

			this.addChild(root);
		};

		// Public Accessor Methods

		this.window = function()
		{
			return this._window;
		};

		this.root = function()
		{
			return this._root;
		};

		this.body = function()
		{
			return this._root ? this._root.body() : null;
		};

		// Public Methods

		this.remove = function(dispose)
		{
			throw new Error("This operation is not supported.");
		};

		this.dispose = function()
		{
			throw new Error("This operation is not supported.");
		};

		this.getBubbleTarget = function()
		{
			return this._window;
		};

		// Protected Methods

		this.addChildOverride = function(child, index, siblings)
		{
			if (!_instantiating)
			{
				if (!(child instanceof Element))
					throw new Error("Parameter child must be of type " + Class.getName(Element) + ".");

				if (index < siblings.length)
					this.element.insertBefore(child.element, siblings[index].element);
				else
					this.element.appendChild(child.element);
			}

			if (!this._root && (child instanceof RootElement))
				this._root = child;
		};

		this.removeChildOverride = function(child, index, siblings)
		{
			if (child === this._root)
				this._root = null;

			var parentNode = child.element.parentNode;
			if (parentNode)
				parentNode.removeChild(child.element);
		};

	});

	var Window = Class(module.id.replace(/Element$/, "Window"), Object, function(Window, base)
	{

		Class.mixin(this, MEventTarget, MListenerTarget, MObservableTarget, MPropertyTarget);
		Class.mixin(this, MDOMTarget, MKeyboardTarget, MMouseTarget, MResizeTarget);

		// Private Static Properties

		var _instance = null;
		var _instantiating = false;

		// Public Static Methods

		Window.getInstance = function()
		{
			if (!_instance && !_instantiating)
			{
				try
				{
					_instantiating = true;

					_instance = new Window(Document.getInstance());
				}
				finally
				{
					_instantiating = false;
				}
			}

			return _instance;
		};

		// Protected Properties

		this.element = null;

		// Private Properties

		this._document = null;

		// Constructor

		this.constructor = function(document)
		{
			if (!_instantiating)
				throw new Error("Singleton class. Use " + Class.getName(Window) + ".getInstance() to retrieve the instance of this class.");

			this.element = Global.window;
			if (!this.element)
				throw new Error("Window not found.");

			this.bindDOMElement(this.element);

			this._document = document;
			document._window = this;
		};

		// Public Accessor Methods

		this.document = function()
		{
			return this._document;
		};

	});

	return Element;

});
