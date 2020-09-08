/**
 * Requires:
 * jquery
 * jg_global
 * jg_library
 * splunk_time
 */

jg_import.define("splunk.brushes.BorderStrokeBrush", function()
{
jg_namespace("splunk.brushes", function()
{

	var Brush = jg_import("jgatt.graphics.brushes.Brush");
	var ObservableArrayProperty = jg_import("jgatt.properties.ObservableArrayProperty");
	var ObservableProperty = jg_import("jgatt.properties.ObservableProperty");
	var NumberUtils = jg_import("jgatt.utils.NumberUtils");

	this.BorderStrokeBrush = jg_extend(Brush, function(BorderStrokeBrush, base)
	{

		// Public Properties

		this.colors = new ObservableArrayProperty("colors", Number, [ 0x000000, 0x000000, 0x000000, 0x000000 ])
			.readFilter(function(value)
			{
				return value.concat();
			})
			.writeFilter(function(value)
			{
				var length = value ? value.length : 0;
				var top = ((length > 0) && !isNaN(value[0])) ? NumberUtils.minMax(Math.floor(value[0]), 0x000000, 0xFFFFFF) : 0x000000;
				var right = ((length > 1) && !isNaN(value[1])) ? NumberUtils.minMax(Math.floor(value[1]), 0x000000, 0xFFFFFF) : top;
				var bottom = ((length > 2) && !isNaN(value[2])) ? NumberUtils.minMax(Math.floor(value[2]), 0x000000, 0xFFFFFF) : top;
				var left = ((length > 3) && !isNaN(value[3])) ? NumberUtils.minMax(Math.floor(value[3]), 0x000000, 0xFFFFFF) : right;
				return [ top, right, bottom, left ];
			});

		this.alphas = new ObservableArrayProperty("alphas", Number, [ 1, 1, 1, 1 ])
			.readFilter(function(value)
			{
				return value.concat();
			})
			.writeFilter(function(value)
			{
				var length = value ? value.length : 0;
				var top = ((length > 0) && !isNaN(value[0])) ? NumberUtils.minMax(value[0], 0, 1) : 1;
				var right = ((length > 1) && !isNaN(value[1])) ? NumberUtils.minMax(value[1], 0, 1) : top;
				var bottom = ((length > 2) && !isNaN(value[2])) ? NumberUtils.minMax(value[2], 0, 1) : top;
				var left = ((length > 3) && !isNaN(value[3])) ? NumberUtils.minMax(value[3], 0, 1) : right;
				return [ top, right, bottom, left ];
			});

		this.thicknesses = new ObservableArrayProperty("thicknesses", Number, [ 1, 1, 1, 1 ])
			.readFilter(function(value)
			{
				return value.concat();
			})
			.writeFilter(function(value)
			{
				var length = value ? value.length : 0;
				var top = ((length > 0) && (value[0] < Infinity)) ? Math.max(value[0], 0) : 1;
				var right = ((length > 1) && (value[1] < Infinity)) ? Math.max(value[1], 0) : top;
				var bottom = ((length > 2) && (value[2] < Infinity)) ? Math.max(value[2], 0) : top;
				var left = ((length > 3) && (value[3] < Infinity)) ? Math.max(value[3], 0) : right;
				return [ top, right, bottom, left ];
			});

		this.caps = new ObservableProperty("caps", String, "none")
			.writeFilter(function(value)
			{
				switch (value)
				{
					case "none":
					case "round":
					case "square":
						return value;
					default:
						return "none";
				}
			});

		this.joints = new ObservableProperty("joints", String, "miter")
			.writeFilter(function(value)
			{
				switch (value)
				{
					case "miter":
					case "round":
					case "bevel":
						return value;
					default:
						return "miter";
				}
			});

		this.miterLimit = new ObservableProperty("miterLimit", Number, 10)
			.writeFilter(function(value)
			{
				return ((value > 0) && (value < Infinity)) ? value : 10;
			});

		this.pixelHinting = new ObservableProperty("pixelHinting", Boolean, true);

		// Constructor

		this.constructor = function(colors, alphas, thicknesses, caps, joints, miterLimit, pixelHinting)
		{
			base.constructor.call(this);

			if (colors != null)
				this.set(this.colors, colors);
			if (alphas != null)
				this.set(this.alphas, alphas);
			if (thicknesses != null)
				this.set(this.thicknesses, thicknesses);
			if (caps != null)
				this.set(this.caps, caps);
			if (joints != null)
				this.set(this.joints, joints);
			if (miterLimit != null)
				this.set(this.miterLimit, miterLimit);
			if (pixelHinting != null)
				this.set(this.pixelHinting, pixelHinting);
		};

		// Protected Methods

		this.draw = function(properties, commands, graphics, matrix, bounds)
		{
			var numCommands = commands.length;
			if (numCommands === 0)
				return;

			var x1 = Infinity;
			var x2 = -Infinity;
			var y1 = Infinity;
			var y2 = -Infinity;
			var command;
			var i;

			for (i = 0; i < numCommands; i++)
			{
				command = commands[i];
				if ((command.name === "moveTo") || (command.name === "lineTo"))
				{
					x1 = Math.min(x1, command.x);
					x2 = Math.max(x2, command.x);
					y1 = Math.min(y1, command.y);
					y2 = Math.max(y2, command.y);
				}
				else if (command.name === "curveTo")
				{
					x1 = Math.min(x1, command.controlX, command.anchorX);
					x2 = Math.max(x2, command.controlX, command.anchorX);
					y1 = Math.min(y1, command.controlY, command.anchorY);
					y2 = Math.max(y2, command.controlY, command.anchorY);
				}
			}

			var borderPoints = [ { x: x1, y: y1 }, { x: x2, y: y1 }, { x: x2, y: y2 }, { x: x1, y: y2 }, { x: x1, y: y1 } ];
			var thickness = NaN;
			var color = NaN;
			var alpha = NaN;
			var newStroke = true;

			for (i = 0; i < 4; i++)
			{
				if (properties.thicknesses[i] !== thickness)
				{
					thickness = properties.thicknesses[i];
					newStroke = true;
				}

				if (thickness === 0)
					continue;

				if (properties.colors[i] !== color)
				{
					color = properties.colors[i];
					newStroke = true;
				}

				if (properties.alphas[i] !== alpha)
				{
					alpha = properties.alphas[i];
					newStroke = true;
				}

				if (newStroke)
				{
					graphics.endStroke();
					graphics.setStrokeStyle(thickness, properties.caps, properties.joints, properties.miterLimit, properties.pixelHinting);
					graphics.beginSolidStroke(color, alpha);
					graphics.moveTo(borderPoints[i].x, borderPoints[i].y);
					newStroke = false;
				}

				graphics.lineTo(borderPoints[i + 1].x, borderPoints[i + 1].y);
			}

			graphics.endStroke();
		};

	});

});
});

jg_import.define("splunk.charting.LogScale", function()
{
jg_namespace("splunk.charting", function()
{

	var NumberUtils = jg_import("jgatt.utils.NumberUtils");

	this.LogScale = jg_extend(Object, function(LogScale, base)
	{

		// Private Properties

		this._base = 0;
		this._baseMultiplier = 0;

		// Constructor

		this.constructor = function(base)
		{
			if ((base != null) && (typeof base !== "number"))
				throw new Error("Parameter base must be a number.");

			this._base = ((base > 0) && (base < Infinity)) ? base : 10;
			this._baseMultiplier = Math.log(this._base);
		};

		// Public Getters/Setters

		this.base = function()
		{
			return this._base;
		};

		// Public Methods

		this.valueToScale = function(value)
		{
			if (this._base <= 1)
				return 0;

			var scale = 0;

			var isNegative = (value < 0);

			if (isNegative)
				value = -value;

			if (value < this._base)
				value += (this._base - value) / this._base;
			scale = Math.log(value) / this._baseMultiplier;

			scale = NumberUtils.toPrecision(scale, -1);

			if (isNegative)
				scale = -scale;

			return scale;
		};

		this.scaleToValue = function(scale)
		{
			if (this._base <= 1)
				return 0;

			var value = 0;

			var isNegative = (scale < 0);

			if (isNegative)
				scale = -scale;

			value = Math.exp(scale * this._baseMultiplier);
			if (value < this._base)
				value = this._base * (value - 1) / (this._base - 1);

			value = NumberUtils.toPrecision(value, -1);

			if (isNegative)
				value = -value;

			return value;
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

jg_import.define("splunk.viz.GraphicsVizBase", function()
{
jg_namespace("splunk.viz", function()
{

	var Point = jg_import("jgatt.geom.Point");
	var Graphics = jg_import("jgatt.graphics.Graphics");
	var ObservableProperty = jg_import("jgatt.properties.ObservableProperty");
	var PropertyComparator = jg_import("jgatt.utils.PropertyComparator");
	var ValidatePass = jg_import("jgatt.validation.ValidatePass");
	var VizBase = jg_import("splunk.viz.VizBase");

	this.GraphicsVizBase = jg_extend(VizBase, function(GraphicsVizBase, base)
	{

		// Public Passes

		this.renderGraphicsPass = new ValidatePass("renderGraphics", 2, new PropertyComparator("renderGraphicsPriority"));

		// Public Properties

		this.x = new ObservableProperty("x", Number, 0)
			.writeFilter(function(value)
			{
				return ((value > -Infinity) && (value < Infinity)) ? value : 0;
			})
			.setter(function(value)
			{
				this.setStyle({ left: value + "px" });
			});

		this.y = new ObservableProperty("y", Number, 0)
			.writeFilter(function(value)
			{
				return ((value > -Infinity) && (value < Infinity)) ? value : 0;
			})
			.setter(function(value)
			{
				this.setStyle({ top: value + "px" });
			});

		this.width = new ObservableProperty("width", Number, 0)
			.writeFilter(function(value)
			{
				return ((value > -Infinity) && (value < Infinity)) ? value : 0;
			})
			.onChanged(function(e)
			{
				this.invalidate("renderGraphicsPass");
			});

		this.height = new ObservableProperty("height", Number, 0)
			.writeFilter(function(value)
			{
				return ((value > -Infinity) && (value < Infinity)) ? value : 0;
			})
			.onChanged(function(e)
			{
				this.invalidate("renderGraphicsPass");
			});

		this.renderGraphicsPriority = 0;
		this.graphics = null;

		// Constructor

		this.constructor = function(html)
		{
			base.constructor.call(this, html);

			this.addStyleClass("splunk-viz-GraphicsVizBase");

			this.setStyle({ position: "absolute", left: "0px", top: "0px" });

			this.graphics = new Graphics();
			this.graphics.appendTo(this.element);

			this.invalidate("renderGraphicsPass");
		};

		// Public Methods

		this.renderGraphics = function()
		{
			this.validatePreceding("renderGraphicsPass");

			if (this.isValid("renderGraphicsPass"))
				return;

			var width = this.getInternal("width");
			var height = this.getInternal("height");

			var graphics = this.graphics;
			graphics.setSize(width, height);

			this.renderGraphicsOverride(graphics, width, height);

			this.setValid("renderGraphicsPass");
		};

		this.localToGlobal = function(point)
		{
			if (point == null)
				throw new Error("Parameter point must be non-null.");
			if (!(point instanceof Point))
				throw new Error("Parameter point must be of type splunk.geom.Point.");

			var offset = this.$element.offset();
			return new Point(point.x + offset.left, point.y + offset.top);
		};

		this.globalToLocal = function(point)
		{
			if (point == null)
				throw new Error("Parameter point must be non-null.");
			if (!(point instanceof Point))
				throw new Error("Parameter point must be of type splunk.geom.Point.");

			var offset = this.$element.offset();
			return new Point(point.x - offset.left, point.y - offset.top);
		};

		// Protected Methods

		this.renderGraphicsOverride = function(graphics, width, height)
		{
		};

	});

});
});

jg_import.define("splunk.charting.Histogram", function()
{
jg_namespace("splunk.charting", function()
{

	var ChainedEvent = jg_import("jgatt.events.ChainedEvent");
	var EventData = jg_import("jgatt.events.EventData");
	var Point = jg_import("jgatt.geom.Point");
	var Rectangle = jg_import("jgatt.geom.Rectangle");
	var Graphics = jg_import("jgatt.graphics.Graphics");
	var DrawingUtils = jg_import("jgatt.graphics.brushes.DrawingUtils");
	var Brush = jg_import("jgatt.graphics.brushes.Brush");
	var SolidFillBrush = jg_import("jgatt.graphics.brushes.SolidFillBrush");
	var ObservableProperty = jg_import("jgatt.properties.ObservableProperty");
	var Property = jg_import("jgatt.properties.Property");
	var ArrayUtils = jg_import("jgatt.utils.ArrayUtils");
	var Comparator = jg_import("jgatt.utils.Comparator");
	var NumberUtils = jg_import("jgatt.utils.NumberUtils");
	var ValidatePass = jg_import("jgatt.validation.ValidatePass");
	var LogScale = jg_import("splunk.charting.LogScale");
	var DateTime = jg_import("splunk.time.DateTime");
	var GraphicsVizBase = jg_import("splunk.viz.GraphicsVizBase");

	this.Histogram = jg_extend(GraphicsVizBase, function(Histogram, base)
	{

		// Public Passes

		this.processDataPass = new ValidatePass("processData", 0.1);
		this.updateRangeXPass = new ValidatePass("updateRangeX", 0.2);
		this.updateRangeYPass = new ValidatePass("updateRangeY", 0.2);

		// Public Events

		this.rangeXChanged = new ChainedEvent("rangeXChanged", this.changed);
		this.rangeYChanged = new ChainedEvent("rangeYChanged", this.changed);
		this.containedRangeXChanged = new ChainedEvent("containedRangeXChanged", this.changed);
		this.containedRangeYChanged = new ChainedEvent("containedRangeYChanged", this.changed);

		// Public Properties

		this.data = new ObservableProperty("data", Array, null)
			.onChanged(function(e)
			{
				this.invalidate("processDataPass");
			});

		this.brush = new ObservableProperty("brush", Brush, null)
			.onChanged(function(e)
			{
				this.invalidate("renderGraphicsPass");
			});

		this.minimumX = new ObservableProperty("minimumX", Number, NaN)
			.writeFilter(function(value)
			{
				return ((value > -Infinity) && (value < Infinity)) ? value : NaN;
			})
			.onChanged(function(e)
			{
				this.invalidate("updateRangeXPass");
			});

		this.maximumX = new ObservableProperty("maximumX", Number, NaN)
			.writeFilter(function(value)
			{
				return ((value > -Infinity) && (value < Infinity)) ? value : NaN;
			})
			.onChanged(function(e)
			{
				this.invalidate("updateRangeXPass");
			});

		this.minimumY = new ObservableProperty("minimumY", Number, NaN)
			.readFilter(function(value)
			{
				return this.valueToAbsoluteY(value);
			})
			.writeFilter(function(value)
			{
				return ((value > -Infinity) && (value < Infinity)) ? this.absoluteToValueY(value) : NaN;
			})
			.onChanged(function(e)
			{
				this.invalidate("updateRangeYPass");
			});

		this.maximumY = new ObservableProperty("maximumY", Number, NaN)
			.readFilter(function(value)
			{
				return this.valueToAbsoluteY(value);
			})
			.writeFilter(function(value)
			{
				return ((value > -Infinity) && (value < Infinity)) ? this.absoluteToValueY(value) : NaN;
			})
			.onChanged(function(e)
			{
				this.invalidate("updateRangeYPass");
			});

		this.scaleY = new ObservableProperty("scaleY", LogScale, null)
			.onChanged(function(e)
			{
				this._cachedScaleY = e.newValue;
				this.invalidate("processDataPass");
			});

		this.containedMinimumX = new Property("containedMinimumX", Number, null, true)
			.onRead(function()
			{
				this.validate("updateRangeXPass");
			})
			.getter(function()
			{
				return this._containedMinimumX;
			});

		this.containedMaximumX = new Property("containedMaximumX", Number, null, true)
			.onRead(function()
			{
				this.validate("updateRangeXPass");
			})
			.getter(function()
			{
				return this._containedMaximumX;
			});

		this.containedMinimumY = new Property("containedMinimumY", Number, null, true)
			.onRead(function()
			{
				this.validate("updateRangeYPass");
			})
			.getter(function()
			{
				return this._containedMinimumY;
			});

		this.containedMaximumY = new Property("containedMaximumY", Number, null, true)
			.onRead(function()
			{
				this.validate("updateRangeYPass");
			})
			.getter(function()
			{
				return this._containedMaximumY;
			});

		this.actualMinimumX = new Property("actualMinimumX", Number, null, true)
			.onRead(function()
			{
				this.validate("updateRangeXPass");
			})
			.getter(function()
			{
				return this._actualMinimumX;
			});

		this.actualMaximumX = new Property("actualMaximumX", Number, null, true)
			.onRead(function()
			{
				this.validate("updateRangeXPass");
			})
			.getter(function()
			{
				return this._actualMaximumX;
			});

		this.actualMinimumY = new Property("actualMinimumY", Number, null, true)
			.onRead(function()
			{
				this.validate("updateRangeYPass");
			})
			.getter(function()
			{
				return this._actualMinimumY;
			});

		this.actualMaximumY = new Property("actualMaximumY", Number, null, true)
			.onRead(function()
			{
				this.validate("updateRangeYPass");
			})
			.getter(function()
			{
				return this._actualMaximumY;
			});

		// Private Properties

		this._cachedScaleY = null;
		this._containedMinimumX = 0;
		this._containedMaximumX = 0;
		this._containedMinimumY = 0;
		this._containedMaximumY = 100;
		this._actualMinimumX = 0;
		this._actualMaximumX = 0;
		this._actualMinimumY = 0;
		this._actualMaximumY = 100;

		this._actualRangeX = 0;
		this._actualRangeY = 100;
		this._actualScaleY = null;
		this._valueDatasX = null;
		this._valueDatasY = null;
		this._renderDatas = null;
		this._sortComparator = null;
		this._searchComparator = null;

		// Constructor

		this.constructor = function()
		{
			base.constructor.call(this);

			this.addStyleClass("splunk-charting-Histogram");

			var now = new DateTime();
			now = now.toUTC();
			now.setMinutes(0);
			now.setSeconds(0);
			this._containedMinimumX = now.getTime();
			this._containedMaximumX = now.getTime() + 3600;
			this._actualMinimumX = this._containedMinimumX;
			this._actualMaximumX = this._containedMaximumX;
			this._actualRangeX = this._actualMaximumX - this._actualMinimumX;

			this._valueDatasX = [];
			this._valueDatasY = [];
			this._renderDatas = [];
			this._sortComparator = new SortComparator();
			this._searchComparator = new SearchComparator();
		};

		// Public Methods

		this.processData = function()
		{
			this.validatePreceding("processDataPass");

			if (this.isValid("processDataPass"))
				return;

			this.invalidate("updateRangeXPass");
			this.invalidate("updateRangeYPass");

			var valueDatasX = this._valueDatasX = [];
			var valueDatasY = this._valueDatasY = [];
			var renderDatas = this._renderDatas = [];

			var buckets = this.getInternal("data");
			var numBuckets = buckets ? buckets.length : 0;
			if (numBuckets > 0)
			{
				var bucket;
				var valueDataX1;
				var valueDataX2;
				var valueDataY1;
				var valueDataY2 = { value: 0, absolute: this.valueToAbsoluteY(0) };
				var renderData;
				var i;

				valueDatasY.push(valueDataY2);

				for (i = 0; i < numBuckets; i++)
				{
					bucket = buckets[i];

					valueDataX1 = { value: bucket.x1, absolute: this.valueToAbsoluteX(bucket.x1) };
					valueDataX2 = { value: bucket.x2, absolute: this.valueToAbsoluteX(bucket.x2) };
					valueDataY1 = { value: bucket.y, absolute: this.valueToAbsoluteY(bucket.y) };

					if ((valueDataX1.absolute > -Infinity) && (valueDataX1.absolute < Infinity) &&
					    (valueDataX2.absolute > -Infinity) && (valueDataX2.absolute < Infinity) &&
					    (valueDataY1.absolute > -Infinity) && (valueDataY1.absolute < Infinity))
					{
						renderData = { valueDataX1: valueDataX1, valueDataX2: valueDataX2, valueDataY1: valueDataY1, valueDataY2: valueDataY2 };
						renderData.data = { x1: valueDataX1.value, x2: valueDataX2.value, y: valueDataY1.value };
						renderData.bounds = null;

						valueDatasX.push(valueDataX1);
						valueDatasX.push(valueDataX2);
						valueDatasY.push(valueDataY1);
						renderDatas.push(renderData);
					}
				}
			}

			this.setValid("processDataPass");
		};

		this.updateRangeX = function()
		{
			this.validatePreceding("updateRangeXPass");

			if (this.isValid("updateRangeXPass"))
				return;

			this.invalidate("renderGraphicsPass");

			var valueDatasX = this._valueDatasX;
			var numValueDatasX = valueDatasX.length;
			var valueDataX1;
			var minimumX = Infinity;
			var maximumX = -Infinity;
			var i;

			for (i = 0; i < numValueDatasX; i++)
			{
				valueDataX1 = valueDatasX[i];
				if (valueDataX1.absolute < minimumX)
					minimumX = valueDataX1.absolute;
				if (valueDataX1.absolute > maximumX)
					maximumX = valueDataX1.absolute;
			}

			if (minimumX == Infinity)
			{
				// default range is current hour
				var now = new DateTime();
				now = now.toUTC();
				now.setMinutes(0);
				now.setSeconds(0);
				minimumX = now.getTime();
				maximumX = now.getTime() + 3600;
			}

			var containedRangeXChanged = ((minimumX != this._containedMinimumX) || (maximumX != this._containedMaximumX));

			this._containedMinimumX = minimumX;
			this._containedMaximumX = maximumX;

			var assignedMinimumX = this.getInternal("minimumX");
			if (!isNaN(assignedMinimumX))
				minimumX = assignedMinimumX;

			var assignedMaximumX = this.getInternal("maximumX");
			if (!isNaN(assignedMaximumX))
				maximumX = assignedMaximumX;

			if (minimumX > maximumX)
			{
				var temp = minimumX;
				minimumX = maximumX;
				maximumX = temp;
			}

			var rangeX = maximumX - minimumX;
			for (i = 0; i < numValueDatasX; i++)
			{
				valueDataX1 = valueDatasX[i];
				valueDataX1.relative = (rangeX > 0) ? (valueDataX1.absolute - minimumX) / rangeX : 0;
			}

			ArrayUtils.sort(this._renderDatas, this._sortComparator);

			var rangeXChanged = ((minimumX != this._actualMinimumX) || (maximumX != this._actualMaximumX));

			this._actualMinimumX = minimumX;
			this._actualMaximumX = maximumX;
			this._actualRangeX = rangeX;

			this.setValid("updateRangeXPass");

			if (containedRangeXChanged)
				this.dispatchEvent("containedRangeXChanged", new EventData());
			if (rangeXChanged)
				this.dispatchEvent("rangeXChanged", new EventData());
		};

		this.updateRangeY = function()
		{
			this.validatePreceding("updateRangeYPass");

			if (this.isValid("updateRangeYPass"))
				return;

			this.invalidate("renderGraphicsPass");

			var valueDatasY = this._valueDatasY;
			var numValueDatasY = valueDatasY.length;
			var valueDataY1;
			var minimumY = Infinity;
			var maximumY = -Infinity;
			var i;

			for (i = 0; i < numValueDatasY; i++)
			{
				valueDataY1 = valueDatasY[i];
				if (valueDataY1.absolute < minimumY)
					minimumY = valueDataY1.absolute;
				if (valueDataY1.absolute > maximumY)
					maximumY = valueDataY1.absolute;
			}

			if (minimumY == Infinity)
			{
				// default range is 0-100
				minimumY = this.valueToAbsoluteY(0);
				maximumY = this.valueToAbsoluteY(100);
			}
			else
			{
				// extend range to round units
				var maxUnits = 50;
				var extendedMinimumY = minimumY;
				var extendedMaximumY = maximumY;
				var unit;
				var numUnits;
				for (i = 0; i < 2; i++)
				{
					unit = this._computeAutoUnits(extendedMaximumY - extendedMinimumY);

					// verify unit is greater than zero
					if (unit <= 0)
						break;

					// snap unit to integer if required
					if ((extendedMaximumY - extendedMinimumY) >= 1)
						unit = Math.max(Math.round(unit), 1);

					// scale unit if numUnits is greater than maxUnits
					numUnits = 1 + Math.floor((extendedMaximumY - extendedMinimumY) / unit);
					unit *= Math.ceil(numUnits / maxUnits);

					// snap minimumY and maximumY to unit
					extendedMinimumY = Math.ceil(minimumY / unit) * unit;
					if (extendedMinimumY != minimumY)
						extendedMinimumY -= unit;
					extendedMaximumY = Math.ceil(maximumY / unit) * unit;
				}
				minimumY = extendedMinimumY;
				maximumY = extendedMaximumY;
			}

			var containedRangeYChanged = ((minimumY != this._containedMinimumY) || (maximumY != this._containedMaximumY));

			this._containedMinimumY = minimumY;
			this._containedMaximumY = maximumY;

			var assignedMinimumY = this.getInternal("minimumY");
			if (!isNaN(assignedMinimumY))
				minimumY = this.valueToAbsoluteY(assignedMinimumY);

			var assignedMaximumY = this.getInternal("maximumY");
			if (!isNaN(assignedMaximumY))
				maximumY = this.valueToAbsoluteY(assignedMaximumY);

			if (minimumY > maximumY)
			{
				var temp = minimumY;
				minimumY = maximumY;
				maximumY = temp;
			}

			var rangeY = maximumY - minimumY;
			for (i = 0; i < numValueDatasY; i++)
			{
				valueDataY1 = valueDatasY[i];
				valueDataY1.relative = (rangeY > 0) ? (valueDataY1.absolute - minimumY) / rangeY : 0;
			}
			var scaleY = this._cachedScaleY;

			var rangeYChanged = ((minimumY != this._actualMinimumY) || (maximumY != this._actualMaximumY) || (scaleY != this._actualScaleY));

			this._actualMinimumY = minimumY;
			this._actualMaximumY = maximumY;
			this._actualRangeY = rangeY;
			this._actualScaleY = scaleY;

			this.setValid("updateRangeYPass");

			if (containedRangeYChanged)
				this.dispatchEvent("containedRangeYChanged", new EventData());
			if (rangeYChanged)
				this.dispatchEvent("rangeYChanged", new EventData());
		};

		this.valueToAbsoluteX = function(value)
		{
			if (value == null)
				return NaN;
			if (value instanceof DateTime)
				return value.getTime();
			if (value instanceof Date)
				return (value.getTime() / 1000);
			if (typeof value === "string")
			{
				if (!value)
					return NaN;
				var num = Number(value);
				if (!isNaN(num))
					return ((num > -Infinity) && (num < Infinity)) ? num : NaN;
				var date = new DateTime(value);
				return date.getTime();
			}
			if (typeof value === "number")
				return ((value > -Infinity) && (value < Infinity)) ? value : NaN;
			return NaN;
		};

		this.absoluteToValueX = function(absolute)
		{
			if ((absolute > -Infinity) && (absolute < Infinity))
				return (new DateTime(absolute)).toUTC();
			return null;
		};

		this.absoluteToRelativeX = function(absolute)
		{
			return (absolute - this._actualMinimumX) / this._actualRangeX;
		};

		this.relativeToAbsoluteX = function(relative)
		{
			return this._actualMinimumX + this._actualRangeX * relative;
		};

		this.valueToAbsoluteY = function(value)
		{
			var scaleY = this._cachedScaleY;
			if (scaleY)
				return scaleY.valueToScale(NumberUtils.parseNumber(value));
			return NumberUtils.parseNumber(value);
		};

		this.absoluteToValueY = function(absolute)
		{
			if ((absolute > -Infinity) && (absolute < Infinity))
			{
				var scaleY = this._cachedScaleY;
				if (scaleY)
					return scaleY.scaleToValue(Number(absolute));
				return Number(absolute);
			}
			return NaN;
		};

		this.absoluteToRelativeY = function(absolute)
		{
			return (absolute - this._actualMinimumY) / this._actualRangeY;
		};

		this.relativeToAbsoluteY = function(relative)
		{
			return this._actualMinimumY + this._actualRangeY * relative;
		};

		this.getDataUnderPoint = function(x, y)
		{
			this.validate("renderGraphicsPass");

			if ((y < 0) || (y > this.getInternal("height")))
				return null;

			var index = ArrayUtils.binarySearch(this._renderDatas, x / this.getInternal("width"), this._searchComparator);
			if (index < 0)
				return null;

			var renderData = this._renderDatas[index];
			return { data: renderData.data, bounds: renderData.bounds };
		};

		// Protected Methods

		this.renderGraphicsOverride = function(graphics, width, height)
		{
			var valueDatasX = this._valueDatasX;
			var valueDatasY = this._valueDatasY;
			var renderDatas = this._renderDatas;
			var numValueDatasX = valueDatasX.length;
			var numValueDatasY = valueDatasY.length;
			var numRenderDatas = renderDatas.length;
			var valueDataX1;
			var valueDataX2;
			var valueDataY1;
			var valueDataY2;
			var renderData;
			var i;

			for (i = 0; i < numValueDatasX; i++)
			{
				valueDataX1 = valueDatasX[i];
				valueDataX1.pixel = Math.round(width * valueDataX1.relative);
			}

			for (i = 0; i < numValueDatasY; i++)
			{
				valueDataY1 = valueDatasY[i];
				valueDataY1.pixel = Math.round(height * (1 - valueDataY1.relative));
			}

			var zeroData = (valueDatasY.length > 0) ? valueDatasY[0] : null;
			var zeroPixel = zeroData ? zeroData.pixel : height;
			var brushBounds1 = [ new Point(0, 0), new Point(width, 0), new Point(width, zeroPixel), new Point(0, zeroPixel) ];
			var brushBounds2 = [ new Point(0, zeroPixel), new Point(width, zeroPixel), new Point(width, height), new Point(0, height) ];
			var brushBounds;
			var x1;
			var x2;
			var y1;
			var y2;
			var temp;

			var brush = this.getInternal("brush");
			if (!brush)
				brush = new SolidFillBrush(0x000000, 1);

			graphics.clear();

			for (i = 0; i < numRenderDatas; i++)
			{
				renderData = renderDatas[i];
				valueDataX1 = renderData.valueDataX1;
				valueDataX2 = renderData.valueDataX2;
				valueDataY1 = renderData.valueDataY1;
				valueDataY2 = renderData.valueDataY2;

				if ((Math.max(valueDataX1.relative, valueDataX2.relative) < 0) ||
				    (Math.min(valueDataX1.relative, valueDataX2.relative) > 1) ||
				    (Math.max(valueDataY1.relative, valueDataY2.relative) < 0) ||
				    (Math.min(valueDataY1.relative, valueDataY2.relative) > 1))
					continue;

				x1 = valueDataX1.pixel;
				x2 = valueDataX2.pixel;
				y1 = valueDataY1.pixel;
				y2 = valueDataY2.pixel;

				if (x1 < x2)
					x1++;
				else
					x2++;

				if (x1 == x2)
				{
					if (valueDataX1.relative < valueDataX2.relative)
						x2++;
					else if (valueDataX1.relative > valueDataX2.relative)
						x2--;
				}

				if (y1 == y2)
				{
					if (valueDataY1.relative < valueDataY2.relative)
						y1++;
					else if (valueDataY1.relative > valueDataY2.relative)
						y1--;
				}

				if (x1 > x2)
				{
					temp = x1;
					x1 = x2;
					x2 = temp;
				}

				renderData.bounds = new Rectangle(x1, y1, x2 - x1, 0);

				brushBounds = (y1 <= y2) ? brushBounds1 : brushBounds2;

				brush.beginBrush(graphics, null, brushBounds);
				DrawingUtils.drawRectangle(brush, x1, y1, x2 - x1, y2 - y1);
				brush.endBrush();
			}
		};

		// Private Methods

		this._computeAutoUnits = function(range)
		{
			if (range <= 0)
				return 0;

			var significand = range / 10;
			var exponent = 0;

			if (significand > 0)
			{
				var str = significand.toExponential(20);
				var eIndex = str.indexOf("e");
				if (eIndex >= 0)
				{
					significand = Number(str.substring(0, eIndex));
					exponent = Number(str.substring(eIndex + 1, str.length));
				}
			}

			significand = Math.ceil(significand);

			if (significand > 5)
				significand = 10;
			else if (significand > 2)
				significand = 5;

			return significand * Math.pow(10, exponent);
		};

	});

	// Private Classes

	var SortComparator = jg_extend(Comparator, function(SortComparator, base)
	{

		// Public Methods

		this.compare = function(renderData1, renderData2)
		{
			var x11 = renderData1.valueDataX1.relative;
			var x21 = renderData2.valueDataX1.relative;
			if (x11 < x21)
				return -1;
			if (x11 > x21)
				return 1;
			return 0;
		};

	});

	var SearchComparator = jg_extend(Comparator, function(SearchComparator, base)
	{

		// Public Methods

		this.compare = function(x, renderData)
		{
			var x1 = renderData.valueDataX1.relative;
			var x2 = renderData.valueDataX2.relative;
			if (x < x1)
				return -1;
			if (x >= x2)
				return 1;
			return 0;
		};

	});

});
});

jg_import.define("splunk.charting.ClickDragRangeMarker", function()
{
jg_namespace("splunk.charting", function()
{

	var $ = jg_import("jQuery");
	var ChainedEvent = jg_import("jgatt.events.ChainedEvent");
	var Event = jg_import("jgatt.events.Event");
	var EventData = jg_import("jgatt.events.EventData");
	var Matrix = jg_import("jgatt.geom.Matrix");
	var Point = jg_import("jgatt.geom.Point");
	var Graphics = jg_import("jgatt.graphics.Graphics");
	var DrawingUtils = jg_import("jgatt.graphics.brushes.DrawingUtils");
	var SolidFillBrush = jg_import("jgatt.graphics.brushes.SolidFillBrush");
	var SolidStrokeBrush = jg_import("jgatt.graphics.brushes.SolidStrokeBrush");
	var PropertyTween = jg_import("jgatt.motion.PropertyTween");
	var TweenRunner = jg_import("jgatt.motion.TweenRunner");
	var CubicEaser = jg_import("jgatt.motion.easers.CubicEaser");
	var EaseDirection = jg_import("jgatt.motion.easers.EaseDirection");
	var ObservableProperty = jg_import("jgatt.properties.ObservableProperty");
	var Property = jg_import("jgatt.properties.Property");
	var FunctionUtils = jg_import("jgatt.utils.FunctionUtils");
	var NumberUtils = jg_import("jgatt.utils.NumberUtils");
	var StringUtils = jg_import("jgatt.utils.StringUtils");
	var ValidatePass = jg_import("jgatt.validation.ValidatePass");
	var Histogram = jg_import("splunk.charting.Histogram");
	var GraphicsVizBase = jg_import("splunk.viz.GraphicsVizBase");

	this.ClickDragRangeMarker = jg_extend(GraphicsVizBase, function(ClickDragRangeMarker, base)
	{

		// Public Passes

		this.updateRangePass = new ValidatePass("updateRange", 0.4);

		// Public Events

		this.rangeChanged = new ChainedEvent("rangeChanged", this.changed);
		this.dragStart = new Event("dragStart", EventData);
		this.dragComplete = new Event("dragComplete", EventData);

		// Public Properties

		this.foregroundColor = new ObservableProperty("foregroundColor", Number, 0x000000)
			.writeFilter(function(value)
			{
				return !isNaN(value) ? Math.min(Math.max(Math.floor(value), 0x000000), 0xFFFFFF) : 0x000000;
			})
			.onChanged(function(e)
			{
				this.invalidate("renderGraphicsPass");
			});

		this.histogram = new ObservableProperty("histogram", Histogram, null)
			.onChanged(function(e)
			{
				var target = e.target;
				if ((target === this) || ((target instanceof Histogram) && (e.event === target.rangeXChanged)))
					this.invalidate("updateRangePass");
			});

		this.minimum = new ObservableProperty("minimum", Number, NaN)
			.writeFilter(function(value)
			{
				return ((value > -Infinity) && (value < Infinity)) ? value : NaN;
			})
			.onChanged(function(e)
			{
				this.invalidate("updateRangePass");
			});

		this.maximum = new ObservableProperty("maximum", Number, NaN)
			.writeFilter(function(value)
			{
				return ((value > -Infinity) && (value < Infinity)) ? value : NaN;
			})
			.onChanged(function(e)
			{
				this.invalidate("updateRangePass");
			});

		this.minimumSnap = new ObservableProperty("minimumSnap", Function, null)
			.onChanged(function(e)
			{
				this.invalidate("updateRangePass");
			});

		this.maximumSnap = new ObservableProperty("maximumSnap", Function, null)
			.onChanged(function(e)
			{
				this.invalidate("updateRangePass");
			});

		this.minimumFormat = new ObservableProperty("minimumFormat", Function, null)
			.onChanged(function(e)
			{
				this.invalidate("renderGraphicsPass");
			});

		this.maximumFormat = new ObservableProperty("maximumFormat", Function, null)
			.onChanged(function(e)
			{
				this.invalidate("renderGraphicsPass");
			});

		this.rangeFormat = new ObservableProperty("rangeFormat", Function, null)
			.onChanged(function(e)
			{
				this.invalidate("renderGraphicsPass");
			});

		this.actualMinimum = new Property("actualMinimum", Number, null, true)
			.onRead(function()
			{
				this.validate("updateRangePass");
			})
			.getter(function()
			{
				return this._actualMinimum;
			});

		this.actualMaximum = new Property("actualMaximum", Number, null, true)
			.onRead(function()
			{
				this.validate("updateRangePass");
			})
			.getter(function()
			{
				return this._actualMaximum;
			});

		this.labelOpacity = new ObservableProperty("labelOpacity", Number, 0)
			.onChanged(function(e)
			{
				this._redrawLabelOpacity();
			});

		// Private Properties

		this._actualMinimum = NaN;
		this._actualMaximum = NaN;
		this._relativeMinimum = 0;
		this._relativeMaximum = 1;
		this._fillBrush = null;
		this._lineBrush = null;
		this._backgroundBrush = null;
		this._labelGraphics = null;
		this._minimumLabel = null;
		this._maximumLabel = null;
		this._rangeLabel = null;
		this._rangeLabelClip = null;
		this._labelContainer = null;
		this._moveHotspot = null;
		this._areLabelsVisible = false;
		this._dragMode = null;
		this._pressMouseX = 0;
		this._pressMinimum = 0;
		this._pressMaximum = 1;

		// Constructor

		this.constructor = function()
		{
			base.constructor.call(this, "<div tabindex=\"0\"></div>");

			this.addStyleClass("splunk-charting-ClickDragRangeMarker");

			this.setStyle({ outline: "none" });

			this._self_mouseOver = FunctionUtils.bind(this._self_mouseOver, this);
			this._self_mouseOut = FunctionUtils.bind(this._self_mouseOut, this);
			this._self_mouseMove = FunctionUtils.bind(this._self_mouseMove, this);
			this._self_mouseDown = FunctionUtils.bind(this._self_mouseDown, this);
			this._self_keyDown = FunctionUtils.bind(this._self_keyDown, this);
			this._document_mouseUp = FunctionUtils.bind(this._document_mouseUp, this);
			this._document_mouseMove = FunctionUtils.bind(this._document_mouseMove, this);
			this._document_mouseLeave = FunctionUtils.bind(this._document_mouseLeave, this);

			this._fillBrush = new SolidFillBrush(0xD9D9D9, 1);

			this._lineBrush = new SolidStrokeBrush(this.getInternal("foregroundColor"), 0.4, 1, "square");

			this._backgroundBrush = new SolidFillBrush(0xEAEAEA, 0.66);

			this._labelGraphics = new Graphics();

			this._minimumLabel = document.createElement("span");
			$(this._minimumLabel).addClass("splunk-charting-label");
			$(this._minimumLabel).css({ position: "absolute", left: "0px", top: "0px", "white-space": "pre" });

			this._maximumLabel = document.createElement("span");
			$(this._maximumLabel).addClass("splunk-charting-label");
			$(this._maximumLabel).css({ position: "absolute", left: "0px", top: "0px", "white-space": "pre" });

			this._rangeLabel = document.createElement("span");
			$(this._rangeLabel).addClass("splunk-charting-label");
			$(this._rangeLabel).css({ position: "absolute", left: "0px", top: "0px", "white-space": "pre" });

			this._rangeLabelClip = document.createElement("div");
			this._rangeLabelClip.appendChild(this._rangeLabel);
			$(this._rangeLabelClip).css({ position: "absolute", left: "0px", top: "0px", margin: "0px", padding: "0px", overflow: "hidden" });

			this._labelContainer = document.createElement("div");
			this._labelGraphics.appendTo(this._labelContainer);
			this._labelContainer.appendChild(this._minimumLabel);
			this._labelContainer.appendChild(this._maximumLabel);
			this._labelContainer.appendChild(this._rangeLabelClip);
			$(this._labelContainer).css({ position: "absolute", left: "0px", top: "0px", margin: "0px", padding: "0px" });

			this._moveHotspot = document.createElement("div");
			$(this._moveHotspot).css({ position: "absolute", left: "0px", top: "0px", margin: "0px", padding: "0px", cursor: "move", visibility: "hidden" });

			this.$element.bind("mouseover", this._self_mouseOver);
			this.$element.bind("mouseout", this._self_mouseOut);
			this.$element.bind("mousemove", this._self_mouseMove);
			this.$element.bind("mousedown", this._self_mouseDown);
			this.$element.bind("keydown", this._self_keyDown);

			this.element.appendChild(this._labelContainer);
			this.element.appendChild(this._moveHotspot);
		};

		// Public Methods

		this.updateRange = function()
		{
			this.validatePreceding("updateRangePass");

			if (this.isValid("updateRangePass"))
				return;

			var actualMinimum = this.getInternal("minimum");
			var actualMaximum = this.getInternal("maximum");
			var relativeMinimum = 0;
			var relativeMaximum = 1;

			var histogram = this.getInternal("histogram");
			if (histogram)
			{
				var histogramMinimumX = histogram.get("actualMinimumX");
				var histogramMaximumX = histogram.get("actualMaximumX");
				var histogramRangeX = histogramMaximumX - histogramMinimumX;

				var minimumSnap = this.getInternal("minimumSnap");
				if ((minimumSnap != null) && !isNaN(actualMinimum))
					actualMinimum = minimumSnap(actualMinimum);

				var maximumSnap = this.getInternal("maximumSnap");
				if ((maximumSnap != null) && !isNaN(actualMaximum))
					actualMaximum = maximumSnap(actualMaximum);

				if (!isNaN(actualMinimum))
					relativeMinimum = (histogramRangeX > 0) ? ((actualMinimum - histogramMinimumX) / histogramRangeX) : 0;
				else
					actualMinimum = histogramMinimumX;

				if (!isNaN(actualMaximum))
					relativeMaximum = (histogramRangeX > 0) ? ((actualMaximum - histogramMinimumX) / histogramRangeX) : 1;
				else
					actualMaximum = histogramMaximumX;

				var temp;
				if (actualMinimum > actualMaximum)
				{
					temp = actualMinimum;
					actualMinimum = actualMaximum;
					actualMaximum = temp;

					temp = relativeMinimum;
					relativeMinimum = relativeMaximum;
					relativeMaximum = temp;
				}
			}

			var actualChanged = ((actualMinimum != this._actualMinimum) || (actualMaximum != this._actualMaximum));
			var relativeChanged = ((relativeMinimum != this._relativeMinimum) || (relativeMaximum != this._relativeMaximum));

			this._actualMinimum = actualMinimum;
			this._actualMaximum = actualMaximum;
			this._relativeMinimum = relativeMinimum;
			this._relativeMaximum = relativeMaximum;

			if (actualChanged || relativeChanged)
				this.invalidate("renderGraphicsPass");

			this.setValid("updateRangePass");

			if (actualChanged)
				this.dispatchEvent("rangeChanged", new EventData());
		};

		this.isDragging = function()
		{
			return (this._dragMode != null);
		};

		// Protected Methods

		this.onAppend = function()
		{
			$(document).bind("mousemove", this._document_mouseMove);
			$(document).bind("mouseleave", this._document_mouseLeave);
		};

		this.onRemove = function()
		{
			$(document).unbind("mouseup", this._document_mouseUp);
			$(document).unbind("mousemove", this._document_mouseMove);
			$(document).unbind("mouseleave", this._document_mouseLeave);
		};

		this.renderGraphicsOverride = function(graphics, width, height)
		{
			var actualMinimum = this._actualMinimum;
			var actualMaximum = this._actualMaximum;
			var relativeMinimum = this._relativeMinimum;
			var relativeMaximum = this._relativeMaximum;
			var minimumLabel = $(this._minimumLabel);
			var maximumLabel = $(this._maximumLabel);
			var rangeLabel = $(this._rangeLabel);
			var rangeLabelClip = $(this._rangeLabelClip);
			var moveHotspot = $(this._moveHotspot);

			// format labels

			var minimumFormat = this.getInternal("minimumFormat");
			if (isNaN(actualMinimum))
				minimumLabel.html("");
			else if (!minimumFormat)
				minimumLabel.html(StringUtils.escapeHTML(actualMinimum));
			else
				minimumLabel.html(StringUtils.escapeHTML(minimumFormat(actualMinimum)));

			var maximumFormat = this.getInternal("maximumFormat");
			if (isNaN(actualMaximum))
				maximumLabel.html("");
			else if (!maximumFormat)
				maximumLabel.html(StringUtils.escapeHTML(actualMaximum));
			else
				maximumLabel.html(StringUtils.escapeHTML(maximumFormat(actualMaximum)));

			var rangeFormat = this.getInternal("rangeFormat");
			if (!rangeFormat || isNaN(actualMinimum) || isNaN(actualMaximum))
				rangeLabel.html("");
			else
				rangeLabel.html(StringUtils.escapeHTML(rangeFormat(actualMinimum, actualMaximum)));

			// compute placements

			if (relativeMinimum > relativeMaximum)
			{
				var temp;

				temp = relativeMinimum;
				relativeMinimum = relativeMaximum;
				relativeMaximum = temp;

				temp = minimumLabel;
				minimumLabel = maximumLabel;
				maximumLabel = temp;
			}

			var x1 = 0;
			var x2 = Math.round(width * relativeMinimum);
			var x3 = Math.round(width * relativeMaximum);
			var x4 = Math.round(width);

			var y1 = 0;
			var y2 = Math.round(height);

			x2 = NumberUtils.minMax(x2, x1, x4);
			x3 = NumberUtils.minMax(x3, x1, x4);

			// layout labels

			var minimumLabelBounds = {};
			minimumLabelBounds.width = Math.round(minimumLabel.outerWidth(true));
			minimumLabelBounds.height = 20;
			minimumLabelBounds.x = x2 - minimumLabelBounds.width;
			minimumLabelBounds.y = Math.min(y2 - minimumLabelBounds.height, 0);

			var maximumLabelBounds = {};
			maximumLabelBounds.width = Math.round(maximumLabel.outerWidth(true));
			maximumLabelBounds.height = 20;
			maximumLabelBounds.x = x3;
			maximumLabelBounds.y = Math.min(y2 - maximumLabelBounds.height, 0);

			var rangeLabelBounds = {};
			rangeLabelBounds.width = Math.min(Math.round(rangeLabel.outerWidth(true)), x3 - x2);
			rangeLabelBounds.height = 20;
			rangeLabelBounds.x = x2 + Math.round((x3 - x2 - rangeLabelBounds.width) / 2);
			rangeLabelBounds.y = y2;

			if ((maximumLabelBounds.x + maximumLabelBounds.width) > x4)
				maximumLabelBounds.x = x4 - maximumLabelBounds.width;
			if ((minimumLabelBounds.x + minimumLabelBounds.width) > maximumLabelBounds.x)
				minimumLabelBounds.x = maximumLabelBounds.x - minimumLabelBounds.width;

			if (minimumLabelBounds.x < 0)
				minimumLabelBounds.x = 0;
			if (maximumLabelBounds.x < (minimumLabelBounds.x + minimumLabelBounds.width))
				maximumLabelBounds.x = minimumLabelBounds.x + minimumLabelBounds.width;

			minimumLabel.css(
			{
				left: minimumLabelBounds.x + "px",
				top: minimumLabelBounds.y + Math.round((minimumLabelBounds.height - minimumLabel.outerHeight(true)) / 2) + "px"
			});

			maximumLabel.css(
			{
				left: maximumLabelBounds.x + "px",
				top: maximumLabelBounds.y + Math.round((maximumLabelBounds.height - maximumLabel.outerHeight(true)) / 2) + "px"
			});

			rangeLabel.css(
			{
				top: Math.round((rangeLabelBounds.height - rangeLabel.outerHeight(true)) / 2) + "px"
			});

			rangeLabelClip.css(
			{
				left: rangeLabelBounds.x + "px",
				top: rangeLabelBounds.y + "px",
				width: rangeLabelBounds.width + "px",
				height: rangeLabelBounds.height + "px"
			});

			// layout hotspot

			moveHotspot.css(
			{
				left: x2 + "px",
				top: y1 + "px",
				width: (x3 - x2) + "px",
				height: (y2 - y1) + "px",
				visibility: ((this._dragMode === "move") || (!this._dragMode && ((relativeMinimum > 0) || (relativeMaximum < 1)))) ? "" : "hidden"
			});

			// draw background

			graphics.clear();

			var backgroundBrush = this._backgroundBrush;

			backgroundBrush.beginBrush(graphics);
			DrawingUtils.drawRectangle(backgroundBrush, Math.min(x1 + 1, x4), y1, Math.max(x2 - 1, 0), y2);
			backgroundBrush.endBrush();

			backgroundBrush.beginBrush(graphics);
			DrawingUtils.drawRectangle(backgroundBrush, Math.min(x3 + 1, x4), y1, Math.max(x4 - x3 - 1, 0), y2);
			backgroundBrush.endBrush();

			// draw lines

			graphics = this._labelGraphics;
			graphics.clear();
			graphics.setSize(width + 1, height + 20);  // pad graphics width and height so we can draw outside bounds

			var lineBrush = this._lineBrush;
			lineBrush.set("color", this.getInternal("foregroundColor"));

			lineBrush.beginBrush(graphics);
			lineBrush.moveTo(x2, minimumLabelBounds.y);
			lineBrush.lineTo(x2, y2 + 20);
			lineBrush.endBrush();

			lineBrush.beginBrush(graphics);
			lineBrush.moveTo(x3, maximumLabelBounds.y);
			lineBrush.lineTo(x3, y2 + 20);
			lineBrush.endBrush();

			// draw fills

			var fillBrush = this._fillBrush;

			fillBrush.beginBrush(graphics);
			DrawingUtils.drawRectangle(fillBrush, minimumLabelBounds.x + 1, minimumLabelBounds.y, minimumLabelBounds.width - 1, minimumLabelBounds.height);
			fillBrush.endBrush();

			fillBrush.beginBrush(graphics);
			DrawingUtils.drawRectangle(fillBrush, maximumLabelBounds.x + 1, maximumLabelBounds.y, maximumLabelBounds.width - 1, maximumLabelBounds.height);
			fillBrush.endBrush();

			fillBrush.beginBrush(graphics);
			DrawingUtils.drawRectangle(fillBrush, x2 + 1, y2, Math.max(x3 - x2 - 1, 0), 20);
			fillBrush.endBrush();

			this._redrawLabelOpacity();
		};

		// Private Methods

		this._redrawLabelOpacity = function()
		{
			var opacity = this.getInternal(this.labelOpacity);
			$(this._labelContainer).css(
			{
				opacity: opacity + "",
				filter: "alpha(opacity=" + Math.round(opacity * 100) + ")",
				visibility: (opacity > 0) ? "" : "hidden"
			});
		};

		this._updateShowLabels = function(mouseLocal, enableShow)
		{
			if (isNaN(this.getInternal("minimum")) && isNaN(this.getInternal("maximum")) &&
			    ((mouseLocal.x < 0) || (mouseLocal.x > this.getInternal("width")) || (mouseLocal.y < 0) || (mouseLocal.y > this.getInternal("height"))))
				this._hideLabels();
			else if (enableShow !== false)
				this._showLabels();
		};

		this._showLabels = function()
		{
			if (this._areLabelsVisible)
				return;

			this._areLabelsVisible = true;

			var tween = new PropertyTween(this, "labelOpacity", null, 1, new CubicEaser(EaseDirection.OUT));
			TweenRunner.start(tween, 0.3);
		};

		this._hideLabels = function()
		{
			if (!this._areLabelsVisible)
				return;

			this._areLabelsVisible = false;

			var tween = new PropertyTween(this, "labelOpacity", null, 0, new CubicEaser(EaseDirection.OUT));
			TweenRunner.start(tween, 0.3);
		};

		this._beginDrag = function(mouseLocal, dragMode)
		{
			if (this._dragMode || !dragMode)
				return;

			this._dragMode = dragMode;

			this._pressMouseX = mouseLocal.x;
			this._pressMinimum = this._relativeMinimum;
			this._pressMaximum = this._relativeMaximum;

			this._updateDrag(mouseLocal);

			this.dispatchEvent("dragStart", new EventData());
		};

		this._endDrag = function()
		{
			if (!this._dragMode)
				return;

			var dragMode = this._dragMode;
			this._dragMode = null;

			this.validate("updateRangePass");

			switch (dragMode)
			{
				case "new":
				case "inside":
					// select single bucket
					this._selectOne();
					break;
				case "outside":
					// select all
					this._selectAll();
					break;
				case "select":
					// if nothing or everything is selected, select all
					if ((this._relativeMinimum == this._relativeMaximum) || ((this._relativeMinimum <= 0) && (this._relativeMaximum >= 1)))
						this._selectAll();
					break;
			}

			this.invalidate("renderGraphicsPass");

			this.dispatchEvent("dragComplete", new EventData());
		};

		this._updateDrag = function(mouseLocal)
		{
			if (!this._dragMode)
				return;

			switch (this._dragMode)
			{
				case "new":
					this._updateDragStart(mouseLocal, "select");
					break;
				case "inside":
					this._updateDragStart(mouseLocal, "move");
					break;
				case "outside":
					this._updateDragStart(mouseLocal, "select");
					break;
				case "select":
					this._updateDragSelect(mouseLocal);
					break;
				case "move":
					this._updateDragMove(mouseLocal);
					break;
			}
		};

		this._updateDragStart = function(mouseLocal, nextDragMode)
		{
			if (Math.abs(mouseLocal.x - this._pressMouseX) < 4)
				return;

			this._dragMode = nextDragMode;

			this._updateDrag(mouseLocal);
		};

		this._updateDragSelect = function(mouseLocal)
		{
			var histogram = this.getInternal("histogram");
			if (!histogram)
				return;

			var width = this.getInternal("width");
			if (width <= 0)
				return;

			var pressMouseX = NumberUtils.minMax(this._pressMouseX, 0, width);
			var mouseX = NumberUtils.minMax(mouseLocal.x, 0, width);

			var relativeMinimum = pressMouseX / width;
			var relativeMaximum = mouseX / width;

			var histogramMinimumX = histogram.get("actualMinimumX");
			var histogramMaximumX = histogram.get("actualMaximumX");
			var histogramRangeX = histogramMaximumX - histogramMinimumX;

			var minimum = histogramMinimumX + histogramRangeX * relativeMinimum;
			var maximum = histogramMinimumX + histogramRangeX * relativeMaximum;
			if (minimum > maximum)
			{
				var temp = minimum;
				minimum = maximum;
				maximum = temp;
			}

			var minimumSnap = this.getInternal("minimumSnap");
			if ((minimumSnap != null) && !isNaN(minimum))
				minimum = minimumSnap(minimum, true);

			var maximumSnap = this.getInternal("maximumSnap");
			if ((maximumSnap != null) && !isNaN(maximum))
				maximum = maximumSnap(maximum, true);

			this.set("minimum", minimum);
			this.set("maximum", maximum);
		};

		this._updateDragMove = function(mouseLocal)
		{
			var histogram = this.getInternal("histogram");
			if (!histogram)
				return;

			var width = this.getInternal("width");
			if (width <= 0)
				return;

			var diff = (mouseLocal.x - this._pressMouseX) / width;
			diff = NumberUtils.minMax(diff, -this._pressMinimum, 1 - this._pressMaximum);

			var relativeMinimum = this._pressMinimum + diff;
			var relativeMaximum  = this._pressMaximum + diff;

			var histogramMinimumX = histogram.get("actualMinimumX");
			var histogramMaximumX = histogram.get("actualMaximumX");
			var histogramRangeX = histogramMaximumX - histogramMinimumX;

			var minimum = histogramMinimumX + histogramRangeX * relativeMinimum;
			var maximum = histogramMinimumX + histogramRangeX * relativeMaximum;

			this.set("minimum", minimum);
			this.set("maximum", maximum);
		};

		this._selectOne = function()
		{
			var histogram = this.getInternal("histogram");
			if (!histogram)
				return;

			var width = this.getInternal("width");
			if (width <= 0)
				return;

			var pressMouseX = NumberUtils.minMax(this._pressMouseX, 0, width);
			var relativePress = pressMouseX / width;

			var histogramMinimumX = histogram.get("actualMinimumX");
			var histogramMaximumX = histogram.get("actualMaximumX");
			var histogramRangeX = histogramMaximumX - histogramMinimumX;

			var minimum = histogramMinimumX + histogramRangeX * relativePress;
			var maximum = minimum;

			var minimumSnap = this.getInternal("minimumSnap");
			if ((minimumSnap != null) && !isNaN(minimum))
				minimum = minimumSnap(minimum, true);

			var maximumSnap = this.getInternal("maximumSnap");
			if ((maximumSnap != null) && !isNaN(maximum))
				maximum = maximumSnap(maximum, true);

			this.set("minimum", minimum);
			this.set("maximum", maximum);
			this.validate("updateRangePass");
		};

		this._selectAll = function()
		{
			this.set("minimum", NaN);
			this.set("maximum", NaN);
			this.validate("updateRangePass");
		};

		this._self_mouseOver = function(e)
		{
			if (this._dragMode)
				return;

			var mouseLocal = this.globalToLocal(new Point(e.pageX, e.pageY));
			this._updateShowLabels(mouseLocal);
		};

		this._self_mouseOut = function(e)
		{
			if (this._dragMode)
				return;

			var mouseLocal = this.globalToLocal(new Point(e.pageX, e.pageY));
			this._updateShowLabels(mouseLocal);
		};

		this._self_mouseMove = function(e)
		{
			if (this._dragMode)
				return;

			var mouseLocal = this.globalToLocal(new Point(e.pageX, e.pageY));
			this._updateShowLabels(mouseLocal);
		};

		this._self_mouseDown = function(e)
		{
			var width = this.getInternal("width");
			var height = this.getInternal("height");
			if ((width <= 0) || (height <= 0))
				return;

			var mouseLocal = this.globalToLocal(new Point(e.pageX, e.pageY));
			var mouseX = mouseLocal.x / width;
			var mouseY = mouseLocal.y / height;
			if ((mouseX < 0) || (mouseX > 1) || (mouseY < 0) || (mouseY > 1))
				return;

			this.element.focus();

			$(document).bind("mouseup", this._document_mouseUp);

			if ((this._relativeMinimum <= 0) && (this._relativeMaximum >= 1))
				this._beginDrag(mouseLocal, "new");
			else if ((mouseX > this._relativeMinimum) && (mouseX < this._relativeMaximum))
				this._beginDrag(mouseLocal, "inside");
			else
				this._beginDrag(mouseLocal, "outside");

			e.preventDefault();
		};

		this._self_keyDown = function(e)
		{
			if (this._dragMode)
				return;

			if (e.keyCode == 27) // esc
			{
				// clicking outside selection selects all
				if (!isNaN(this.getInternal("minimum")) || !isNaN(this.getInternal("maximum")))
				{
					this._beginDrag(new Point(0, 0), "outside");
					this._endDrag();
				}
			}
		};

		this._document_mouseUp = function(e)
		{
			var mouseLocal = this.globalToLocal(new Point(e.pageX, e.pageY));

			$(document).unbind("mouseup", this._document_mouseUp);

			this._endDrag();
			this._updateShowLabels(mouseLocal, false);
		};

		this._document_mouseMove = function(e)
		{
			var mouseLocal = this.globalToLocal(new Point(e.pageX, e.pageY));
			if (this._dragMode)
				this._updateDrag(mouseLocal);
			else
				this._updateShowLabels(mouseLocal, false);
		};

		this._document_mouseLeave = function(e)
		{
			if (!this._dragMode)
				this._updateShowLabels(new Point(-1, -1), false);
		};

	});

});
});

jg_import.define("splunk.charting.CursorMarker", function()
{
jg_namespace("splunk.charting", function()
{

	var $ = jg_import("jQuery");
	var Matrix = jg_import("jgatt.geom.Matrix");
	var Graphics = jg_import("jgatt.graphics.Graphics");
	var DrawingUtils = jg_import("jgatt.graphics.brushes.DrawingUtils");
	var SolidFillBrush = jg_import("jgatt.graphics.brushes.SolidFillBrush");
	var SolidStrokeBrush = jg_import("jgatt.graphics.brushes.SolidStrokeBrush");
	var ObservableProperty = jg_import("jgatt.properties.ObservableProperty");
	var StringUtils = jg_import("jgatt.utils.StringUtils");
	var Histogram = jg_import("splunk.charting.Histogram");
	var GraphicsVizBase = jg_import("splunk.viz.GraphicsVizBase");

	this.CursorMarker = jg_extend(GraphicsVizBase, function(CursorMarker, base)
	{

		// Public Properties

		this.foregroundColor = new ObservableProperty("foregroundColor", Number, 0x000000)
			.writeFilter(function(value)
			{
				return !isNaN(value) ? Math.min(Math.max(Math.floor(value), 0x000000), 0xFFFFFF) : 0x000000;
			})
			.onChanged(function(e)
			{
				this.invalidate("renderGraphicsPass");
			});

		this.histogram = new ObservableProperty("histogram", Histogram, null)
			.onChanged(function(e)
			{
				var target = e.target;
				if ((target === this) || ((target instanceof Histogram) && (e.event === target.rangeXChanged)))
					this.invalidate("renderGraphicsPass");
			});

		this.value = new ObservableProperty("value", Number, NaN)
			.writeFilter(function(value)
			{
				return ((value > -Infinity) && (value < Infinity)) ? value : NaN;
			})
			.onChanged(function(e)
			{
				this.invalidate("renderGraphicsPass");
			});

		this.valueSnap = new ObservableProperty("valueSnap", Function, null)
			.onChanged(function(e)
			{
				this.invalidate("renderGraphicsPass");
			});

		this.valueFormat = new ObservableProperty("valueFormat", Function, null)
			.onChanged(function(e)
			{
				this.invalidate("renderGraphicsPass");
			});

		this.labelOpacity = new ObservableProperty("labelOpacity", Number, 1)
			.onChanged(function(e)
			{
				this._redrawLabelOpacity();
			});

		// Private Properties

		this._fillBrush = null;
		this._lineBrush = null;
		this._backgroundBrush = null;
		this._labelGraphics = null;
		this._valueLabel = null;
		this._labelContainer = null;

		// Constructor

		this.constructor = function()
		{
			base.constructor.call(this);

			this.addStyleClass("splunk-charting-CursorMarker");

			this._fillBrush = new SolidFillBrush(0xD9D9D9, 1);

			this._lineBrush = new SolidStrokeBrush(this.getInternal("foregroundColor"), 0.4, 1, "square");

			this._backgroundBrush = new SolidFillBrush(0xEAEAEA, 0.66);

			this._labelGraphics = new Graphics();

			this._valueLabel = document.createElement("span");
			$(this._valueLabel).addClass("splunk-charting-label");
			$(this._valueLabel).css({ position: "absolute", left: "0px", top: "0px", "white-space": "pre" });

			this._labelContainer = document.createElement("div");
			this._labelGraphics.appendTo(this._labelContainer);
			this._labelContainer.appendChild(this._valueLabel);
			$(this._labelContainer).css({ position: "absolute", left: "0px", top: "0px", margin: "0px", padding: "0px" });

			this.element.appendChild(this._labelContainer);
		};

		// Protected Methods

		this.renderGraphicsOverride = function(graphics, width, height)
		{
			var value = this.getInternal("value");
			var displayValue = value;
			var relativeValue = 0;
			var valueLabel = $(this._valueLabel);

			var histogram = this.getInternal("histogram");
			if (histogram)
			{
				var histogramMinimumX = histogram.get("actualMinimumX");
				var histogramMaximumX = histogram.get("actualMaximumX");
				var histogramRangeX = histogramMaximumX - histogramMinimumX;

				var valueSnap = this.getInternal("valueSnap");
				if (valueSnap && !isNaN(value))
					displayValue = valueSnap(value);

				if (!isNaN(value))
					relativeValue = (histogramRangeX > 0) ? ((value - histogramMinimumX) / histogramRangeX) : 0;
			}

			// format label

			var valueFormat = this.getInternal("valueFormat");
			if (isNaN(displayValue))
				valueLabel.html("");
			else if (!valueFormat)
				valueLabel.html(StringUtils.escapeHTML(displayValue));
			else
				valueLabel.html(StringUtils.escapeHTML(valueFormat(displayValue)));

			// compute placements

			var x1 = 0;
			var x2 = Math.round(width * Math.min(Math.max(relativeValue, 0), 1));

			var y1 = 0;
			var y2 = Math.round(height);

			// layout label

			var valueLabelBounds = {};
			valueLabelBounds.width = Math.round(valueLabel.outerWidth(true));
			valueLabelBounds.height = 20;
			valueLabelBounds.x = Math.max(x2 - valueLabelBounds.width, 0);
			valueLabelBounds.y = Math.min(y2 - valueLabelBounds.height, 0);

			valueLabel.css(
			{
				left: valueLabelBounds.x + "px",
				top: valueLabelBounds.y + Math.round((valueLabelBounds.height - valueLabel.outerHeight(true)) / 2) + "px",
				visibility: ((relativeValue > 0) && (relativeValue <= 1)) ? "" : "hidden"
			});

			// draw background

			graphics.clear();

			if (relativeValue > 0)
			{
				var backgroundBrush = this._backgroundBrush;
				backgroundBrush.beginBrush(graphics);
				DrawingUtils.drawRectangle(backgroundBrush, x1, y1, x2 - x1, y2 - y1);
				backgroundBrush.endBrush();
			}

			// draw line and fill

			var labelGraphics = this._labelGraphics;
			labelGraphics.clear();
			labelGraphics.setSize(width, height);

			if ((relativeValue > 0) && (relativeValue <= 1))
			{
				var lineBrush = this._lineBrush;
				lineBrush.set("color", this.getInternal("foregroundColor"));
				lineBrush.beginBrush(graphics);
				lineBrush.moveTo(x2, y1);
				lineBrush.lineTo(x2, y2);
				lineBrush.endBrush();

				var fillBrush = this._fillBrush;
				fillBrush.beginBrush(labelGraphics);
				DrawingUtils.drawRectangle(fillBrush, valueLabelBounds.x + 1, valueLabelBounds.y, valueLabelBounds.width - 1, valueLabelBounds.height);
				fillBrush.endBrush();
			}

			this._redrawLabelOpacity();
		};

		// Private Methods

		this._redrawLabelOpacity = function()
		{
			var opacity = this.getInternal(this.labelOpacity);
			$(this._labelContainer).css(
			{
				opacity: opacity + "",
				filter: "alpha(opacity=" + Math.round(opacity * 100) + ")",
				visibility: (opacity > 0) ? "" : "hidden"
			});
		};

	});

});
});

jg_import.define("splunk.charting.NumericAxisLabels", function()
{
jg_namespace("splunk.charting", function()
{

	var $ = jg_import("jQuery");
	var ChainedEvent = jg_import("jgatt.events.ChainedEvent");
	var EventData = jg_import("jgatt.events.EventData");
	var SolidStrokeBrush = jg_import("jgatt.graphics.brushes.SolidStrokeBrush");
	var ArrayProperty = jg_import("jgatt.properties.ArrayProperty");
	var ObservableProperty = jg_import("jgatt.properties.ObservableProperty");
	var Property = jg_import("jgatt.properties.Property");
	var StringUtils = jg_import("jgatt.utils.StringUtils");
	var ValidatePass = jg_import("jgatt.validation.ValidatePass");
	var Histogram = jg_import("splunk.charting.Histogram");
	var GraphicsVizBase = jg_import("splunk.viz.GraphicsVizBase");

	this.NumericAxisLabels = jg_extend(GraphicsVizBase, function(NumericAxisLabels, base)
	{

		// Public Passes

		this.updateLabelsPass = new ValidatePass("updateLabels", 0.3);

		// Public Events

		this.labelsChanged = new ChainedEvent("labelsChanged", this.changed);

		// Public Properties

		this.placement = new ObservableProperty("placement", String, "left")
			.writeFilter(function(value)
			{
				switch (value)
				{
					case "left":
					case "right":
						return value;
					default:
						return "left";
				}
			})
			.onChanged(function(e)
			{
				this.invalidate("renderGraphicsPass");
			});

		this.foregroundColor = new ObservableProperty("foregroundColor", Number, 0x000000)
			.writeFilter(function(value)
			{
				return !isNaN(value) ? Math.min(Math.max(Math.floor(value), 0x000000), 0xFFFFFF) : 0x000000;
			})
			.onChanged(function(e)
			{
				this.invalidate("renderGraphicsPass");
			});

		this.histogram = new ObservableProperty("histogram", Histogram, null)
			.onChanged(function(e)
			{
				var target = e.target;
				if ((target === this) || ((target instanceof Histogram) && (e.event === target.rangeYChanged)))
					this.invalidate("updateLabelsPass");
			});

		this.labelFormat = new ObservableProperty("labelFormat", Function, null)
			.onChanged(function(e)
			{
				this.invalidate("updateLabelsPass");
			});

		this.actualUnit = new Property("actualUnit", Number, null, true)
			.onRead(function()
			{
				this.validate("updateLabelsPass");
			})
			.getter(function()
			{
				return this._actualUnit;
			});

		this.positions = new ArrayProperty("positions", Number, null, true)
			.onRead(function()
			{
				this.validate("updateLabelsPass");
			})
			.getter(function()
			{
				var value = [];
				var labelInfos = this._labelInfos;
				var labelInfo;
				for (var i = 0, l = labelInfos.length; i < l; i++)
				{
					labelInfo = labelInfos[i];
					if (labelInfo.visible)
						value.push(labelInfo.relative);
				}
				return value;
			});

		// Private Properties

		this._actualUnit = 0;
		this._lineBrush = null;
		this._tickBrush = null;
		this._labelInfos = null;

		// Constructor

		this.constructor = function()
		{
			base.constructor.call(this);

			this.addStyleClass("splunk-charting-NumericAxisLabels");

			this._lineBrush = new SolidStrokeBrush(this.getInternal("foregroundColor"), 0.2, 1, "square");

			this._tickBrush = new SolidStrokeBrush(this.getInternal("foregroundColor"), 0.1, 1);

			this._labelInfos = [];
		};

		// Public Methods

		this.updateLabels = function()
		{
			this.validatePreceding("updateLabelsPass");

			if (this.isValid("updateLabelsPass"))
				return;

			this.invalidate("renderGraphicsPass");

			var element = this.element;
			var labelFormat = this.getInternal("labelFormat");
			var labelInfos = this._labelInfos;
			var numLabelInfos = labelInfos.length;
			var numNewLabelInfos = 0;
			var labelInfo;

			try
			{
				var maxMajorUnits = 50;

				// set default value for actualUnit
				this._actualUnit = 0;

				// get histogram and verify not null
				var histogram = this.getInternal("histogram");
				if (!histogram)
					return;

				// get minimum and maximum and verify not equal
				var minimum = histogram.get("actualMinimumY");
				var maximum = histogram.get("actualMaximumY");
				if (minimum == maximum)
					return;

				// scale minimum and maximum if required
				var scale = histogram.get("scaleY");
				var scaleMajorUnit = (scale != null);
				var minimumScaled = minimum;
				var maximumScaled = maximum;
				if (scaleMajorUnit)
				{
					minimum = scale.scaleToValue(minimum);
					maximum = scale.scaleToValue(maximum);
				}
				var rangeScaled = maximumScaled - minimumScaled;

				// compute majorUnit
				var majorUnit = this._computeAutoUnits(rangeScaled);

				// verify majorUnit is greater than zero
				if (majorUnit <= 0)
					return;

				// snap majorUnit to integer
				if (rangeScaled >= 1)
					majorUnit = Math.max(Math.round(majorUnit), 1);

				// scale majorUnit if numMajorUnits is greater than maxMajorUnits
				var numMajorUnits = 1 + Math.floor(rangeScaled / majorUnit);
				majorUnit *= Math.ceil(numMajorUnits / maxMajorUnits);

				// update actualUnit
				this._actualUnit = majorUnit;

				// snap minimum and maximum to majorUnit
				var minimumScaled2 = Math.ceil(minimumScaled / majorUnit) * majorUnit - majorUnit;
				var maximumScaled2 = Math.ceil(maximumScaled / majorUnit) * majorUnit;

				// compute label info
				var majorValue;
				var majorValue2;
				var majorRelative;
				for (majorValue = minimumScaled2; majorValue <= maximumScaled2; majorValue += majorUnit)
				{
					majorValue2 = scaleMajorUnit ? scale.scaleToValue(majorValue) : majorValue;
					majorRelative = (majorValue - minimumScaled) / rangeScaled;
					if ((majorRelative > 0) && (majorRelative <= 1))
					{
						if (numNewLabelInfos < numLabelInfos)
						{
							labelInfo = labelInfos[numNewLabelInfos];
						}
						else
						{
							labelInfo = {};
							labelInfo.label = document.createElement("span");
							labelInfo.queryLabel = $(labelInfo.label);
							labelInfo.queryLabel.addClass("splunk-charting-label");
							labelInfo.queryLabel.css({ position: "absolute", left: "0px", top: "0px", "white-space": "pre" });
							labelInfos.push(labelInfo);
							element.appendChild(labelInfo.label);
						}

						labelInfo.relative = majorRelative;

						if (labelFormat)
							labelInfo.queryLabel.html(StringUtils.escapeHTML(labelFormat(majorValue2)));
						else
							labelInfo.queryLabel.html(StringUtils.escapeHTML(majorValue2));

						numNewLabelInfos++;
					}
				}
			}
			finally
			{
				// remove labels
				for (var i = labelInfos.length - 1; i >= numNewLabelInfos; i--)
				{
					labelInfo = labelInfos.pop();
					element = labelInfo.label.parentNode;
					if (element)
						element.removeChild(labelInfo.label);
				}

				this.setValid("updateLabelsPass");
			}
		};

		// Protected Methods

		this.renderGraphicsOverride = function(graphics, width, height)
		{
			var isPlacementLeft = (this.getInternal("placement") != "right");
			var lineBrush = this._lineBrush;
			var tickBrush = this._tickBrush;
			var labelInfos = this._labelInfos;
			var numLabelInfos = labelInfos.length;
			var labelInfo;
			var labelInfo2;
			var labelWidth = 0;
			var tickWidth = 25;
			var numOverlaps = 0;
			var i;
			var j;

			// measure labels and prepare for rendering
			for (i = 0; i < numLabelInfos; i++)
			{
				labelInfo = labelInfos[i];

				labelInfo.y = Math.round(height * (1 - labelInfo.relative));
				labelInfo.width = Math.round(labelInfo.queryLabel.outerWidth(true));
				labelInfo.height = Math.round(labelInfo.queryLabel.outerHeight(true));
				labelInfo.visible = true;

				labelWidth = Math.max(labelWidth, labelInfo.width);
			}
			width = Math.max(labelWidth, tickWidth);
			this.setInternal("width", width);
			for (i = 0; i < numLabelInfos; i++)
			{
				labelInfo = labelInfos[i];
				labelInfo.x = isPlacementLeft ? (width - labelInfo.width) : 0;
			}

			// compute numOverlaps
			for (i = numLabelInfos - 1; i >= 0; i--)
			{
				labelInfo = labelInfos[i];
				for (j = i - 1; j >= 0; j--)
				{
					labelInfo2 = labelInfos[j];
					if (labelInfo2.y >= (labelInfo.y + labelInfo.height))
						break;
					numOverlaps = Math.max(numOverlaps, i - j);
				}
			}

			// mark overlapping labels as not visible
			if (numOverlaps > 0)
			{
				numOverlaps++;
				for (i = 0; i < numLabelInfos; i++)
				{
					if (((numLabelInfos - i - 1) % numOverlaps) != 0)
						labelInfos[i].visible = false;
				}
			}

			// mark labels that fall outside render bounds as not visible
			for (i = 0; i < numLabelInfos; i++)
			{
				labelInfo = labelInfos[i];
				if ((labelInfo.y + labelInfo.height) <= height)
					break;
				labelInfo.visible = false;
			}

			// layout labels and render ticks
			graphics.clear();
			graphics.setSize(width + (isPlacementLeft ? 1 : 0), height + 1);  // set graphics size according to computed width plus padding for axis lines
			tickBrush.set("color", this.getInternal("foregroundColor"));
			for (i = 0; i < numLabelInfos; i++)
			{
				labelInfo = labelInfos[i];
				labelInfo.queryLabel.css(
				{
					left: labelInfo.x + "px",
					top: labelInfo.y + "px",
					visibility: labelInfo.visible ? "" : "hidden"
				});

				if (labelInfo.visible)
				{
					tickBrush.beginBrush(graphics);
					if (isPlacementLeft)
					{
						tickBrush.moveTo(width, labelInfo.y);
						tickBrush.lineTo(width - tickWidth, labelInfo.y);
					}
					else
					{
						tickBrush.moveTo(0, labelInfo.y);
						tickBrush.lineTo(tickWidth, labelInfo.y);
					}
					tickBrush.endBrush();
				}
			}
			lineBrush.set("color", this.getInternal("foregroundColor"));
			lineBrush.beginBrush(graphics);
			if (isPlacementLeft)
			{
				lineBrush.moveTo(width, 0);
				lineBrush.lineTo(width, Math.round(height));
			}
			else
			{
				lineBrush.moveTo(0, 0);
				lineBrush.lineTo(0, Math.round(height));
			}
			lineBrush.endBrush();

			this.dispatchEvent("labelsChanged", new EventData());
		};

		// Private Methods

		this._computeAutoUnits = function(range)
		{
			if (range <= 0)
				return 0;

			var significand = range / 10;
			var exponent = 0;

			if (significand > 0)
			{
				var str = significand.toExponential(20);
				var eIndex = str.indexOf("e");
				if (eIndex >= 0)
				{
					significand = Number(str.substring(0, eIndex));
					exponent = Number(str.substring(eIndex + 1, str.length));
				}
			}

			significand = Math.ceil(significand);

			if (significand > 5)
				significand = 10;
			else if (significand > 2)
				significand = 5;

			return significand * Math.pow(10, exponent);
		};

	});

});
});

jg_import.define("splunk.charting.GridLines", function()
{
jg_namespace("splunk.charting", function()
{

	var SolidStrokeBrush = jg_import("jgatt.graphics.brushes.SolidStrokeBrush");
	var ObservableProperty = jg_import("jgatt.properties.ObservableProperty");
	var NumericAxisLabels = jg_import("splunk.charting.NumericAxisLabels");
	var GraphicsVizBase = jg_import("splunk.viz.GraphicsVizBase");

	this.GridLines = jg_extend(GraphicsVizBase, function(GridLines, base)
	{

		// Public Properties

		this.foregroundColor = new ObservableProperty("foregroundColor", Number, 0x000000)
			.writeFilter(function(value)
			{
				return !isNaN(value) ? Math.min(Math.max(Math.floor(value), 0x000000), 0xFFFFFF) : 0x000000;
			})
			.onChanged(function(e)
			{
				this.invalidate("renderGraphicsPass");
			});

		this.axisLabels = new ObservableProperty("axisLabels", NumericAxisLabels, null)
			.onChanged(function(e)
			{
				var target = e.target;
				if ((target === this) || ((target instanceof NumericAxisLabels) && (e.event === target.labelsChanged)))
					this.invalidate("renderGraphicsPass");
			});

		// Private Properties

		this._lineBrush = null;

		// Constructor

		this.constructor = function()
		{
			base.constructor.call(this);

			this.addStyleClass("splunk-charting-GridLines");

			this._lineBrush = new SolidStrokeBrush(this.getInternal("foregroundColor"), 0.1, 1);
		};

		// Protected Methods

		this.renderGraphicsOverride = function(graphics, width, height)
		{
			graphics.clear();

			var axisLabels = this.getInternal("axisLabels");
			if (!axisLabels)
				return;

			var lineBrush = this._lineBrush;
			lineBrush.set("color", this.getInternal("foregroundColor"));

			var positions = axisLabels.get("positions");
			var numPositions = positions.length;
			var position;
			var y;
			for (var i = 0; i < numPositions; i++)
			{
				position = positions[i];
				y = Math.round(height * (1 - position));
				lineBrush.beginBrush(graphics);
				lineBrush.moveTo(0, y);
				lineBrush.lineTo(width, y);
				lineBrush.endBrush();
			}
		};

	});

});
});

jg_import.define("splunk.charting.TimeAxisLabels", function()
{
jg_namespace("splunk.charting", function()
{

	var $ = jg_import("jQuery");
	var ChainedEvent = jg_import("jgatt.events.ChainedEvent");
	var EventData = jg_import("jgatt.events.EventData");
	var SolidStrokeBrush = jg_import("jgatt.graphics.brushes.SolidStrokeBrush");
	var ArrayProperty = jg_import("jgatt.properties.ArrayProperty");
	var ObservableProperty = jg_import("jgatt.properties.ObservableProperty");
	var Property = jg_import("jgatt.properties.Property");
	var StringUtils = jg_import("jgatt.utils.StringUtils");
	var ValidatePass = jg_import("jgatt.validation.ValidatePass");
	var Histogram = jg_import("splunk.charting.Histogram");
	var DateTime = jg_import("splunk.time.DateTime");
	var Duration = jg_import("splunk.time.Duration");
	var TimeUtils = jg_import("splunk.time.TimeUtils");
	var TimeZone = jg_import("splunk.time.TimeZone");
	var TimeZones = jg_import("splunk.time.TimeZones");
	var GraphicsVizBase = jg_import("splunk.viz.GraphicsVizBase");

	this.TimeAxisLabels = jg_extend(GraphicsVizBase, function(TimeAxisLabels, base)
	{

		// Public Passes

		this.updateLabelsPass = new ValidatePass("updateLabels", 0.3);

		// Public Events

		this.labelsChanged = new ChainedEvent("labelsChanged", this.changed);

		// Public Properties

		this.foregroundColor = new ObservableProperty("foregroundColor", Number, 0x000000)
			.writeFilter(function(value)
			{
				return !isNaN(value) ? Math.min(Math.max(Math.floor(value), 0x000000), 0xFFFFFF) : 0x000000;
			})
			.onChanged(function(e)
			{
				this.invalidate("renderGraphicsPass");
			});

		this.histogram = new ObservableProperty("histogram", Histogram, null)
			.onChanged(function(e)
			{
				var target = e.target;
				if ((target === this) || ((target instanceof Histogram) && (e.event === target.rangeXChanged)))
					this.invalidate("updateLabelsPass");
			});

		this.timeZone = new ObservableProperty("timeZone", TimeZone, TimeZones.LOCAL)
			.onChanged(function(e)
			{
				this.invalidate("updateLabelsPass");
			});

		this.labelFormat = new ObservableProperty("labelFormat", Function, null)
			.onChanged(function(e)
			{
				this.invalidate("updateLabelsPass");
			});

		this.actualUnit = new Property("actualUnit", Duration, null, true)
			.onRead(function()
			{
				this.validate("updateLabelsPass");
			})
			.getter(function()
			{
				return this._actualUnit.clone();
			});

		this.positions = new ArrayProperty("positions", Number, null, true)
			.onRead(function()
			{
				this.validate("updateLabelsPass");
			})
			.getter(function()
			{
				var value = [];
				var labelInfos = this._labelInfos;
				var labelInfo;
				for (var i = 0, l = labelInfos.length; i < l; i++)
				{
					labelInfo = labelInfos[i];
					if (labelInfo.visible)
						value.push(labelInfo.relative);
				}
				return value;
			});

		// Private Properties

		this._actualUnit = null;
		this._lineBrush = null;
		this._labelInfos = null;

		// Constructor

		this.constructor = function()
		{
			base.constructor.call(this);

			this.addStyleClass("splunk-charting-TimeAxisLabels");

			this._actualUnit = new Duration();

			this._lineBrush = new SolidStrokeBrush(this.getInternal("foregroundColor"), 0.2, 1, "square");

			this._labelInfos = [];
		};

		// Public Methods

		this.updateLabels = function()
		{
			this.validatePreceding("updateLabelsPass");

			if (this.isValid("updateLabelsPass"))
				return;

			this.invalidate("renderGraphicsPass");

			var element = this.element;
			var labelFormat = this.getInternal("labelFormat");
			var labelInfos = this._labelInfos;
			var numLabelInfos = labelInfos.length;
			var numNewLabelInfos = 0;
			var labelInfo;

			try
			{
				var maxMajorUnits = 50;

				// set default value for actualUnit
				this._actualUnit = new Duration();

				// get histogram and verify not null
				var histogram = this.getInternal("histogram");
				if (!histogram)
					return;

				// get minimum and maximum and verify not equal
				var minimum = histogram.get("actualMinimumX");
				var maximum = histogram.get("actualMaximumX");
				var range = maximum - minimum;
				if (range == 0)
					return;

				// adjust minimum and maximum for timeZone
				var timeZone = this.getInternal("timeZone");
				var minimumTime = new DateTime(minimum);
				var maximumTime = new DateTime(maximum);
				minimumTime = minimumTime.toTimeZone(timeZone);
				maximumTime = maximumTime.toTimeZone(timeZone);

				// compute majorUnit
				var majorUnit = this._computeAutoUnits(TimeUtils.subtractDates(maximumTime, minimumTime));

				// compute majorUnit time and verify greater than zero
				var majorUnitTime = TimeUtils.durationToSeconds(majorUnit, minimumTime);
				if (majorUnitTime <= 0)
					return;

				// scale majorUnit if numMajorUnits is greater than maxMajorUnits
				var numMajorUnits = 1 + Math.floor((maximum - minimum) / majorUnitTime);
				majorUnit = TimeUtils.multiplyDuration(majorUnit, Math.ceil(numMajorUnits / maxMajorUnits));

				// update actualUnit
				this._actualUnit = majorUnit;

				// snap minimum and maximum to majorUnit
				minimumTime = TimeUtils.subtractDateDuration(TimeUtils.ceilDate(minimumTime, majorUnit), majorUnit);
				maximumTime = TimeUtils.ceilDate(maximumTime, majorUnit);

				// compute label info
				var majorValue;
				var majorRelative;
				var majorUnitNum = 1;
				for (majorValue = minimumTime; majorValue.getTime() <= maximumTime.getTime(); majorUnitNum++)
				{
					majorRelative = (majorValue.getTime() - minimum) / range;
					if ((majorRelative >= 0) && (majorRelative < 1))
					{
						if (numNewLabelInfos < numLabelInfos)
						{
							labelInfo = labelInfos[numNewLabelInfos];
						}
						else
						{
							labelInfo = {};
							labelInfo.label = document.createElement("span");
							labelInfo.queryLabel = $(labelInfo.label);
							labelInfo.queryLabel.addClass("splunk-charting-label");
							labelInfo.queryLabel.css({ position: "absolute", left: "0px", top: "0px", "white-space": "pre" });
							labelInfos.push(labelInfo);
							element.appendChild(labelInfo.label);
						}

						labelInfo.relative = majorRelative;

						if (labelFormat)
							labelInfo.queryLabel.html(StringUtils.escapeHTML(labelFormat(majorValue)));
						else
							labelInfo.queryLabel.html(StringUtils.escapeHTML(majorValue));

						numNewLabelInfos++;
					}
					majorValue = TimeUtils.addDateDuration(minimumTime, TimeUtils.multiplyDuration(majorUnit, majorUnitNum));
				}
			}
			finally
			{
				// remove labels
				for (var i = labelInfos.length - 1; i >= numNewLabelInfos; i--)
				{
					labelInfo = labelInfos.pop();
					element = labelInfo.label.parentNode;
					if (element)
						element.removeChild(labelInfo.label);
				}

				this.setValid("updateLabelsPass");
			}
		};

		// Protected Methods

		this.renderGraphicsOverride = function(graphics, width, height)
		{
			var lineBrush = this._lineBrush;
			var labelInfos = this._labelInfos;
			var numLabelInfos = labelInfos.length;
			var labelInfo;
			var labelInfo2;
			var labelHeight = 0;
			var tickHeight = 25;
			var numOverlaps = 0;
			var i;
			var j;

			// measure labels and prepare for rendering
			for (i = 0; i < numLabelInfos; i++)
			{
				labelInfo = labelInfos[i];

				labelInfo.x = Math.round(width * labelInfo.relative);
				labelInfo.y = 0;
				labelInfo.width = Math.round(labelInfo.queryLabel.outerWidth(true));
				labelInfo.height = Math.round(labelInfo.queryLabel.outerHeight(true));
				labelInfo.visible = true;

				labelHeight = Math.max(labelHeight, labelInfo.height);
			}
			height = Math.max(labelHeight, tickHeight);
			this.setInternal("height", height);

			// compute numOverlaps
			for (i = 0; i < numLabelInfos; i++)
			{
				labelInfo = labelInfos[i];
				for (j = i + 1; j < numLabelInfos; j++)
				{
					labelInfo2 = labelInfos[j];
					if (labelInfo2.x >= (labelInfo.x + labelInfo.width))
						break;
					numOverlaps = Math.max(numOverlaps, j - i);
				}
			}

			// mark overlapping labels as not visible
			if (numOverlaps > 0)
			{
				numOverlaps++;
				for (i = 0; i < numLabelInfos; i++)
				{
					if ((i % numOverlaps) != 0)
						labelInfos[i].visible = false;
				}
			}

			// mark labels that fall outside render bounds as not visible
			for (i = numLabelInfos - 1; i >= 0; i--)
			{
				labelInfo = labelInfos[i];
				if ((labelInfo.x + labelInfo.width) <= width)
					break;
				labelInfo.visible = false;
			}

			// layout labels and render ticks
			graphics.clear();
			graphics.setSize(width + 1, height);  // set graphics size according to computed height plus padding for axis lines
			lineBrush.set("color", this.getInternal("foregroundColor"));
			for (i = 0; i < numLabelInfos; i++)
			{
				labelInfo = labelInfos[i];
				labelInfo.queryLabel.css(
				{
					left: labelInfo.x + "px",
					top: labelInfo.y + "px",
					visibility: labelInfo.visible ? "" : "hidden"
				});

				if (labelInfo.visible)
				{
					lineBrush.beginBrush(graphics);
					lineBrush.moveTo(labelInfo.x, 0);
					lineBrush.lineTo(labelInfo.x, tickHeight);
					lineBrush.endBrush();
				}
			}
			lineBrush.beginBrush(graphics);
			lineBrush.moveTo(0, 0);
			lineBrush.lineTo(Math.round(width), 0);
			lineBrush.endBrush();

			this.dispatchEvent("labelsChanged", new EventData());
		};

		// Private Methods

		this._computeAutoUnits = function(range)
		{
			if (TimeUtils.durationToSeconds(range) <= 0)
				return new Duration();

			var date = new DateTime(range.years, range.months + 1, range.days + 1, range.hours, range.minutes, range.seconds, TimeZones.UTC);

			range = new Duration(date.getYear(), date.getMonth() - 1, date.getDay() - 1, date.getHours(), date.getMinutes(), date.getSeconds());

			var diff;
			var significand;
			var exponent;
			var str;
			var eIndex;

			diff = range.years;
			if (diff > 2)
			{
				significand = diff / 10;
				exponent = 0;

				if (significand > 0)
				{
					str = significand.toExponential(20);
					eIndex = str.indexOf("e");
					if (eIndex >= 0)
					{
						significand = Number(str.substring(0, eIndex));
						exponent = Number(str.substring(eIndex + 1, str.length));
					}
				}

				significand = Math.ceil(significand);

				if (significand > 5)
					significand = 10;
				else if (significand > 2)
					significand = 5;

				return new Duration(Math.ceil(significand * Math.pow(10, exponent)));
			}

			diff = range.months + diff * 12;
			if (diff > 2)
			{
				if (diff > 18)
					return new Duration(0, 4);
				else if (diff > 12)
					return new Duration(0, 3);
				else if (diff > 6)
					return new Duration(0, 2);
				else
					return new Duration(0, 1);
			}

			diff = range.days + diff * 30;
			if (diff > 2)
			{
				if (diff > 49)
					return new Duration(0, 0, 14);
				else if (diff > 28)
					return new Duration(0, 0, 7);
				else if (diff > 14)
					return new Duration(0, 0, 4);
				else if (diff > 7)
					return new Duration(0, 0, 2);
				else
					return new Duration(0, 0, 1);
			}

			diff = range.hours + diff * 24;
			if (diff > 2)
			{
				if (diff > 36)
					return new Duration(0, 0, 0, 12);
				else if (diff > 24)
					return new Duration(0, 0, 0, 6);
				else if (diff > 12)
					return new Duration(0, 0, 0, 4);
				else if (diff > 6)
					return new Duration(0, 0, 0, 2);
				else
					return new Duration(0, 0, 0, 1);
			}

			diff = range.minutes + diff * 60;
			if (diff > 2)
			{
				if (diff > 105)
					return new Duration(0, 0, 0, 0, 30);
				else if (diff > 70)
					return new Duration(0, 0, 0, 0, 15);
				else if (diff > 35)
					return new Duration(0, 0, 0, 0, 10);
				else if (diff > 14)
					return new Duration(0, 0, 0, 0, 5);
				else if (diff > 7)
					return new Duration(0, 0, 0, 0, 2);
				else
					return new Duration(0, 0, 0, 0, 1);
			}

			diff = range.seconds + diff * 60;
			if (diff > 2)
			{
				if (diff > 105)
					return new Duration(0, 0, 0, 0, 0, 30);
				else if (diff > 70)
					return new Duration(0, 0, 0, 0, 0, 15);
				else if (diff > 35)
					return new Duration(0, 0, 0, 0, 0, 10);
				else if (diff > 14)
					return new Duration(0, 0, 0, 0, 0, 5);
				else if (diff > 7)
					return new Duration(0, 0, 0, 0, 0, 2);
				else
					return new Duration(0, 0, 0, 0, 0, 1);
			}

			significand = diff / 10;
			exponent = 0;

			if (significand > 0)
			{
				str = significand.toExponential(20);
				eIndex = str.indexOf("e");
				if (eIndex >= 0)
				{
					significand = Number(str.substring(0, eIndex));
					exponent = Number(str.substring(eIndex + 1, str.length));
				}
			}

			significand = Math.ceil(significand);

			if (significand > 5)
				significand = 10;
			else if (significand > 2)
				significand = 5;

			return new Duration(0, 0, 0, 0, 0, significand * Math.pow(10, exponent));
		};

	});

});
});

jg_import.define("splunk.charting.Tooltip", function()
{
jg_namespace("splunk.charting", function()
{

	var $ = jg_import("jQuery");
	var Matrix = jg_import("jgatt.geom.Matrix");
	var Point = jg_import("jgatt.geom.Point");
	var Rectangle = jg_import("jgatt.geom.Rectangle");
	var SolidFillBrush = jg_import("jgatt.graphics.brushes.SolidFillBrush");
	var ObservableProperty = jg_import("jgatt.properties.ObservableProperty");
	var NumberUtils = jg_import("jgatt.utils.NumberUtils");
	var StringUtils = jg_import("jgatt.utils.StringUtils");
	var GraphicsVizBase = jg_import("splunk.viz.GraphicsVizBase");

	this.Tooltip = jg_extend(GraphicsVizBase, function(Tooltip, base)
	{

		// Public Properties

		this.value = new ObservableProperty("value", String, null)
			.onChanged(function(e)
			{
				this.invalidate("renderGraphicsPass");
			});

		this.viewBounds = new ObservableProperty("viewBounds", Rectangle, new Rectangle())
			.readFilter(function(value)
			{
				return value.clone();
			})
			.writeFilter(function(value)
			{
				if (value)
				{
					value = value.clone();
					if (value.width < 0)
					{
						value.x += value.width;
						value.width = -value.width;
					}
					if (value.height < 0)
					{
						value.y += value.height;
						value.height = -value.height;
					}
				}
				else
				{
					value = new Rectangle();
				}
				return value;
			})
			.changedComparator(function(oldValue, newValue)
			{
				return !oldValue.equals(newValue);
			})
			.onChanged(function(e)
			{
				this.invalidate("renderGraphicsPass");
			});

		this.targetBounds = new ObservableProperty("targetBounds", Rectangle, new Rectangle())
			.readFilter(function(value)
			{
				return value.clone();
			})
			.writeFilter(function(value)
			{
				if (value)
				{
					value = value.clone();
					if (value.width < 0)
					{
						value.x += value.width;
						value.width = -value.width;
					}
					if (value.height < 0)
					{
						value.y += value.height;
						value.height = -value.height;
					}
				}
				else
				{
					value = new Rectangle();
				}
				return value;
			})
			.changedComparator(function(oldValue, newValue)
			{
				return !oldValue.equals(newValue);
			})
			.onChanged(function(e)
			{
				this.invalidate("renderGraphicsPass");
			});

		// Private Properties

		this._backgroundBrush = null;
		this._valueLabel = null;
		this._isShowing = true;

		// Constructor

		this.constructor = function()
		{
			base.constructor.call(this);

			this.addStyleClass("splunk-charting-Tooltip");

			this._backgroundBrush = new SolidFillBrush(0x444444, 1);

			this._valueLabel = document.createElement("span");
			$(this._valueLabel).addClass("splunk-charting-label");
			$(this._valueLabel).css({ position: "absolute", left: "0px", top: "0px", "white-space": "pre" });

			this.element.appendChild(this._valueLabel);

			this.hide();
		};

		// Public Methods

		this.show = function()
		{
			if (this._isShowing)
				return;

			this._isShowing = true;

			this.validate("renderGraphicsPass");

			this.setStyle({ visibility: "" });
		};

		this.hide = function()
		{
			if (!this._isShowing)
				return;

			this._isShowing = false;

			this.setStyle({ visibility: "hidden" });
		};

		// Protected Methods

		this.renderGraphicsOverride = function(graphics, width, height)
		{
			var valueLabel = $(this._valueLabel);
			var value = this.getInternal("value");
			if (!value)
				valueLabel.html("");
			else
				valueLabel.html(StringUtils.escapeHTML(value));

			var contentWidth = valueLabel.outerWidth(true);
			var contentHeight = valueLabel.outerHeight(true);

			var pointerLength = 7;
			var pointerThickness = 14 / 2;

			var viewBounds = this.getInternal("viewBounds");
			var viewWidth = viewBounds.width;
			var viewHeight = viewBounds.height;
			var viewLeft = viewBounds.x;
			var viewRight = viewLeft + viewWidth;
			var viewTop = viewBounds.y;
			var viewBottom = viewTop + viewHeight;

			var targetBounds = this.getInternal("targetBounds");
			var targetWidth = targetBounds.width;
			var targetHeight = targetBounds.height;
			var targetLeft = targetBounds.x;
			var targetRight = targetLeft + targetWidth;
			var targetTop = targetBounds.y;
			var targetBottom = targetTop + targetHeight;

			var marginLeft = 10;
			var marginRight = 10;
			var marginTop = 10;
			var marginBottom = 10;
			var marginX = marginLeft + marginRight;
			var marginY = marginTop + marginBottom;
			var marginScaleX = (marginX > 0) ? NumberUtils.minMax((viewWidth - contentWidth) / marginX, 0, 1) : 0;
			var marginScaleY = (marginY > 0) ? NumberUtils.minMax((viewHeight - contentHeight) / marginY, 0, 1) : 0;

			var alignmentX = 0.5;
			var alignmentY = 0.5;

			// determine placement

			var placement;
			if (((targetLeft + targetRight) / 2) > ((viewLeft + viewRight) / 2))
				placement = "left";
			else
				placement = "right";

			// compute targetPosition (in global coordinates) and pointerPosition (in local coordinates)

			var targetPosition;
			var pointerPosition;
			if (placement == "left")
			{
				marginTop *= marginScaleY;
				marginBottom *= marginScaleY;
				targetPosition = new Point(targetLeft, targetTop * (1 - alignmentY) + targetBottom * alignmentY);
				targetPosition.x = NumberUtils.minMax(targetPosition.x, viewLeft + marginLeft + contentWidth + pointerLength, targetRight);
				targetPosition.x = NumberUtils.minMax(targetPosition.x, viewLeft + contentWidth + pointerLength, viewRight);
				targetPosition.y = NumberUtils.maxMin(targetPosition.y, viewBottom, viewTop);
				pointerPosition = new Point(contentWidth + pointerLength, contentHeight * alignmentY);
				pointerPosition.y = NumberUtils.minMax(pointerPosition.y, contentHeight - Math.max(viewBottom - marginBottom - targetPosition.y, 0), Math.max(targetPosition.y - viewTop - marginTop, 0));
			}
			else
			{
				marginTop *= marginScaleY;
				marginBottom *= marginScaleY;
				targetPosition = new Point(targetRight, targetTop * (1 - alignmentY) + targetBottom * alignmentY);
				targetPosition.x = NumberUtils.maxMin(targetPosition.x, viewRight - marginRight - contentWidth - pointerLength, targetLeft);
				targetPosition.x = NumberUtils.maxMin(targetPosition.x, viewRight - contentWidth - pointerLength, viewLeft);
				targetPosition.y = NumberUtils.maxMin(targetPosition.y, viewBottom, viewTop);
				pointerPosition = new Point(0, contentHeight * alignmentY);
				pointerPosition.y = NumberUtils.minMax(pointerPosition.y, contentHeight - Math.max(viewBottom - marginBottom - targetPosition.y, 0), Math.max(targetPosition.y - viewTop - marginTop, 0));
			}

			// snap positions to pixels

			targetPosition.x = Math.round(targetPosition.x);
			targetPosition.y = Math.round(targetPosition.y);
			pointerPosition.x = Math.round(pointerPosition.x);
			pointerPosition.y = Math.round(pointerPosition.y);

			// convert targetPosition to local coordinates and offset this position

			targetPosition = this.globalToLocal(targetPosition);
			this.set("x", this.get("x") + (targetPosition.x - pointerPosition.x));
			this.set("y", this.get("y") + (targetPosition.y - pointerPosition.y));

			// render

			graphics.clear();
			graphics.setSize(contentWidth + pointerLength, contentHeight);

			var backgroundBrush = this._backgroundBrush;
			var p1;
			var p2;
			var p3;
			var p4;

			if (placement == "left")
			{
				p1 = new Point(0, 0);
				p2 = new Point(contentWidth, 0);
				p3 = new Point(contentWidth, contentHeight);
				p4 = new Point(0, contentHeight);

				backgroundBrush.beginBrush(graphics, null, [ p1, p2, p3, p4 ]);
				backgroundBrush.moveTo(p1.x, p1.y);
				backgroundBrush.lineTo(p2.x, p2.y);
				backgroundBrush.lineTo(p2.x, NumberUtils.maxMin(pointerPosition.y - pointerThickness, p3.y - pointerThickness, p2.y));
				backgroundBrush.lineTo(pointerPosition.x, pointerPosition.y);
				backgroundBrush.lineTo(p2.x, NumberUtils.minMax(pointerPosition.y + pointerThickness, p2.y + pointerThickness, p3.y));
				backgroundBrush.lineTo(p3.x, p3.y);
				backgroundBrush.lineTo(p4.x, p4.y);
				backgroundBrush.lineTo(p1.x, p1.y);
				backgroundBrush.endBrush();
			}
			else
			{
				p1 = new Point(pointerLength, 0);
				p2 = new Point(pointerLength + contentWidth, 0);
				p3 = new Point(pointerLength + contentWidth, contentHeight);
				p4 = new Point(pointerLength, contentHeight);

				backgroundBrush.beginBrush(graphics, null, [ p1, p2, p3, p4 ]);
				backgroundBrush.moveTo(p1.x, p1.y);
				backgroundBrush.lineTo(p2.x, p2.y);
				backgroundBrush.lineTo(p3.x, p3.y);
				backgroundBrush.lineTo(p4.x, p4.y);
				backgroundBrush.lineTo(p4.x, NumberUtils.minMax(pointerPosition.y + pointerThickness, p1.y + pointerThickness, p4.y));
				backgroundBrush.lineTo(pointerPosition.x, pointerPosition.y);
				backgroundBrush.lineTo(p4.x, NumberUtils.maxMin(pointerPosition.y - pointerThickness, p4.y - pointerThickness, p1.y));
				backgroundBrush.lineTo(p1.x, p1.y);
				backgroundBrush.endBrush();
			}

			// set valueLabel position

			valueLabel.css({ left: p1.x + "px" });
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

jg_import.define("splunk.charting.Timeline", function()
{
jg_namespace("splunk.charting", function()
{

	var $ = jg_import("jQuery");
	var ChainedEvent = jg_import("jgatt.events.ChainedEvent");
	var Event = jg_import("jgatt.events.Event");
	var Matrix = jg_import("jgatt.geom.Matrix");
	var Point = jg_import("jgatt.geom.Point");
	var Rectangle = jg_import("jgatt.geom.Rectangle");
	var ColorUtils = jg_import("jgatt.graphics.ColorUtils");
	var GroupBrush = jg_import("jgatt.graphics.brushes.GroupBrush");
	var SolidFillBrush = jg_import("jgatt.graphics.brushes.SolidFillBrush");
	var SolidStrokeBrush = jg_import("jgatt.graphics.brushes.SolidStrokeBrush");
	var GroupTween = jg_import("jgatt.motion.GroupTween");
	var PropertyTween = jg_import("jgatt.motion.PropertyTween");
	var TweenRunner = jg_import("jgatt.motion.TweenRunner");
	var CubicEaser = jg_import("jgatt.motion.easers.CubicEaser");
	var EaseDirection = jg_import("jgatt.motion.easers.EaseDirection");
	var Property = jg_import("jgatt.properties.Property");
	var FunctionUtils = jg_import("jgatt.utils.FunctionUtils");
	var NumberUtils = jg_import("jgatt.utils.NumberUtils");
	var ValidatePass = jg_import("jgatt.validation.ValidatePass");
	var BorderStrokeBrush = jg_import("splunk.brushes.BorderStrokeBrush");
	var ClickDragRangeMarker = jg_import("splunk.charting.ClickDragRangeMarker");
	var CursorMarker = jg_import("splunk.charting.CursorMarker");
	var GridLines = jg_import("splunk.charting.GridLines");
	var Histogram = jg_import("splunk.charting.Histogram");
	var LogScale = jg_import("splunk.charting.LogScale");
	var NumericAxisLabels = jg_import("splunk.charting.NumericAxisLabels");
	var TimeAxisLabels = jg_import("splunk.charting.TimeAxisLabels");
	var Tooltip = jg_import("splunk.charting.Tooltip");
	var GenericEventData = jg_import("splunk.events.GenericEventData");
	var DateTime = jg_import("splunk.time.DateTime");
	var SimpleTimeZone = jg_import("splunk.time.SimpleTimeZone");
	var SplunkTimeZone = jg_import("splunk.time.SplunkTimeZone");
	var TimeUtils = jg_import("splunk.time.TimeUtils");
	var TimeZones = jg_import("splunk.time.TimeZones");
	var GraphicsVizBase = jg_import("splunk.viz.GraphicsVizBase");

	this.Timeline = jg_extend(GraphicsVizBase, function(Timeline, base)
	{

		// Public Passes

		this.dispatchUpdatedPass = new ValidatePass("dispatchUpdated", 3);

		// Public Events

		this.updated = new Event("updated", GenericEventData);
		this.viewChanged = new ChainedEvent("viewChanged", this.changed);
		this.selectionChanged = new ChainedEvent("selectionChanged", this.changed);
		this.chartDoubleClicked = new Event("chartDoubleClicked", GenericEventData);

		// Public Properties

		this.timeZone = new Property("timeZone", String, null)
			.setter(function(value)
			{
				this._timeZone = value ? new SplunkTimeZone(value) : TimeZones.LOCAL;
				this._axisLabelsX.set("timeZone", this._timeZone);
				this._rangeMarker.invalidate("updateRangePass");
				this._cursorMarker.invalidate("renderGraphicsPass");
			});

		this.jobID = new Property("jobID", String)
			.getter(function()
			{
				return this._jobID;
			})
			.setter(function(value)
			{
				this._jobID = value;
			});

		this.bucketCount = new Property("bucketCount", Number)
			.getter(function()
			{
				return this._bucketCount;
			})
			.setter(function(value)
			{
				this._bucketCount = value;
			});

		this.viewMinimum = new Property("viewMinimum", Number, null, true)
			.getter(function()
			{
				return this._viewMinimum;
			});

		this.viewMaximum = new Property("viewMaximum", Number, null, true)
			.getter(function()
			{
				return this._viewMaximum;
			});

		this.selectionMinimum = new Property("selectionMinimum", Number)
			.getter(function()
			{
				return this._selectionMinimum;
			})
			.setter(function(value)
			{
				if (this._rangeMarker.isDragging())
					return;

				this._rangeMarker.set("minimum", value);
				this._updateSelectionRange(false);
			});

		this.selectionMaximum = new Property("selectionMaximum", Number)
			.getter(function()
			{
				return this._selectionMaximum;
			})
			.setter(function(value)
			{
				if (this._rangeMarker.isDragging())
					return;

				this._rangeMarker.set("maximum", value);
				this._updateSelectionRange(false);
			});

		this.actualSelectionMinimum = new Property("actualSelectionMinimum", Number, null, true)
			.getter(function()
			{
				return this._actualSelectionMinimum;
			});

		this.actualSelectionMaximum = new Property("actualSelectionMaximum", Number, null, true)
			.getter(function()
			{
				return this._actualSelectionMaximum;
			});

		this.timelineData = new Property("timelineData", Object, null, true)
			.getter(function()
			{
				return this._cloneTimelineData(this._timelineData);
			});

		this.timelineScale = new Property("timelineScale", Object, null, true)
			.getter(function()
			{
				var timelineData = this._timelineData;
				if (!timelineData)
					return null;

				var buckets = timelineData.buckets;
				if (buckets.length == 0)
					return null;

				var bucket = buckets[0];
				var duration = TimeUtils.subtractDates(bucket.latestTime, bucket.earliestTime);
				if (duration.years > 0)
					return { value:duration.years, unit:"year" };
				if (duration.months > 0)
					return { value:duration.months, unit:"month" };
				if (duration.days > 0)
					return { value:duration.days, unit:"day" };
				if (duration.hours > 0)
					return { value:duration.hours, unit:"hour" };
				if (duration.minutes > 0)
					return { value:duration.minutes, unit:"minute" };
				if (duration.seconds > 0)
					return { value:duration.seconds, unit:"second" };
				return null;
			});

		this.enableChartClick = new Property("enableChartClick", Boolean)
			.getter(function()
			{
				return this._enableChartClick;
			})
			.setter(function(value)
			{
				this._enableChartClick = value;
			});

		this.scaleY = new Property("scaleY", String)
			.getter(function()
			{
				return this._scaleY;
			})
			.setter(function(value)
			{
				value = (value == "log") ? "log" : "linear";
				if (this._scaleY === value)
					return;

				this._scaleY = value;
				this._histogram.set("scaleY", (value == "log") ? new LogScale() : null);
			});

		this.foregroundColor = new Property("foregroundColor", Number)
			.getter(function()
			{
				return this._foregroundColor;
			})
			.setter(function(value)
			{
				value = !isNaN(value) ? Math.min(Math.max(Math.floor(value), 0x000000), 0xFFFFFF) : 0x000000;
				if (this._foregroundColor === value)
					return;

				this._foregroundColor = value;
				this._axisLabelsX.set("foregroundColor", value);
				this._axisLabelsY1.set("foregroundColor", value);
				this._axisLabelsY2.set("foregroundColor", value);
				this._gridLines.set("foregroundColor", value);
				this._cursorMarker.set("foregroundColor", value);
				this._rangeMarker.set("foregroundColor", value);

				this.invalidate("renderGraphicsPass");
			});

		this.seriesColor = new Property("seriesColor", Number)
			.getter(function()
			{
				return this._seriesColor;
			})
			.setter(function(value)
			{
				value = !isNaN(value) ? Math.min(Math.max(Math.floor(value), 0x000000), 0xFFFFFF) : 0x000000;
				if (this._seriesColor === value)
					return;

				this._seriesColor = value;
				this._seriesFillBrush.set("color", value);
				this._seriesBorderBrush.set("colors", [ ColorUtils.brightness(value, -0.3) ]);
			});

		this.minimalMode = new Property("minimalMode", Boolean, false)
			.setter(function(value)
			{
				this.invalidate("renderGraphicsPass");
			});

		this.externalInterface = null;

		// Private Properties

		this._hostPath = null;
		this._basePath = null;

		this._timeZone = TimeZones.LOCAL;
		this._jobID = null;
		this._bucketCount = 1000;
		this._viewMinimum = NaN;
		this._viewMaximum = NaN;
		this._selectionMinimum = NaN;
		this._selectionMaximum = NaN;
		this._actualSelectionMinimum = NaN;
		this._actualSelectionMaximum = NaN;
		this._timelineData = null;
		this._enableChartClick = false;
		this._scaleY = "linear";
		this._foregroundColor = 0x000000;
		this._seriesColor = 0x73A550;

		this._updateCount = 0;
		this._updatingCount = 0;
		this._updatedCount = 0;
		this._dataLoading = false;
		this._loadJobID = null;

		this._seriesFillBrush = null;
		this._seriesBorderBrush = null;
		this._seriesGroupBrush = null;
		this._lineBrush = null;
		this._histogram = null;
		this._axisLabelsX = null;
		this._axisLabelsY1 = null;
		this._axisLabelsY2 = null;
		this._gridLines = null;
		this._cursorMarker = null;
		this._rangeMarker = null;
		this._tooltip = null;

		this._prevDate = null;
		this._prevJobID = null;
		this._prevMouseGlobal = null;
		this._tooltipData = null;
		this._updateSizeInterval = 0;

		// Constructor

		this.constructor = function(hostPath, basePath)
		{
			base.constructor.call(this);

			this.addStyleClass("splunk-charting-Timeline");

			this.setStyle({ position: "relative", width: "100%", height: "100%", overflow: "hidden" });

			hostPath = (typeof hostPath === "string") ? hostPath : null;
			if (!hostPath)
			{
				var url = location.href;
				var colonIndex = url.indexOf("://");
				var slashIndex = url.indexOf("/", colonIndex + 4);
				hostPath = url.substring(0, slashIndex);
			}
			this._hostPath = hostPath;

			basePath = (typeof basePath === "string") ? basePath : null;
			if (basePath == null)
				basePath = "/splunkd";
			this._basePath = basePath;

			this.updateSize = FunctionUtils.bind(this.updateSize, this);
			this._histogram_containedRangeXChanged = FunctionUtils.bind(this._histogram_containedRangeXChanged, this);
			this._histogram_containedRangeYChanged = FunctionUtils.bind(this._histogram_containedRangeYChanged, this);
			this._rangeMarker_dragComplete = FunctionUtils.bind(this._rangeMarker_dragComplete, this);
			this._rangeMarker_labelOpacity_changed = FunctionUtils.bind(this._rangeMarker_labelOpacity_changed, this);
			this._child_invalidated = FunctionUtils.bind(this._child_invalidated, this);
			this._self_mouseOver = FunctionUtils.bind(this._self_mouseOver, this);
			this._self_mouseOut = FunctionUtils.bind(this._self_mouseOut, this);
			this._self_mouseMove = FunctionUtils.bind(this._self_mouseMove, this);
			this._self_doubleClick = FunctionUtils.bind(this._self_doubleClick, this);
			this._data_success = FunctionUtils.bind(this._data_success, this);
			this._data_error = FunctionUtils.bind(this._data_error, this);

			this.externalInterface = {};

			var seriesColor = this._seriesColor;
			var seriesColorDark = ColorUtils.brightness(seriesColor, -0.3);
			this._seriesFillBrush = new SolidFillBrush(seriesColor, 1);
			this._seriesBorderBrush = new BorderStrokeBrush([ seriesColorDark ], [ 1 ], [ 0, 1, 0, 0 ], "square");
			this._seriesGroupBrush = new GroupBrush([ this._seriesFillBrush, this._seriesBorderBrush ]);

			this._lineBrush = new SolidStrokeBrush(this._foregroundColor, 0.1, 1, "square");

			this._histogram = new Histogram();
			this._histogram.renderGraphicsPriority = 1;
			this._histogram.set("brush", this._seriesGroupBrush);
			this._histogram.set("minimumX", this._histogram.get("actualMinimumX"));
			this._histogram.set("maximumX", this._histogram.get("actualMaximumX"));
			this._histogram.set("minimumY", this._histogram.get("actualMinimumY"));
			this._histogram.set("maximumY", this._histogram.get("actualMaximumY"));
			this._histogram.addEventListener("containedRangeXChanged", this._histogram_containedRangeXChanged);
			this._histogram.addEventListener("containedRangeYChanged", this._histogram_containedRangeYChanged);

			this._axisLabelsX = new TimeAxisLabels();
			this._axisLabelsX.renderGraphicsPriority = 1;
			this._axisLabelsX.set("histogram", this._histogram);
			this._axisLabelsX.set("labelFormat", FunctionUtils.bind(this._timeAxisFormat, this));
			this._axisLabelsX.addEventListener("invalidated", this._child_invalidated);

			this._axisLabelsY1 = new NumericAxisLabels();
			this._axisLabelsY1.renderGraphicsPriority = 1;
			this._axisLabelsY1.set("histogram", this._histogram);
			this._axisLabelsY1.set("labelFormat", FunctionUtils.bind(this._numericAxisFormat, this));
			this._axisLabelsY1.addEventListener("invalidated", this._child_invalidated);

			this._axisLabelsY2 = new NumericAxisLabels();
			this._axisLabelsY2.renderGraphicsPriority = 1;
			this._axisLabelsY2.set("histogram", this._histogram);
			this._axisLabelsY2.set("placement", "right");
			this._axisLabelsY2.set("labelFormat", FunctionUtils.bind(this._numericAxisFormat, this));
			this._axisLabelsY2.addEventListener("invalidated", this._child_invalidated);

			this._gridLines = new GridLines();
			this._gridLines.renderGraphicsPriority = 1;
			this._gridLines.set("axisLabels", this._axisLabelsY1);

			this._cursorMarker = new CursorMarker();
			this._cursorMarker.renderGraphicsPriority = 1;
			this._cursorMarker.set("histogram", this._histogram);
			this._cursorMarker.set("valueSnap", FunctionUtils.bind(this._cursorValueSnap, this));
			this._cursorMarker.set("valueFormat", FunctionUtils.bind(this._cursorValueFormat, this));

			this._rangeMarker = new ClickDragRangeMarker();
			this._rangeMarker.renderGraphicsPriority = 1;
			this._rangeMarker.set("histogram", this._histogram);
			this._rangeMarker.set("minimumSnap", FunctionUtils.bind(this._minimumSnap, this));
			this._rangeMarker.set("maximumSnap", FunctionUtils.bind(this._maximumSnap, this));
			this._rangeMarker.set("minimumFormat", FunctionUtils.bind(this._minimumFormat, this));
			this._rangeMarker.set("maximumFormat", FunctionUtils.bind(this._maximumFormat, this));
			this._rangeMarker.set("rangeFormat", FunctionUtils.bind(this._rangeFormat, this));
			this._rangeMarker.addEventListener("dragComplete", this._rangeMarker_dragComplete);
			this._rangeMarker.addEventListener("labelOpacity.changed", this._rangeMarker_labelOpacity_changed);

			this._tooltip = new Tooltip();
			this._tooltip.renderGraphicsPriority = 1;

			this.$element.bind("mouseover", this._self_mouseOver);
			this.$element.bind("mouseout", this._self_mouseOut);
			this.$element.bind("mousemove", this._self_mouseMove);
			this.$element.bind("dblclick", this._self_doubleClick);

			this._gridLines.appendTo(this);
			this._histogram.appendTo(this);
			this._axisLabelsX.appendTo(this);
			this._axisLabelsY1.appendTo(this);
			this._axisLabelsY2.appendTo(this);
			this._cursorMarker.appendTo(this);
			this._rangeMarker.appendTo(this);
			this._tooltip.appendTo(this);

			this._updateViewRange();
			this._updateCountRange();
		};

		// Public Methods

		this.dispatchUpdated = function()
		{
			this.validatePreceding("dispatchUpdatedPass");

			if (this.isValid("dispatchUpdatedPass"))
				return;

			this.setValid("dispatchUpdatedPass");

			this.dispatchEvent("updated", new GenericEventData({ updateCount: this._updatedCount }));
		};

		this.update = function()
		{
			this._updateCount++;
			this._update();
			return this._updateCount;
		};

		this.getSelectedBuckets = function()
		{
			if (!this._timelineData)
				return null;

			var buckets = this._timelineData.buckets;
			if (!buckets)
				return null;

			var selectedBuckets = new Array();

			var selectionMinimum = this._actualSelectionMinimum;
			var selectionMaximum = this._actualSelectionMaximum;
			var bucket;
			var bucketTime;

			for (var i = 0, l = buckets.length; i < l; i++)
			{
				bucket = buckets[i];

				bucketTime = bucket.earliestTime;
				if (!bucketTime || (bucketTime.getTime() < selectionMinimum))
					continue;

				bucketTime = bucket.latestTime;
				if (!bucketTime || (bucketTime.getTime() > selectionMaximum))
					continue;

				selectedBuckets.push(this._cloneTimelineData(bucket));
			}

			return selectedBuckets;
		};

		this.updateSize = function()
		{
			this.set("width", this.$element.width());
			this.set("height", this.$element.height());
		};

		this.dispose = function()
		{
			this._gridLines.dispose();
			this._histogram.dispose();
			this._axisLabelsX.dispose();
			this._axisLabelsY1.dispose();
			this._axisLabelsY2.dispose();
			this._cursorMarker.dispose();
			this._rangeMarker.dispose();
			this._tooltip.dispose();

			base.dispose.call(this);
		};

		// Protected Methods

		this.renderGraphicsOverride = function(graphics, width, height)
		{
			var minimalMode = this.getInternal("minimalMode");
			var minimalLineWidth = Math.round(width);

			var tl = this.localToGlobal(new Point(0, 0));
			var br = this.localToGlobal(new Point(width, height));

			this._axisLabelsX.setStyle({ visibility: (minimalMode ? "hidden" : "") });
			this._axisLabelsX.set("width", width);
			this._axisLabelsX.renderGraphics();
			height = minimalMode ? Math.max(height - 20, 0) : Math.max(height - this._axisLabelsX.get("height"), 0);

			this._axisLabelsY1.setStyle({ visibility: (minimalMode ? "hidden" : "") });
			this._axisLabelsY1.set("height", height);
			this._axisLabelsY1.renderGraphics();
			var x1 = minimalMode ? 20 : this._axisLabelsY1.get("width");

			this._axisLabelsY2.setStyle({ visibility: (minimalMode ? "hidden" : "") });
			this._axisLabelsY2.set("height", height);
			this._axisLabelsY2.renderGraphics();
			var x2 = minimalMode ? Math.max(x1, width - 20) : Math.max(x1, width - this._axisLabelsY2.get("width"));

			width = x2 - x1;

			this._axisLabelsX.set("x", x1);
			this._axisLabelsX.set("y", height);
			this._axisLabelsX.set("width", width);
			this._axisLabelsX.renderGraphics();

			this._axisLabelsY2.set("x", x2);

			this._histogram.set("x", x1);
			this._histogram.set("width", width);
			this._histogram.set("height", height);
			this._histogram.renderGraphics();

			this._gridLines.setStyle({ visibility: (minimalMode ? "hidden" : "") });
			this._gridLines.set("x", x1);
			this._gridLines.set("width", width);
			this._gridLines.set("height", height);
			this._gridLines.renderGraphics();

			this._cursorMarker.set("x", x1);
			this._cursorMarker.set("width", width);
			this._cursorMarker.set("height", height);
			this._cursorMarker.renderGraphics();

			this._rangeMarker.set("x", x1);
			this._rangeMarker.set("width", width);
			this._rangeMarker.set("height", height);
			this._rangeMarker.renderGraphics();

			this._tooltip.set("viewBounds", new Rectangle(tl.x, tl.y, br.x - tl.x, br.y - tl.y));

			graphics.clear();
			if (minimalMode)
			{
				x1 = Math.round(x1);
				x2 = Math.round(x2);
				height = Math.round(height);

				var lineBrush = this._lineBrush;
				var numLines = Math.round(height / 7);
				var y;

				lineBrush.set("color", this._foregroundColor);
				lineBrush.beginBrush(graphics);

				// vertical lines
				lineBrush.moveTo(x1, 0);
				lineBrush.lineTo(x1, height);
				lineBrush.moveTo(x2, 0);
				lineBrush.lineTo(x2, height);

				// horizontal lines
				for (var i = 0; i <= numLines; i++)
				{
					y = Math.round(height * (i / numLines));
					lineBrush.moveTo(x1, y);
					lineBrush.lineTo(x2, y);
				}

				lineBrush.endBrush();
			}

			this._updateTooltip();
		};

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

		this._update = function()
		{
			if (this._dataLoading)
				return;

			this._updatingCount = this._updateCount;
			this._loadJobID = this._jobID;
			if (!this._loadJobID)
			{
				this._updateComplete(null);
				return;
			}

			this._dataLoading = true;
			$.ajax(
			{
				type: "GET",
				url: this._hostPath + this._basePath + "/search/jobs/" + this._loadJobID + "/timeline?offset=0&count=" + this._bucketCount,
				dataType: "xml",
				success: this._data_success,
				error: this._data_error
			});
		};

		this._updateComplete = function(data)
		{
			this._updateTimelineData(data);

			this._dataLoading = false;

			this._updatedCount = this._updatingCount;

			this.invalidate("dispatchUpdatedPass");

			if (this._updatingCount < this._updateCount)
				this._update();
		};

		this._updateTimelineData = function(timelineData)
		{
			this._timelineData = timelineData;

			var jobIDChanged = (this._loadJobID != this._prevJobID);
			this._prevJobID = this._loadJobID;

			if (jobIDChanged)
			{
				this._rangeMarker.set("minimum", NaN);
				this._rangeMarker.set("maximum", NaN);
			}

			this._rangeMarker.invalidate("updateRangePass");

			this._cursorMarker.set("value", (timelineData && (timelineData.buckets.length > 0) && timelineData.cursorTime) ? timelineData.cursorTime.getTime() : NaN);
			this._cursorMarker.invalidate("renderGraphicsPass");

			var buckets = timelineData ? timelineData.buckets.concat() : null;
			if (buckets)
			{
				var bucket;
				for (var i = 0, l = buckets.length; i < l; i++)
				{
					bucket = buckets[i];
					buckets[i] = { x1: bucket.earliestTime, x2: bucket.latestTime, y: bucket.eventCount };
				}
			}
			this._histogram.set("data", buckets);

			this.invalidate("renderGraphicsPass");
			this.validate("renderGraphicsPass");

			this._updateViewRange();
			this._updateSelectionRange();
		};

		this._updateViewRange = function()
		{
			if ((!this._timelineData || (this._timelineData.buckets.length == 0)) && !isNaN(this._viewMinimum))
				return;

			var minimum = this._histogram.get("containedMinimumX");
			var maximum = this._histogram.get("containedMaximumX");

			if ((minimum == this._viewMinimum) && (maximum == this._viewMaximum))
				return;

			this._viewMinimum = minimum;
			this._viewMaximum = maximum;

			this.dispatchEvent("viewChanged", new GenericEventData({ viewMinimum: this._viewMinimum, viewMaximum: this._viewMaximum }));

			var tweenMinimum = new PropertyTween(this._histogram, "minimumX", this._histogram.get("actualMinimumX"), this._histogram.get("containedMinimumX"));
			var tweenMaximum = new PropertyTween(this._histogram, "maximumX", this._histogram.get("actualMaximumX"), this._histogram.get("containedMaximumX"));
			var tween = new GroupTween([ tweenMinimum, tweenMaximum ], new CubicEaser(EaseDirection.OUT));
			TweenRunner.start(tween, 0.5);

			this._updateSelectionRange();
		};

		this._updateCountRange = function()
		{
			if (!this._timelineData || (this._timelineData.eventCount == 0))
				return;

			var tweenMinimum = new PropertyTween(this._histogram, "minimumY", this._histogram.get("actualMinimumY"), this._histogram.get("containedMinimumY"));
			var tweenMaximum = new PropertyTween(this._histogram, "maximumY", this._histogram.get("actualMaximumY"), this._histogram.get("containedMaximumY"));
			var tween = new GroupTween([ tweenMinimum, tweenMaximum ], new CubicEaser(EaseDirection.OUT));
			TweenRunner.start(tween, 0.5);
		};

		this._updateSelectionRange = function(dispatchEvent)
		{
			if (this._rangeMarker.isDragging())
				return;

			if (dispatchEvent === undefined)
				dispatchEvent = true;

			var minimum = this._rangeMarker.get("minimum");
			var maximum = this._rangeMarker.get("maximum");
			var actualMinimum = isNaN(minimum) ? this._viewMinimum : this._rangeMarker.get("actualMinimum");
			var actualMaximum = isNaN(maximum) ? this._viewMaximum : this._rangeMarker.get("actualMaximum");

			var minimumChanged = isNaN(minimum) ? !isNaN(this._selectionMinimum) : (isNaN(this._selectionMinimum) || (actualMinimum != this._actualSelectionMinimum));
			var maximumChanged = isNaN(maximum) ? !isNaN(this._selectionMaximum) : (isNaN(this._selectionMaximum) || (actualMaximum != this._actualSelectionMaximum));

			this._selectionMinimum = minimum;
			this._selectionMaximum = maximum;
			this._actualSelectionMinimum = actualMinimum;
			this._actualSelectionMaximum = actualMaximum;

			if (dispatchEvent && (minimumChanged || maximumChanged))
			{
				minimum = isNaN(minimum) ? NaN : actualMinimum;
				maximum = isNaN(maximum) ? NaN : actualMaximum;
				this.dispatchEvent("selectionChanged", new GenericEventData({ selectionMinimum: minimum, selectionMaximum: maximum }));
			}
		};

		this._updateTooltip = function(mouseGlobal)
		{
			if (mouseGlobal == null)
				mouseGlobal = this._prevMouseGlobal ? this._prevMouseGlobal : new Point();
			else
				this._prevMouseGlobal = mouseGlobal;

			var mouseLocal = this._histogram.globalToLocal(mouseGlobal);
			var bucketData = this._rangeMarker.isDragging() ? null : this._histogram.getDataUnderPoint(mouseLocal.x, mouseLocal.y);
			if (bucketData && bucketData.bounds)
			{
				var bounds = bucketData.bounds;
				var boundsTL = this._histogram.localToGlobal(new Point(bounds.x, bounds.y));
				var boundsBR = this._histogram.localToGlobal(new Point(bounds.x + bounds.width, bounds.y + bounds.height));

				this._tooltip.set("targetBounds", new Rectangle(boundsTL.x, boundsTL.y, boundsBR.x - boundsTL.x, boundsBR.y - boundsTL.y));

				if (this._tooltipData && (this._tooltipData.data === bucketData.data))
					return;

				this._tooltipData = bucketData;

				this._tooltip.set("value", this._tipFormat(bucketData.data));
				this._tooltip.show();

				if (this._enableChartClick)
					this.$element.css({ cursor: "pointer" });
			}
			else
			{
				if (!this._tooltipData)
					return;

				this._tooltipData = null;

				this._tooltip.set("value", null);
				this._tooltip.hide();

				this.$element.css({ cursor: "auto" });
			}
		};

		this._parseTimelineData = function(node)
		{
			if (!node)
				return null;

			var attributes = node.attributes;
			var attribute;
			var childNodes = node.childNodes;
			var childNode;
			var i;
			var l;

			var earliestTime = null;
			var latestTime = null;
			var cursorTime = null;
			var duration = NaN;
			var earliestOffset = NaN;
			var latestOffset = NaN;
			var eventCount = 0;
			var eventAvailableCount = 0;
			var isComplete = false;
			var isTimeCursored = true;
			var buckets = [];

			for (i = 0, l = attributes.length; i < l; i++)
			{
				attribute = attributes[i];
				if (attribute.nodeType == 2)
				{
					switch (attribute.nodeName.toLowerCase())
					{
						case "t":
							earliestTime = new DateTime(Number(attribute.nodeValue));
							break;
						case "cursor":
							cursorTime = new DateTime(Number(attribute.nodeValue));
							break;
						case "d":
							duration = Number(attribute.nodeValue);
							break;
						case "etz":
							earliestOffset = Number(attribute.nodeValue);
							break;
						case "ltz":
							latestOffset = Number(attribute.nodeValue);
							break;
						case "c":
							eventCount = Number(attribute.nodeValue);
							break;
						case "a":
							eventAvailableCount = Number(attribute.nodeValue);
							break;
						case "f":
							isComplete = (attribute.nodeValue == "1");
							break;
						case "is_time_cursored":
							isTimeCursored = (attribute.nodeValue != "0");
							break;
					}
				}
			}

			var bucketEventCount = 0;
			var bucket;
			for (i = 0, l = childNodes.length; i < l; i++)
			{
				childNode = childNodes[i];
				if (childNode.nodeType == 1)
				{
					switch (childNode.nodeName.toLowerCase())
					{
						case "bucket":
							bucket = this._parseTimelineData(childNode);
							bucketEventCount += bucket.eventCount;
							buckets.push(bucket);
							break;
					}
				}
			}
			eventCount = Math.max(eventCount, bucketEventCount);

			if (isNaN(duration))
				duration = 0;
			if (isNaN(earliestOffset))
				earliestOffset = 0;
			if (isNaN(latestOffset))
				latestOffset = 0;

			if (earliestTime)
				latestTime = new DateTime(earliestTime.getTime() + duration);

			if (buckets.length > 0)
			{
				var earliestBucketTime = buckets[0].earliestTime;
				if (earliestBucketTime && (!earliestTime || (earliestBucketTime.getTime() < earliestTime.getTime())))
					earliestTime = earliestBucketTime.clone();

				var latestBucketTime = buckets[buckets.length - 1].latestTime;
				if (latestBucketTime && (!latestTime || (latestBucketTime.getTime() > latestTime.getTime())))
					latestTime = latestBucketTime.clone();

				if (earliestTime && latestTime)
					duration = latestTime.getTime() - earliestTime.getTime();
			}

			if (earliestTime)
				earliestTime = earliestTime.toTimeZone(new SimpleTimeZone(earliestOffset));
			if (latestTime)
				latestTime = latestTime.toTimeZone(new SimpleTimeZone(latestOffset));
			if (cursorTime)
				cursorTime = cursorTime.toTimeZone(new SimpleTimeZone(earliestOffset));

			var data = {};
			data.earliestTime = earliestTime;
			data.latestTime = latestTime;
			data.cursorTime = isTimeCursored ? cursorTime : null;
			data.duration = duration;
			data.eventCount = eventCount;
			data.eventAvailableCount = eventAvailableCount;
			data.isComplete = isComplete;
			data.buckets = buckets;
			return data;
		};

		this._cloneTimelineData = function(timelineData)
		{
			if (!timelineData)
				return null;

			var clonedData = {};
			clonedData.earliestTime = timelineData.earliestTime ? timelineData.earliestTime.getTime() : null;
			clonedData.earliestOffset = timelineData.earliestTime ? timelineData.earliestTime.getTimeZoneOffset() : 0;
			clonedData.latestTime = timelineData.latestTime ? timelineData.latestTime.getTime() : null;
			clonedData.latestOffset = timelineData.latestTime ? timelineData.latestTime.getTimeZoneOffset() : 0;
			clonedData.cursorTime = timelineData.cursorTime ? timelineData.cursorTime.getTime() : null;
			clonedData.duration = timelineData.duration;
			clonedData.eventCount = timelineData.eventCount;
			clonedData.eventAvailableCount = timelineData.eventAvailableCount;
			clonedData.isComplete = timelineData.isComplete;

			var buckets = timelineData.buckets;
			var numBuckets = buckets.length;
			var parsedBuckets = clonedData.buckets = [];
			for (var i = 0; i < numBuckets; i++)
				parsedBuckets.push(this._cloneTimelineData(buckets[i]));

			return clonedData;
		};

		this._cursorValueSnap = function(value)
		{
			return this._ceilToBucket(value);
		};

		this._minimumSnap = function(value, floor)
		{
			return floor ? this._floorToBucket(value) : this._roundToBucket(value);
		};

		this._maximumSnap = function(value, ceil)
		{
			return ceil ? this._ceilToBucket(value) : this._roundToBucket(value);
		};

		this._floorToBucket = function(value)
		{
			var buckets = this._histogram.get("data");
			if (buckets)
			{
				var bucket;
				var bucketTime = null;
				for (var i = buckets.length - 1; i >= 0; i--)
				{
					bucket = buckets[i];
					bucketTime = bucket.x1;
					if (bucketTime && (bucketTime.getTime() <= value))
						break;
				}
				if (bucketTime && !isNaN(bucketTime.getTime()))
					value = bucketTime.getTime();
			}
			return value;
		};

		this._ceilToBucket = function(value)
		{
			var buckets = this._histogram.get("data");
			if (buckets)
			{
				var bucket;
				var bucketTime = null;
				for (var i = 0, l = buckets.length; i < l; i++)
				{
					bucket = buckets[i];
					bucketTime = bucket.x2;
					if (bucketTime && (bucketTime.getTime() >= value))
						break;
				}
				if (bucketTime && !isNaN(bucketTime.getTime()))
					value = bucketTime.getTime();
			}
			return value;
		};

		this._roundToBucket = function(value)
		{
			var buckets = this._histogram.get("data");
			if (buckets)
			{
				var bestTime = value;
				var bestDiff = Infinity;
				var bucket;
				var bucketTime = null;
				var diff;
				for (var i = 0, l = buckets.length; i < l; i++)
				{
					bucket = buckets[i];
					bucketTime = bucket.x1 ? bucket.x1.getTime() : NaN;
					if (!isNaN(bucketTime))
					{
						diff = Math.abs(bucketTime - value);
						if (diff < bestDiff)
						{
							bestTime = bucketTime;
							bestDiff = diff;
						}
					}
					bucketTime = bucket.x2 ? bucket.x2.getTime() : NaN;
					if (!isNaN(bucketTime))
					{
						diff = Math.abs(bucketTime - value);
						if (diff < bestDiff)
						{
							bestTime = bucketTime;
							bestDiff = diff;
						}
					}
				}
				value = bestTime;
			}
			return value;
		};

		this._timeAxisFormat = function(date)
		{
			if (!date)
				return "";

			var dateString = "";

			var majorUnit = this._axisLabelsX.get("actualUnit");

			var resYears = 0;
			var resMonths = 1;
			var resDays = 2;
			var resHours = 3;
			var resMinutes = 4;
			var resSeconds = 5;
			var resSubSeconds = 6;

			var resMin;
			var resMax;

			var prevDate = this._prevDate;

			if (!prevDate || (prevDate.getTime() > date.getTime()) || (prevDate.getYear() != date.getYear()))
				resMin = resYears;
			else if (prevDate.getMonth() != date.getMonth())
				resMin = resMonths;
			else if (prevDate.getDay() != date.getDay())
				resMin = resDays;
			else
				resMin = resHours;

			this._prevDate = date.clone();

			if ((majorUnit.seconds % 1) > 0)
				resMax = resSubSeconds;
			else if ((majorUnit.seconds > 0) || ((majorUnit.minutes % 1) > 0))
				resMax = resSeconds;
			else if ((majorUnit.minutes > 0) || ((majorUnit.hours % 1) > 0))
				resMax = resMinutes;
			else if ((majorUnit.hours > 0) || ((majorUnit.days % 1) > 0))
				resMax = resHours;
			else if ((majorUnit.days > 0) || ((majorUnit.months % 1) > 0))
				resMax = resDays;
			else if ((majorUnit.months > 0) || ((majorUnit.years % 1) > 0))
				resMax = resMonths;
			else
				resMax = resYears;

			if (resMin > resMax)
				resMin = resMax;

			if (resMax == resSubSeconds)
				dateString += this._formatTime(date, "full");
			else if (resMax == resSeconds)
				dateString += this._formatTime(date, "medium");
			else if (resMax >= resHours)
				dateString += this._formatTime(date, "short");

			if ((resMax >= resDays) && (resMin <= resDays))
				dateString += (dateString ? "\n" : "") + this._formatDate(date, "EEE MMM d");
			else if ((resMax >= resMonths) && (resMin <= resMonths))
				dateString += (dateString ? "\n" : "") + this._formatDate(date, "MMMM");

			if ((resMax >= resYears) && (resMin <= resYears))
				dateString += (dateString ? "\n" : "") + this._formatDate(date, "yyyy");

			return dateString;
		};

		this._numericAxisFormat = function(num)
		{
			return this._formatNumber(num);
		};

		this._cursorValueFormat = function(value)
		{
			return this._minMaxFormat(value);
		};

		this._minimumFormat = function(value)
		{
			return this._minMaxFormat(this._minimumSnap(value));
		};

		this._maximumFormat = function(value)
		{
			return this._minMaxFormat(this._maximumSnap(value));
		};

		this._minMaxFormat = function(value)
		{
			var dateTime = new DateTime(value);
			dateTime = dateTime.toTimeZone(this._timeZone);

			var dateFormat = "medium";
			var timeFormat;
			if ((dateTime.getSeconds() % 1) >= 0.001)
				timeFormat = "full";
			else if (dateTime.getSeconds() > 0)
				timeFormat = "medium";
			else if (dateTime.getMinutes() > 0)
				timeFormat = "short";
			else if (dateTime.getHours() > 0)
				timeFormat = "short";
			else
				timeFormat = "none";

			if (timeFormat == "none")
				return this._formatDate(dateTime, dateFormat);
			else
				return this._formatDateTime(dateTime, dateFormat, timeFormat);
		};

		this._rangeFormat = function(minimum, maximum)
		{
			var minimumTime = new DateTime(this._minimumSnap(minimum));
			minimumTime = minimumTime.toTimeZone(this._timeZone);

			var maximumTime = new DateTime(this._maximumSnap(maximum));
			maximumTime = maximumTime.toTimeZone(this._timeZone);

			var duration = TimeUtils.subtractDates(maximumTime, minimumTime);

			var str = "";
			if (duration.years > 0)
				str += this._formatNumericString("%s year ", "%s years ", duration.years);
			if (duration.months > 0)
				str += this._formatNumericString("%s month ", "%s months ", duration.months);
			if (duration.days > 0)
				str += this._formatNumericString("%s day ", "%s days ", duration.days);
			if (duration.hours > 0)
				str += this._formatNumericString("%s hour ", "%s hours ", duration.hours);
			if (duration.minutes > 0)
				str += this._formatNumericString("%s minute ", "%s minutes ", duration.minutes);
			if (duration.seconds > 0)
				str += this._formatNumericString("%s second ", "%s seconds ", Math.floor(duration.seconds * 1000) / 1000);

			return str;
		};

		this._tipFormat = function(data)
		{
			if (!data)
				return "";
			return this._formatTooltip(data.x1, data.x2, data.y);
		};

		this._formatNumber = function(num)
		{
			num = NumberUtils.toPrecision(num, 12);

			var format = this.externalInterface.formatNumber;
			if (typeof format === "function")
				return format(num);

			return String(num);
		};

		this._formatNumericString = function(strSingular, strPlural, num)
		{
			num = NumberUtils.toPrecision(num, 12);

			var format = this.externalInterface.formatNumericString;
			if (typeof format === "function")
				return format(strSingular, strPlural, num);

			var str = (Math.abs(num) == 1) ? strSingular : strPlural;
			str = str.split("%s").join(String(num));
			return str;
		};

		this._formatDate = function(dateTime, dateFormat)
		{
			if (dateFormat === undefined)
				dateFormat = "full";

			var format = this.externalInterface.formatDate;
			if (typeof format === "function")
				return format(dateTime.getTime(), dateTime.getTimeZoneOffset(), dateFormat);

			return this._pad(dateTime.getYear(), 4) + "-" + this._pad(dateTime.getMonth(), 2) + "-" + this._pad(dateTime.getDay(), 2);
		};

		this._formatTime = function(dateTime, timeFormat)
		{
			if (timeFormat === undefined)
				timeFormat = "full";

			var format = this.externalInterface.formatTime;
			if (typeof format === "function")
				return format(dateTime.getTime(), dateTime.getTimeZoneOffset(), timeFormat);

			return this._pad(dateTime.getHours(), 2) + ":" + this._pad(dateTime.getMinutes(), 2) + ":" + this._pad(dateTime.getSeconds(), 2, 3);
		};

		this._formatDateTime = function(dateTime, dateFormat, timeFormat)
		{
			if (dateFormat === undefined)
				dateFormat = "full";
			if (timeFormat === undefined)
				timeFormat = "full";

			var format = this.externalInterface.formatDateTime;
			if (typeof format === "function")
				return format(dateTime.getTime(), dateTime.getTimeZoneOffset(), dateFormat, timeFormat);

			return this._pad(dateTime.getYear(), 4) + "-" + this._pad(dateTime.getMonth(), 2) + "-" + this._pad(dateTime.getDay(), 2) + " " + this._pad(dateTime.getHours(), 2) + ":" + this._pad(dateTime.getMinutes(), 2) + ":" + this._pad(dateTime.getSeconds(), 2, 3);
		};

		this._formatTooltip = function(earliestTime, latestTime, eventCount)
		{
			var format = this.externalInterface.formatTooltip;
			if (typeof format === "function")
				return format(earliestTime.getTime(), latestTime.getTime(), earliestTime.getTimeZoneOffset(), latestTime.getTimeZoneOffset(), eventCount);

			return eventCount + " events from " + earliestTime.toString() + " to " + latestTime.toString();
		};

		this._pad = function(value, digits, fractionDigits)
		{
			if (isNaN(value))
				return "NaN";
			if (value === Infinity)
				return "Infinity";
			if (value === -Infinity)
				return "-Infinity";

			if (digits === undefined)
				digits = 0;
			if (fractionDigits === undefined)
				fractionDigits = 0;

			var str = value.toFixed(20);

			var decimalIndex = str.indexOf(".");
			if (decimalIndex < 0)
				decimalIndex = str.length;
			else if (fractionDigits < 1)
				str = str.substring(0, decimalIndex);
			else
				str = str.substring(0, decimalIndex) + "." + str.substring(decimalIndex + 1, decimalIndex + fractionDigits + 1);

			for (var i = decimalIndex; i < digits; i++)
				str = "0" + str;

			return str;
		};

		this._histogram_containedRangeXChanged = function(e)
		{
			this._updateViewRange();
		};

		this._histogram_containedRangeYChanged = function(e)
		{
			this._updateCountRange();
		};

		this._rangeMarker_dragComplete = function(e)
		{
			this._updateSelectionRange();
		};

		this._rangeMarker_labelOpacity_changed = function(e)
		{
			this._cursorMarker.set("labelOpacity", 1 - e.newValue);
		};

		this._child_invalidated = function(e)
		{
			if (e.pass === this.renderGraphicsPass)
				this.invalidate(e.pass);
		};

		this._self_mouseOver = function(e)
		{
			this._updateTooltip(new Point(e.pageX, e.pageY));
		};

		this._self_mouseOut = function(e)
		{
			this._updateTooltip(new Point(e.pageX, e.pageY));
		};

		this._self_mouseMove = function(e)
		{
			this._updateTooltip(new Point(e.pageX, e.pageY));
		};

		this._self_doubleClick = function(e)
		{
			if (!this._enableChartClick)
				return;

			this._updateTooltip(new Point(e.pageX, e.pageY));

			var bucketData = this._tooltipData;
			if (!bucketData)
				return;

			var data = {};
			data.earliestTime = {};  // flash timeline sends empty objects (due to JABridge conversion of DateTime), so we will emulate
			data.latestTime = {};
			data.eventCount = bucketData.data.y;

			var fields = [ "earliestTime", "latestTime", "eventCount" ];

			this.dispatchEvent("chartDoubleClicked", new GenericEventData({ data: data, fields: fields, altKey: e.altKey, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey }));
		};

		this._data_success = function(xml, msg, xhr)
		{
			this._updateComplete(this._parseTimelineData(xml ? xml.documentElement : null));
		};

		this._data_error = function(xhr, msg, error)
		{
			this._updateComplete(null);
		};

	});

});
});
