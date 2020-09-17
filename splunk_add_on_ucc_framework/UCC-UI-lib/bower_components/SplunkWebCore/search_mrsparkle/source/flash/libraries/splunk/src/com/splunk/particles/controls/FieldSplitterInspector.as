package com.splunk.particles.controls
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.PropertyChangedEvent;
	import com.jasongatt.core.ValidatePass;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Margin;
	import com.jasongatt.layout.Size;
	import com.jasongatt.utils.AlphabeticComparator;
	import com.jasongatt.utils.IComparator;
	import com.jasongatt.utils.NaturalComparator;
	import com.jasongatt.utils.NumericComparator;
	import com.jasongatt.utils.SequentialNumericComparator;
	import com.splunk.controls.DropDownList;
	import com.splunk.controls.Label;
	import com.splunk.controls.ListOption;
	import com.splunk.controls.NumericStepper;
	import com.splunk.particles.renderers.AbstractRenderer;
	import com.splunk.particles.renderers.LabelRenderer;
	import com.splunk.particles.renderers.SimpleRenderer;
	import com.splunk.particles.renderers.SwatchRenderer;
	import com.splunk.properties.PropertyManager;
	import flash.display.DisplayObject;
	import flash.display.Graphics;
	import flash.events.Event;
	import flash.geom.Rectangle;

	public class FieldSplitterInspector extends LayoutSprite
	{

		// Private Properties

		private var _target:ObservableProperty;
		private var _color:ObservableProperty;

		private var _propertyManager:PropertyManager;

		private var _nameOptionMap:Object;
		private var _nameOptionList:Array;
		private var _nameOptionComparator:NameOptionComparator;
		private var _sortOptionMap:Object;
		private var _rendererOptionMap:Object;
		private var _emitRendererOptionMap:Object;

		private var _priorityLabel:Label;
		private var _priorityStepper:NumericStepper;
		private var _fieldNameLabel:Label;
		private var _fieldNameList:DropDownList;
		private var _fieldSortLabel:Label;
		private var _fieldSortList:DropDownList;
		private var _fieldRendererLabel:Label;
		private var _fieldRendererList:DropDownList;
		private var _emitFieldLabel:Label;
		private var _emitFieldList:DropDownList;
		private var _emitRendererLabel:Label;
		private var _emitRendererList:DropDownList;

		// Constructor

		public function FieldSplitterInspector(propertyManager:PropertyManager = null)
		{
			this._target = new ObservableProperty(this, "target", FieldSplitter, null, this._target_changed);
			this._color = new ObservableProperty(this, "color", uint, 0x000000, this.invalidates(LayoutSprite.MEASURE));

			this._propertyManager = propertyManager;

			this._nameOptionMap = new Object();
			this._nameOptionList = new Array();
			this._nameOptionComparator = new NameOptionComparator();

			this._sortOptionMap = new Object();
			this._sortOptionMap["natural"] = new ListOption("natural", "natural");
			this._sortOptionMap["alphabetic"] = new ListOption("alphabetic", "alphabetic");
			this._sortOptionMap["numeric"] = new ListOption("numeric", "numeric");
			this._sortOptionMap["sequentialNumeric"] = new ListOption("sequentialNumeric", "sequential numeric");
			this._sortOptionMap["none"] = new ListOption("none", "arrival order");

			this._rendererOptionMap = new Object();
			this._rendererOptionMap["labels"] = new ListOption("@labelElementRenderer", "labels");
			this._rendererOptionMap["histogram"] = new ListOption("@histogramElementRenderer", "histogram");
			this._rendererOptionMap["images"] = new ListOption("@swatchElementRenderer", "images");
			this._rendererOptionMap["histogramLabels"] = new ListOption("@histogramLabelElementRenderer", "histogram and labels");
			this._rendererOptionMap["imagesLabels"] = new ListOption("@swatchLabelElementRenderer", "images and labels");
			this._rendererOptionMap["imagesLabelsHistogram"] = new ListOption("@swatchLabelHistogramElementRenderer", "images, labels, and histogram");

			this._emitRendererOptionMap = new Object();
			this._emitRendererOptionMap["dots"] = new ListOption("simple", "dots");
			this._emitRendererOptionMap["labels"] = new ListOption("label", "labels");
			this._emitRendererOptionMap["images"] = new ListOption("swatch", "images");

			this._priorityLabel = new Label();
			this._priorityLabel.margin = new Margin(2, 2, 5, 5);
			this._priorityLabel.alignmentY = 0.5;
			this._priorityLabel.text = "Collect priority";

			this._priorityStepper = new NumericStepper();
			this._priorityStepper.width = 50;
			this._priorityStepper.margin = new Margin(2, 2, 5, 5);
			this._priorityStepper.alignmentY = 0.5;
			this._priorityStepper.addEventListener(NumericStepper.VALUE_CHANGED, this._priorityStepper_valueChanged);

			this._fieldNameLabel = new Label();
			this._fieldNameLabel.margin = new Margin(2, 2, 5, 5);
			this._fieldNameLabel.alignmentY = 0.5;
			this._fieldNameLabel.text = "Split by field";

			this._fieldNameList = new DropDownList();
			this._fieldNameList.margin = new Margin(2, 2, 5, 5);
			this._fieldNameList.alignmentY = 0.5;
			this._fieldNameList.prompt = "select field";
			this._fieldNameList.addEventListener(DropDownList.SELECTION_CHANGED, this._fieldNameList_selectionChanged);

			this._fieldSortLabel = new Label();
			this._fieldSortLabel.margin = new Margin(2, 2, 5, 5);
			this._fieldSortLabel.alignmentY = 0.5;
			this._fieldSortLabel.text = "Sort values as";

			this._fieldSortList = new DropDownList();
			this._fieldSortList.margin = new Margin(2, 2, 5, 5);
			this._fieldSortList.alignmentY = 0.5;
			this._fieldSortList.prompt = "select sort";
			this._fieldSortList.options = [ this._sortOptionMap["natural"], this._sortOptionMap["alphabetic"], this._sortOptionMap["numeric"], this._sortOptionMap["sequentialNumeric"], this._sortOptionMap["none"] ];
			this._fieldSortList.addEventListener(DropDownList.SELECTION_CHANGED, this._fieldSortList_selectionChanged);

			this._fieldRendererLabel = new Label();
			this._fieldRendererLabel.margin = new Margin(2, 2, 5, 5);
			this._fieldRendererLabel.alignmentY = 0.5;
			this._fieldRendererLabel.text = "Render values as";

			this._fieldRendererList = new DropDownList();
			this._fieldRendererList.margin = new Margin(2, 2, 5, 5);
			this._fieldRendererList.alignmentY = 0.5;
			this._fieldRendererList.prompt = "select renderer";
			this._fieldRendererList.options = [ this._rendererOptionMap["labels"], this._rendererOptionMap["histogram"], this._rendererOptionMap["images"], this._rendererOptionMap["histogramLabels"], this._rendererOptionMap["imagesLabels"], this._rendererOptionMap["imagesLabelsHistogram"] ];
			this._fieldRendererList.addEventListener(DropDownList.SELECTION_CHANGED, this._fieldRendererList_selectionChanged);

			this._emitFieldLabel = new Label();
			this._emitFieldLabel.margin = new Margin(2, 2, 5, 5);
			this._emitFieldLabel.alignmentY = 0.5;
			this._emitFieldLabel.text = "Emit by field";

			this._emitFieldList = new DropDownList();
			this._emitFieldList.margin = new Margin(2, 2, 5, 5);
			this._emitFieldList.alignmentY = 0.5;
			this._emitFieldList.prompt = "select field";
			this._emitFieldList.addEventListener(DropDownList.SELECTION_CHANGED, this._emitFieldList_selectionChanged);

			this._emitRendererLabel = new Label();
			this._emitRendererLabel.margin = new Margin(2, 2, 5, 5);
			this._emitRendererLabel.alignmentY = 0.5;
			this._emitRendererLabel.text = "Render particles as";

			this._emitRendererList = new DropDownList();
			this._emitRendererList.margin = new Margin(2, 2, 5, 5);
			this._emitRendererList.alignmentY = 0.5;
			this._emitRendererList.prompt = "select renderer";
			this._emitRendererList.options = [ this._emitRendererOptionMap["dots"], this._emitRendererOptionMap["labels"], this._emitRendererOptionMap["images"] ];
			this._emitRendererList.addEventListener(DropDownList.SELECTION_CHANGED, this._emitRendererList_selectionChanged);

			this.visible = false;

			this.addChild(this._priorityLabel);
			this.addChild(this._priorityStepper);
			this.addChild(this._fieldNameLabel);
			this.addChild(this._fieldNameList);
			this.addChild(this._fieldSortLabel);
			this.addChild(this._fieldSortList);
			this.addChild(this._fieldRendererLabel);
			this.addChild(this._fieldRendererList);
			this.addChild(this._emitFieldLabel);
			this.addChild(this._emitFieldList);
			this.addChild(this._emitRendererLabel);
			this.addChild(this._emitRendererList);
		}

		// Public Getters/Setters

		public function get target() : FieldSplitter
		{
			return this._target.value;
		}
		public function set target(value:FieldSplitter) : void
		{
			this._target.value = value;
		}

		public function get color() : uint
		{
			return this._color.value;
		}
		public function set color(value:uint) : void
		{
			this._color.value = value;
		}

		// Public Methods

		public function addFields(fieldNames:Array) : void
		{
			if (!fieldNames)
				return;

			var nameOptionsChanged:Boolean = false;

			var nameOptionMap:Object = this._nameOptionMap;
			var nameOptionList:Array = this._nameOptionList;
			var fieldName:String;
			var option:ListOption;
			for each (fieldName in fieldNames)
			{
				if (fieldName)
				{
					option = nameOptionMap[fieldName];
					if (!option)
					{
						option = nameOptionMap[fieldName] = new ListOption(fieldName, fieldName);
						nameOptionList.push(option);
						nameOptionsChanged = true;
					}
				}
			}

			if (!nameOptionsChanged)
				return;

			nameOptionList.sort(this._nameOptionComparator.compare);

			this._fieldNameList.options = nameOptionList;
			this._emitFieldList.options = nameOptionList;
		}

		// Protected Methods

		protected override function measureOverride(availableSize:Size) : Size
		{
			var color:uint = this._color.value;

			this._priorityLabel.textColor = color;
			this._priorityLabel.measure(availableSize);
			this._priorityStepper.measure(availableSize);

			this._fieldNameLabel.textColor = color;
			this._fieldNameLabel.measure(availableSize);
			this._fieldNameList.measure(availableSize);

			this._fieldSortLabel.textColor = color;
			this._fieldSortLabel.measure(availableSize);
			this._fieldSortList.measure(availableSize);

			this._fieldRendererLabel.textColor = color;
			this._fieldRendererLabel.measure(availableSize);
			this._fieldRendererList.measure(availableSize);

			this._emitFieldLabel.textColor = color;
			this._emitFieldLabel.measure(availableSize);
			this._emitFieldList.measure(availableSize);

			this._emitRendererLabel.textColor = color;
			this._emitRendererLabel.measure(availableSize);
			this._emitRendererList.measure(availableSize);

			var width1:Number = this._priorityLabel.measuredWidth;
			var width2:Number = this._priorityStepper.measuredWidth;
			var width3:Number = Math.max(this._fieldNameLabel.measuredWidth, this._fieldSortLabel.measuredWidth, this._fieldRendererLabel.measuredWidth);
			var width4:Number = Math.max(this._fieldNameList.measuredWidth, this._fieldSortList.measuredWidth, this._fieldRendererList.measuredWidth);
			var width5:Number = Math.max(this._emitFieldLabel.measuredWidth, this._emitRendererLabel.measuredWidth);
			var width6:Number = Math.max(this._emitFieldList.measuredWidth, this._emitRendererList.measuredWidth);

			var height1:Number = Math.max(this._priorityLabel.measuredHeight, this._priorityStepper.measuredHeight);
			var height2:Number = Math.max(this._fieldNameLabel.measuredHeight, this._fieldNameList.measuredHeight);
			var height3:Number = Math.max(this._fieldSortLabel.measuredHeight, this._fieldSortList.measuredHeight);
			var height4:Number = Math.max(this._fieldRendererLabel.measuredHeight, this._fieldRendererList.measuredHeight);
			var height5:Number = Math.max(this._emitFieldLabel.measuredHeight, this._emitFieldList.measuredHeight);
			var height6:Number = Math.max(this._emitRendererLabel.measuredHeight, this._emitRendererList.measuredHeight);

			return new Size(width1 + width2 + 10 + width3 + width4 + 10 + width5 + width6, Math.max(height1, height2 + height3 + height4, height5 + height6));
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			var width1:Number = this._priorityLabel.measuredWidth;
			var width2:Number = this._priorityStepper.measuredWidth;
			var width3:Number = Math.max(this._fieldNameLabel.measuredWidth, this._fieldSortLabel.measuredWidth, this._fieldRendererLabel.measuredWidth);
			var width4:Number = Math.max(this._fieldNameList.measuredWidth, this._fieldSortList.measuredWidth, this._fieldRendererList.measuredWidth);
			var width5:Number = Math.max(this._emitFieldLabel.measuredWidth, this._emitRendererLabel.measuredWidth);
			var width6:Number = Math.max(this._emitFieldList.measuredWidth, this._emitRendererList.measuredWidth);

			var height1:Number = Math.max(this._priorityLabel.measuredHeight, this._priorityStepper.measuredHeight);
			var height2:Number = Math.max(this._fieldNameLabel.measuredHeight, this._fieldNameList.measuredHeight);
			var height3:Number = Math.max(this._fieldSortLabel.measuredHeight, this._fieldSortList.measuredHeight);
			var height4:Number = Math.max(this._fieldRendererLabel.measuredHeight, this._fieldRendererList.measuredHeight);
			var height5:Number = Math.max(this._emitFieldLabel.measuredHeight, this._emitFieldList.measuredHeight);
			var height6:Number = Math.max(this._emitRendererLabel.measuredHeight, this._emitRendererList.measuredHeight);

			var x1:Number = 0;
			var x2:Number = x1 + width1;
			var x3:Number = x2 + 10 + width2;
			var x4:Number = x3 + width3;
			var x5:Number = x4 + 10 + width4;
			var x6:Number = x5 + width5;

			var y1:Number = 0;
			var y2:Number = 0;
			var y3:Number = y2 + height2;
			var y4:Number = y3 + height3;
			var y5:Number = 0;
			var y6:Number = y5 + height5;

			this._priorityLabel.layout(new Rectangle(x1, y1, width1, height1));
			this._priorityStepper.layout(new Rectangle(x2, y1, width2, height1));

			this._fieldNameLabel.layout(new Rectangle(x3, y2, width3, height2));
			this._fieldNameList.layout(new Rectangle(x4, y2, width4, height2));

			this._fieldSortLabel.layout(new Rectangle(x3, y3, width3, height3));
			this._fieldSortList.layout(new Rectangle(x4, y3, width4, height3));

			this._fieldRendererLabel.layout(new Rectangle(x3, y4, width3, height4));
			this._fieldRendererList.layout(new Rectangle(x4, y4, width4, height4));

			this._emitFieldLabel.layout(new Rectangle(x5, y5, width5, height5));
			this._emitFieldList.layout(new Rectangle(x6, y5, width6, height5));

			this._emitRendererLabel.layout(new Rectangle(x5, y6, width5, height6));
			this._emitRendererList.layout(new Rectangle(x6, y6, width6, height6));

			var graphics:Graphics = this.graphics;
			graphics.clear();

			graphics.lineStyle(1, 0xCCCCCC, 1);

			graphics.moveTo(x3 - 5, 0);
			graphics.lineTo(x3 - 5, layoutSize.height);

			graphics.moveTo(x5 - 5, 0);
			graphics.lineTo(x5 - 5, layoutSize.height);

			return layoutSize;
		}

		protected override function onChildInvalidated(child:DisplayObject, pass:ValidatePass) : void
		{
			switch (pass)
			{
				case LayoutSprite.MEASURE:
					this.invalidate(LayoutSprite.MEASURE);
					break;
			}
		}

		// Private Methods

		private function _updatePriority() : void
		{
			var target:FieldSplitter = this._target.value;
			var priority:Number = target ? target.priority : NaN;

			this._priorityStepper.removeEventListener(NumericStepper.VALUE_CHANGED, this._priorityStepper_valueChanged);

			this._priorityStepper.value = priority;

			this._priorityStepper.addEventListener(NumericStepper.VALUE_CHANGED, this._priorityStepper_valueChanged);
		}

		private function _updateFieldName() : void
		{
			var target:FieldSplitter = this._target.value;
			var fieldName:String = target ? target.fieldName : null;

			this._fieldNameList.removeEventListener(DropDownList.SELECTION_CHANGED, this._fieldNameList_selectionChanged);

			if (fieldName)
			{
				this.addFields([ fieldName ]);
				this._fieldNameList.selectedOption = this._nameOptionMap[fieldName];
			}
			else
			{
				this._fieldNameList.selectedOption = null;
			}

			this._fieldNameList.addEventListener(DropDownList.SELECTION_CHANGED, this._fieldNameList_selectionChanged);
		}

		private function _updateFieldSort() : void
		{
			var target:FieldSplitter = this._target.value;
			var fieldSort:IComparator = target ? target.fieldSort : null;

			this._fieldSortList.removeEventListener(DropDownList.SELECTION_CHANGED, this._fieldSortList_selectionChanged);

			if (fieldSort is NaturalComparator)
				this._fieldSortList.selectedOption = this._sortOptionMap["natural"];
			else if (fieldSort is AlphabeticComparator)
				this._fieldSortList.selectedOption = this._sortOptionMap["alphabetic"];
			else if (fieldSort is NumericComparator)
				this._fieldSortList.selectedOption = this._sortOptionMap["numeric"];
			else if (fieldSort is SequentialNumericComparator)
				this._fieldSortList.selectedOption = this._sortOptionMap["sequentialNumeric"];
			else
				this._fieldSortList.selectedOption = this._sortOptionMap["none"];

			this._fieldSortList.addEventListener(DropDownList.SELECTION_CHANGED, this._fieldSortList_selectionChanged);
		}

		private function _updateFieldRenderer() : void
		{
			var propertyManager:PropertyManager = this._propertyManager;
			if (!propertyManager)
				return;

			var target:FieldSplitter = this._target.value;
			var fieldRenderer:IElementRenderer = target ? target.fieldRenderer : null;
			var fieldRendererPath:String = fieldRenderer ? propertyManager.getPropertyPath(fieldRenderer) : null;

			this._fieldRendererList.removeEventListener(DropDownList.SELECTION_CHANGED, this._fieldRendererList_selectionChanged);

			if (fieldRendererPath == "labelElementRenderer")
				this._fieldRendererList.selectedOption = this._rendererOptionMap["labels"];
			else if (fieldRendererPath == "histogramElementRenderer")
				this._fieldRendererList.selectedOption = this._rendererOptionMap["histogram"];
			else if (fieldRendererPath == "swatchElementRenderer")
				this._fieldRendererList.selectedOption = this._rendererOptionMap["images"];
			else if (fieldRendererPath == "histogramLabelElementRenderer")
				this._fieldRendererList.selectedOption = this._rendererOptionMap["histogramLabels"];
			else if (fieldRendererPath == "swatchLabelElementRenderer")
				this._fieldRendererList.selectedOption = this._rendererOptionMap["imagesLabels"];
			else if (fieldRendererPath == "swatchLabelHistogramElementRenderer")
				this._fieldRendererList.selectedOption = this._rendererOptionMap["imagesLabelsHistogram"];
			else
				this._fieldRendererList.selectedOption = null;

			this._fieldRendererList.addEventListener(DropDownList.SELECTION_CHANGED, this._fieldRendererList_selectionChanged);
		}

		private function _updateEmitField() : void
		{
			var target:FieldSplitter = this._target.value;
			var emitRenderer:AbstractRenderer = target ? target.emitRenderer : null;
			var emitField:String = emitRenderer ? emitRenderer["fieldName"] : null;

			this._emitFieldList.removeEventListener(DropDownList.SELECTION_CHANGED, this._emitFieldList_selectionChanged);

			if (emitField)
			{
				this.addFields([ emitField ]);
				this._emitFieldList.selectedOption = this._nameOptionMap[emitField];
			}
			else
			{
				this._emitFieldList.selectedOption = null;
			}

			this._emitFieldList.addEventListener(DropDownList.SELECTION_CHANGED, this._emitFieldList_selectionChanged);
		}

		private function _updateEmitRenderer() : void
		{
			var propertyManager:PropertyManager = this._propertyManager;
			if (!propertyManager)
				return;

			var target:FieldSplitter = this._target.value;
			var emitRenderer:AbstractRenderer = target ? target.emitRenderer : null;

			this._emitRendererList.removeEventListener(DropDownList.SELECTION_CHANGED, this._emitRendererList_selectionChanged);

			if (emitRenderer is SimpleRenderer)
				this._emitRendererList.selectedOption = this._emitRendererOptionMap["dots"];
			else if (emitRenderer is LabelRenderer)
				this._emitRendererList.selectedOption = this._emitRendererOptionMap["labels"];
			else if (emitRenderer is SwatchRenderer)
				this._emitRendererList.selectedOption = this._emitRendererOptionMap["images"];
			else
				this._emitRendererList.selectedOption = null;

			this._emitRendererList.addEventListener(DropDownList.SELECTION_CHANGED, this._emitRendererList_selectionChanged);
		}

		private function _target_changed(e:ChangedEvent) : void
		{
			var pce:PropertyChangedEvent = e as PropertyChangedEvent;
			if (!pce)
				return;

			if (pce.source == this._target)
			{
				var newTarget:FieldSplitter = pce.newValue as FieldSplitter;
				this.visible = (newTarget != null);
				this._updatePriority();
				this._updateFieldName();
				this._updateFieldSort();
				this._updateFieldRenderer();
				this._updateEmitField();
				this._updateEmitRenderer();
			}
			else if (pce.source == this._target.value)
			{
				switch (pce.propertyName)
				{
					case "priority":
						this._updatePriority();
						break;
					case "fieldName":
						this._updateFieldName();
						break;
					case "fieldSort":
						this._updateFieldSort();
						break;
					case "fieldRenderer":
						this._updateFieldRenderer();
						break;
					case "emitRenderer":
						this._updateEmitRenderer();
						this._updateEmitField();
						break;
				}
			}
			else if (pce.source is AbstractRenderer)
			{
				switch (pce.propertyName)
				{
					case "fieldName":
						this._updateEmitField();
						break;
				}
			}
		}

		private function _priorityStepper_valueChanged(e:Event) : void
		{
			var target:FieldSplitter = this._target.value;
			if (!target)
				return;

			var propertyManager:PropertyManager = this._propertyManager;
			if (!propertyManager || propertyManager.isParsing)
				return;

			var path:String = propertyManager.getPropertyPath(target);
			if (!path)
				return;

			var value:Number = this._priorityStepper.value;
			propertyManager.setValue(path + ".priority", String(value));
		}

		private function _fieldNameList_selectionChanged(e:Event) : void
		{
			var target:FieldSplitter = this._target.value;
			if (!target)
				return;

			var propertyManager:PropertyManager = this._propertyManager;
			if (!propertyManager || propertyManager.isParsing)
				return;

			var path:String = propertyManager.getPropertyPath(target);
			if (!path)
				return;

			var selectedOption:ListOption = this._fieldNameList.selectedOption;
			if (selectedOption)
				propertyManager.setValue(path + ".fieldName", String(selectedOption.value));
			else
				propertyManager.clearValue(path + ".fieldName");
		}

		private function _fieldSortList_selectionChanged(e:Event) : void
		{
			var target:FieldSplitter = this._target.value;
			if (!target)
				return;

			var propertyManager:PropertyManager = this._propertyManager;
			if (!propertyManager || propertyManager.isParsing)
				return;

			var path:String = propertyManager.getPropertyPath(target);
			if (!path)
				return;

			var selectedOption:ListOption = this._fieldSortList.selectedOption;
			if (selectedOption)
				propertyManager.setValue(path + ".fieldSort", String(selectedOption.value));
			else
				propertyManager.clearValue(path + ".fieldSort");
		}

		private function _fieldRendererList_selectionChanged(e:Event) : void
		{
			var target:FieldSplitter = this._target.value;
			if (!target)
				return;

			var propertyManager:PropertyManager = this._propertyManager;
			if (!propertyManager || propertyManager.isParsing)
				return;

			var path:String = propertyManager.getPropertyPath(target);
			if (!path)
				return;

			var selectedOption:ListOption = this._fieldRendererList.selectedOption;
			if (selectedOption)
				propertyManager.setValue(path + ".fieldRenderer", String(selectedOption.value));
			else
				propertyManager.clearValue(path + ".fieldRenderer");
		}

		private function _emitFieldList_selectionChanged(e:Event) : void
		{
			var target:FieldSplitter = this._target.value;
			if (!target)
				return;

			var propertyManager:PropertyManager = this._propertyManager;
			if (!propertyManager || propertyManager.isParsing)
				return;

			var path:String = propertyManager.getPropertyPath(target);
			if (!path)
				return;

			var selectedOption:ListOption = this._emitFieldList.selectedOption;
			if (selectedOption)
				propertyManager.setValue(path + ".emitRenderer.fieldName", String(selectedOption.value));
			else
				propertyManager.clearValue(path + ".emitRenderer.fieldName");
		}

		private function _emitRendererList_selectionChanged(e:Event) : void
		{
			var target:FieldSplitter = this._target.value;
			if (!target)
				return;

			var propertyManager:PropertyManager = this._propertyManager;
			if (!propertyManager || propertyManager.isParsing)
				return;

			var path:String = propertyManager.getPropertyPath(target);
			if (!path)
				return;

			var selectedOption:ListOption = this._emitRendererList.selectedOption;
			if (selectedOption)
				propertyManager.setValue(path + ".emitRenderer", String(selectedOption.value));
			else
				propertyManager.clearValue(path + ".emitRenderer");
		}

	}

}

import com.jasongatt.utils.IComparator;
import com.splunk.controls.ListOption;

class NameOptionComparator implements IComparator
{

	// Constructor

	public function NameOptionComparator()
	{
	}

	// Public Methods

	public function compare(value1:*, value2:*) : Number
	{
		var option1:ListOption = value1 as ListOption;
		var option2:ListOption = value2 as ListOption;
		if (!option1 || !option2)
			return 0;
		var str1:String = String(option1.value).toLowerCase();
		var str2:String = String(option2.value).toLowerCase();
		if (str1 < str2)
			return -1;
		if (str1 > str2)
			return 1;
		return 0;
	}

}
