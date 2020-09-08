/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Outline = require("./Outline");
	var Size = require("./Size");
	var Class = require("../Class");
	var CSS = require("../CSS");
	var Pass = require("../async/Pass");
	var Element = require("../display/Element");
	var Rectangle = require("../geom/Rectangle");
	var ObservableEnumProperty = require("../properties/ObservableEnumProperty");
	var ObservableProperty = require("../properties/ObservableProperty");
	var Property = require("../properties/Property");
	var FunctionUtil = require("../utils/FunctionUtil");
	var Global = require("../utils/Global");
	var NumberUtil = require("../utils/NumberUtil");
	var ObjectUtil = require("../utils/ObjectUtil");

	require("../CSS!./LayoutElement").inject();

	/**
	 * Inspired by the layout system from .Net WPF.
	 */
	return Class(module.id, Element, function(LayoutElement, base)
	{

		// Private Static Constants

		var _LAYOUT_PENDING = CSS.formatClassName(module.id, "layoutPending");
		var _ROOT = CSS.formatClassName(module.id, "root");
		var _CHILD = CSS.formatClassName(module.id, "child");

		// Public Passes

		this.measurePass = new Pass("measure", 1, "topDown");
		this.layoutPass = new Pass("layout", 2, "topDown");
		this.offsetPass = new Pass("offset", 3);

		// Public Properties

		this.autoResize = new ObservableEnumProperty("autoResize", String, [ "none", "width", "height", "both" ])
			.onChange(function(e)
			{
				var layoutCache = this._layoutCache;
				if (layoutCache.autoResizeInfo)
				{
					LayoutHelper.teardownAutoResize(layoutCache.autoResizeInfo);
					layoutCache.autoResizeInfo = null;
					this.invalidate(this.measurePass);
				}

				if ((e.newValue !== "none") && !this._layoutParent && this.inFlow())
				{
					layoutCache.autoResizeInfo = LayoutHelper.setupAutoResize(this, e.newValue);
					this.invalidate(this.measurePass);
				}
			});

		this.boxSizing = new ObservableEnumProperty("boxSizing", String, [ "borderBox", "contentBox" ])
			.onChange(function(e)
			{
				this.invalidate(this.measurePass);
			});

		this.x = new ObservableProperty("x", Number, NaN)
			.writeFilter(function(value)
			{
				return ((value > -Infinity) && (value < Infinity)) ? value : NaN;
			})
			.onChange(function(e)
			{
				this.invalidate(this.offsetPass);
			});

		this.y = new ObservableProperty("y", Number, NaN)
			.writeFilter(function(value)
			{
				return ((value > -Infinity) && (value < Infinity)) ? value : NaN;
			})
			.onChange(function(e)
			{
				this.invalidate(this.offsetPass);
			});

		this.offsetX = new ObservableProperty("offsetX", Number, 0)
			.writeFilter(function(value)
			{
				return ((value > -Infinity) && (value < Infinity)) ? value : 0;
			})
			.onChange(function(e)
			{
				this.invalidate(this.offsetPass);
			});

		this.offsetY = new ObservableProperty("offsetY", Number, 0)
			.writeFilter(function(value)
			{
				return ((value > -Infinity) && (value < Infinity)) ? value : 0;
			})
			.onChange(function(e)
			{
				this.invalidate(this.offsetPass);
			});

		this.alignmentX = new ObservableProperty("alignmentX", Number, NaN)
			.writeFilter(function(value)
			{
				return !isNaN(value) ? NumberUtil.minMax(value, 0, 1) : NaN;
			})
			.onChange(function(e)
			{
				if (isNaN(e.oldValue) || isNaN(e.newValue))
					this.invalidate(this.layoutPass);
				else
					this.invalidate(this.offsetPass);
			});

		this.alignmentY = new ObservableProperty("alignmentY", Number, NaN)
			.writeFilter(function(value)
			{
				return !isNaN(value) ? NumberUtil.minMax(value, 0, 1) : NaN;
			})
			.onChange(function(e)
			{
				if (isNaN(e.oldValue) || isNaN(e.newValue))
					this.invalidate(this.layoutPass);
				else
					this.invalidate(this.offsetPass);
			});

		this.width = new ObservableProperty("width", Number, NaN)
			.writeFilter(function(value)
			{
				return (value < Infinity) ? Math.max(Math.round(value), 0) : NaN;
			})
			.onChange(function(e)
			{
				this.invalidate(this.measurePass);
			});

		this.height = new ObservableProperty("height", Number, NaN)
			.writeFilter(function(value)
			{
				return (value < Infinity) ? Math.max(Math.round(value), 0) : NaN;
			})
			.onChange(function(e)
			{
				this.invalidate(this.measurePass);
			});

		this.minWidth = new ObservableProperty("minWidth", Number, 0)
			.writeFilter(function(value)
			{
				return (value < Infinity) ? Math.max(Math.round(value), 0) : 0;
			})
			.onChange(function(e)
			{
				this.invalidate(this.measurePass);
			});

		this.minHeight = new ObservableProperty("minHeight", Number, 0)
			.writeFilter(function(value)
			{
				return (value < Infinity) ? Math.max(Math.round(value), 0) : 0;
			})
			.onChange(function(e)
			{
				this.invalidate(this.measurePass);
			});

		this.maxWidth = new ObservableProperty("maxWidth", Number, Infinity)
			.writeFilter(function(value)
			{
				return (value < Infinity) ? Math.max(Math.round(value), 0) : Infinity;
			})
			.onChange(function(e)
			{
				this.invalidate(this.measurePass);
			});

		this.maxHeight = new ObservableProperty("maxHeight", Number, Infinity)
			.writeFilter(function(value)
			{
				return (value < Infinity) ? Math.max(Math.round(value), 0) : Infinity;
			})
			.onChange(function(e)
			{
				this.invalidate(this.measurePass);
			});

		this.margin = new ObservableProperty("margin", Outline, new Outline())
			.readFilter(function(value)
			{
				return value.clone();
			})
			.writeFilter(function(value)
			{
				value = value ? value.clone() : new Outline();
				value.top = ((value.top > -Infinity) && (value.top < Infinity)) ? Math.round(value.top) : 0;
				value.right = ((value.right > -Infinity) && (value.right < Infinity)) ? Math.round(value.right) : 0;
				value.bottom = ((value.bottom > -Infinity) && (value.bottom < Infinity)) ? Math.round(value.bottom) : 0;
				value.left = ((value.left > -Infinity) && (value.left < Infinity)) ? Math.round(value.left) : 0;
				return value;
			})
			.changeComparator(function(oldValue, newValue)
			{
				return !oldValue.equals(newValue);
			})
			.onWrite(function()
			{
				this._layoutCache.hasExplicitMargin = true;
			})
			.onChange(function(e)
			{
				this.invalidate(this.measurePass);
			});

		this.padding = new ObservableProperty("padding", Outline, new Outline())
			.readFilter(function(value)
			{
				return value.clone();
			})
			.writeFilter(function(value)
			{
				value = value ? value.clone() : new Outline();
				value.top = (value.top < Infinity) ? Math.max(Math.round(value.top), 0) : 0;
				value.right = (value.right < Infinity) ? Math.max(Math.round(value.right), 0) : 0;
				value.bottom = (value.bottom < Infinity) ? Math.max(Math.round(value.bottom), 0) : 0;
				value.left = (value.left < Infinity) ? Math.max(Math.round(value.left), 0) : 0;
				return value;
			})
			.changeComparator(function(oldValue, newValue)
			{
				return !oldValue.equals(newValue);
			})
			.onWrite(function()
			{
				this._layoutCache.hasExplicitPadding = true;
			})
			.onChange(function(e)
			{
				this.invalidate(this.measurePass);
			});

		this.borderWidth = new ObservableProperty("borderWidth", Outline, new Outline())
			.readFilter(function(value)
			{
				return value.clone();
			})
			.writeFilter(function(value)
			{
				value = value ? value.clone() : new Outline();
				value.top = (value.top < Infinity) ? Math.max(Math.round(value.top), 0) : 0;
				value.right = (value.right < Infinity) ? Math.max(Math.round(value.right), 0) : 0;
				value.bottom = (value.bottom < Infinity) ? Math.max(Math.round(value.bottom), 0) : 0;
				value.left = (value.left < Infinity) ? Math.max(Math.round(value.left), 0) : 0;
				return value;
			})
			.changeComparator(function(oldValue, newValue)
			{
				return !oldValue.equals(newValue);
			})
			.onWrite(function()
			{
				this._layoutCache.hasExplicitBorderWidth = true;
			})
			.onChange(function(e)
			{
				this.invalidate(this.measurePass);
			});

		this.measuredSize = new Property("measuredSize", Size)
			.readOnly(true)
			.onRead(function()
			{
				this.validate(this.measurePass);
			})
			.getter(function()
			{
				return this._layoutCache.getMeasuredSize();
			});

		this.layoutBounds = new Property("layoutBounds", Rectangle)
			.readOnly(true)
			.onRead(function()
			{
				this.validate(this.layoutPass);
			})
			.getter(function()
			{
				return this._layoutCache.getLayoutBounds();
			});

		this.computedBounds = new Property("computedBounds", Rectangle)
			.readOnly(true)
			.onRead(function()
			{
				this.validate(this.offsetPass);
			})
			.getter(function()
			{
				return this._layoutCache.getComputedBounds();
			});

		// Private Properties

		this._layoutParent = null;
		this._layoutCache = null;
		this._layoutStyle = null;

		// Constructor

		this.constructor = function(tagName)
		{
			base.constructor.call(this, tagName);

			this._layoutCache = new LayoutCache();
			this._layoutStyle = { left: "", top: "", width: "", height: "", margin: "", padding: "", borderWidth: "" };
		};

		// Public Accessor Methods

		this.layoutParent = function()
		{
			return this._layoutParent;
		};

		// Public Methods

		this.measure = function(constraint)
		{
			var layoutCache = this._layoutCache;
			var autoResizeInfo = layoutCache.autoResizeInfo;
			if (autoResizeInfo)
			{
				if (!autoResizeInfo.handler)
					LayoutHelper.setupAutoResizeHandler(autoResizeInfo);

				constraint = new Size(Infinity, Infinity);
				if (autoResizeInfo.width >= 0)
					constraint.width = autoResizeInfo.width;
				if (autoResizeInfo.height >= 0)
					constraint.height = autoResizeInfo.height;
			}
			else if (constraint == null)
			{
				constraint = layoutCache.givenMeasureConstraint || new Size(Infinity, Infinity);
			}
			else if (!(constraint instanceof Size))
			{
				throw new Error("Parameter constraint must be of type " + Class.getName(Size) + ".");
			}
			else
			{
				var constraintWidth = (constraint.width < Infinity) ? Math.max(Math.floor(constraint.width), 0) : Infinity;
				var constraintHeight = (constraint.height < Infinity) ? Math.max(Math.floor(constraint.height), 0) : Infinity;
				constraint = layoutCache.givenMeasureConstraint = new Size(constraintWidth, constraintHeight);
			}

			if (!this.inFlow())
			{
				if (layoutCache.hasMeasure)
				{
					layoutCache.hasMeasure = false;
					this.invalidate(this.layoutPass);
				}
				this.markValid(this.measurePass);
				return new Size();
			}

			if (this.isValid(this.measurePass))
			{
				if (constraint.equals(layoutCache.prevMeasureConstraint))
					return new Size(layoutCache.measuredWidth, layoutCache.measuredHeight);

				this.invalidate(this.measurePass);
			}

			this.invalidate(this.layoutPass);

			LayoutHelper.computeBoxSizing();

			if (!layoutCache.hasComputedStyles)
			{
				LayoutHelper.readComputedStyles(this, layoutCache);
				layoutCache.hasComputedStyles = true;
			}

			var width = this.getInternal(this.width);
			var contentMinWidth = this.getInternal(this.minWidth);
			var contentMaxWidth = this.getInternal(this.maxWidth);
			if (isNaN(width))
				contentMaxWidth = Math.max(contentMaxWidth, contentMinWidth);
			else
				contentMinWidth = contentMaxWidth = NumberUtil.maxMin(width, contentMaxWidth, contentMinWidth);

			var height = this.getInternal(this.height);
			var contentMinHeight = this.getInternal(this.minHeight);
			var contentMaxHeight = this.getInternal(this.maxHeight);
			if (isNaN(height))
				contentMaxHeight = Math.max(contentMaxHeight, contentMinHeight);
			else
				contentMinHeight = contentMaxHeight = NumberUtil.maxMin(height, contentMaxHeight, contentMinHeight);

			var margin = this.getInternal(this.margin);
			var padding = this.getInternal(this.padding);
			var borderWidth = this.getInternal(this.borderWidth);
			var marginWidth = margin.left + margin.right;
			var marginHeight = margin.top + margin.bottom;
			var paddingBorderWidth = padding.left + padding.right + borderWidth.left + borderWidth.right;
			var paddingBorderHeight = padding.top + padding.bottom + borderWidth.top + borderWidth.bottom;

			if (this.getInternal(this.boxSizing) === "borderBox")
			{
				contentMinWidth = Math.max(contentMinWidth - paddingBorderWidth, 0);
				contentMaxWidth = Math.max(contentMaxWidth - paddingBorderWidth, 0);
				contentMinHeight = Math.max(contentMinHeight - paddingBorderHeight, 0);
				contentMaxHeight = Math.max(contentMaxHeight - paddingBorderHeight, 0);
			}

			var contentConstraintWidth = NumberUtil.maxMin(constraint.width - marginWidth - paddingBorderWidth, contentMaxWidth, contentMinWidth);
			var contentConstraintHeight = NumberUtil.maxMin(constraint.height - marginHeight - paddingBorderHeight, contentMaxHeight, contentMinHeight);

			var contentMeasuredSize = this.measureOverride(new Size(contentConstraintWidth, contentConstraintHeight));
			if (contentMeasuredSize == null)
				throw new Error("Value returned from measureOverride must be non-null.");
			if (!(contentMeasuredSize instanceof Size))
				throw new Error("Value returned from measureOverride must be of type " + Class.getName(Size) + ".");
			if (!contentMeasuredSize.isFinite())
				throw new Error("Size returned from measureOverride must be finite.");

			var contentMeasuredWidth = Math.max(Math.ceil(contentMeasuredSize.width), contentMinWidth);
			var contentMeasuredHeight = Math.max(Math.ceil(contentMeasuredSize.height), contentMinHeight);

			var measuredWidth = Math.max(Math.min(contentMeasuredWidth, contentMaxWidth) + marginWidth + paddingBorderWidth, 0);
			var measuredHeight = Math.max(Math.min(contentMeasuredHeight, contentMaxHeight) + marginHeight + paddingBorderHeight, 0);

			layoutCache.prevMeasureConstraint = constraint;
			layoutCache.margin = margin;
			layoutCache.padding = padding;
			layoutCache.borderWidth = borderWidth;
			layoutCache.marginWidth = marginWidth;
			layoutCache.marginHeight = marginHeight;
			layoutCache.paddingBorderWidth = paddingBorderWidth;
			layoutCache.paddingBorderHeight = paddingBorderHeight;
			layoutCache.contentMinWidth = contentMinWidth;
			layoutCache.contentMinHeight = contentMinHeight;
			layoutCache.contentMaxWidth = contentMaxWidth;
			layoutCache.contentMaxHeight = contentMaxHeight;
			layoutCache.contentMeasuredWidth = contentMeasuredWidth;
			layoutCache.contentMeasuredHeight = contentMeasuredHeight;
			layoutCache.measuredWidth = measuredWidth;
			layoutCache.measuredHeight = measuredHeight;
			layoutCache.hasMeasure = true;

			this.markValid(this.measurePass);

			return new Size(measuredWidth, measuredHeight);
		};

		this.layout = function(bounds)
		{
			var layoutCache = this._layoutCache;
			var autoResizeInfo = layoutCache.autoResizeInfo;
			if (autoResizeInfo)
			{
				bounds = new Rectangle(0, 0, layoutCache.measuredWidth, layoutCache.measuredHeight);
				if (autoResizeInfo.width >= 0)
					bounds.width = autoResizeInfo.width;
				if (autoResizeInfo.height >= 0)
					bounds.height = autoResizeInfo.height;
			}
			else if (bounds == null)
			{
				bounds = layoutCache.givenLayoutBounds || new Rectangle(0, 0, layoutCache.measuredWidth, layoutCache.measuredHeight);
			}
			else if (!(bounds instanceof Rectangle))
			{
				throw new Error("Parameter bounds must be of type " + Class.getName(Rectangle) + ".");
			}
			else if (!bounds.isFinite())
			{
				throw new Error("Parameter bounds must be finite.");
			}
			else
			{
				var layoutX1 = Math.round(bounds.x);
				var layoutY1 = Math.round(bounds.y);
				var layoutX2 = Math.round(bounds.x + bounds.width);
				var layoutY2 = Math.round(bounds.y + bounds.height);
				bounds = layoutCache.givenLayoutBounds = new Rectangle(layoutX1, layoutY1, Math.max(layoutX2 - layoutX1, 0), Math.max(layoutY2 - layoutY1, 0));
			}

			if (!layoutCache.hasMeasure)
			{
				if (layoutCache.hasLayout)
				{
					layoutCache.hasLayout = false;
					this.invalidate(this.offsetPass);
				}
				this.markValid(this.layoutPass);
				return;
			}

			if (this.isValid(this.layoutPass))
			{
				var prevLayoutBounds = layoutCache.prevLayoutBounds;
				if ((bounds.width === prevLayoutBounds.width) && (bounds.height === prevLayoutBounds.height))
				{
					if ((bounds.x !== prevLayoutBounds.x) || (bounds.y !== prevLayoutBounds.y))
					{
						layoutCache.prevLayoutBounds = bounds;
						layoutCache.layoutX = bounds.x;
						layoutCache.layoutY = bounds.y;
						this.invalidate(this.offsetPass);
					}
					return;
				}

				this.invalidate(this.layoutPass);
			}

			this.invalidate(this.offsetPass);

			var contentLayoutWidth;
			if (!isNaN(this.getInternal(this.alignmentX)))
				contentLayoutWidth = layoutCache.contentMeasuredWidth;
			else
				contentLayoutWidth = NumberUtil.maxMin(bounds.width - layoutCache.marginWidth - layoutCache.paddingBorderWidth, layoutCache.contentMaxWidth, layoutCache.contentMeasuredWidth);

			var contentLayoutHeight;
			if (!isNaN(this.getInternal(this.alignmentY)))
				contentLayoutHeight = layoutCache.contentMeasuredHeight;
			else
				contentLayoutHeight = NumberUtil.maxMin(bounds.height - layoutCache.marginHeight - layoutCache.paddingBorderHeight, layoutCache.contentMaxHeight, layoutCache.contentMeasuredHeight);

			var contentComputedBounds = this.layoutOverride(new Rectangle(layoutCache.padding.left, layoutCache.padding.top, contentLayoutWidth, contentLayoutHeight));
			if (contentComputedBounds == null)
				throw new Error("Value returned from layoutOverride must be non-null.");
			if (!(contentComputedBounds instanceof Rectangle))
				throw new Error("Value returned from layoutOverride must be of type " + Class.getName(Rectangle) + ".");
			if (!contentComputedBounds.isFinite())
				throw new Error("Rectangle returned from layoutOverride must be finite.");

			var computedWidth = NumberUtil.minMax(Math.ceil(contentComputedBounds.width), layoutCache.contentMinWidth, layoutCache.contentMaxWidth) + layoutCache.paddingBorderWidth;
			var computedHeight = NumberUtil.minMax(Math.ceil(contentComputedBounds.height), layoutCache.contentMinHeight, layoutCache.contentMaxHeight) + layoutCache.paddingBorderHeight;

			layoutCache.prevLayoutBounds = bounds;
			layoutCache.layoutX = bounds.x;
			layoutCache.layoutY = bounds.y;
			layoutCache.layoutWidth = bounds.width;
			layoutCache.layoutHeight = bounds.height;
			layoutCache.computedWidth = computedWidth;
			layoutCache.computedHeight = computedHeight;
			layoutCache.hasLayout = true;

			this.markValid(this.layoutPass);
		};

		this.offset = function()
		{
			var layoutCache = this._layoutCache;
			if (!layoutCache.hasLayout)
			{
				layoutCache.hasOffset = false;
				this.markValid(this.offsetPass);
				return;
			}

			if (this.isValid(this.offsetPass))
				return;

			var margin = layoutCache.margin;
			var padding = layoutCache.padding;
			var borderWidth = layoutCache.borderWidth;
			var computedWidth = layoutCache.computedWidth;
			var computedHeight = layoutCache.computedHeight;

			var computedX = this.getInternal(this.x);
			if (isNaN(computedX))
			{
				var totalWidth = computedWidth + layoutCache.marginWidth;
				var alignmentX = this.getInternal(this.alignmentX);
				if (isNaN(alignmentX))
					alignmentX = (totalWidth > layoutCache.layoutWidth) ? 0 : 0.5;

				computedX = layoutCache.layoutX + margin.left;
				computedX += (layoutCache.layoutWidth - totalWidth) * alignmentX;
				computedX += this.getInternal(this.offsetX);
			}

			var computedY = this.getInternal(this.y);
			if (isNaN(computedY))
			{
				var totalHeight = computedHeight + layoutCache.marginHeight;
				var alignmentY = this.getInternal(this.alignmentY);
				if (isNaN(alignmentY))
					alignmentY = (totalHeight > layoutCache.layoutHeight) ? 0 : 0.5;

				computedY = layoutCache.layoutY + margin.top;
				computedY += (layoutCache.layoutHeight - totalHeight) * alignmentY;
				computedY += this.getInternal(this.offsetY);
			}

			computedX = Math.round(computedX);
			computedY = Math.round(computedY);

			layoutCache.computedX = computedX;
			layoutCache.computedY = computedY;
			layoutCache.hasOffset = true;

			var isContentBox = (layoutCache.boxSizingInfo && (layoutCache.boxSizingInfo.nativeBoxSizing === "contentBox"));
			var style = this.element.style;
			var layoutStyle = this._layoutStyle;
			var newLayoutStyle =
			{
				left: (computedX - margin.left) + "px",
				top: (computedY - margin.top) + "px",
				width: (isContentBox ? (computedWidth - layoutCache.paddingBorderWidth) : computedWidth) + "px",
				height: (isContentBox ? (computedHeight - layoutCache.paddingBorderHeight) : computedHeight) + "px",
				margin: margin.top + "px " + margin.right + "px " + margin.bottom + "px " + margin.left + "px",
				padding: padding.top + "px " + padding.right + "px " + padding.bottom + "px " + padding.left + "px",
				borderWidth: borderWidth.top + "px " + borderWidth.right + "px " + borderWidth.bottom + "px " + borderWidth.left + "px"
			};

			for (var p in layoutStyle)
			{
				if (layoutStyle.hasOwnProperty(p) && (layoutStyle[p] !== newLayoutStyle[p]))
					style[p] = layoutStyle[p] = newLayoutStyle[p];
			}

			if (layoutCache.isLayoutPending)
			{
				layoutCache.isLayoutPending = false;
				this.removeClass(_LAYOUT_PENDING);
			}

			this.markValid(this.offsetPass);
		};

		this.getLayoutChildren = function()
		{
			var children = this.getChildren();
			for (var i = children.length - 1; i >= 0; i--)
			{
				if (!(children[i] instanceof LayoutElement))
					children.splice(i, 1);
			}
			return children;
		};

		// Protected Methods

		this.measureOverride = function(contentConstraint)
		{
			return new Size();
		};

		this.layoutOverride = function(contentBounds)
		{
			return contentBounds;
		};

		this.addChildOverride = function(child, index, siblings)
		{
			base.addChildOverride.call(this, child, index, siblings);

			if (!(child instanceof LayoutElement))
				child.addClass(_CHILD);
		};

		this.removeChildOverride = function(child, index, siblings)
		{
			if (!(child instanceof LayoutElement))
				child.removeClass(_CHILD);

			base.removeChildOverride.call(this, child, index, siblings);
		};

		this.onAdded = function(parent)
		{
			if (parent instanceof LayoutElement)
				this._layoutParent = parent;

			this._layoutCache.givenMeasureConstraint = null;
			this._layoutCache.givenLayoutBounds = null;
		};

		this.onRemoved = function(parent)
		{
			this._layoutParent = null;
		};

		this.onAddedToDocument = function(document)
		{
			var layoutCache = this._layoutCache;

			if (!layoutCache.boxSizingInfo)
				layoutCache.boxSizingInfo = LayoutHelper.prepareBoxSizing(this);

			if (layoutCache.hasComputedStyles)
			{
				var style = this.element.style;
				var layoutStyle = this._layoutStyle;
				if (!layoutCache.hasExplicitMargin)
				{
					style.margin = layoutStyle.margin = "";
					layoutCache.hasComputedStyles = false;
				}
				if (!layoutCache.hasExplicitPadding)
				{
					style.padding = layoutStyle.padding = "";
					layoutCache.hasComputedStyles = false;
				}
				if (!layoutCache.hasExplicitBorderWidth)
				{
					style.borderWidth = layoutStyle.borderWidth = "";
					layoutCache.hasComputedStyles = false;
				}
			}

			if (!this.parent())
			{
				layoutCache.givenMeasureConstraint = null;
				layoutCache.givenLayoutBounds = null;
			}

			if (!this._layoutParent)
				this.addClass(_ROOT);
		};

		this.onRemovedFromDocument = function(document)
		{
			if (!this._layoutParent)
				this.removeClass(_ROOT);
		};

		this.onAddedToFlow = function()
		{
			var layoutCache = this._layoutCache;
			if (!layoutCache.isLayoutPending)
			{
				layoutCache.isLayoutPending = true;
				this.addClass(_LAYOUT_PENDING);
			}

			if (!this._layoutParent && !layoutCache.autoResizeInfo)
			{
				var autoResize = this.getInternal(this.autoResize);
				if (autoResize !== "none")
					layoutCache.autoResizeInfo = LayoutHelper.setupAutoResize(this, autoResize);
			}

			this.invalidate(this.measurePass);
		};

		this.onRemovedFromFlow = function()
		{
			var layoutCache = this._layoutCache;
			if (layoutCache.autoResizeInfo)
			{
				LayoutHelper.teardownAutoResize(layoutCache.autoResizeInfo);
				layoutCache.autoResizeInfo = null;
			}

			this.invalidate(this.measurePass);
		};

		// Private Nested Classes

		var LayoutCache = Class(Object, function(LayoutCache, base)
		{

			// Public Properties

			this.autoResizeInfo = null;
			this.boxSizingInfo = null;
			this.givenMeasureConstraint = null;
			this.givenLayoutBounds = null;
			this.prevMeasureConstraint = new Size();
			this.prevLayoutBounds = new Rectangle();
			this.margin = new Outline();
			this.padding = new Outline();
			this.borderWidth = new Outline();
			this.marginWidth = 0;
			this.marginHeight = 0;
			this.paddingBorderWidth = 0;
			this.paddingBorderHeight = 0;
			this.contentMinWidth = 0;
			this.contentMinHeight = 0;
			this.contentMaxWidth = Infinity;
			this.contentMaxHeight = Infinity;
			this.contentMeasuredWidth = 0;
			this.contentMeasuredHeight = 0;
			this.measuredWidth = 0;
			this.measuredHeight = 0;
			this.layoutX = 0;
			this.layoutY = 0;
			this.layoutWidth = 0;
			this.layoutHeight = 0;
			this.computedX = 0;
			this.computedY = 0;
			this.computedWidth = 0;
			this.computedHeight = 0;
			this.hasMeasure = false;
			this.hasLayout = false;
			this.hasOffset = false;
			this.hasExplicitMargin = false;
			this.hasExplicitPadding = false;
			this.hasExplicitBorderWidth = false;
			this.hasComputedStyles = false;
			this.isLayoutPending = false;

			// Constructor

			this.constructor = function()
			{
				// noop
			};

			// Public Methods

			this.getMeasuredSize = function()
			{
				if (this.hasMeasure)
					return new Size(this.measuredWidth, this.measuredHeight);

				return new Size();
			};

			this.getLayoutBounds = function()
			{
				if (this.hasLayout)
					return new Rectangle(this.layoutX, this.layoutY, this.layoutWidth, this.layoutHeight);

				return new Rectangle();
			};

			this.getComputedBounds = function()
			{
				if (this.hasLayout && this.hasOffset)
					return new Rectangle(this.computedX, this.computedY, this.computedWidth, this.computedHeight);

				return new Rectangle();
			};

		});

		var LayoutHelper = Class(function(LayoutHelper)
		{

			// Private Static Constants

			var _PARENT_AUTO_WIDTH = CSS.formatClassName(module.id, "parent", "autoWidth");
			var _PARENT_AUTO_HEIGHT = CSS.formatClassName(module.id, "parent", "autoHeight");

			// Private Static Properties

			var _boxSizingMap = {};
			var _boxSizingList = [];

			// Public Static Methods

			LayoutHelper.prepareBoxSizing = function(element)
			{
				var domElement = element.element;
				var tagName = (domElement.tagName || "div").toLowerCase();
				var type = (tagName === "input") ? (domElement.type || "").toLowerCase() : null;
				var key = type ? (tagName + " " + type) : tagName;
				var boxSizingInfo = ObjectUtil.get(_boxSizingMap, key);
				if (boxSizingInfo)
					return boxSizingInfo;

				boxSizingInfo = { tagName: tagName, type: type, nativeBoxSizing: null, stub: null };
				_boxSizingMap[key] = boxSizingInfo;
				_boxSizingList.push(boxSizingInfo);

				return boxSizingInfo;
			};

			LayoutHelper.computeBoxSizing = function()
			{
				if (_boxSizingList.length === 0)
					return;

				var boxSizingList = _boxSizingList;
				_boxSizingList = [];

				var boxSizingCount = boxSizingList.length;
				var boxSizingInfo;
				var document = Global.document;
				var body = document.body;
				var stub;
				var style;
				var i;

				// create stubs for computing boxSizing
				for (i = 0; i < boxSizingCount; i++)
				{
					boxSizingInfo = boxSizingList[i];
					stub = boxSizingInfo.stub = document.createElement(boxSizingInfo.tagName);
					if (boxSizingInfo.type)
						stub.type = boxSizingInfo.type;

					style = stub.style;
					if (style)
						style.cssText = "position:absolute;display:block;width:100px;min-width:0px;max-width:none;margin:0px;padding:5px;border:0px;overflow:hidden;";

					body.appendChild(stub);
				}

				// compute boxSizing
				for (i = 0; i < boxSizingCount; i++)
				{
					boxSizingInfo = boxSizingList[i];
					boxSizingInfo.nativeBoxSizing = (boxSizingInfo.stub.offsetWidth === 100) ? "borderBox" : "contentBox";
				}

				// destroy stubs
				for (i = 0; i < boxSizingCount; i++)
				{
					boxSizingInfo = boxSizingList[i];
					stub = boxSizingInfo.stub;
					boxSizingInfo.stub = null;
					if (stub.parentNode)
						stub.parentNode.removeChild(stub);
				}
			};

			LayoutHelper.readComputedStyles = function(element, layoutCache)
			{
				if (layoutCache.hasExplicitMargin && layoutCache.hasExplicitPadding && layoutCache.hasExplicitBorderWidth)
					return;

				var domElement = element.element;
				var defaultView = Global.document && Global.document.defaultView;
				var computedStyle = (defaultView && defaultView.getComputedStyle && defaultView.getComputedStyle(domElement, null)) || domElement.currentStyle;
				if (!computedStyle)
					return;

				if (!layoutCache.hasExplicitMargin)
				{
					var margin = new Outline(parseInt(computedStyle.marginTop), parseInt(computedStyle.marginRight), parseInt(computedStyle.marginBottom), parseInt(computedStyle.marginLeft));
					margin.top = ((margin.top > -Infinity) && (margin.top < Infinity)) ? margin.top : 0;
					margin.right = ((margin.right > -Infinity) && (margin.right < Infinity)) ? margin.right : 0;
					margin.bottom = ((margin.bottom > -Infinity) && (margin.bottom < Infinity)) ? margin.bottom : 0;
					margin.left = ((margin.left > -Infinity) && (margin.left < Infinity)) ? margin.left : 0;
					element.setInternal(element.margin, margin);
				}

				if (!layoutCache.hasExplicitPadding)
				{
					var padding = new Outline(parseInt(computedStyle.paddingTop), parseInt(computedStyle.paddingRight), parseInt(computedStyle.paddingBottom), parseInt(computedStyle.paddingLeft));
					padding.top = (padding.top < Infinity) ? Math.max(padding.top, 0) : 0;
					padding.right = (padding.right < Infinity) ? Math.max(padding.right, 0) : 0;
					padding.bottom = (padding.bottom < Infinity) ? Math.max(padding.bottom, 0) : 0;
					padding.left = (padding.left < Infinity) ? Math.max(padding.left, 0) : 0;
					element.setInternal(element.padding, padding);
				}

				if (!layoutCache.hasExplicitBorderWidth)
				{
					var borderWidth = new Outline(parseInt(computedStyle.borderTopWidth), parseInt(computedStyle.borderRightWidth), parseInt(computedStyle.borderBottomWidth), parseInt(computedStyle.borderLeftWidth));
					borderWidth.top = (borderWidth.top < Infinity) ? Math.max(borderWidth.top, 0) : 0;
					borderWidth.right = (borderWidth.right < Infinity) ? Math.max(borderWidth.right, 0) : 0;
					borderWidth.bottom = (borderWidth.bottom < Infinity) ? Math.max(borderWidth.bottom, 0) : 0;
					borderWidth.left = (borderWidth.left < Infinity) ? Math.max(borderWidth.left, 0) : 0;
					element.setInternal(element.borderWidth, borderWidth);
				}
			};

			LayoutHelper.setupAutoResize = function(element, autoResize)
			{
				var parent = element.parent();
				if (!parent)
				{
					var parentNode = element.element.parentNode;
					if (!parentNode)
						return null;

					parent = new AutoResizeProxy(parentNode);
				}

				var autoResizeInfo = { element: element, parent: parent, width: -1, height: -1, paddingWidth: 0, paddingHeight: 0, handler: null };

				if ((autoResize === "width") || (autoResize === "both"))
				{
					autoResizeInfo.width = 0;
					parent.addClass(_PARENT_AUTO_WIDTH);
				}

				if ((autoResize === "height") || (autoResize === "both"))
				{
					autoResizeInfo.height = 0;
					parent.addClass(_PARENT_AUTO_HEIGHT);
				}

				return autoResizeInfo;
			};

			LayoutHelper.setupAutoResizeHandler = function(autoResizeInfo)
			{
				var parent = autoResizeInfo.parent;
				var defaultView = Global.document && Global.document.defaultView;
				var computedStyle = (defaultView && defaultView.getComputedStyle && defaultView.getComputedStyle(parent.element, null)) || parent.element.currentStyle;
				if (computedStyle)
				{
					if (autoResizeInfo.width >= 0)
					{
						var paddingWidth = parseInt(computedStyle.paddingLeft) + parseInt(computedStyle.paddingRight);
						autoResizeInfo.paddingWidth = (paddingWidth < Infinity) ? Math.max(paddingWidth, 0) : 0;
					}

					if (autoResizeInfo.height >= 0)
					{
						var paddingHeight = parseInt(computedStyle.paddingTop) + parseInt(computedStyle.paddingBottom);
						autoResizeInfo.paddingHeight = (paddingHeight < Infinity) ? Math.max(paddingHeight, 0) : 0;
					}
				}

				if (autoResizeInfo.width >= 0)
					autoResizeInfo.width = Math.max(parent.element.clientWidth - autoResizeInfo.paddingWidth, 0);

				if (autoResizeInfo.height >= 0)
					autoResizeInfo.height = Math.max(parent.element.clientHeight - autoResizeInfo.paddingHeight, 0);

				autoResizeInfo.handler = FunctionUtil.bind(_autoResizeHandler, null, autoResizeInfo);
				autoResizeInfo.element.listenOn(parent, parent.resize, autoResizeInfo.handler, null, Infinity);
			};

			LayoutHelper.teardownAutoResize = function(autoResizeInfo)
			{
				var parent = autoResizeInfo.parent;
				if (autoResizeInfo.handler)
				{
					autoResizeInfo.element.listenOff(parent, parent.resize, autoResizeInfo.handler, null);
					autoResizeInfo.handler = null;
				}

				if (autoResizeInfo.width >= 0)
					parent.removeClass(_PARENT_AUTO_WIDTH);

				if (autoResizeInfo.height >= 0)
					parent.removeClass(_PARENT_AUTO_HEIGHT);

				autoResizeInfo.parent = null;
				autoResizeInfo.element = null;
			};

			// Private Static Methods

			var _autoResizeHandler = function(autoResizeInfo, e)
			{
				if (autoResizeInfo.width >= 0)
				{
					var width = Math.max(autoResizeInfo.parent.element.clientWidth - autoResizeInfo.paddingWidth, 0);
					if (autoResizeInfo.width !== width)
					{
						autoResizeInfo.width = width;
						autoResizeInfo.element.invalidate(autoResizeInfo.element.measurePass);
					}
				}

				if (autoResizeInfo.height >= 0)
				{
					var height = Math.max(autoResizeInfo.parent.element.clientHeight - autoResizeInfo.paddingHeight, 0);
					if (autoResizeInfo.height !== height)
					{
						autoResizeInfo.height = height;
						autoResizeInfo.element.invalidate(autoResizeInfo.element.measurePass);
					}
				}
			};

		});

		var AutoResizeProxy = Class(Element, function(AutoResizeProxy, base)
		{

			// Constructor

			this.constructor = function(domElement)
			{
				this.element = domElement;

				base.constructor.call(this);

				this.unbindDOMElement();
			};

			// Public Methods

			this.on = function(event, listener, scope, priority)
			{
				this.bindDOMElement(this.element);

				base.on.call(this, event, listener, scope, priority);

				this.unbindDOMElement();

				return this;
			};

			// Protected Methods

			this.createElementOverride = function(tagName)
			{
				return this.element;
			};

			this.getClassNamesOverride = function()
			{
				return "";
			};

		});

	});

});
