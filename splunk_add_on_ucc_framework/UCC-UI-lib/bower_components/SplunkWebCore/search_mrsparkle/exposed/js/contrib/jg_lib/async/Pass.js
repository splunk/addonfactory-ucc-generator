/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var FrameClock = require("./FrameClock");
	var PassEventData = require("./PassEventData");
	var Class = require("../Class");
	var ChainedEvent = require("../events/ChainedEvent");
	var Event = require("../events/Event");
	var ArrayUtil = require("../utils/ArrayUtil");
	var ErrorUtil = require("../utils/ErrorUtil");
	var Global = require("../utils/Global");
	var Map = require("../utils/Map");
	var ObjectUtil = require("../utils/ObjectUtil");
	var Set = require("../utils/Set");

	return Class(module.id, Object, function(Pass, base)
	{

		// Public Static Constants

		Pass.FRAME_PRIORITY = -1000000;

		// Public Static Events

		Pass.invalidated = new Event("invalidated", PassEventData);
		Pass.validated = new Event("validated", PassEventData);

		// Public Static Properties

		Pass.debug = false;

		// Private Static Properties

		var _validateClock = FrameClock.getInstance();
		var _validateList = [];
		var _validateSet = new Set();
		var _validateIndex = -1;
		var _validatePass = null;
		var _validateEndPass = null;
		var _validateCount = 0;
		var _isValidating = false;
		var _isAsync = false;
		var _debugStats = null;

		// Public Static Methods

		Pass.resolve = function(target, pass, strict)
		{
			if (target == null)
				throw new Error("Parameter target must be non-null.");
			if (pass == null)
				throw new Error("Parameter pass must be non-null.");

			if (pass instanceof Pass)
				return pass;

			if (!Class.isString(pass))
				throw new Error("Parameter pass must be of type String or " + Class.getName(Pass) + ".");

			var passName = pass;
			if (passName.indexOf(".") < 0)
			{
				pass = target[passName];
			}
			else
			{
				var passPath = passName.split(".");
				pass = target;
				for (var i = 0, l = passPath.length; i < l; i++)
				{
					pass = pass[passPath[i]];
					if (pass == null)
						break;
				}
			}

			if ((pass != null) && (pass instanceof Pass))
				return pass;

			if (strict !== false)
				throw new Error("Unknown pass \"" + passName + "\".");

			return null;
		};

		Pass.validateAll = function(endPass)
		{
			var isAsync = _isAsync;
			_isAsync = false;

			if ((endPass != null) && !(endPass instanceof Pass))
				throw new Error("Parameter endPass must be of type " + Class.getName(Pass) + ".");

			if (_isValidating || (_validateList.length === 0))
				return;

			var statsList = Pass.debug ? [] : null;
			var statsSummary = statsList ? DebugStats.begin() : null;
			var stats;

			try
			{
				_isValidating = true;
				_validateEndPass = endPass;
				_validateCount++;

				for (_validateIndex = 0; _validateIndex < _validateList.length; _validateIndex++)
				{
					_validatePass = _validateList[_validateIndex];
					if (_validateEndPass && (_validateEndPass._order < _validatePass._order))
						break;

					if (statsList)
						stats = _debugStats = DebugStats.begin(_validatePass);

					_validatePass.validateAll();

					if (statsList)
						statsList.push(DebugStats.end(stats));
				}
			}
			finally
			{
				_validateIndex = -1;
				_validatePass = null;
				_validateEndPass = null;
				_isValidating = false;
				_debugStats = null;

				_dequeueValidPasses();
			}

			if (statsList)
			{
				statsList.push(DebugStats.end(statsSummary));
				DebugStats.render(statsList, _validateCount, isAsync);
				if (_validateList.length > 0)
					DebugStats.renderWarning(_validateList, endPass);
			}
		};

		Pass.markValid = function(target)
		{
			var validateList = _validateList.concat();
			for (var i = 0, l = validateList.length; i < l; i++)
				validateList[i].markValid(target);
		};

		Pass.isValid = function(target)
		{
			var validateList = _validateList.concat();
			for (var i = 0, l = validateList.length; i < l; i++)
			{
				if (!validateList[i].isValid(target))
					return false;
			}

			return true;
		};

		Pass.isValidating = function()
		{
			return _isValidating;
		};

		// Private Static Methods

		var _enqueuePass = function(pass)
		{
			if (_validateSet.has(pass))
				return;

			var index = -ArrayUtil.binarySearch(_validateList, pass, _passComparator) - 1;
			if (index < _validateList.length)
				_validateList.splice(index, 0, pass);
			else
				_validateList.push(pass);

			_validateSet.add(pass);

			if (index <= _validateIndex)
				_validateIndex++;

			if (_validateList.length === 1)
				_validateClock.on(_validateClock.frameTick, _validateClockTick, null, Pass.FRAME_PRIORITY);
		};

		var _dequeueValidPasses = function()
		{
			var pass;
			for (var i = _validateList.length - 1; i >= 0; i--)
			{
				pass = _validateList[i];
				if (pass._targetMap.size() === 0)
				{
					_validateList.splice(i, 1);
					_validateSet.del(pass);
				}
			}

			if (_validateList.length === 0)
				_validateClock.off(_validateClock.frameTick, _validateClockTick);
		};

		var _validateClockTick = function(e)
		{
			_isAsync = true;
			Pass.validateAll();
		};

		var _passComparator = function(pass1, pass2)
		{
			if (pass1._order <= pass2._order)
				return -1;
			return 1;
		};

		var _topDownComparator = function(targetInfo1, targetInfo2)
		{
			if (targetInfo1.depth < targetInfo2.depth)
				return -1;
			if (targetInfo1.depth > targetInfo2.depth)
				return 1;
			return 0;
		};

		var _bottomUpComparator = function(targetInfo1, targetInfo2)
		{
			if (targetInfo1.depth > targetInfo2.depth)
				return -1;
			if (targetInfo1.depth < targetInfo2.depth)
				return 1;
			return 0;
		};

		var _wrapComparator = function(comparator, direction)
		{
			return function(targetInfo1, targetInfo2)
			{
				return (comparator(targetInfo1.target, targetInfo2.target) * direction);
			};
		};

		// Public Events

		this.invalidated = null;
		this.validated = null;

		// Private Properties

		this._name = null;
		this._order = 0;
		this._direction = "none";
		this._comparator = null;
		this._targetMap = null;

		// Constructor

		this.constructor = function(name, order, direction)
		{
			if (name == null)
				throw new Error("Parameter name must be non-null.");
			if (!Class.isString(name))
				throw new Error("Parameter name must be of type String.");
			if ((order != null) && !Class.isNumber(order))
				throw new Error("Parameter order must be of type Number.");
			if ((direction != null) && !Class.isString(direction))
				throw new Error("Parameter direction must be of type String.");

			this._name = name;
			this._order = ((order != null) && !isNaN(order)) ? order : 0;
			this._direction = ((direction === "topDown") || (direction === "bottomUp")) ? direction : "none";

			this._targetMap = new Map();

			this.invalidated = new ChainedEvent(name + ".invalidated", Pass.invalidated);
			this.validated = new ChainedEvent(name + ".validated", Pass.validated);
		};

		// Public Accessor Methods

		this.name = function()
		{
			return this._name;
		};

		this.order = function()
		{
			return this._order;
		};

		this.direction = function()
		{
			return this._direction;
		};

		this.comparator = function(value)
		{
			if (!arguments.length)
				return this._comparator;

			if ((value != null) && !Class.isFunction(value))
				throw new Error("Parameter comparator must be of type Function.");

			this._comparator = value || null;

			return this;
		};

		// Public Methods

		this.invalidate = function(target)
		{
			var targetMap = this._targetMap;
			if (targetMap.has(target))
				return;

			var method = target[this._name];
			if ((method == null) || !Class.isFunction(method))
				return;

			targetMap.set(target, { target: target, method: method, depth: 0 });
			if (targetMap.size() === 1)
				_enqueuePass(this);

			if (target.isEventTarget)
				target.fire(this.invalidated, new PassEventData(this));
		};

		this.validate = function(target)
		{
			var targetInfo = this._targetMap.get(target);
			if (!targetInfo)
				return;

			try
			{
				targetInfo.method.call(target);
			}
			catch (e)
			{
				ErrorUtil.nonBlockingThrow(e);
			}
			finally
			{
				if (targetInfo.target)
					this.markValid(target);
			}
		};

		this.validateAll = function()
		{
			var direction = this._direction;
			var comparator = this._comparator;
			var targetInfoList = this._targetMap.values();
			var targetInfoCount = targetInfoList.length;
			var targetInfo;
			var target;
			var depth;
			var i;

			if (targetInfoCount === 0)
				return;

			if (comparator)
			{
				comparator = _wrapComparator(comparator, (direction === "bottomUp") ? -1 : 1);
				targetInfoList.sort(comparator);
			}
			else if (direction !== "none")
			{
				for (i = 0; i < targetInfoCount; i++)
				{
					targetInfo = targetInfoList[i];
					depth = +targetInfo.target.getValidateDepth();
					targetInfo.depth = !isNaN(depth) ? depth : 0;
				}

				if (direction === "bottomUp")
					targetInfoList.sort(_bottomUpComparator);
				else
					targetInfoList.sort(_topDownComparator);
			}

			for (i = 0; i < targetInfoCount; i++)
			{
				target = targetInfoList[i].target;
				if (target)
					this.validate(target);
			}
		};

		this.markValid = function(target)
		{
			var targetMap = this._targetMap;
			var targetInfo = targetMap.get(target);
			if (!targetInfo)
				return;

			targetMap.del(target);
			targetInfo.target = null;
			targetInfo.method = null;

			if (_debugStats && (_debugStats.pass === this))
				_debugStats.targets++;

			if (target.isEventTarget)
				target.fire(this.validated, new PassEventData(this));
		};

		this.isValid = function(target)
		{
			return !this._targetMap.has(target);
		};

		this.isValidating = function()
		{
			return (_isValidating && ((_validateEndPass == null) || (_validateEndPass._order >= this._order)));
		};

		// Private Nested Classes

		var DebugStats = Class(function(DebugStats)
		{

			// Private Static Constants

			var _R_DECIMAL = /^[^\.e]*([^$]*)$/;
			var _R_INFINITY = /^\-?Infinity$/;

			// Public Static Methods

			DebugStats.begin = function(pass)
			{
				var stats = {};
				stats.pass = pass || null;
				stats.time = new Date().getTime();
				if (pass)
				{
					stats.name = pass._name;
					stats.order = pass._order;
					stats.targets = 0;
				}
				return stats;
			};

			DebugStats.end = function(stats)
			{
				stats.time = new Date().getTime() - stats.time;
				return stats;
			};

			DebugStats.render = function(statsList, iterationCount, isAsync)
			{
				if (!Global.console || !Global.console.log)
					return;

				_formatData(statsList);

				var title = "ASYNC PASS VALIDATION - iteration " + iterationCount + (!isAsync ? " (FORCED SYNC)" : "");

				var columns = [];
				columns.push({ heading: "name", field: "name", align: "left" });
				columns.push({ heading: "order", field: "order", align: "right" });
				columns.push({ heading: "targets", field: "targets", align: "right" });
				columns.push({ heading: "time", field: "time", align: "right" });

				var str = "\n" + _renderTable(title, columns, statsList, true) + "\n";

				try
				{
					Global.console.log(str);
				}
				catch (e)
				{
					// ignore errors
				}
			};

			DebugStats.renderWarning = function(passList, endPass)
			{
				if (!Global.console || !Global.console.warn)
					return;

				var dataList = [];
				var pass;

				// populate dataList
				for (var i = 0, l = passList.length; i < l; i++)
				{
					pass = passList[i];
					if (endPass && (endPass._order < pass._order))
						break;

					dataList.push({ name: pass._name, order: pass._order, targets: pass._targetMap.size() });
				}

				// bail if no passes occur before endPass
				if (dataList.length === 0)
					return;

				_formatData(dataList);

				var message = "WARNING: Validation cycle detected.";

				var title = "Passes queued for next iteration...";

				var columns = [];
				columns.push({ heading: "name", field: "name", align: "left" });
				columns.push({ heading: "order", field: "order", align: "right" });
				columns.push({ heading: "targets", field: "targets", align: "right" });

				var str = message + "\n\n" + _renderTable(title, columns, dataList) + "\n";

				try
				{
					Global.console.warn(str);
				}
				catch (e)
				{
					// ignore errors
				}
			};

			// Private Static Methods

			var _formatData = function(dataList)
			{
				var dataCount = dataList.length;
				var data;
				var decimalWidth = 0;
				var i;

				// measure decimal width of "order" fields
				for (i = 0; i < dataCount; i++)
				{
					data = dataList[i];
					if (ObjectUtil.has(data, "order"))
						decimalWidth = Math.max(decimalWidth, _measureDecimal(data.order));
				}

				// format "order" and "time" fields
				for (i = 0; i < dataCount; i++)
				{
					data = dataList[i];
					if (ObjectUtil.has(data, "order"))
						data.order = _formatDecimal(data.order, decimalWidth);
					if (ObjectUtil.has(data, "time"))
						data.time = _formatTime(data.time);
				}

				return dataList;
			};

			var _renderTable = function(title, columnList, dataList, hasFooter)
			{
				var columnCount = columnList.length;
				var column;
				var dataCount = dataList.length;
				var data;
				var i;
				var j;

				var width = (columnCount - 1) * 2;
				var columnWidths = [];
				var columnWidth;

				// measure columns
				for (i = 0; i < columnCount; i++)
				{
					column = columnList[i];
					columnWidth = _measureValue(column.heading);

					for (j = 0; j < dataCount; j++)
					{
						data = dataList[j];
						columnWidth = Math.max(columnWidth, _measureValue(ObjectUtil.get(data, column.field)));
					}

					width += columnWidth;
					columnWidths.push(columnWidth);
				}

				// measure title and adjust column widths if needed
				if (title)
				{
					var titleWidth = _measureValue(title);
					if (titleWidth > width)
					{
						var diff = (titleWidth - width);
						width = titleWidth;
						for (i = 0; i < diff; i++)
							columnWidths[i % columnCount]++;
					}
				}

				var str = "";
				var divider = _renderValue("", width, "left", "-");

				// render title
				if (title)
					str += _renderValue(title, width) + "\n\n";

				// render headings
				for (i = 0; i < columnCount; i++)
				{
					column = columnList[i];
					str += _renderValue(column.heading, columnWidths[i], column.align);
					str += (i < (columnCount - 1)) ? "  " : "\n";
				}
				str += divider + "\n";

				// render rows
				for (i = 0; i < dataCount; i++)
				{
					data = dataList[i];

					if (hasFooter && (i === (dataCount - 1)))
						str += divider + "\n";

					for (j = 0; j < columnCount; j++)
					{
						column = columnList[j];
						str += _renderValue(ObjectUtil.get(data, column.field), columnWidths[j], column.align);
						str += (j < (columnCount - 1)) ? "  " : "\n";
					}
				}

				return str;
			};

			var _measureValue = function(value)
			{
				if (value == null)
					return 0;

				return ("" + value).length;
			};

			var _renderValue = function(value, width, align, padChar)
			{
				if (!padChar)
					padChar = " ";

				var str = (value != null) ? ("" + value) : "";
				var i;

				if (align === "right")
				{
					for (i = str.length; i < width; i++)
						str = padChar + str;
				}
				else
				{
					for (i = str.length; i < width; i++)
						str += padChar;
				}

				return str;
			};

			var _measureDecimal = function(value)
			{
				if (value == null)
					return 0;

				var match = ("" + value).match(_R_DECIMAL);
				if (match)
					return match[1].length;

				return 0;
			};

			var _formatDecimal = function(value, decimalWidth)
			{
				if (value == null)
					return "";

				var str = "" + value;
				if (_R_INFINITY.test(str))
					return str;

				var match = str.match(_R_DECIMAL);
				if (match)
					decimalWidth -= match[1].length;

				for (var i = 0; i < decimalWidth; i++)
					str += " ";

				return str;
			};

			var _formatTime = function(value)
			{
				if (value == null)
					return "";

				return (value + " ms");
			};

		});

	});

});
