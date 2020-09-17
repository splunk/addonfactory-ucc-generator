/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var DOMEvent = require("./DOMEvent");
	var Class = require("../Class");
	var Set = require("../utils/Set");

	return Class(module.id, DOMEvent, function(ResizeEvent, base)
	{

		// Private Static Properties

		var _resizeSet = new Set();
		var _resizeList = null;
		var _resizeMonitorHandle = 0;

		// Private Static Methods

		var _setupResizeMonitor = function(context)
		{
			var domElement = context.domElement;

			context._resizeTarget = (domElement.nodeType === 9) ? (domElement.documentElement || domElement) : domElement;
			context._resizeWidth = context._resizeTarget.clientWidth;
			context._resizeHeight = context._resizeTarget.clientHeight;
			context._resizeDepth = 0;

			_resizeSet.add(context);
			_resizeList = null;

			if (_resizeSet.size() === 1)
				_resizeMonitorHandle = setTimeout(_resizeMonitor, 1000 / 60);
		};

		var _teardownResizeMonitor = function(context)
		{
			_resizeSet.del(context);
			_resizeList = null;

			context._resizeTarget = null;

			if (_resizeSet.size() === 0)
				clearTimeout(_resizeMonitorHandle);
		};

		var _resizeMonitor = function()
		{
			_resizeMonitorHandle = setTimeout(_resizeMonitor, 1000 / 60);

			var resizeList = _resizeList;
			if (!resizeList)
				resizeList = _resizeList = _resizeSet.keys();

			var notifyList;
			var context;
			var width;
			var height;
			var i, l;

			// detect size changes
			for (i = 0, l = resizeList.length; i < l; i++)
			{
				context = resizeList[i];
				width = context._resizeTarget.clientWidth;
				height = context._resizeTarget.clientHeight;
				if ((context._resizeWidth !== width) || (context._resizeHeight !== height))
				{
					context._resizeWidth = width;
					context._resizeHeight = height;
					context._resizeDepth = _getDepth(context.domElement);
					if (!notifyList)
						notifyList = [];
					notifyList.push(context);
				}
			}

			// notify size changes
			if (notifyList)
			{
				notifyList.sort(_depthComparator);
				for (i = 0, l = notifyList.length; i < l; i++)
				{
					context = notifyList[i];
					if (context._resizeTarget)
						context.event.domHandler(context, _createDOMEvent(context));
				}
			}
		};

		var _createDOMEvent = function(context)
		{
			var domEvent = {};
			domEvent.type = context.event.domName();
			domEvent.target = context.domElement;
			domEvent.currentTarget = context.domElement;
			return domEvent;
		};

		var _getDepth = function(domElement)
		{
			var depth = 0;
			while (domElement)
			{
				depth++;
				domElement = domElement.parentNode;
			}
			return depth;
		};

		var _depthComparator = function(context1, context2)
		{
			if (context1._resizeDepth < context2._resizeDepth)
				return -1;
			if (context1._resizeDepth > context2._resizeDepth)
				return 1;
			return 0;
		};

		// Protected Methods

		this.setupDOMHandler = function(context, domElement)
		{
			// use native resize event for window, otherwise manually monitor for size changes
			context._resizeNative = (domElement == domElement.window);
			if (context._resizeNative)
				base.setupDOMHandler.call(this, context, domElement);
			else
				_setupResizeMonitor(context);
		};

		this.teardownDOMHandler = function(context, domElement)
		{
			if (context._resizeNative)
				base.teardownDOMHandler.call(this, context, domElement);
			else
				_teardownResizeMonitor(context);
		};

		this.domEventToEventData = function(context, domEvent)
		{
			var eventData = base.domEventToEventData.call(this, context, domEvent);

			if (!context._resizeNative)
				eventData.originalEvent = null;

			return eventData;
		};

	});

});
