/**
 * Requires:
 * jquery
 * leaflet
 * legend
 * jg_global
 * jg_library
 */

jg_import.define("splunk.charting.Legend", function()
{
jg_namespace("splunk.charting", function()
{

	var ChainedEvent = jg_import("jgatt.events.ChainedEvent");
	var Event = jg_import("jgatt.events.Event");
	var EventData = jg_import("jgatt.events.EventData");
	var MObservable = jg_import("jgatt.events.MObservable");
	var MPropertyTarget = jg_import("jgatt.properties.MPropertyTarget");
	var ObservableProperty = jg_import("jgatt.properties.ObservableProperty");
	var ArrayUtils = jg_import("jgatt.utils.ArrayUtils");
	var Dictionary = jg_import("jgatt.utils.Dictionary");

	this.Legend = jg_extend(Object, function(Legend, base)
	{

		base = jg_mixin(this, MObservable, base);
		base = jg_mixin(this, MPropertyTarget, base);

		// Public Events

		this.settingLabels = new Event("settingLabels", EventData);
		this.labelIndexMapChanged = new ChainedEvent("labelIndexMapChanged", this.changed);

		// Public Properties

		this.labels = new ObservableProperty("labels", Array, [])
			.readFilter(function(value)
			{
				return value.concat();
			})
			.writeFilter(function(value)
			{
				return value ? value.concat() : [];
			})
			.onChanged(function(e)
			{
				this._updateLabelMap();
			});

		// Private Properties

		this._targetMap = null;
		this._targetList = null;
		this._labelMap = null;
		this._labelList = null;
		this._isSettingLabels = false;

		// Constructor

		this.constructor = function()
		{
			base.constructor.call(this);

			this._targetMap = new Dictionary();
			this._targetList = [];
			this._labelMap = {};
			this._labelList = [];
		};

		// Public Methods

		this.register = function(target)
		{
			if (target == null)
				throw new Error("Parameter target must be non-null.");

			var targetData = this._targetMap.get(target);
			if (targetData)
				return;

			targetData = { labels: null };
			this._targetMap.set(target, targetData);
			this._targetList.push(targetData);
		};

		this.unregister = function(target)
		{
			if (target == null)
				throw new Error("Parameter target must be non-null.");

			var targetData = this._targetMap.get(target);
			if (!targetData)
				return;

			var targetIndex = ArrayUtils.indexOf(this._targetList, targetData);
			if (targetIndex >= 0)
				this._targetList.splice(targetIndex, 1);
			this._targetMap.del(target);

			this._updateLabelMap();
		};

		this.setLabels = function(target, labels)
		{
			if (target == null)
				throw new Error("Parameter target must be non-null.");
			if ((labels != null) && !(labels instanceof Array))
				throw new Error("Parameter labels must be an array.");

			var targetData = this._targetMap.get(target);
			if (!targetData)
				return;

			targetData.labels = labels ? labels.concat() : null;

			this.notifySettingLabels();
		};

		this.getLabelIndex = function(label)
		{
			if (label == null)
				throw new Error("Parameter label must be non-null.");
			if (typeof label !== "string")
				throw new Error("Parameter label must be a string.");

			var index = this.getLabelIndexOverride(label);
			if (index < 0)
			{
				var labelIndex = this._labelMap[label];
				index = (labelIndex != null) ? labelIndex : -1;
			}
			return index;
		};

		this.getNumLabels = function()
		{
			var value = this.getNumLabelsOverride();
			if (value < 0)
				value = this._labelList.length;
			return value;
		};

		this.notifySettingLabels = function()
		{
			if (this._isSettingLabels)
				return;

			try
			{
				this._isSettingLabels = true;
				this.dispatchEvent(this.settingLabels, new EventData());
				this._updateLabelMap();
			}
			finally
			{
				this._isSettingLabels = false;
			}
		};

		this.notifyLabelIndexMapChanged = function()
		{
			this.dispatchEvent(this.labelIndexMapChanged, new EventData());
		};

		// Protected Methods

		this.getNumLabelsOverride = function()
		{
			return -1;
		};

		this.getLabelIndexOverride = function(label)
		{
			return -1;
		};

		this.updateLabelsOverride = function(labels)
		{
			return false;
		};

		// Private Methods

		this._updateLabelMap = function()
		{
			var currentLabelList = this._labelList;
			var changed = false;

			var labelMap = {};
			var labelList = [];

			var targetList = this._targetList;
			var targetData;
			var targetLabels;
			var targetLabel;

			var i;
			var j;
			var l;
			var m;

			targetLabels = this.getInternal(this.labels);
			for (i = 0, l = targetLabels.length; i < l; i++)
			{
				targetLabel = String(targetLabels[i]);
				if (labelMap[targetLabel] == null)
				{
					labelMap[targetLabel] = labelList.length;
					labelList.push(targetLabel);
				}
			}

			for (i = 0, l = targetList.length; i < l; i++)
			{
				targetData = targetList[i];
				targetLabels = targetData.labels;
				if (targetLabels)
				{
					for (j = 0, m = targetLabels.length; j < m; j++)
					{
						targetLabel = String(targetLabels[j]);
						if (labelMap[targetLabel] == null)
						{
							labelMap[targetLabel] = labelList.length;
							labelList.push(targetLabel);
						}
					}
				}
			}

			if (labelList.length != currentLabelList.length)
			{
				changed = true;
			}
			else
			{
				for (i = 0, l = labelList.length; i < l; i++)
				{
					if (labelList[i] !== currentLabelList[i])
					{
						changed = true;
						break;
					}
				}
			}

			if (changed)
			{
				this._labelMap = labelMap;
				this._labelList = labelList;

				if (!this.updateLabelsOverride(labelList.concat()))
					this.notifyLabelIndexMapChanged();
			}
		};

	});

});
});

jg_import.define("splunk.charting.ExternalLegend", function()
{
jg_namespace("splunk.charting", function()
{

	var SplunkLegend = jg_import("Splunk.Legend");
	var FunctionUtils = jg_import("jgatt.utils.FunctionUtils");
	var Legend = jg_import("splunk.charting.Legend");

	this.ExternalLegend = jg_extend(Legend, function(ExternalLegend, base)
	{

		// Private Static Properties

		var _instanceCount = 0;

		// Private Properties

		this._id = null;
		this._isConnected = false;
		this._cachedExternalNumLabels = -1;
		this._cachedExternalLabelMap = null;

		// Constructor

		this.constructor = function()
		{
			base.constructor.call(this);

			this._external_setLabels = FunctionUtils.bind(this._external_setLabels, this);
			this._external_labelIndexMapChanged = FunctionUtils.bind(this._external_labelIndexMapChanged, this);

			this._id = "splunk-charting-ExternalLegend-" + (++_instanceCount);
		};

		// Public Methods

		this.connect = function()
		{
			this.close();

			SplunkLegend.register(this._id);
			SplunkLegend.addEventListener("setLabels", this._external_setLabels);
			SplunkLegend.addEventListener("labelIndexMapChanged", this._external_labelIndexMapChanged);

			this._isConnected = true;
		};

		this.close = function()
		{
			if (!this._isConnected)
				return;

			this._isConnected = false;

			SplunkLegend.removeEventListener("labelIndexMapChanged", this._external_labelIndexMapChanged);
			SplunkLegend.removeEventListener("setLabels", this._external_setLabels);
			SplunkLegend.unregister(this._id);
		};

		this.isConnected = function()
		{
			return this._isConnected;
		};

		// Protected Methods

		this.getNumLabelsOverride = function()
		{
			if (this._isConnected)
			{
				var value = this._cachedExternalNumLabels;
				if (value < 0)
					value = this._cachedExternalNumLabels = SplunkLegend.numLabels();
				return value;
			}

			return -1;
		};

		this.getLabelIndexOverride = function(label)
		{
			if (this._isConnected)
			{
				var labelMap = this._cachedExternalLabelMap;
				if (!labelMap)
					labelMap = this._cachedExternalLabelMap = {};
				var index = labelMap[label];
				if (index == null)
					index = labelMap[label] = SplunkLegend.getLabelIndex(label);
				return index;
			}

			return -1;
		};

		this.updateLabelsOverride = function(labels)
		{
			if (this._isConnected)
			{
				this._cachedExternalNumLabels = -1;
				this._cachedExternalLabelMap = null;
				SplunkLegend.setLabels(this._id, labels);
				return true;
			}

			return false;
		};

		// Private Methods

		this._external_setLabels = function()
		{
			this.notifySettingLabels();
		};

		this._external_labelIndexMapChanged = function()
		{
			this._cachedExternalNumLabels = -1;
			this._cachedExternalLabelMap = null;

			this.notifyLabelIndexMapChanged();
		};

	});

});
});

jg_import.define("splunk.palettes.ColorPalette", function()
{
jg_namespace("splunk.palettes", function()
{

	var MObservable = jg_import("jgatt.events.MObservable");
	var MPropertyTarget = jg_import("jgatt.properties.MPropertyTarget");
	var Property = jg_import("jgatt.properties.Property");
	var PropertyEventData = jg_import("jgatt.properties.PropertyEventData");

	this.ColorPalette = jg_extend(Object, function(ColorPalette, base)
	{

		base = jg_mixin(this, MObservable, base);
		base = jg_mixin(this, MPropertyTarget, base);

		// Private Properties

		this._properties = null;

		// Constructor

		this.constructor = function()
		{
			base.constructor.call(this);

			this.addEventListener(this.changed, this._self_changed, Infinity);
		};

		// Public Methods

		this.getColor = function(field, index, count)
		{
			if ((field != null) && (typeof field !== "string"))
				throw new Error("Parameter field must be a string.");
			if (index == null)
				throw new Error("Parameter index must be non-null.");
			if (typeof index !== "number")
				throw new Error("Parameter index must be a number.");
			if (count == null)
				throw new Error("Parameter count must be non-null.");
			if (typeof count !== "number")
				throw new Error("Parameter count must be a number.");

			if (!this._properties)
				this._properties = this._getProperties();

			return this.getColorOverride(this._properties, field, Math.floor(index), Math.floor(count));
		};

		// Protected Methods

		this.getColorOverride = function(properties, field, index, count)
		{
			return 0x000000;
		};

		// Private Methods

		this._getProperties = function()
		{
			var properties = {};
			var property;
			for (var p in this)
			{
				property = this[p];
				if (property instanceof Property)
					properties[p] = this.getInternal(property);
			}
			return properties;
		};

		this._self_changed = function(e)
		{
			if ((e.target === this) && (e instanceof PropertyEventData))
				this._properties = null;
		};

	});

});
});

jg_import.define("splunk.palettes.FieldColorPalette", function()
{
jg_namespace("splunk.palettes", function()
{

	var ObservableProperty = jg_import("jgatt.properties.ObservableProperty");
	var ColorPalette = jg_import("splunk.palettes.ColorPalette");

	this.FieldColorPalette = jg_extend(ColorPalette, function(FieldColorPalette, base)
	{

		// Private Static Methods

		var _cloneFieldColors = function(fieldColors)
		{
			var fieldColors2 = {};
			for (var field in fieldColors)
			{
				if (fieldColors[field] != null)
					fieldColors2[field] = Number(fieldColors[field]);
			}
			return fieldColors2;
		};

		// Public Properties

		this.fieldColors = new ObservableProperty("fieldColors", Object, {})
			.readFilter(function(value)
			{
				return _cloneFieldColors(value);
			})
			.writeFilter(function(value)
			{
				return _cloneFieldColors(value);
			});

		this.defaultColorPalette = new ObservableProperty("defaultColorPalette", ColorPalette, null);

		// Constructor

		this.constructor = function(fieldColors, defaultColorPalette)
		{
			base.constructor.call(this);

			if (fieldColors != null)
				this.set(this.fieldColors, fieldColors);
			if (defaultColorPalette != null)
				this.set(this.defaultColorPalette, defaultColorPalette);
		};

		// Protected Methods

		this.getColorOverride = function(properties, field, index, count)
		{
			if (field)
			{
				var color = properties.fieldColors[field];
				if ((color != null) && !isNaN(color))
					return color;
			}

			if (properties.defaultColorPalette)
				return properties.defaultColorPalette.getColor(field, index, count);

			return 0x000000;
		};

	});

});
});

jg_import.define("splunk.palettes.ListColorPalette", function()
{
jg_namespace("splunk.palettes", function()
{

	var ColorUtils = jg_import("jgatt.graphics.ColorUtils");
	var ObservableArrayProperty = jg_import("jgatt.properties.ObservableArrayProperty");
	var ObservableProperty = jg_import("jgatt.properties.ObservableProperty");
	var ColorPalette = jg_import("splunk.palettes.ColorPalette");

	this.ListColorPalette = jg_extend(ColorPalette, function(ListColorPalette, base)
	{

		// Public Properties

		this.colors = new ObservableArrayProperty("colors", Number, [])
			.readFilter(function(value)
			{
				return value.concat();
			})
			.writeFilter(function(value)
			{
				return value ? value.concat() : [];
			});

		this.interpolate = new ObservableProperty("interpolate", Boolean, false);

		// Constructor

		this.constructor = function(colors, interpolate)
		{
			base.constructor.call(this);

			if (colors != null)
				this.set(this.colors, colors);
			if (interpolate != null)
				this.set(this.interpolate, interpolate);
		};

		// Protected Methods

		this.getColorOverride = function(properties, field, index, count)
		{
			var colors = properties.colors;
			var numColors = colors.length;

			if (numColors == 0)
				return 0x000000;

			if (index < 0)
				index = 0;

			if (properties.interpolate)
			{
				if (count < 1)
					count = 1;
				if (index > count)
					index = count;

				var p = (count == 1) ? 0 : (numColors - 1) * (index / (count - 1));
				var index1 = Math.floor(p);
				var index2 = Math.min(index1 + 1, numColors - 1);
				p -= index1;

				return ColorUtils.interpolate(colors[index1], colors[index2], p);
			}

			return colors[index % numColors];
		};

	});

});
});

jg_import.define("splunk.parsers.Parser", function()
{
jg_namespace("splunk.parsers", function()
{

	this.Parser = jg_extend(Object, function(Parser, base)
	{

		// Public Methods

		this.stringToValue = function(str)
		{
			return null;
		};

		this.valueToString = function(value)
		{
			return null;
		};

	});

});
});

jg_import.define("splunk.parsers.ParseUtils", function()
{
jg_namespace("splunk.parsers", function()
{

	this.ParseUtils = jg_static(function(ParseUtils)
	{

		// Private Static Constants

		var _UNESCAPE_PATTERN = /\\([.\n\r]?)/g;
		var _ESCAPE_SLASH_PATTERN = /\\/g;
		var _ESCAPE_QUOTE_PATTERN = /"/g;

		// Public Static Methods

		ParseUtils.prepareArray = function(str)
		{
			if (!str || (typeof str !== "string"))
				return null;

			str = ParseUtils.trimWhiteSpace(str);
			if (!str)
				return null;

			var length = str.length;
			if (length < 2)
				return null;

			if (str.charAt(0) != "[")
				return null;

			if (str.charAt(length - 1) != "]")
				return null;

			str = str.substring(1, length - 1);
			length = str.length;

			var arr = [];
			var index = -1;
			var value;

			while (index < length)
			{
				index++;
				value = _readUntil(str, index, ",");
				index += value.length;

				value = ParseUtils.trimWhiteSpace(value);
				if (value || (index < length) || (arr.length > 0))
					arr.push(ParseUtils.unescapeString(value));
			}

			return arr;
		};

		ParseUtils.prepareObject = function(str)
		{
			if (!str || (typeof str !== "string"))
				return null;

			str = ParseUtils.trimWhiteSpace(str);
			if (!str)
				return null;

			var length = str.length;
			if (length < 2)
				return null;

			if (str.charAt(0) != "{")
				return null;

			if (str.charAt(length - 1) != "}")
				return null;

			str = str.substring(1, length - 1);
			length = str.length;

			var obj = {};
			var index = 0;
			var key;
			var value;

			while (index < length)
			{
				key = _readUntil(str, index, ":");
				index += key.length + 1;

				if (index > length)
					break;

				value = _readUntil(str, index, ",");
				index += value.length + 1;

				key = ParseUtils.unescapeString(key);
				if (key)
					obj[key] = ParseUtils.unescapeString(value);
			}

			return obj;
		};

		ParseUtils.prepareTuple = function(str)
		{
			if (!str || (typeof str !== "string"))
				return null;

			str = ParseUtils.trimWhiteSpace(str);
			if (!str)
				return null;

			var length = str.length;
			if (length < 2)
				return null;

			if (str.charAt(0) != "(")
				return null;

			if (str.charAt(length - 1) != ")")
				return null;

			str = str.substring(1, length - 1);
			length = str.length;

			var arr = [];
			var index = -1;
			var value;

			while (index < length)
			{
				index++;
				value = _readUntil(str, index, ",");
				index += value.length;

				value = ParseUtils.trimWhiteSpace(value);
				if (value || (index < length) || (arr.length > 0))
					arr.push(ParseUtils.unescapeString(value));
			}

			return arr;
		};

		ParseUtils.unescapeString = function(str)
		{
			if ((str == null) || (typeof str !== "string"))
				return null;

			if (!str)
				return str;

			str = ParseUtils.trimWhiteSpace(str);
			if (!str)
				return str;

			var length = str.length;
			if (length < 2)
				return str;

			if (str.charAt(0) != "\"")
				return str;

			if (str.charAt(length - 1) != "\"")
				return str;

			str = str.substring(1, length - 1);
			if (!str)
				return str;

			str = str.replace(_UNESCAPE_PATTERN, "$1");

			return str;
		};

		ParseUtils.escapeString = function(str)
		{
			if ((str == null) || (typeof str !== "string"))
				return null;

			// two simple replace calls are faster than str.replace(/([\\"])/g, "\\$1")
			str = str.replace(_ESCAPE_SLASH_PATTERN, "\\\\");
			str = str.replace(_ESCAPE_QUOTE_PATTERN, "\\\"");

			return "\"" + str + "\"";
		};

		ParseUtils.trimWhiteSpace = function(str)
		{
			if ((str == null) || (typeof str !== "string"))
				return null;

			if (!str)
				return str;

			var startIndex = 0;
			var endIndex = str.length - 1;

			for (startIndex; startIndex <= endIndex; startIndex++)
			{
				if (!ParseUtils.isWhiteSpace(str.charAt(startIndex)))
					break;
			}

			for (endIndex; endIndex >= startIndex; endIndex--)
			{
				if (!ParseUtils.isWhiteSpace(str.charAt(endIndex)))
					break;
			}

			return str.substring(startIndex, endIndex + 1);
		};

		ParseUtils.isWhiteSpace = function(ch)
		{
			return ((ch === " ") || (ch === "\t") || (ch === "\n") || (ch === "\r"));
		};

		// Private Static Methods

		var _readUntil = function(str, startIndex, endChar)
		{
			var substr = "";

			var index = startIndex;
			var length = str.length;
			var ch;
			var isQuote = false;
			var nestLevel = 0;
			var nestBeginChar;
			var nestEndChar;

			while (index < length)
			{
				ch = str.charAt(index);
				if (isQuote)
				{
					if (ch == "\"")
					{
						isQuote = false;
					}
					else if (ch == "\\")
					{
						substr += ch;
						index++;
						ch = str.charAt(index);
					}
				}
				else if (nestLevel > 0)
				{
					if (ch == nestEndChar)
						nestLevel--;
					else if (ch == nestBeginChar)
						nestLevel++;
					else if (ch == "\"")
						isQuote = true;
				}
				else if (ch != endChar)
				{
					if (ch == "[")
					{
						nestLevel = 1;
						nestBeginChar = "[";
						nestEndChar = "]";
					}
					else if (ch == "{")
					{
						nestLevel = 1;
						nestBeginChar = "{";
						nestEndChar = "}";
					}
					else if (ch == "(")
					{
						nestLevel = 1;
						nestBeginChar = "(";
						nestEndChar = ")";
					}
					else if (ch == "\"")
					{
						isQuote = true;
					}
				}
				else
				{
					break;
				}

				substr += ch;
				index++;
			}

			return substr;
		};

	});

});
});

jg_import.define("splunk.parsers.StringParser", function()
{
jg_namespace("splunk.parsers", function()
{

	var Parser = jg_import("splunk.parsers.Parser");

	this.StringParser = jg_extend(Parser, function(StringParser, base)
	{

		// Private Static Properties

		var _instance = null;

		// Public Static Methods

		StringParser.getInstance = function()
		{
			if (!_instance)
				_instance = new StringParser();
			return _instance;
		};

		// Public Methods

		this.stringToValue = function(str)
		{
			return ((str == null) || (typeof str !== "string")) ? null : str;
		};

		this.valueToString = function(value)
		{
			return (value == null) ? null : String(value);
		};

	});

});
});

jg_import.define("splunk.parsers.ArrayParser", function()
{
jg_namespace("splunk.parsers", function()
{

	var Dictionary = jg_import("jgatt.utils.Dictionary");
	var Parser = jg_import("splunk.parsers.Parser");
	var ParseUtils = jg_import("splunk.parsers.ParseUtils");
	var StringParser = jg_import("splunk.parsers.StringParser");

	this.ArrayParser = jg_extend(Parser, function(ArrayParser, base)
	{

		// Private Static Properties

		var _instances = new Dictionary();

		// Public Static Methods

		ArrayParser.getInstance = function(elementParser)
		{
			var instance = _instances.get(elementParser);
			if (!instance)
				instance = _instances.set(elementParser, new ArrayParser(elementParser));
			return instance;
		};

		// Protected Properties

		this.elementParser = null;

		// Constructor

		this.constructor = function(elementParser)
		{
			if (elementParser == null)
				throw new Error("Parameter elementParser must be non-null.");
			if (!(elementParser instanceof Parser))
				throw new Error("Parameter elementParser must be an instance of splunk.parsers.Parser.");

			this.elementParser = elementParser;
		};

		// Public Methods

		this.stringToValue = function(str)
		{
			var array = ParseUtils.prepareArray(str);
			if (!array)
				return null;

			var elementParser = this.elementParser;
			for (var i = 0, l = array.length; i < l; i++)
				array[i] = elementParser.stringToValue(array[i]);

			return array;
		};

		this.valueToString = function(value)
		{
			var array = (value instanceof Array) ? value : null;
			if (!array)
				return null;

			var str = "";

			var elementParser = this.elementParser;
			var elementValue;
			for (var i = 0, l = array.length; i < l; i++)
			{
				elementValue = array[i];
				if (str)
					str += ",";
				if (elementParser instanceof StringParser)
					str += ParseUtils.escapeString(elementParser.valueToString(elementValue));
				else
					str += elementParser.valueToString(elementValue);
			}

			return "[" + str + "]";
		};

	});

});
});

jg_import.define("splunk.parsers.BooleanParser", function()
{
jg_namespace("splunk.parsers", function()
{

	var Parser = jg_import("splunk.parsers.Parser");
	var ParseUtils = jg_import("splunk.parsers.ParseUtils");

	this.BooleanParser = jg_extend(Parser, function(BooleanParser, base)
	{

		// Private Static Properties

		var _instance = null;

		// Public Static Methods

		BooleanParser.getInstance = function()
		{
			if (!_instance)
				_instance = new BooleanParser();
			return _instance;
		};

		// Public Methods

		this.stringToValue = function(str)
		{
			str = ParseUtils.trimWhiteSpace(str);
			if (str)
				str = str.toLowerCase();
			return ((str === "true") || (str === "t") || (str === "1"));
		};

		this.valueToString = function(value)
		{
			return value ? "true" : "false";
		};

	});

});
});

jg_import.define("splunk.parsers.NumberParser", function()
{
jg_namespace("splunk.parsers", function()
{

	var Parser = jg_import("splunk.parsers.Parser");
	var ParseUtils = jg_import("splunk.parsers.ParseUtils");

	this.NumberParser = jg_extend(Parser, function(NumberParser, base)
	{

		// Private Static Properties

		var _instance = null;

		// Public Static Methods

		NumberParser.getInstance = function()
		{
			if (!_instance)
				_instance = new NumberParser();
			return _instance;
		};

		// Public Methods

		this.stringToValue = function(str)
		{
			str = ParseUtils.trimWhiteSpace(str);
			return str ? Number(str) : NaN;
		};

		this.valueToString = function(value)
		{
			return (typeof value === "number") ? String(value) : String(NaN);
		};

	});

});
});

jg_import.define("splunk.parsers.ObjectParser", function()
{
jg_namespace("splunk.parsers", function()
{

	var Dictionary = jg_import("jgatt.utils.Dictionary");
	var Parser = jg_import("splunk.parsers.Parser");
	var ParseUtils = jg_import("splunk.parsers.ParseUtils");
	var StringParser = jg_import("splunk.parsers.StringParser");

	this.ObjectParser = jg_extend(Parser, function(ObjectParser, base)
	{

		// Private Static Properties

		var _instances = new Dictionary();

		// Public Static Methods

		ObjectParser.getInstance = function(elementParser)
		{
			var instance = _instances.get(elementParser);
			if (!instance)
				instance = _instances.set(elementParser, new ObjectParser(elementParser));
			return instance;
		};

		// Protected Properties

		this.elementParser = null;

		// Constructor

		this.constructor = function(elementParser)
		{
			if (elementParser == null)
				throw new Error("Parameter elementParser must be non-null.");
			if (!(elementParser instanceof Parser))
				throw new Error("Parameter elementParser must be an instance of splunk.parsers.Parser.");

			this.elementParser = elementParser;
		};

		// Public Methods

		this.stringToValue = function(str)
		{
			var map = ParseUtils.prepareObject(str);
			if (!map)
				return null;

			var elementParser = this.elementParser;
			for (var key in map)
			{
				if (map.hasOwnProperty(key))
					map[key] = elementParser.stringToValue(map[key]);
			}

			return map;
		};

		this.valueToString = function(value)
		{
			var map = (value instanceof Object) ? value : null;
			if (!map)
				return null;

			var str = "";

			var elementParser = this.elementParser;
			for (var key in map)
			{
				if (map.hasOwnProperty(key))
				{
					if (str)
						str += ",";
					str += ParseUtils.escapeString(key) + ":";
					if (elementParser instanceof StringParser)
						str += ParseUtils.escapeString(elementParser.valueToString(map[key]));
					else
						str += elementParser.valueToString(map[key]);
				}
			}

			return "{" + str + "}";
		};

	});

});
});

jg_import.define("splunk.mapping.LatLon", function()
{
jg_namespace("splunk.mapping", function()
{

	var Leaflet = jg_import("L");

	this.LatLon = jg_extend(Object, function(LatLon, base)
	{

		// Public Static Methods

		LatLon.fromLeaflet = function(latLng)
		{
			return new LatLon(latLng.lat, latLng.lng);
		};

		// Public Properties

		this.lat = 0;
		this.lon = 0;

		// Constructor

		this.constructor = function(lat, lon)
		{
			this.lat = (lat !== undefined) ? lat : 0;
			this.lon = (lon !== undefined) ? lon : 0;
		};

		// Public Methods

		this.normalize = function(center)
		{
			var lat = this.lat;
			if (lat < -90)
				lat = -90;
			else if (lat > 90)
				lat = 90;

			var centerLon = center ? center.lon : 0;
			var lon = (this.lon - centerLon) % 360;
			if (lon < -180)
				lon += 360;
			else if (lon > 180)
				lon -= 360;
			lon += centerLon;

			return new LatLon(lat, lon);
		};

		this.isFinite = function()
		{
			return (((this.lat - this.lat) === 0) &&
			        ((this.lon - this.lon) === 0));
		};

		this.equals = function(latLon)
		{
			return ((this.lat == latLon.lat) &&
			        (this.lon == latLon.lon));
		};

		this.clone = function()
		{
			return new LatLon(this.lat, this.lon);
		};

		this.toString = function()
		{
			return "(" + this.lat + ", " + this.lon + ")";
		};

		this.toLeaflet = function()
		{
			// Leaflet.LatLng wraps the coordinates passed to the constructor
			// we must assign the values manually to avoid this

			var latLng = new Leaflet.LatLng(0, 0);
			latLng.lat = this.lat;
			latLng.lng = this.lon;
			return latLng;
		};

	});

});
});

jg_import.define("splunk.mapping.LatLonBounds", function()
{
jg_namespace("splunk.mapping", function()
{

	var Leaflet = jg_import("L");
	var LatLon = jg_import("splunk.mapping.LatLon");

	this.LatLonBounds = jg_extend(Object, function(LatLonBounds, base)
	{

		// Public Static Methods

		LatLonBounds.fromLeaflet = function(latLngBounds)
		{
			var sw = latLngBounds.getSouthWest();
			var ne = latLngBounds.getNorthEast();
			return new LatLonBounds(sw.lat, sw.lng, ne.lat, ne.lng);
		};

		// Public Properties

		this.s = 0;
		this.w = 0;
		this.n = 0;
		this.e = 0;

		// Constructor

		this.constructor = function(s, w, n, e)
		{
			this.s = (s !== undefined) ? s : 0;
			this.w = (w !== undefined) ? w : 0;
			this.n = (n !== undefined) ? n : 0;
			this.e = (e !== undefined) ? e : 0;
		};

		// Public Methods

		this.getSW = function()
		{
			return new LatLon(this.s, this.w);
		};

		this.getSE = function()
		{
			return new LatLon(this.s, this.e);
		};

		this.getNW = function()
		{
			return new LatLon(this.n, this.w);
		};

		this.getNE = function()
		{
			return new LatLon(this.n, this.e);
		};

		this.getCenter = function()
		{
			return new LatLon((this.s + this.n) / 2, (this.w + this.e) / 2);
		};

		this.expand = function(latLon)
		{
			if (latLon.lat < this.s)
				this.s = latLon.lat;
			if (latLon.lat > this.n)
				this.n = latLon.lat;
			if (latLon.lon < this.w)
				this.w = latLon.lon;
			if (latLon.lon > this.e)
				this.e = latLon.lon;
		};

		this.contains = function(latLon)
		{
			return ((latLon.lat >= this.s) &&
			        (latLon.lat <= this.n) &&
			        (latLon.lon >= this.w) &&
			        (latLon.lon <= this.e));
		};

		this.normalize = function(center)
		{
			var s = this.s;
			if (s < -90)
				s = -90;
			else if (s > 90)
				s = 90;

			var n = this.n;
			if (n < s)
				n = s;
			else if (n > 90)
				n = 90;

			var centerLon = center ? center.lon : 0;
			var w = (this.w - centerLon);
			var e = (this.e - centerLon);
			if ((e - w) >= 360)
			{
				w = -180;
				e = 180;
			}
			else
			{
				w %= 360;
				if (w < -180)
					w += 360;
				else if (w > 180)
					w -= 360;

				e %= 360;
				if (e < -180)
					e += 360;
				else if (e > 180)
					e -= 360;

				if (e < w)
				{
					if (e > -w)
						w -= 360;
					else
						e += 360;
				}
			}
			w += centerLon;
			e += centerLon;

			return new LatLonBounds(s, w, n, e);
		};

		this.isFinite = function()
		{
			return (((this.s - this.s) === 0) &&
			        ((this.w - this.w) === 0) &&
			        ((this.n - this.n) === 0) &&
			        ((this.e - this.e) === 0));
		};

		this.equals = function(bounds)
		{
			return ((this.s == bounds.s) &&
			        (this.w == bounds.w) &&
			        (this.n == bounds.n) &&
			        (this.e == bounds.e));
		};

		this.clone = function()
		{
			return new LatLonBounds(this.s, this.w, this.n, this.e);
		};

		this.toString = function()
		{
			return "(" + this.s + ", " + this.w + ", " + this.n + ", " + this.e + ")";
		};

		this.toLeaflet = function()
		{
			// Leaflet.LatLng wraps the coordinates passed to the constructor
			// we must assign the values manually to avoid this

			var sw = new Leaflet.LatLng(0, 0);
			sw.lat = this.s;
			sw.lng = this.w;

			var ne = new Leaflet.LatLng(0, 0);
			ne.lat = this.n;
			ne.lng = this.e;

			return new Leaflet.LatLngBounds(sw, ne);
		};

	});

});
});

jg_import.define("splunk.events.GenericEventData", function()
{
jg_namespace("splunk.events", function()
{

	var EventData = jg_import("jgatt.events.EventData");

	this.GenericEventData = jg_extend(EventData, function(GenericEventData, base)
	{

		// Constructor

		this.constructor = function(attributes)
		{
			if (attributes != null)
			{
				for (var a in attributes)
				{
					if (attributes.hasOwnProperty(a) && !(a in this))
						this[a] = attributes[a];
				}
			}
		};

	});

});
});

jg_import.define("splunk.viz.MRenderTarget", function()
{
jg_namespace("splunk.viz", function()
{

	var MObservable = jg_import("jgatt.events.MObservable");
	var MPropertyTarget = jg_import("jgatt.properties.MPropertyTarget");
	var PropertyComparator = jg_import("jgatt.utils.PropertyComparator");
	var MValidateTarget = jg_import("jgatt.validation.MValidateTarget");
	var ValidatePass = jg_import("jgatt.validation.ValidatePass");

	this.MRenderTarget = jg_static(function(MRenderTarget)
	{

		// Mixin

		this.mixin = function(base)
		{
			base = jg_mixin(this, MObservable, base);
			base = jg_mixin(this, MPropertyTarget, base);
			base = jg_mixin(this, MValidateTarget, base);
		};

		// Public Passes

		this.renderPass = new ValidatePass("render", 3, new PropertyComparator("renderPriority"));

		// Public Properties

		this.renderPriority = 0;

		// Public Methods

		this.render = function()
		{
		};

	});

});
});

jg_import.define("splunk.mapping.layers.LayerBase", function()
{
jg_namespace("splunk.mapping.layers", function()
{

	var Property = jg_import("jgatt.properties.Property");
	var FunctionUtils = jg_import("jgatt.utils.FunctionUtils");
	var MRenderTarget = jg_import("splunk.viz.MRenderTarget");

	this.LayerBase = jg_extend(Object, function(LayerBase, base)
	{

		base = jg_mixin(this, MRenderTarget, base);

		// Public Static Constants

		LayerBase.METADATA_KEY = "__splunk_mapping_layers_LayerBase_metadata";

		// Public Properties

		this.map = new Property("map", Object, null, true);

		this.leafletLayer = null;

		// Constructor

		this.constructor = function()
		{
			base.constructor.call(this);

			this._map_boundsChanged = FunctionUtils.bind(this._map_boundsChanged, this);

			this.leafletLayer = this.createLeafletLayer();
			if (!this.leafletLayer)
				throw new Error("Value returned from createLeafletLayer() must be non-null.");
		};

		// Public Methods

		this.render = function()
		{
			this.validatePreceding("renderPass");

			if (this.isValid("renderPass"))
				return;

			var map = this.getInternal("map");
			if (map)
				this.renderOverride(map);

			this.setValid("renderPass");
		};

		// Protected Methods

		this.createLeafletLayer = function()
		{
			throw new Error("Must implement method createLeafletLayer.");
		};

		this.renderOverride = function(map)
		{
		};

		this.onAddedToMap = function(map)
		{
			this.setInternal("map", map);

			map.addEventListener("boundsChanged", this._map_boundsChanged);

			this.invalidate("renderPass");
		};

		this.onRemovedFromMap = function(map)
		{
			map.removeEventListener("boundsChanged", this._map_boundsChanged);

			this.setInternal("map", null);
		};

		// Private Methods

		this._map_boundsChanged = function(e)
		{
			this.invalidate("renderPass");
		};

	});

});
});

jg_import.define("splunk.viz.VizBase", function()
{
jg_namespace("splunk.viz", function()
{

	var $ = jg_import("jQuery");
	var MObservable = jg_import("jgatt.events.MObservable");
	var MPropertyTarget = jg_import("jgatt.properties.MPropertyTarget");
	var Property = jg_import("jgatt.properties.Property");
	var MValidateTarget = jg_import("jgatt.validation.MValidateTarget");

	this.VizBase = jg_extend(Object, function(VizBase, base)
	{

		base = jg_mixin(this, MObservable, base);
		base = jg_mixin(this, MPropertyTarget, base);
		base = jg_mixin(this, MValidateTarget, base);

		// Private Static Constants

		var _INSTANCE_KEY = "__splunk_viz_VizBase_instance";

		// Private Static Properties

		var _instanceCount = 0;

		// Public Static Methods

		VizBase.getInstance = function(element)
		{
			if (element == null)
				return null;

			element = $(element);
			if (element.length == 0)
				return null;

			element = element[0];

			var instance = element[_INSTANCE_KEY];
			return (instance instanceof VizBase) ? instance : null;
		};

		// Public Properties

		this.id = new Property("id", String, null, true);

		this.element = null;
		this.$element = null;

		// Constructor

		this.constructor = function(html)
		{
			if ((html != null) && (typeof html !== "string"))
				throw new Error("Parameter html must be a string.");

			var query = $(html ? html : "<div></div>");
			if (query.length == 0)
				throw new Error("Parameter html must be valid markup.");

			base.constructor.call(this);

			var id = "splunk-viz-VizBase-" + (++_instanceCount);

			this.element = query[0];
			//this.element[_INSTANCE_KEY] = this;
			//this.element.id = id;

			this.$element = $(this.element);

			this.setInternal("id", id);

			this.addStyleClass("splunk-viz-VizBase");
		};

		// Public Methods

		this.addStyleClass = function(styleClass)
		{
			this.$element.addClass(styleClass);
		};

		this.removeStyleClass = function(styleClass)
		{
			this.$element.removeClass(styleClass);
		};

		this.setStyle = function(style)
		{
			this.$element.css(style);
		};

		this.appendTo = function(parentElement)
		{
			if (parentElement == null)
				throw new Error("Parameter parentElement must be non-null.");

			if (parentElement instanceof VizBase)
				parentElement = parentElement.element;

			parentElement = $(parentElement);
			if (parentElement.length == 0)
				return;

			parentElement = parentElement[0];

			var oldParent = this.element.parentNode;
			if (oldParent && (oldParent !== parentElement))
				this.onRemove();

			parentElement.appendChild(this.element);

			if (oldParent !== parentElement)
				this.onAppend();
		};

		this.replace = function(element)
		{
			if (element == null)
				throw new Error("Parameter element must be non-null.");

			if (element instanceof VizBase)
				element = element.element;

			element = $(element);
			if (element.length == 0)
				return;

			element = element[0];

			var parentElement = element.parentNode;
			if (parentElement == null)
				return;

			var oldParent = this.element.parentNode;
			if (oldParent && (oldParent !== parentElement))
				this.onRemove();

			parentElement.replaceChild(this.element, element);

			if (oldParent !== parentElement)
				this.onAppend();
		};

		this.remove = function()
		{
			var element = this.element;
			var parentElement = element.parentNode;
			if (!parentElement)
				return;

			this.onRemove();

			parentElement.removeChild(element);
		};

		this.dispose = function()
		{
			this.remove();

			// ensure all jquery data and events are removed
			this.$element.remove();
		};

		// Protected Methods

		this.onAppend = function()
		{
		};

		this.onRemove = function()
		{
		};

	});

});
});

jg_import.define("splunk.mapping.Map", function()
{
jg_namespace("splunk.mapping", function()
{

	var Leaflet = jg_import("L");
	var ChainedEvent = jg_import("jgatt.events.ChainedEvent");
	var Event = jg_import("jgatt.events.Event");
	var EventData = jg_import("jgatt.events.EventData");
	var ObservableArrayProperty = jg_import("jgatt.properties.ObservableArrayProperty");
	var ObservableProperty = jg_import("jgatt.properties.ObservableProperty");
	var Property = jg_import("jgatt.properties.Property");
	var ArrayUtils = jg_import("jgatt.utils.ArrayUtils");
	var FunctionUtils = jg_import("jgatt.utils.FunctionUtils");
	var NumberUtils = jg_import("jgatt.utils.NumberUtils");
	var StringUtils = jg_import("jgatt.utils.StringUtils");
	var ValidatePass = jg_import("jgatt.validation.ValidatePass");
	var GenericEventData = jg_import("splunk.events.GenericEventData");
	var LatLon = jg_import("splunk.mapping.LatLon");
	var LatLonBounds = jg_import("splunk.mapping.LatLonBounds");
	var LayerBase = jg_import("splunk.mapping.layers.LayerBase");
	var VizBase = jg_import("splunk.viz.VizBase");

	this.Map = jg_extend(VizBase, function(Map, base)
	{

		// Private Static Constants

		var _MIN_LAT = -85.051128779806;
		var _MAX_LAT =  85.051128779806;

		// Public Passes

		this.updateLeafletMapSizePass = new ValidatePass("updateLeafletMapSize", -1);
		this.updateTilesPass = new ValidatePass("updateTiles", 0);

		// Public Events

		this.boundsChanged = new ChainedEvent("boundsChanged", this.changed, EventData);
		this.mapClicked = new Event("mapClicked", GenericEventData);

		// Public Properties

		this.center = new Property("center", LatLon, null)
			.getter(function()
			{
				return LatLon.fromLeaflet(this.leafletMap.getCenter());
			})
			.setter(function(value)
			{
				value = (value && value.isFinite()) ? value.clone() : new LatLon();

				this.validate();
				this.leafletMap.setView(value.toLeaflet(), this.leafletMap.getZoom(), true);

				this._checkBoundsChanged();

				// set a second time on a delay since Leaflet is a POS and doesn't set the
				// center properly if zoom, minZoom, or maxZoom are also set at the same time
				clearTimeout(this._setCenterTimeout);
				this._setCenterTimeout = setTimeout(FunctionUtils.bind(function()
				{
					this.leafletMap.setView(value.toLeaflet(), this.leafletMap.getZoom(), true);
					this._checkBoundsChanged();
				}, this), 500);
			});

		this.zoom = new Property("zoom", Number, 0)
			.getter(function()
			{
				return this.leafletMap.getZoom();
			})
			.setter(function(value)
			{
				value = ((value >= 0) && (value < Infinity)) ? value : 0;

				this.validate();
				this.leafletMap.setView(this.leafletMap.getCenter(), value, true);

				this._checkBoundsChanged();
			});

		this.tileURL = new ObservableProperty("tileURL", String, null)
			.onChanged(function(e)
			{
				this.invalidate("updateTilesPass");
			});

		this.tileSubdomains = new ObservableArrayProperty("tileSubdomains", String, [ "a", "b", "c" ])
			.readFilter(function(value)
			{
				return value.concat();
			})
			.writeFilter(function(value)
			{
				return value ? value.concat() : [];
			})
			.changedComparator(function(oldValue, newValue)
			{
				if (oldValue.length !== newValue.length)
					return true;

				for (var i = 0, l = oldValue.length; i < l; i++)
				{
					if (oldValue[i] !== newValue[i])
						return true;
				}

				return false;
			})
			.onChanged(function(e)
			{
				this.invalidate("updateTilesPass");
			});

		this.tileMinZoom = new ObservableProperty("tileMinZoom", Number, 0)
			.writeFilter(function(value)
			{
				return ((value >= 0) && (value < Infinity)) ? Math.floor(value) : 0;
			})
			.onChanged(function(e)
			{
				this.invalidate("updateTilesPass");
			});

		this.tileMaxZoom = new ObservableProperty("tileMaxZoom", Number, Infinity)
			.writeFilter(function(value)
			{
				return ((value >= 0) && (value < Infinity)) ? Math.floor(value) : Infinity;
			})
			.onChanged(function(e)
			{
				this.invalidate("updateTilesPass");
			});

		this.tileInvertY = new ObservableProperty("tileInvertY", Boolean, false)
			.onChanged(function(e)
			{
				this.invalidate("updateTilesPass");
			});

		this.tileAttribution = new ObservableProperty("tileAttribution", String, null)
			.onChanged(function(e)
			{
				this.invalidate("updateTilesPass");
			});

		this.leafletMap = null;

		this.formatNumber = null;
		this.formatDegrees = null;

		// Private Properties

		this._tooltip = null;
		this._tooltipMetadata = null;
		this._layers = null;
		this._tileLayer = null;
		this._width = 0;
		this._height = 0;
		this._bounds = null;
		this._updateSizeInterval = 0;
		this._setCenterTimeout = 0;

		// Constructor

		this.constructor = function()
		{
			base.constructor.call(this);

			this.addStyleClass("splunk-mapping-Map");

			this.setStyle({ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "none" });

			this.updateSize = FunctionUtils.bind(this.updateSize, this);
			this._leafletMap_moveend = FunctionUtils.bind(this._leafletMap_moveend, this);
			this._leafletMap_zoomend = FunctionUtils.bind(this._leafletMap_zoomend, this);
			this._self_mouseOver = FunctionUtils.bind(this._self_mouseOver, this);
			this._self_mouseOut = FunctionUtils.bind(this._self_mouseOut, this);
			this._self_mouseMove = FunctionUtils.bind(this._self_mouseMove, this);
			this._self_click = FunctionUtils.bind(this._self_click, this);

			this.leafletMap = new Leaflet.Map(this.element, { center: new Leaflet.LatLng(0, 0), zoom: 0, trackResize: false, worldCopyJump: false });
			this.leafletMap.attributionControl.setPrefix("");
			this.leafletMap.on("moveend", this._leafletMap_moveend);
			this.leafletMap.on("zoomend", this._leafletMap_zoomend);

			this._tooltip = new LeafletTooltip();

			this._layers = [];

			this.$element.bind("mouseover", this._self_mouseOver);
			this.$element.bind("mouseout", this._self_mouseOut);
			this.$element.bind("mousemove", this._self_mouseMove);
			this.$element.bind("click", this._self_click);
		};

		// Public Methods

		this.updateLeafletMapSize = function()
		{
			this.validatePreceding("updateLeafletMapSizePass");

			if (this.isValid("updateLeafletMapSizePass"))
				return;

			this.leafletMap.invalidateSize();
			// hack to force immediate redraw
			clearTimeout(this.leafletMap._sizeTimer);
			this.leafletMap.fire("moveend");

			this.setValid("updateLeafletMapSizePass");
		};

		this.updateTiles = function()
		{
			this.validatePreceding("updateTilesPass");

			if (this.isValid("updateTilesPass"))
				return;

			var leafletMap = this.leafletMap;

			var tileLayer = this._tileLayer;
			if (tileLayer)
			{
				leafletMap.removeLayer(tileLayer);
				this._tileLayer = null;
			}

			var tileOptions = {};
			tileOptions.subdomains = this.getInternal("tileSubdomains");
			tileOptions.minZoom = this.getInternal("tileMinZoom");
			tileOptions.maxZoom = this.getInternal("tileMaxZoom");
			tileOptions.tms = this.getInternal("tileInvertY");
			tileOptions.attribution = this.getInternal("tileAttribution");

			var tileURL = this.getInternal("tileURL");
			if (tileURL)
			{
				tileLayer = this._tileLayer = new Leaflet.TileLayer(tileURL, tileOptions);
				leafletMap.addLayer(tileLayer, true);
			}

			// hack to adjust maxZoom on leafletMap
			leafletMap.options.minZoom = tileOptions.minZoom;
			leafletMap.options.maxZoom = tileOptions.maxZoom;
			leafletMap.setZoom(leafletMap.getZoom());

			this.setValid("updateTilesPass");

			this._checkBoundsChanged();
		};

		this.addLayer = function(layer)
		{
			if (layer == null)
				throw new Error("Parameter layer must be non-null.");
			if (!(layer instanceof LayerBase))
				throw new Error("Parameter layer must be an instance of splunk.mapping.layers.LayerBase");

			var layers = this._layers;
			if (ArrayUtils.indexOf(layers, layer) >= 0)
				return;

			layers.push(layer);
			this.leafletMap.addLayer(layer.leafletLayer);
			layer.onAddedToMap(this);
		};

		this.removeLayer = function(layer)
		{
			if (layer == null)
				throw new Error("Parameter layer must be non-null.");
			if (!(layer instanceof LayerBase))
				throw new Error("Parameter layer must be an instance of splunk.mapping.layers.LayerBase");

			var layers = this._layers;
			var index = ArrayUtils.indexOf(layers, layer);
			if (index < 0)
				return;

			layer.onRemovedFromMap(this);
			this.leafletMap.removeLayer(layer.leafletLayer);
			layers.splice(index, 1);
		};

		this.fitWorld = function(viewportInside)
		{
			if ((viewportInside != null) && (typeof viewportInside !== "boolean"))
				throw new Error("Parameter viewportInside must be a boolean.");

			this.fitBounds(new LatLonBounds(-60, -180, 85, 180), viewportInside);
		};

		this.fitBounds = function(latLonBounds, viewportInside)
		{
			if (latLonBounds == null)
				throw new Error("Parameter latLonBounds must be non-null.");
			if (!(latLonBounds instanceof LatLonBounds))
				throw new Error("Parameter latLonBounds must be an instance of splunk.mapping.LatLonBounds.");
			if ((viewportInside != null) && (typeof viewportInside !== "boolean"))
				throw new Error("Parameter viewportInside must be a boolean.");

			latLonBounds = latLonBounds.isFinite() ? latLonBounds : new LatLonBounds(-60, -180, 85, 180);
			viewportInside = (viewportInside === true);

			// clear center timeout hack so it doesn't conflict with the center we set here
			clearTimeout(this._setCenterTimeout);

			// compute zoom
			var zoom = this.leafletMap.getBoundsZoom(latLonBounds.toLeaflet(), viewportInside);

			// must set zoom first so that Leaflet conversion methods are accurate when computing the center
			this.leafletMap.setView(this.leafletMap.getCenter(), zoom, true);

			// compute center
			var tl = this.leafletMap.latLngToLayerPoint(latLonBounds.getNW().toLeaflet());
			var br = this.leafletMap.latLngToLayerPoint(latLonBounds.getSE().toLeaflet());
			var centerPoint = new Leaflet.Point((tl.x + br.x) / 2, (tl.y + br.y) / 2);
			var center = this.leafletMap.layerPointToLatLng(centerPoint);

			// set center and zoom
			this.leafletMap.setView(center, zoom, true);

			this._checkBoundsChanged();
		};

		this.getLatLonBounds = function()
		{
			return LatLonBounds.fromLeaflet(this.leafletMap.getBounds());
		};

		this.updateSize = function()
		{
			var width = this.$element.width();
			var height = this.$element.height();
			if ((width === this._width) && (height === this._height))
				return;

			this._width = width;
			this._height = height;

			this.leafletMap.invalidateSize();
			this.invalidate("updateLeafletMapSizePass");

			this._checkBoundsChanged();
		};

		this.dispose = function()
		{
			clearTimeout(this._setCenterTimeout);

			var layers = this._layers.concat();
			for (var i = layers.length - 1; i >= 0; i--)
				this.removeLayer(layers[i]);

			base.dispose.call(this);
		};

		// Protected Methods

		this.onAppend = function()
		{
			this._updateSizeInterval = setInterval(this.updateSize, 50);

			this.updateSize();
		};

		this.onRemove = function()
		{
			clearInterval(this._updateSizeInterval);
		};

		// Private Methods

		this._checkBoundsChanged = function()
		{
			var oldBounds = this._bounds;
			var newBounds = this.getLatLonBounds();
			if (oldBounds && oldBounds.equals(newBounds))
				return;

			this._bounds = newBounds;

			this.dispatchEvent("boundsChanged", new EventData());
		};

		this._updateTooltip = function(element)
		{
			var tooltip = this._tooltip;
			var metadata = this._getMetadataFromElement(element);

			if (metadata && (metadata !== this._tooltipMetadata))
			{
				this._tooltipMetadata = metadata;

				var data = metadata.data;
				var fields = metadata.fields;
				var sliceList = metadata.sliceList;
				var tooltipLatLng = metadata.tooltipLatLng;
				var tooltipOffsetRadius = metadata.tooltipOffsetRadius;

				if (data && fields && tooltipLatLng)
				{
					var content = "";
					var field;
					var slice;
					var i, l;

					content += "<table style=\"border: 0 none; border-spacing: 0; border-collapse: collapse;\">";
					for (i = 0, l = Math.min(fields.length, 2); i < l; i++)
					{
						field = fields[i];
						content += "<tr>";
						content += "<td style=\"padding: 0; text-align: left; white-space: nowrap; color: #333333;\">" + StringUtils.escapeHTML(field) + ":&nbsp;&nbsp;</td><td style=\"padding: 0; text-align: right; white-space: nowrap;\">" + StringUtils.escapeHTML(this._formatDegrees(data[field], (i === 0) ? "ns" : "ew")) + "</td>";
						content += "</tr>";
					}
					for (i = 0, l = sliceList.length; i < l; i++)
					{
						slice = sliceList[i];
						content += "<tr>";
						content += "<td style=\"padding: 0; text-align: left; white-space: nowrap; color: " + ("#" + (slice.series.color | 0x1000000).toString(16).substring(1)) + ";\">" + StringUtils.escapeHTML(slice.series.name) + ":&nbsp;&nbsp;</td><td style=\"padding: 0; text-align: right; white-space: nowrap;\">" + StringUtils.escapeHTML(this._formatNumber(slice.value)) + "</td>";
						content += "</tr>";
					}
					content += "</table>";

					tooltip.setLatLng(tooltipLatLng);
					tooltip.setOffsetRadius(tooltipOffsetRadius);
					tooltip.setContent(content);

					this.leafletMap.openPopup(tooltip);
				}
				else
				{
					this.leafletMap.closePopup();
				}
			}
			else if (!metadata && this._tooltipMetadata)
			{
				this._tooltipMetadata = null;

				this.leafletMap.closePopup();
			}
		};

		this._getMetadataFromElement = function(element)
		{
			while (element)
			{
				if (element[LayerBase.METADATA_KEY])
					return element[LayerBase.METADATA_KEY];
				element = element.parentNode;
			}
			return null;
		};

		this._formatNumber = function(num)
		{
			var format = this.formatNumber;
			if (typeof format === "function")
				return format(Number(num));

			return String(num);
		};

		this._formatDegrees = function(degrees, orientation)
		{
			var format = this.formatDegrees;
			if (typeof format === "function")
				return format(Number(degrees), orientation);

			return String(degrees);
		};

		this._leafletMap_moveend = function(e)
		{
			this._checkBoundsChanged();
		};

		this._leafletMap_zoomend = function(e)
		{
			this._checkBoundsChanged();
		};

		this._self_mouseOver = function(e)
		{
			this._updateTooltip(e.target);
		};

		this._self_mouseOut = function(e)
		{
			this._updateTooltip(e.target);
		};

		this._self_mouseMove = function(e)
		{
			this._updateTooltip(e.target);
		};

		this._self_click = function(e)
		{
			if (this.leafletMap.dragging && this.leafletMap.dragging.moved())
				return;

			var metadata = this._getMetadataFromElement(e.target);
			if (!metadata || !metadata.data || !metadata.fields)
				return;

			e.preventDefault();

			var data = {};
			for (var p in metadata.data)
				data[p] = metadata.data[p];
			var fields = metadata.fields.concat();

			this.dispatchEvent("mapClicked", new GenericEventData({ data: data, fields: fields, altKey: e.altKey, ctrlKey: e.ctrlKey || e.metaKey, shiftKey: e.shiftKey, jQueryEvent: e, originalEvent: e.originalEvent }));
		};

	});

	var LeafletTooltip = Leaflet.Popup.extend({

		options: {
			paddingX: 5,
			paddingY: 5
		},

		_offsetRadius: 0,

		initialize: function(options) {
			options = Leaflet.Util.extend(options || {}, { maxWidth: Infinity, maxHeight: Infinity, autoPan: false, closeButton: false });
			Leaflet.Popup.prototype.initialize.call(this, options);
		},

		setOffsetRadius: function(offsetRadius) {
			this._offsetRadius = offsetRadius;
			this._update();
			return this;
		},

		_initLayout: function() {
			Leaflet.Popup.prototype._initLayout.call(this);

			// hide tip
			this._tipContainer.style.display = "none";
		},

		_updatePosition: function() {
			var map = this._map;
			var mapTL = map.containerPointToLayerPoint(new Leaflet.Point(0, 0));
			var mapBR = map.containerPointToLayerPoint(map.getSize());
			var mapLeft = mapTL.x;
			var mapTop = mapTL.y;
			var mapRight = mapBR.x;
			var mapBottom = mapBR.y;

			var container = this._container;
			var containerWidth = container.offsetWidth;
			var containerHeight = container.offsetHeight;

			var is3d = L.Browser.any3d;
			var offsetRadius = this._offsetRadius;
			var paddingX = this.options.paddingX;
			var paddingY = this.options.paddingY;

			var centerPoint = map.latLngToLayerPoint(this._latlng);
			var offsetX = (centerPoint.x > ((mapLeft + mapRight) / 2)) ? (-containerWidth - offsetRadius - paddingX) : offsetRadius + paddingX;
			var offsetY = NumberUtils.maxMin(centerPoint.y - containerHeight / 2, mapBottom - containerHeight - paddingY, mapTop + paddingY) - centerPoint.y;

			if (is3d)
				L.DomUtil.setPosition(container, centerPoint);

			var x = offsetX + (is3d ? 0 : centerPoint.x);
			var y = offsetY + (is3d ? 0 : centerPoint.y);

			container.style.left = Math.round(x) + "px";
			container.style.top = Math.round(y) + "px";
		}

	});

	// override Leaflet.Control.Attribution so that the attribution container is hidden when there is no text
	Leaflet.Control.Attribution.include({

		_update: function () {
			if (!this._map) { return; }

			var attribs = [];

			for (var i in this._attributions) {
				if (this._attributions.hasOwnProperty(i) && this._attributions[i]) {
					attribs.push(i);
				}
			}

			var prefixAndAttribs = [];

			if (this.options.prefix) {
				prefixAndAttribs.push(this.options.prefix);
			}
			if (attribs.length) {
				prefixAndAttribs.push(attribs.join(', '));
			}

			var text = prefixAndAttribs.join(' &#8212; ');

			this._container.innerHTML = text;
			this._container.style.display = text ? "" : "none";
		}

	});

});
});

jg_import.define("splunk.vectors.VectorElement", function()
{
jg_namespace("splunk.vectors", function()
{

	this.VectorElement = jg_extend(Object, function(VectorElement, base)
	{

		// Private Static Constants

		var _HAS_SVG = (typeof document.createElementNS === "function");
		var _HAS_VML = (!_HAS_SVG && (function()
		{
			try
			{
				document.namespaces.add("splvml", "urn:schemas-microsoft-com:vml");

				var styleText = ".splvml { behavior: url(#default#VML); display: inline-block; position: absolute; }";

				var styleNode = document.createElement("style");
				styleNode.setAttribute("type", "text/css");

				var headNode = document.getElementsByTagName("head")[0];
				headNode.appendChild(styleNode);

				if (styleNode.styleSheet)
					styleNode.styleSheet.cssText = styleText;
				else
					styleNode.appendChild(document.createTextNode(styleText));

				return true;
			}
			catch (e)
			{
				return false;
			}
		})());

		// Public Static Methods

		VectorElement.mixin = function(target, sourceSVG, sourceVML)
		{
			if (_HAS_SVG)
			{
				jg_mixin(target, sourceSVG);
				// jg_mixin doesn't copy constructor, so do it manually
				if ((sourceSVG.constructor !== Object) && (typeof sourceSVG.constructor === "function"))
					target.constructor = sourceSVG.constructor;
			}
			else if (_HAS_VML)
			{
				jg_mixin(target, sourceVML);
				// jg_mixin doesn't copy constructor, so do it manually
				if ((sourceVML.constructor !== Object) && (typeof sourceVML.constructor === "function"))
					target.constructor = sourceVML.constructor;
			}
		};

		// Public Properties

		this.hasSVG = _HAS_SVG;
		this.hasVML = _HAS_VML;
		this.element = null;

		// Constructor

		this.constructor = function(tagName)
		{
			if ((tagName != null) && (typeof tagName !== "string"))
				throw new Error("Parameter tagName must be a string.");

			this.element = this.createElement(tagName || null);
		};

		// Public Methods

		this.appendTo = function(parentElement)
		{
			if (parentElement == null)
				throw new Error("Parameter parentElement must be non-null.");
			if (!(parentElement instanceof VectorElement))
				throw new Error("Parameter parentElement must be an instance of splunk.vectors.VectorElement.");

			parentElement.element.appendChild(this.element);

			return this;
		};

		this.remove = function()
		{
			if (this.element.parentNode)
				this.element.parentNode.removeChild(this.element);

			return this;
		};

		this.dispose = function()
		{
			this.remove();

			this.element = null;
		};

		this.display = function(value)
		{
			this.element.style.display = value ? value : "";

			return this;
		};

		this.visibility = function(value)
		{
			this.element.style.visibility = value ? value : "";

			return this;
		};

		this.translate = function(x, y)
		{
			x = ((x != null) && (x > -Infinity) && (x < Infinity)) ? x : 0;
			y = ((y != null) && (y > -Infinity) && (y < Infinity)) ? y : 0;

			this.element.style.left = (x != 0) ? x + "px" : "";
			this.element.style.top = (y != 0) ? y + "px" : "";

			return this;
		};

		// Protected Methods

		this.createElement = function(tagName)
		{
			var dummy = document.createElement("div");
			dummy.style.position = "absolute";
			return dummy;
		};

		// Inner Mixin Classes

		var SVGVectorElement = jg_static(function(SVGVectorElement)
		{

			// Private Static Constants

			var _NS_SVG = "http://www.w3.org/2000/svg";

			// Public Methods

			this.display = function(value)
			{
				if (value)
					this.element.setAttribute("display", value);
				else
					this.element.removeAttribute("display");

				return this;
			};

			this.visibility = function(value)
			{
				if (value)
					this.element.setAttribute("visibility", value);
				else
					this.element.removeAttribute("visibility");

				return this;
			};

			this.translate = function(x, y)
			{
				x = ((x != null) && (x > -Infinity) && (x < Infinity)) ? x : 0;
				y = ((y != null) && (y > -Infinity) && (y < Infinity)) ? y : 0;

				if ((x != 0) || (y != 0))
					this.element.setAttribute("transform", "translate(" + x + "," + y + ")");
				else
					this.element.removeAttribute("transform");

				return this;
			};

			// Protected Methods

			this.createElement = function(tagName)
			{
				return document.createElementNS(_NS_SVG, tagName || "g");
			};

		});

		var VMLVectorElement = jg_static(function(VMLVectorElement)
		{

			// Protected Methods

			this.createElement = function(tagName)
			{
				return document.createElement("<splvml:" + (tagName || "group") + " class=\"splvml\">");
			};

		});

		VectorElement.mixin(this, SVGVectorElement, VMLVectorElement);

	});

});
});

jg_import.define("splunk.vectors.Group", function()
{
jg_namespace("splunk.vectors", function()
{

	var VectorElement = jg_import("splunk.vectors.VectorElement");

	this.Group = jg_extend(VectorElement, function(Group, base)
	{

		// Constructor

		this.constructor = function()
		{
			base.constructor.call(this);
		};

		// Inner Mixin Classes

		var SVGGroup = jg_static(function(SVGGroup)
		{

			// Constructor

			this.constructor = function()
			{
				base.constructor.call(this, "g");
			};

		});

		var VMLGroup = jg_static(function(VMLGroup)
		{

			// Constructor

			this.constructor = function()
			{
				base.constructor.call(this, "group");

				this.element.style.width = "1px";
				this.element.style.height = "1px";
				this.element.coordsize = "1,1";
			};

		});

		VectorElement.mixin(this, SVGGroup, VMLGroup);

	});

});
});

jg_import.define("splunk.vectors.VectorUtils", function()
{
jg_namespace("splunk.vectors", function()
{

	this.VectorUtils = jg_static(function(VectorUtils)
	{

		// Public Static Methods

		VectorUtils.toSVGString = function(element)
		{
			// svg elements don't have innerHTML attribute...
			// clone svg element and place in container div so we can use innerHTML of the container
			var clonedElement = element.cloneNode(true);
			var containerElement = document.createElement("div");
			containerElement.appendChild(clonedElement);

			// get svg string using innerHTML
			var svgString = containerElement.innerHTML;

			// fix or add xlink namespace on href attributes
			svgString = svgString.replace(/xlink:href=|href=/g, "x:href=");

			// properly close image tags
			svgString = svgString.replace(/<image([\S\s]*?)\s*\/?>\s*(<\/image>)?/g, "<image$1></image>");

			// add xmlns attributes to root svg tag
			svgString = svgString.replace(/^<svg/, "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:x=\"http://www.w3.org/1999/xlink\"");

			// clear element references
			clonedElement = null;
			containerElement = null;

			return svgString;
		};

		VectorUtils.concatSVGStrings = function(/*...*/)
		{
			var concatString = "";
			var svgString;
			var viewBoxMatch;
			var viewBox;
			var width = 0;
			var height = 0;

			for (var i = 0, l = arguments.length; i < l; i++)
			{
				svgString = arguments[i];

				// read and parse viewBox attribute from root svg tag
				viewBoxMatch = svgString.match(/^<svg[^>]*viewBox=\"([^ ]+) ([^ ]+) ([^ ]+) ([^\"]+)\"[^>]*>/);
				if (viewBoxMatch && (viewBoxMatch.length == 5))
				{
					viewBox = {
						x: Number(viewBoxMatch[1]),
						y: Number(viewBoxMatch[2]),
						width: Number(viewBoxMatch[3]),
						height: Number(viewBoxMatch[4])
					};

					// expand width and height to include viewBox
					width = Math.max(width, viewBox.width);
					height = Math.max(height, viewBox.height);
				}
				else
				{
					viewBox = null;
				}

				// replace root svg tag with g tag, including translate transform if needed
				if (viewBox && ((viewBox.x != 0) || (viewBox.y != 0)))
					svgString = svgString.replace(/^<svg[^>]*>/, "<g transform=\"translate(" + (-viewBox.x) + ", " + (-viewBox.y) + ")\">");
				else
					svgString = svgString.replace(/^<svg[^>]*>/, "<g>");
				svgString = svgString.replace(/<\/svg>$/, "</g>");

				concatString += svgString;
			}

			// generate new root svg tag around concatString
			svgString = "<svg";
			svgString += " xmlns=\"http://www.w3.org/2000/svg\"";
			svgString += " xmlns:x=\"http://www.w3.org/1999/xlink\"";
			svgString += " width=\"" + width + "\"";
			svgString += " height=\"" + height + "\"";
			svgString += " viewBox=\"0 0 " + width + " " + height + "\"";
			svgString += ">";
			svgString += concatString;
			svgString += "</svg>";

			return svgString;
		};

	});

});
});

jg_import.define("splunk.vectors.Viewport", function()
{
jg_namespace("splunk.vectors", function()
{

	var Rectangle = jg_import("jgatt.geom.Rectangle");
	var VectorElement = jg_import("splunk.vectors.VectorElement");
	var VectorUtils = jg_import("splunk.vectors.VectorUtils");

	this.Viewport = jg_extend(VectorElement, function(Viewport, base)
	{

		// Constructor

		this.constructor = function(width, height, viewBox, preserveAspectRatio)
		{
			base.constructor.call(this);
		};

		// Public Methods

		this.width = function(value)
		{
			return this;
		};

		this.height = function(value)
		{
			return this;
		};

		this.viewBox = function(value)
		{
			return this;
		};

		this.preserveAspectRatio = function(value)
		{
			return this;
		};

		this.toSVGString = function()
		{
			return "";
		};

		// Inner Mixin Classes

		var SVGViewport = jg_static(function(SVGViewport)
		{

			// Constructor

			this.constructor = function(width, height, viewBox, preserveAspectRatio)
			{
				base.constructor.call(this, "svg");

				this.width((width != null) ? width : 0);
				this.height((height != null) ? height : 0);
				if (viewBox != null)
					this.viewBox(viewBox);
				if (preserveAspectRatio != null)
					this.preserveAspectRatio(preserveAspectRatio);
			};

			// Public Methods

			this.appendTo = function(parentElement)
			{
				if (parentElement == null)
					throw new Error("Parameter parentElement must be non-null.");
				if (parentElement.appendChild == null)
					throw new Error("Parameter parentElement must be a DOM node.");

				parentElement.appendChild(this.element);

				return this;
			};

			this.width = function(value)
			{
				if ((value != null) && (value < Infinity))
					this.element.setAttribute("width", Math.max(value, 0));
				else
					this.element.setAttribute("width", 0);

				return this;
			};

			this.height = function(value)
			{
				if ((value != null) && (value < Infinity))
					this.element.setAttribute("height", Math.max(value, 0));
				else
					this.element.setAttribute("height", 0);

				return this;
			};

			this.viewBox = function(value)
			{
				if (value && (value instanceof Rectangle) && value.isFinite())
					this.element.setAttribute("viewBox", value.x + " " + value.y + " " + value.width + " " + value.height);
				else
					this.element.removeAttribute("viewBox");

				return this;
			};

			this.preserveAspectRatio = function(value)
			{
				if (value)
					this.element.setAttribute("preserveAspectRatio", value);
				else
					this.element.removeAttribute("preserveAspectRatio");

				return this;
			};

			this.toSVGString = function()
			{
				return VectorUtils.toSVGString(this.element);
			};

		});

		var VMLViewport = jg_static(function(VMLViewport)
		{

			// Private Properties

			this._containerElement = null;
			this._width = 0;
			this._height = 0;
			this._viewBox = null;

			// Constructor

			this.constructor = function(width, height, viewBox, preserveAspectRatio)
			{
				base.constructor.call(this, "group");

				this._containerElement = document.createElement("div");
				this._containerElement.style.position = "relative";
				this._containerElement.style.overflow = "hidden";
				this._containerElement.appendChild(this.element);

				this.width((width != null) ? width : 0);
				this.height((height != null) ? height : 0);
				if (viewBox != null)
					this.viewBox(viewBox);
				if (preserveAspectRatio != null)
					this.preserveAspectRatio(preserveAspectRatio);
			};

			// Public Methods

			this.appendTo = function(parentElement)
			{
				if (parentElement == null)
					throw new Error("Parameter parentElement must be non-null.");
				if (parentElement.appendChild == null)
					throw new Error("Parameter parentElement must be a DOM node.");

				parentElement.appendChild(this._containerElement);

				return this;
			};

			this.remove = function()
			{
				if (this._containerElement.parentNode)
					this._containerElement.parentNode.removeChild(this._containerElement);

				return this;
			};

			this.dispose = function()
			{
				base.dispose.call(this);

				this._containerElement = null;
			};

			this.display = function(value)
			{
				this._containerElement.style.display = value ? value : "";

				return this;
			};

			this.visibility = function(value)
			{
				this._containerElement.style.visibility = value ? value : "";

				return this;
			};

			this.translate = function(x, y)
			{
				x = ((x != null) && (x > -Infinity) && (x < Infinity)) ? x : 0;
				y = ((y != null) && (y > -Infinity) && (y < Infinity)) ? y : 0;

				this._containerElement.style.left = (x != 0) ? x + "px" : "";
				this._containerElement.style.top = (y != 0) ? y + "px" : "";

				return this;
			};

			this.width = function(value)
			{
				this._width = ((value != null) && (value < Infinity)) ? Math.max(value, 0) : 0;
				this._updateView();

				return this;
			};

			this.height = function(value)
			{
				this._height = ((value != null) && (value < Infinity)) ? Math.max(value, 0) : 0;
				this._updateView();

				return this;
			};

			this.viewBox = function(value)
			{
				this._viewBox = (value && (value instanceof Rectangle) && value.isFinite()) ? value.clone() : null;
				this._updateView();

				return this;
			};

			this.preserveAspectRatio = function(value)
			{
				return this;
			};

			// Private Methods

			this._updateView = function()
			{
				var width = Math.round(this._width);
				var height = Math.round(this._height);
				var viewBox = this._viewBox;
				var viewX = viewBox ? Math.round(viewBox.x) : 0;
				var viewY = viewBox ? Math.round(viewBox.y) : 0;
				var viewWidth = viewBox ? Math.round(Math.max(viewBox.width, 1)) : width;
				var viewHeight = viewBox ? Math.round(Math.max(viewBox.height, 1)) : height;

				var element = this.element;
				var style = element.style;
				var containerStyle = this._containerElement.style;

				style.display = "none";  // prevent premature rendering

				element.coordorigin = viewX + "," + viewY;
				element.coordsize = viewWidth + "," + viewHeight;

				style.width = width + "px";
				style.height = height + "px";

				containerStyle.width = width + "px";
				containerStyle.height = height + "px";

				style.display = "";  // enable rendering
			};

		});

		VectorElement.mixin(this, SVGViewport, VMLViewport);

	});

});
});

jg_import.define("splunk.mapping.layers.VectorLayerBase", function()
{
jg_namespace("splunk.mapping.layers", function()
{

	var Leaflet = jg_import("L");
	var Rectangle = jg_import("jgatt.geom.Rectangle");
	var FunctionUtils = jg_import("jgatt.utils.FunctionUtils");
	var LayerBase = jg_import("splunk.mapping.layers.LayerBase");
	var Group = jg_import("splunk.vectors.Group");
	var Viewport = jg_import("splunk.vectors.Viewport");

	this.VectorLayerBase = jg_extend(LayerBase, function(VectorLayerBase, base)
	{

		// Public Properties

		this.vectorContainer = null;
		this.vectorBounds = null;

		// Private Properties

		this._isZooming = false;

		// Constructor

		this.constructor = function()
		{
			base.constructor.call(this);

			this._leafletMap_move = FunctionUtils.bind(this._leafletMap_move, this);
			this._leafletMap_zoomstart = FunctionUtils.bind(this._leafletMap_zoomstart, this);
			this._leafletMap_zoomend = FunctionUtils.bind(this._leafletMap_zoomend, this);

			this.vectorContainer = this.leafletLayer.vectorContainer;
			this.vectorBounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
		};

		// Protected Methods

		this.createLeafletLayer = function()
		{
			return new LeafletVectorLayer();
		};

		this.renderOverride = function(map)
		{
			if (!this._isZooming)
				this.vectorContainer.display(null);
		};

		this.onAddedToMap = function(map)
		{
			base.onAddedToMap.call(this, map);

			var leafletMap = map.leafletMap;
			if (this.vectorContainer.hasSVG)
				leafletMap.on("move", this._leafletMap_move);
			else
				leafletMap.on("moveend", this._leafletMap_move);
			leafletMap.on("viewreset", this._leafletMap_move);
			leafletMap.on("zoomstart", this._leafletMap_zoomstart);
			leafletMap.on("zoomend", this._leafletMap_zoomend);

			this.vectorBounds = leafletMap._vectorLayerBounds;

			this.vectorContainer.display("none");
		};

		this.onRemovedFromMap = function(map)
		{
			var leafletMap = map.leafletMap;
			if (this.vectorContainer.hasSVG)
				leafletMap.off("move", this._leafletMap_move);
			else
				leafletMap.off("moveend", this._leafletMap_move);
			leafletMap.off("viewreset", this._leafletMap_move);
			leafletMap.off("zoomstart", this._leafletMap_zoomstart);
			leafletMap.off("zoomend", this._leafletMap_zoomend);

			this.vectorBounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };

			base.onRemovedFromMap.call(this, map);
		};

		// Private Methods

		this._leafletMap_move = function(e)
		{
			this.invalidate("renderPass");
		};

		this._leafletMap_zoomstart = function(e)
		{
			this._isZooming = true;

			this.vectorContainer.display("none");
		};

		this._leafletMap_zoomend = function(e)
		{
			this._isZooming = false;

			this.invalidate("renderPass");
		};

	});

	var LeafletVectorLayer = Leaflet.Class.extend({

		includes: [Leaflet.Mixin.Events],

		options: {
			clickable: true
		},

		vectorContainer: null,

		initialize: function (options) {
			Leaflet.Util.setOptions(this, options);

			this.vectorContainer = new Group();
		},

		onAdd: function (map) {
			this._map = map;

			map._initVectorLayerViewport();

			this.vectorContainer.appendTo(map._vectorLayerViewport);
		},

		onRemove: function (map) {
			this._map = null;

			this.vectorContainer.remove();
		}

	});

	Leaflet.Map.include({

		_initVectorLayerViewport: function () {
			if (this._vectorLayerRoot)
				return;

			var root = this._vectorLayerRoot = document.createElement("div");
			root.style.position = "absolute";
			this._panes.overlayPane.appendChild(root);

			var viewport = this._vectorLayerViewport = new Viewport();
			viewport.appendTo(root);

			this._vectorLayerBounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };

			if (viewport.hasSVG)
				this.on("move", this._updateVectorLayerBounds);
			else
				this.on("moveend", this._updateVectorLayerBounds);
			this._updateVectorLayerBounds();
		},

		_updateVectorLayerBounds: function () {
			var root = this._vectorLayerRoot,
			    viewport = this._vectorLayerViewport,
			    bounds = this._vectorLayerBounds,
			    padding = viewport.hasSVG ? 0 : 0.5,
			    size = this.getSize(),
			    panePos = Leaflet.DomUtil.getPosition(this._mapPane),
			    min = panePos.multiplyBy(-1)._subtract(size.multiplyBy(padding)),
			    max = min.add(size.multiplyBy(1 + padding * 2)),
			    width = max.x - min.x,
			    height = max.y - min.y;

			bounds.minX = min.x;
			bounds.minY = min.y;
			bounds.maxX = max.x;
			bounds.maxY = max.y;

			Leaflet.DomUtil.setPosition(root, min);
			viewport.width(width);
			viewport.height(height);
			viewport.viewBox(new Rectangle(min.x, min.y, width, height));
		}

	});

});
});

jg_import.define("splunk.vectors.Shape", function()
{
jg_namespace("splunk.vectors", function()
{

	var NumberUtils = jg_import("jgatt.utils.NumberUtils");
	var VectorElement = jg_import("splunk.vectors.VectorElement");

	this.Shape = jg_extend(VectorElement, function(Shape, base)
	{

		// Constructor

		this.constructor = function(tagName)
		{
			base.constructor.call(this, tagName);
		};

		// Public Methods

		this.fillColor = function(value)
		{
			return this;
		};

		this.fillOpacity = function(value)
		{
			return this;
		};

		this.strokeColor = function(value)
		{
			return this;
		};

		this.strokeOpacity = function(value)
		{
			return this;
		};

		this.strokeWidth = function(value)
		{
			return this;
		};

		this.strokeLineCap = function(value)
		{
			return this;
		};

		this.strokeLineJoin = function(value)
		{
			return this;
		};

		this.strokeMiterLimit = function(value)
		{
			return this;
		};

		// Inner Mixin Classes

		var SVGShape = jg_static(function(SVGShape)
		{

			// Constructor

			this.constructor = function(tagName)
			{
				base.constructor.call(this, tagName);

				this.fillColor(NaN);
				this.strokeColor(NaN);
				this.strokeLineCap("none");
				this.strokeLineJoin("miter");
			};

			// Public Methods

			this.fillColor = function(value)
			{
				if ((value != null) && !isNaN(value))
				{
					value = NumberUtils.minMax(Math.floor(value), 0x000000, 0xFFFFFF);
					this.element.setAttribute("fill", "#" + (value | 0x1000000).toString(16).substring(1));
				}
				else
				{
					this.element.setAttribute("fill", "none");
				}

				return this;
			};

			this.fillOpacity = function(value)
			{
				if ((value != null) && !isNaN(value))
					this.element.setAttribute("fill-opacity", NumberUtils.minMax(value, 0, 1));
				else
					this.element.removeAttribute("fill-opacity");

				return this;
			};

			this.strokeColor = function(value)
			{
				if ((value != null) && !isNaN(value))
				{
					value = NumberUtils.minMax(Math.floor(value), 0x000000, 0xFFFFFF);
					this.element.setAttribute("stroke", "#" + (value | 0x1000000).toString(16).substring(1));
				}
				else
				{
					this.element.removeAttribute("stroke");
				}

				return this;
			};

			this.strokeOpacity = function(value)
			{
				if ((value != null) && !isNaN(value))
					this.element.setAttribute("stroke-opacity", NumberUtils.minMax(value, 0, 1));
				else
					this.element.removeAttribute("stroke-opacity");

				return this;
			};

			this.strokeWidth = function(value)
			{
				if ((value != null) && (value < Infinity))
					this.element.setAttribute("stroke-width", Math.max(value, 1));
				else
					this.element.removeAttribute("stroke-width");

				return this;
			};

			this.strokeLineCap = function(value)
			{
				if (value === "round")
					this.element.setAttribute("stroke-linecap", "round");
				else if (value === "square")
					this.element.setAttribute("stroke-linecap", "square");
				else  // none
					this.element.removeAttribute("stroke-linecap");

				return this;
			};

			this.strokeLineJoin = function(value)
			{
				if (value === "round")
					this.element.setAttribute("stroke-linejoin", "round");
				else if (value === "bevel")
					this.element.setAttribute("stroke-linejoin", "bevel");
				else  // miter
					this.element.removeAttribute("stroke-linejoin");

				return this;
			};

			this.strokeMiterLimit = function(value)
			{
				if ((value != null) && (value < Infinity))
					this.element.setAttribute("stroke-miterlimit", Math.max(value, 1));
				else
					this.element.removeAttribute("stroke-miterlimit");

				return this;
			};

		});

		var VMLShape = jg_static(function(VMLShape)
		{

			// Private Properties

			this._fillElement = null;
			this._strokeElement = null;

			// Constructor

			this.constructor = function(tagName)
			{
				base.constructor.call(this, tagName);

				this._fillElement = this.createElement("fill");
				this._strokeElement = this.createElement("stroke");

				this.element.appendChild(this._fillElement);
				this.element.appendChild(this._strokeElement);

				this.fillColor(NaN);
				this.strokeColor(NaN);
				this.strokeLineCap("none");
				this.strokeLineJoin("miter");
			};

			// Public Methods

			this.dispose = function()
			{
				base.dispose.call(this);

				this._fillElement = null;
				this._strokeElement = null;
			};

			this.fillColor = function(value)
			{
				if ((value != null) && !isNaN(value))
				{
					value = NumberUtils.minMax(Math.floor(value), 0x000000, 0xFFFFFF);
					this._fillElement.on = true;
					this._fillElement.color = "#" + (value | 0x1000000).toString(16).substring(1);
				}
				else
				{
					this._fillElement.on = false;
					this._fillElement.color = "#000000";
				}

				return this;
			};

			this.fillOpacity = function(value)
			{
				if ((value != null) && !isNaN(value))
					this._fillElement.opacity = NumberUtils.minMax(value, 0, 1);
				else
					this._fillElement.opacity = 1;

				return this;
			};

			this.strokeColor = function(value)
			{
				if ((value != null) && !isNaN(value))
				{
					value = NumberUtils.minMax(Math.floor(value), 0x000000, 0xFFFFFF);
					this._strokeElement.on = true;
					this._strokeElement.color = "#" + (value | 0x1000000).toString(16).substring(1);
				}
				else
				{
					this._strokeElement.on = false;
					this._strokeElement.color = "#000000";
				}

				return this;
			};

			this.strokeOpacity = function(value)
			{
				if ((value != null) && !isNaN(value))
					this._strokeElement.opacity = NumberUtils.minMax(value, 0, 1);
				else
					this._strokeElement.opacity = 1;

				return this;
			};

			this.strokeWidth = function(value)
			{
				if ((value != null) && (value < Infinity))
					this._strokeElement.weight = Math.max(value, 1) + "px";
				else
					this._strokeElement.weight = "1px";

				return this;
			};

			this.strokeLineCap = function(value)
			{
				if (value === "round")
					this._strokeElement.endcap = "round";
				else if (value === "square")
					this._strokeElement.endcap = "square";
				else // none
					this._strokeElement.endcap = "flat";

				return this;
			};

			this.strokeLineJoin = function(value)
			{
				if (value === "round")
					this._strokeElement.joinstyle = "round";
				else if (value === "bevel")
					this._strokeElement.joinstyle = "bevel";
				else // miter
					this._strokeElement.joinstyle = "miter";

				return this;
			};

			this.strokeMiterLimit = function(value)
			{
				if ((value != null) && (value < Infinity))
					this._strokeElement.miterlimit = Math.max(value, 1);
				else
					this._strokeElement.miterlimit = 4;

				return this;
			};

		});

		VectorElement.mixin(this, SVGShape, VMLShape);

	});

});
});

jg_import.define("splunk.vectors.Wedge", function()
{
jg_namespace("splunk.vectors", function()
{

	var NumberUtils = jg_import("jgatt.utils.NumberUtils");
	var Shape = jg_import("splunk.vectors.Shape");
	var VectorElement = jg_import("splunk.vectors.VectorElement");

	this.Wedge = jg_extend(Shape, function(Wedge, base)
	{

		// Constructor

		this.constructor = function()
		{
			base.constructor.call(this);
		};

		// Public Methods

		this.draw = function(x, y, radiusX, radiusY, startAngle, arcAngle)
		{
			return this;
		};

		// Inner Mixin Classes

		var SVGWedge = jg_static(function(SVGWedge)
		{

			// Constructor

			this.constructor = function()
			{
				base.constructor.call(this, "path");
			};

			// Public Methods

			this.draw = function(x, y, radiusX, radiusY, startAngle, arcAngle)
			{
				x = ((x != null) && (x > -Infinity) && (x < Infinity)) ? x : 0;
				y = ((y != null) && (y > -Infinity) && (y < Infinity)) ? y : 0;
				radiusX = ((radiusX != null) && (radiusX < Infinity)) ? Math.max(radiusX, 0) : 0;
				radiusY = ((radiusY != null) && (radiusY < Infinity)) ? Math.max(radiusY, 0) : 0;
				startAngle = ((startAngle != null) && (startAngle > -Infinity) && (startAngle < Infinity)) ? startAngle : 0;
				arcAngle = ((arcAngle != null) && (arcAngle != null) && !isNaN(arcAngle)) ? NumberUtils.minMax(arcAngle, -360, 360) : 0;

				if ((radiusX == 0) || (radiusY == 0) || (arcAngle == 0))
				{
					this.element.removeAttribute("d");
					return this;
				}

				var a1 = (startAngle / 180) * Math.PI;
				var x1 = x + Math.cos(a1) * radiusX;
				var y1 = y + Math.sin(a1) * radiusY;
				var a2 = ((startAngle + arcAngle / 2) / 180) * Math.PI;
				var x2 = x + Math.cos(a2) * radiusX;
				var y2 = y + Math.sin(a2) * radiusY;
				var a3 = ((startAngle + arcAngle) / 180) * Math.PI;
				var x3 = x + Math.cos(a3) * radiusX;
				var y3 = y + Math.sin(a3) * radiusY;

				var sweepFlag = (arcAngle < 0) ? 0 : 1;

				var pathData = "";
				if ((arcAngle > -360) && (arcAngle < 360))
				{
					pathData += "M" + x + "," + y;
					pathData += " L" + x1 + "," + y1;
				}
				else
				{
					pathData += "M" + x1 + "," + y1;
				}
				pathData += " A" + radiusX + "," + radiusY + " 0 0 " + sweepFlag + " " + x2 + "," + y2;
				pathData += " " + radiusX + "," + radiusY + " 0 0 " + sweepFlag + " " + x3 + "," + y3;
				pathData += " Z";

				this.element.setAttribute("d", pathData);

				return this;
			};

		});

		var VMLWedge = jg_static(function(VMLWedge)
		{

			// Private Static Constants

			var _RES = 64;

			// Private Properties

			this._pathElement = null;

			// Constructor

			this.constructor = function()
			{
				base.constructor.call(this, "shape");

				this._pathElement = this.createElement("path");

				this.element.style.width = "1px";
				this.element.style.height = "1px";
				this.element.coordsize = _RES + "," + _RES;
				this.element.appendChild(this._pathElement);
			};

			// Public Methods

			this.dispose = function()
			{
				base.dispose.call(this);

				this._pathElement = null;
			};

			this.draw = function(x, y, radiusX, radiusY, startAngle, arcAngle)
			{
				x = ((x != null) && (x > -Infinity) && (x < Infinity)) ? x : 0;
				y = ((y != null) && (y > -Infinity) && (y < Infinity)) ? y : 0;
				radiusX = ((radiusX != null) && (radiusX < Infinity)) ? Math.max(radiusX, 0) : 0;
				radiusY = ((radiusY != null) && (radiusY < Infinity)) ? Math.max(radiusY, 0) : 0;
				startAngle = ((startAngle != null) && (startAngle > -Infinity) && (startAngle < Infinity)) ? startAngle : 0;
				arcAngle = ((arcAngle != null) && (arcAngle != null) && !isNaN(arcAngle)) ? NumberUtils.minMax(arcAngle, -360, 360) : 0;

				if ((radiusX == 0) || (radiusY == 0) || (arcAngle == 0))
				{
					this._pathElement.v = " ";
					return this;
				}

				var a1 = (startAngle / 180) * Math.PI;
				var x1 = x + Math.cos(a1) * radiusX;
				var y1 = y + Math.sin(a1) * radiusY;
				var a2 = ((startAngle + arcAngle / 2) / 180) * Math.PI;
				var x2 = x + Math.cos(a2) * radiusX;
				var y2 = y + Math.sin(a2) * radiusY;
				var a3 = ((startAngle + arcAngle) / 180) * Math.PI;
				var x3 = x + Math.cos(a3) * radiusX;
				var y3 = y + Math.sin(a3) * radiusY;

				var left = Math.round((x - radiusX) * _RES);
				var top = Math.round((y - radiusY) * _RES);
				var right = Math.round((x + radiusX) * _RES);
				var bottom = Math.round((y + radiusY) * _RES);

				x = Math.round(x * _RES);
				y = Math.round(y * _RES);
				x1 = Math.round(x1 * _RES);
				y1 = Math.round(y1 * _RES);
				x2 = Math.round(x2 * _RES);
				y2 = Math.round(y2 * _RES);
				x3 = Math.round(x3 * _RES);
				y3 = Math.round(y3 * _RES);

				var pathData = "";
				if ((arcAngle > -360) && (arcAngle < 360))
				{
					pathData += "m " + x + "," + y;
					pathData += " l " + x1 + "," + y1;
				}
				else
				{
					pathData += "m " + x1 + "," + y1;
				}
				pathData += (arcAngle < 0) ? " at" : " wa";
				pathData += " " + left + "," + top + "," + right + "," + bottom + ", " + x1 + "," + y1 + ", " + x2 + "," + y2;
				pathData += ", " + left + "," + top + "," + right + "," + bottom + ", " + x2 + "," + y2 + ", " + x3 + "," + y3;
				pathData += " x";

				this._pathElement.v = pathData;

				return this;
			};

		});

		VectorElement.mixin(this, SVGWedge, VMLWedge);

	});

});
});

jg_import.define("splunk.viz.MDataTarget", function()
{
jg_namespace("splunk.viz", function()
{

	var MObservable = jg_import("jgatt.events.MObservable");
	var MPropertyTarget = jg_import("jgatt.properties.MPropertyTarget");
	var ObservableArrayProperty = jg_import("jgatt.properties.ObservableArrayProperty");
	var ObservableProperty = jg_import("jgatt.properties.ObservableProperty");
	var FunctionUtils = jg_import("jgatt.utils.FunctionUtils");
	var MValidateTarget = jg_import("jgatt.validation.MValidateTarget");
	var ValidatePass = jg_import("jgatt.validation.ValidatePass");
	var Legend = jg_import("splunk.charting.Legend");

	this.MDataTarget = jg_static(function(MDataTarget)
	{

		// Mixin

		this.mixin = function(base)
		{
			base = jg_mixin(this, MObservable, base);
			base = jg_mixin(this, MPropertyTarget, base);
			base = jg_mixin(this, MValidateTarget, base);
		};

		// Public Passes

		this.processDataPass = new ValidatePass("processData", 0.1);
		this.updateLegendLabelsPass = new ValidatePass("updateLegendLabels", 0.2);
		this.renderDataPass = new ValidatePass("renderData", 0.3);

		// Public Properties

		this.data = new ObservableProperty("data", Array, null)
			.onChanged(function(e)
			{
				this.invalidate("processDataPass");
			});

		this.fields = new ObservableArrayProperty("fields", String, null)
			.onChanged(function(e)
			{
				this.invalidate("processDataPass");
			});

		this.legend = new ObservableProperty("legend", Legend, null)
			.onChanged(function(e)
			{
				if (e.target === this)
				{
					var oldLegend = e.oldValue;
					var newLegend = e.newValue;

					if (oldLegend)
					{
						oldLegend.removeEventListener("settingLabels", this._legend_settingLabels);
						oldLegend.unregister(this);
					}

					if (newLegend)
					{
						newLegend.register(this);
						newLegend.addEventListener("settingLabels", this._legend_settingLabels);
					}

					this.invalidate("updateLegendLabelsPass");
					return;
				}

				if (e.event === e.target.labelIndexMapChanged)
				{
					this.invalidate("renderDataPass");
					return;
				}
			});

		// Private Properties

		this._cachedData = null;
		this._cachedFields = null;
		this._cachedLegend = null;

		// Constructor

		this.constructor = function()
		{
			this._legend_settingLabels = FunctionUtils.bind(this._legend_settingLabels, this);
		};

		// Public Methods

		this.processData = function()
		{
			this.validatePreceding("processDataPass");

			if (this.isValid("processDataPass"))
				return;

			this.invalidate("updateLegendLabelsPass");

			var data = this._cachedData = this.getInternal("data") || [];
			var fields = this._cachedFields = this.getInternal("fields") || [];

			this.processDataOverride(data, fields);

			this.setValid("processDataPass");
		};

		this.updateLegendLabels = function()
		{
			this.validatePreceding("updateLegendLabelsPass");

			if (this.isValid("updateLegendLabelsPass"))
				return;

			this.invalidate("renderDataPass");

			var legend = this._cachedLegend = this.getInternal("legend");
			var labels = null;

			if (legend)
				labels = this.updateLegendLabelsOverride(this._cachedData, this._cachedFields);

			this.setValid("updateLegendLabelsPass");

			// this must run last to avoid recursion
			if (legend)
				legend.setLabels(this, labels);
		};

		this.renderData = function()
		{
			this.validatePreceding("renderDataPass");

			if (this.isValid("renderDataPass"))
				return;

			this.renderDataOverride(this._cachedData, this._cachedFields, this._cachedLegend);

			this.setValid("renderDataPass");
		};

		// Protected Methods

		this.processDataOverride = function(data, fields)
		{
		};

		this.updateLegendLabelsOverride = function(data, fields)
		{
			return null;
		};

		this.renderDataOverride = function(data, fields, legend)
		{
		};

		// Private Methods

		this._legend_settingLabels = function(e)
		{
			this.validate("updateLegendLabelsPass");
		};

	});

});
});

jg_import.define("splunk.mapping.layers.PieMarkerLayer", function()
{
jg_namespace("splunk.mapping.layers", function()
{

	var Leaflet = jg_import("L");
	var Point = jg_import("jgatt.geom.Point");
	var Rectangle = jg_import("jgatt.geom.Rectangle");
	var ObservableProperty = jg_import("jgatt.properties.ObservableProperty");
	var NumberUtils = jg_import("jgatt.utils.NumberUtils");
	var LatLon = jg_import("splunk.mapping.LatLon");
	var LatLonBounds = jg_import("splunk.mapping.LatLonBounds");
	var LayerBase = jg_import("splunk.mapping.layers.LayerBase");
	var VectorLayerBase = jg_import("splunk.mapping.layers.VectorLayerBase");
	var ColorPalette = jg_import("splunk.palettes.ColorPalette");
	var ListColorPalette = jg_import("splunk.palettes.ListColorPalette");
	var Group = jg_import("splunk.vectors.Group");
	var Wedge = jg_import("splunk.vectors.Wedge");
	var MDataTarget = jg_import("splunk.viz.MDataTarget");

	this.PieMarkerLayer = jg_extend(VectorLayerBase, function(PieMarkerLayer, base)
	{

		base = jg_mixin(this, MDataTarget, base);

		// Public Properties

		this.markerColorPalette = new ObservableProperty("markerColorPalette", ColorPalette, new ListColorPalette([ 0x00CC00, 0xCCCC00, 0xCC0000 ], true))
			.onChanged(function(e)
			{
				this.invalidate("renderDataPass");
			});

		this.markerOpacity = new ObservableProperty("markerOpacity", Number, 1)
			.writeFilter(function(value)
			{
				return ((value >= 0) && (value <= Infinity)) ? Math.min(value, 1) : 0;
			})
			.onChanged(function(e)
			{
				this.invalidate("renderDataPass");
			});

		this.markerMinSize = new ObservableProperty("markerMinSize", Number, 10)
			.writeFilter(function(value)
			{
				return ((value >= 0) && (value < Infinity)) ? value : 0;
			})
			.onChanged(function(e)
			{
				this.invalidate("renderDataPass");
			});

		this.markerMaxSize = new ObservableProperty("markerMaxSize", Number, 50)
			.writeFilter(function(value)
			{
				return ((value >= 0) && (value < Infinity)) ? value : 0;
			})
			.onChanged(function(e)
			{
				this.invalidate("renderDataPass");
			});

		this.wrapX = new ObservableProperty("wrapX", Boolean, true)
			.onChanged(function(e)
			{
				this.invalidate("renderPass");
			});

		this.wrapY = new ObservableProperty("wrapY", Boolean, false)
			.onChanged(function(e)
			{
				this.invalidate("renderPass");
			});

		// Private Properties

		this._seriesList = null;
		this._markerList = null;

		// Constructor

		this.constructor = function()
		{
			base.constructor.call(this);

			this._seriesList = [];
			this._markerList = [];
		};

		// Public Methods

		this.getLatLonBounds = function(center)
		{
			if ((center != null) && !(center instanceof LatLon))
				throw new Error("Parameter center must be an instance of splunk.mapping.LatLon.");

			this.validate();

			var bounds = new LatLonBounds(Infinity, Infinity, -Infinity, -Infinity);

			var markerList = this._markerList;
			for (var i = 0, l = markerList.length; i < l; i++)
				bounds.expand(markerList[i].latLon.normalize(center));

			return bounds.isFinite() ? bounds : null;
		};

		// Protected Methods

		this.processDataOverride = function(data, fields)
		{
			var seriesList = this._seriesList;
			var numSeries = 0;
			var series;

			var markerList = this._markerList;
			var numMarkers = 0;
			var marker;

			var sliceList;
			var numSlices;
			var slice;

			var i;
			var j;

			var numRows = data.length;
			var numFields = fields.length;
			if ((numRows > 0) && (numFields > 2))
			{
				var vectorContainer = this.vectorContainer;

				var fieldLat = fields[0];
				var fieldLon = fields[1];
				var fieldSeries;

				var obj;
				var valueLat;
				var valueLon;
				var valueSeries;

				var magMin = Infinity;
				var magMax = -Infinity;
				var magSpan = 0;
				var mag;

				var sum;
				var angle1;
				var angle2;

				// create or reuse series
				for (i = 2; i < numFields; i++)
				{
					fieldSeries = fields[i];
					if (numSeries < seriesList.length)
					{
						series = seriesList[numSeries];
					}
					else
					{
						series = new Series();
						seriesList.push(series);
					}

					series.name = fieldSeries;

					numSeries++;
				}

				// create or reuse markers
				for (i = 0; i < numRows; i++)
				{
					obj = data[i];
					if (obj == null)
						continue;

					valueLat = NumberUtils.parseNumber(obj[fieldLat]);
					valueLon = NumberUtils.parseNumber(obj[fieldLon]);
					if (isNaN(valueLat) || isNaN(valueLon))
						continue;

					if (numMarkers < markerList.length)
					{
						marker = markerList[numMarkers];
					}
					else
					{
						marker = new PieMarker();
						marker.appendTo(vectorContainer);
						markerList.push(marker);
					}

					// create or reuse slices and compute marker magnitude
					sliceList = marker.sliceList;
					numSlices = 0;
					mag = 0;
					for (j = 0; j < numSeries; j++)
					{
						series = seriesList[j];

						valueSeries = NumberUtils.parseNumber(obj[series.name]);
						if (isNaN(valueSeries) || (valueSeries <= 0))
							continue;

						if (numSlices < sliceList.length)
						{
							slice = sliceList[numSlices];
						}
						else
						{
							slice = new PieSlice();
							slice.appendTo(marker);
							sliceList.push(slice);
						}

						slice.series = series;
						slice.value = valueSeries;

						mag += valueSeries;

						numSlices++;
					}

					if (numSlices === 0)
						continue;

					// record marker attributes
					marker.latLon = new LatLon(valueLat, valueLon);
					marker.data = obj;
					marker.fields = fields;
					marker.magnitude = mag;

					// update magnitude min and max
					if (mag < magMin)
						magMin = mag;
					if (mag > magMax)
						magMax = mag;

					// compute slice angles
					sum = 0;
					angle1 = 0;
					angle2 = 0;
					for (j = 0; j < numSlices; j++)
					{
						slice = sliceList[j];

						sum += slice.value;
						angle1 = angle2;
						angle2 = 360 * (sum / mag);

						slice.startAngle = angle1 - 90;
						slice.arcAngle = angle2 - angle1;
					}

					// dispose unused slices
					for (j = sliceList.length - 1; j >= numSlices; j--)
					{
						slice = sliceList.pop();
						slice.dispose();
					}

					numMarkers++;
				}

				// compute marker scales
				magSpan = magMax - magMin;
				for (i = 0; i < numMarkers; i++)
				{
					marker = markerList[i];
					marker.scale = (magSpan > 0) ? NumberUtils.minMax((marker.magnitude - magMin) / magSpan, 0, 1) : (1 / numMarkers);
				}
			}

			// dispose unused markers
			for (i = markerList.length - 1; i >= numMarkers; i--)
			{
				marker = markerList.pop();
				marker.dispose();
			}

			// dispose unused series
			for (i = seriesList.length - 1; i >= numSeries; i--)
				seriesList.pop();
		};

		this.updateLegendLabelsOverride = function(data, fields)
		{
			var seriesList = this._seriesList;
			var numSeries = seriesList.length;
			var labels = (numSeries > 0) ? new Array(numSeries) : null;
			for (var i = 0; i < numSeries; i++)
				labels[i] = seriesList[i].name;
			return labels;
		};

		this.renderDataOverride = function(data, fields, legend)
		{
			this.invalidate("renderPass");

			var seriesList = this._seriesList;
			var numSeries = seriesList.length;
			var series;
			var seriesIndex;
			var seriesCount;

			var markerColorPalette = this.getInternal("markerColorPalette");
			var markerOpacity = this.getInternal("markerOpacity");
			var markerMinSize = this.getInternal("markerMinSize");
			var markerMaxSize = this.getInternal("markerMaxSize");
			var markerList = this._markerList;
			var numMarkers = markerList.length;
			var marker;

			var sliceList;
			var numSlices;
			var slice;

			var i;
			var j;

			// assign series colors
			seriesCount = legend ? legend.getNumLabels() : numSeries;
			for (i = 0; i < numSeries; i++)
			{
				series = seriesList[i];
				seriesIndex = legend ? legend.getLabelIndex(series.name) : i;
				series.color = markerColorPalette ? markerColorPalette.getColor(series.name, seriesIndex, seriesCount) : 0x000000;
			}

			// render pie slices
			for (i = 0; i < numMarkers; i++)
			{
				marker = markerList[i];
				sliceList = marker.sliceList;
				numSlices = sliceList.length;

				marker.radius = Math.round(NumberUtils.interpolate(markerMinSize, markerMaxSize, marker.scale)) / 2;
				marker.tooltipOffsetRadius = marker.radius;
				marker.display("none");  // fixes vml flicker

				for (j = 0; j < numSlices; j++)
				{
					slice = sliceList[j];
					slice.fillColor(slice.series.color);
					slice.fillOpacity(markerOpacity);
					slice.draw(0, 0, marker.radius, marker.radius, slice.startAngle, slice.arcAngle);
				}
			}
		};

		this.renderOverride = function(map)
		{
			base.renderOverride.call(this, map);

			var leafletMap = map.leafletMap;
			var centerLatLng = leafletMap.getCenter();

			var wrapX = this.getInternal("wrapX");
			var wrapY = this.getInternal("wrapY");

			var vectorBounds = this.vectorBounds;
			var minX = vectorBounds.minX;
			var minY = vectorBounds.minY;
			var maxX = vectorBounds.maxX;
			var maxY = vectorBounds.maxY;

			var markerList = this._markerList;
			var marker;
			var markerLatLng;
			var markerPoint;

			for (var i = 0, l = markerList.length; i < l; i++)
			{
				marker = markerList[i];
				markerLatLng = marker.latLon.toLeaflet();

				if (wrapX)
				{
					markerLatLng.lng -= centerLatLng.lng;
					markerLatLng.lng %= 360;
					if (markerLatLng.lng > 180)
						markerLatLng.lng -= 360;
					else if (markerLatLng.lng < -180)
						markerLatLng.lng += 360;
					markerLatLng.lng += centerLatLng.lng;
				}

				if (wrapY)
				{
					markerLatLng.lat -= centerLatLng.lat;
					markerLatLng.lat %= 180;
					if (markerLatLng.lat > 90)
						markerLatLng.lat -= 180;
					else if (markerLatLng.lat < -90)
						markerLatLng.lat += 180;
					markerLatLng.lat += centerLatLng.lat;
				}

				marker.tooltipLatLng = markerLatLng;

				markerPoint = leafletMap.latLngToLayerPoint(markerLatLng);

				marker.translate(markerPoint.x, markerPoint.y);
				if (((markerPoint.x + marker.radius) < minX) || ((markerPoint.x - marker.radius) > maxX) ||
				    ((markerPoint.y + marker.radius) < minY) || ((markerPoint.y - marker.radius) > maxY))
					marker.display("none");
				else
					marker.display(null);
			}
		};

	});

	var Series = jg_extend(Object, function(Series, base)
	{

		// Public Properties

		this.name = null;
		this.color = 0x000000;

		// Constructor

		this.constructor = function()
		{
		};

	});

	var PieMarker = jg_extend(Group, function(PieMarker, base)
	{

		// Public Properties

		this.sliceList = null;
		this.latLon = null;
		this.data = null;
		this.fields = null;
		this.magnitude = 0;
		this.scale = 0;
		this.radius = 0;
		this.tooltipLatLng = null;
		this.tooltipOffsetRadius = 0;

		// Constructor

		this.constructor = function()
		{
			base.constructor.call(this);

			this.element[LayerBase.METADATA_KEY] = this;

			this.sliceList = [];
		};

		// Public Methods

		this.dispose = function()
		{
			var sliceList = this.sliceList;
			for (var i = sliceList.length - 1; i >= 0; i--)
				sliceList[i].dispose();

			this.element[LayerBase.METADATA_KEY] = null;

			base.dispose.call(this);
		};

	});

	var PieSlice = jg_extend(Wedge, function(PieSlice, base)
	{

		// Public Properties

		this.series = null;
		this.value = 0;
		this.startAngle = 0;
		this.arcAngle = 0;

		// Constructor

		this.constructor = function()
		{
			base.constructor.call(this);
		};

	});

});
});

jg_import.define("splunk.mapping.parsers.LatLonBoundsParser", function()
{
jg_namespace("splunk.mapping.parsers", function()
{

	var LatLonBounds = jg_import("splunk.mapping.LatLonBounds");
	var NumberParser = jg_import("splunk.parsers.NumberParser");
	var Parser = jg_import("splunk.parsers.Parser");
	var ParseUtils = jg_import("splunk.parsers.ParseUtils");

	this.LatLonBoundsParser = jg_extend(Parser, function(LatLonBoundsParser, base)
	{

		// Private Static Properties

		var _instance = null;

		// Public Static Methods

		LatLonBoundsParser.getInstance = function()
		{
			if (!_instance)
				_instance = new LatLonBoundsParser();
			return _instance;
		};

		// Protected Properties

		this.numberParser = null;

		// Constructor

		this.constructor = function()
		{
			this.numberParser = NumberParser.getInstance();
		};

		// Public Methods

		this.stringToValue = function(str)
		{
			var values = ParseUtils.prepareTuple(str);
			if (!values)
				return null;

			var latLonBounds = new LatLonBounds();

			var numValues = values.length;
			if (numValues > 0)
				latLonBounds.s = this.numberParser.stringToValue(values[0]);
			if (numValues > 1)
				latLonBounds.w = this.numberParser.stringToValue(values[1]);
			if (numValues > 2)
				latLonBounds.n = this.numberParser.stringToValue(values[2]);
			if (numValues > 3)
				latLonBounds.e = this.numberParser.stringToValue(values[3]);

			return latLonBounds;
		};

		this.valueToString = function(value)
		{
			var latLonBounds = (value instanceof LatLonBounds) ? value : null;
			if (!latLonBounds)
				return null;

			var str = "";

			str += this.numberParser.valueToString(latLonBounds.s) + ",";
			str += this.numberParser.valueToString(latLonBounds.w) + ",";
			str += this.numberParser.valueToString(latLonBounds.n) + ",";
			str += this.numberParser.valueToString(latLonBounds.e);

			return "(" + str + ")";
		};

	});

});
});

jg_import.define("splunk.mapping.parsers.LatLonParser", function()
{
jg_namespace("splunk.mapping.parsers", function()
{

	var LatLon = jg_import("splunk.mapping.LatLon");
	var NumberParser = jg_import("splunk.parsers.NumberParser");
	var Parser = jg_import("splunk.parsers.Parser");
	var ParseUtils = jg_import("splunk.parsers.ParseUtils");

	this.LatLonParser = jg_extend(Parser, function(LatLonParser, base)
	{

		// Private Static Properties

		var _instance = null;

		// Public Static Methods

		LatLonParser.getInstance = function()
		{
			if (!_instance)
				_instance = new LatLonParser();
			return _instance;
		};

		// Protected Properties

		this.numberParser = null;

		// Constructor

		this.constructor = function()
		{
			this.numberParser = NumberParser.getInstance();
		};

		// Public Methods

		this.stringToValue = function(str)
		{
			var values = ParseUtils.prepareTuple(str);
			if (!values)
				return null;

			var latLon = new LatLon();

			var numValues = values.length;
			if (numValues > 0)
				latLon.lat = this.numberParser.stringToValue(values[0]);
			if (numValues > 1)
				latLon.lon = this.numberParser.stringToValue(values[1]);

			return latLon;
		};

		this.valueToString = function(value)
		{
			var latLon = (value instanceof LatLon) ? value : null;
			if (!latLon)
				return null;

			var str = "";

			str += this.numberParser.valueToString(latLon.lat) + ",";
			str += this.numberParser.valueToString(latLon.lon);

			return "(" + str + ")";
		};

	});

});
});
