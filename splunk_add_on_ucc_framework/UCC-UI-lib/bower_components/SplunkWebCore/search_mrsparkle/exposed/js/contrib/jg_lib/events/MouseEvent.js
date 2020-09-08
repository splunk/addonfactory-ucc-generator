/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var DOMEvent = require("./DOMEvent");
	var MouseEventData = require("./MouseEventData");
	var Class = require("../Class");
	var FunctionUtil = require("../utils/FunctionUtil");
	var Global = require("../utils/Global");
	var Map = require("../utils/Map");
	var UID = require("../utils/UID");

	/**
	 * Converts native mouse events to MouseEventData instances.
	 */
	return Class(module.id, DOMEvent, function(MouseEvent, base)
	{

		// Constructor

		this.constructor = function(name, type, bubbles, cancelable, domName)
		{
			if (type == null)
				type = MouseEventData;
			else if (!Class.isFunction(type))
				throw new Error("Parameter type must be of type Function.");
			else if ((type !== MouseEventData) && !Class.isSubclassOf(type, MouseEventData))
				throw new Error("Parameter type must be a subclass of " + Class.getName(MouseEventData) + ".");

			base.constructor.call(this, name, type, bubbles, cancelable, domName);
		};

		// Protected Methods

		this.domEventToEventData = function(context, domEvent)
		{
			var eventData = base.domEventToEventData.call(this, context, domEvent);

			eventData.screenX = domEvent.screenX || 0;
			eventData.screenY = domEvent.screenY || 0;
			eventData.clientX = domEvent.clientX || 0;
			eventData.clientY = domEvent.clientY || 0;
			eventData.ctrlKey = (domEvent.ctrlKey === true);
			eventData.shiftKey = (domEvent.shiftKey === true);
			eventData.altKey = (domEvent.altKey === true);
			eventData.metaKey = (domEvent.metaKey === true);

			// logic adapted from jQuery

			var target = domEvent.target || domEvent.srcElement;

			// get pageX/pageY, compute if necessary
			var pageX = domEvent.pageX;
			var pageY = domEvent.pageY;
			if (pageX == null)
			{
				var document = this.getOwnerDocument(target);
				var root = document.documentElement;
				var body = document.body;
				pageX = eventData.clientX + ((root && root.scrollLeft) || (body && body.scrollLeft) || 0) - ((root && root.clientLeft) || (body && body.clientLeft) || 0);
				pageY = eventData.clientY + ((root && root.scrollTop) || (body && body.scrollTop) || 0) - ((root && root.clientTop) || (body && body.clientTop) || 0);
			}
			eventData.pageX = pageX;
			eventData.pageY = pageY;

			// normalize button
			var button = domEvent.button || 0;
			var which = domEvent.which;
			eventData.button = which ? (which - 1) : ((button & 1) ? 0 : ((button & 2) ? 2 : ((button & 4) ? 1 : 0)));

			// get relatedTarget, use fromElement/toElement if necessary
			var relatedTarget = domEvent.relatedTarget;
			var fromElement = domEvent.fromElement;
			if (!relatedTarget && fromElement)
				relatedTarget = (fromElement === target) ? domEvent.toElement : fromElement;
			eventData.relatedTarget = relatedTarget ? this.resolveDOMElement(relatedTarget) : null;

			return eventData;
		};

		// Public Nested Classes

		/**
		 * Normalizes button property on click/dblclick/contextmenu events on legacy IE.
		 */
		MouseEvent.Click = Class(MouseEvent, function(Click, base)
		{

			// Protected Methods

			this.setupDOMHandler = function(context, domElement)
			{
				base.setupDOMHandler.call(this, context, domElement);

				context._mouseUpButton = -1;

				if (!domElement.addEventListener && domElement.attachEvent)
				{
					// use mouseup handler to capture button state for legacy IE
					context._mouseUpHandler = FunctionUtil.bind(this._mouseUpHandler, this, context);
					domElement.attachEvent("onmouseup", context._mouseUpHandler);
				}
			};

			this.teardownDOMHandler = function(context, domElement)
			{
				if (!domElement.removeEventListener && domElement.detachEvent)
				{
					domElement.detachEvent("onmouseup", context._mouseUpHandler);
					context._mouseUpHandler = null;
				}

				base.teardownDOMHandler.call(this, context, domElement);
			};

			this.domEventToEventData = function(context, domEvent)
			{
				var eventData = base.domEventToEventData.call(this, context, domEvent);

				if (context._mouseUpButton >= 0)
				{
					eventData.button = context._mouseUpButton;
					context._mouseUpButton = -1;
				}

				return eventData;
			};

			// Private Methods

			this._mouseUpHandler = function(context, domEvent)
			{
				// normalize button and store as _mouseUpButton
				var button = domEvent.button || 0;
				var which = domEvent.which;
				context._mouseUpButton = which ? (which - 1) : ((button & 1) ? 0 : ((button & 2) ? 2 : ((button & 4) ? 1 : 0)));
			};

		});

		/**
		 * Suppresses mouseover/mouseout events when target and relatedTarget resolve to the same object.
		 */
		MouseEvent.OverOut = Class(MouseEvent, function(OverOut, base)
		{

			// Protected Methods

			this.domEventToEventData = function(context, domEvent)
			{
				var eventData = base.domEventToEventData.call(this, context, domEvent);

				if (eventData.target === eventData.relatedTarget)
				{
					eventData.originalEvent = null;
					eventData.stopPropagation();
				}

				return eventData;
			};

		});

		/**
		 * Simulates mouseenter/mouseleave events on all browsers except for legacy IE, which supports them natively.
		 */
		MouseEvent.EnterLeave = Class(MouseEvent, function(EnterLeave, base)
		{

			// Private Static Constants

			var _R_ENTER = /enter$/;
			var _R_LEAVE = /leave$/;

			// Private Static Methods

			var _simName = function(domName)
			{
				return domName.replace(_R_ENTER, "over").replace(_R_LEAVE, "out");
			};

			// Private Properties

			this._simContextMap = null;
			this._simEventKey = null;

			// Constructor

			this.constructor = function(name, type, bubbles, cancelable, domName)
			{
				base.constructor.call(this, name, type, bubbles, cancelable, domName);

				this._simContextMap = new Map();
				this._simEventKey = "__enterLeave_" + UID.random() + "__";
			};

			// Protected Methods

			this.setupDOMHandler = function(context, domElement)
			{
				context._simRoot = null;

				if (domElement.addEventListener)
				{
					// use mouseover/mouseout events to drive mouseenter/mouseleave simulation
					// listen on capture phase to protect against stopPropagation() calls during the bubble phase
					context._simHandler = FunctionUtil.bind(this._simHandler, this, context);
					domElement.addEventListener(_simName(this.domName()), context._simHandler, true);
					this._simContextMap.set(domElement, context);
				}
				else if (domElement.attachEvent)
				{
					var document = this.getOwnerDocument(domElement);
					var root = document.documentElement;
					if (root && ((domElement === root) || (domElement === document)))
					{
						// native mouseenter/mouseleave events in legacy IE are not fired on the document node
						// simulate it by using the root node as a proxy
						context._simRoot = root;
						context._simHandler = FunctionUtil.bind(this._simHandler, this, context);
						root.attachEvent("on" + this.domName(), context._simHandler);
						this._simContextMap.set(domElement, context);
					}
					else
					{
						// use native mouseenter/mouseleave events as-is for all other nodes in legacy IE
						context.domHandler = FunctionUtil.bind(this.domHandler, this, context);
						domElement.attachEvent("on" + this.domName(), context.domHandler);
					}
				}
			};

			this.teardownDOMHandler = function(context, domElement)
			{
				if (domElement.removeEventListener)
				{
					this._simContextMap.del(domElement);
					domElement.removeEventListener(_simName(this.domName()), context._simHandler, true);
					context._simHandler = null;
				}
				else if (domElement.detachEvent)
				{
					if (context._simRoot)
					{
						this._simContextMap.del(domElement);
						context._simRoot.detachEvent("on" + this.domName(), context._simHandler);
						context._simHandler = null;
						context._simRoot = null;
					}
					else
					{
						domElement.detachEvent("on" + this.domName(), context.domHandler);
						context.domHandler = null;
					}
				}
			};

			this.domEventToEventData = function(context, domEvent)
			{
				var eventData = base.domEventToEventData.call(this, context, domEvent);

				// if simulating (and not legacy IE), clear originalEvent to avoid cross-contaminating the driving event
				if (domEvent[this._simEventKey] && !context._simRoot)
					eventData.originalEvent = null;

				return eventData;
			};

			// Private Methods

			this._simHandler = function(context, domEvent)
			{
				if (domEvent[this._simEventKey])
					return;

				domEvent[this._simEventKey] = true;

				// get target list
				var target = domEvent.target || domEvent.srcElement;
				var targetList = this._simTargets(target);

				// get relatedTarget list (relatedTarget is null for legacy IE document node simulation)
				var relatedTarget = domEvent.relatedTarget;
				var relatedTargetList = this._simTargets(relatedTarget);

				// omit common ancestors between target and relatedTarget
				var i, j;
				for (i = targetList.length - 1, j = relatedTargetList.length - 1; (i >= 0) && (j >= 0); i--, j--)
				{
					if (targetList[i] !== relatedTargetList[j])
						break;
				}
				targetList.splice(i + 1, targetList.length - i - 1);

				// reverse order of target list for mouseenter so parents are notified before children
				if (_R_ENTER.test(this.domName()))
					targetList.reverse();

				// iterate over target list and execute domHandler for any registered contexts
				var simContextMap = this._simContextMap;
				for (i = 0, j = targetList.length; i < j; i++)
				{
					context = simContextMap.get(targetList[i]);
					if (context)
						this.domHandler(context, domEvent);
				}
			};

			this._simTargets = function(domElement)
			{
				var targetList = [];

				// walk up parentNode hierarchy
				while (domElement)
				{
					targetList.push(domElement);
					domElement = domElement.parentNode;
				}

				// include window if reached document
				// but only for standard browsers (for consistency with other events in legacy IE)
				if (targetList.length > 0)
				{
					var lastTarget = targetList[targetList.length - 1];
					var document = this.getOwnerDocument(lastTarget);
					if ((lastTarget === document) && document.addEventListener)
						targetList.push(document.defaultView || document.parentWindow || Global.window);
				}

				return targetList;
			};

		});

		/**
		 * Normalizes mousewheel events across browsers.
		 */
		MouseEvent.Wheel = Class(MouseEvent, function(Wheel, base)
		{

			// Protected Methods

			this.setupDOMHandler = function(context, domElement)
			{
				base.setupDOMHandler.call(this, context, domElement);

				if (domElement.addEventListener)
					domElement.addEventListener("DOMMouseScroll", context.domHandler, false);
			};

			this.teardownDOMHandler = function(context, domElement)
			{
				if (domElement.removeEventListener)
					domElement.removeEventListener("DOMMouseScroll", context.domHandler, false);

				base.teardownDOMHandler.call(this, context, domElement);
			};

			this.domEventToEventData = function(context, domEvent)
			{
				var eventData = base.domEventToEventData.call(this, context, domEvent);

				// logic adapted from jquery.mousewheel.js

				var deltaX = 0;
				var deltaY = 0;

				// legacy scrollwheel
				if (domEvent.wheelDelta)
					deltaY = domEvent.wheelDelta / 120;
				if (domEvent.detail)
					deltaY = -domEvent.detail / 3;

				// multidimensional scroll, Gecko
				if ((domEvent.axis != null) && (domEvent.axis === domEvent.HORIZONTAL_AXIS))
				{
					deltaX = -deltaY;
					deltaY = 0;
				}

				// multidimensional scroll, Webkit
				if (domEvent.wheelDeltaY != null)
					deltaY = domEvent.wheelDeltaY / 120;
				if (domEvent.wheelDeltaX != null)
					deltaX = -domEvent.wheelDeltaX / 120;

				eventData.deltaX = (deltaX < 0) ? Math.floor(deltaX) : Math.ceil(deltaX);
				eventData.deltaY = (deltaY < 0) ? Math.floor(deltaY) : Math.ceil(deltaY);

				return eventData;
			};

		});

	});

});
