package
{

	import com.adobe.images.*;
	import com.jasongatt.controls.*;
	import com.jasongatt.core.*;
	import com.jasongatt.graphics.brushes.*;
	import com.jasongatt.layout.*;
	import com.jasongatt.utils.*;
	import com.splunk.charting.axes.*;
	import com.splunk.charting.charts.*;
	import com.splunk.charting.controls.*;
	import com.splunk.charting.labels.*;
	import com.splunk.charting.layout.*;
	import com.splunk.charting.legend.*;
	import com.splunk.charting.properties.*;
	import com.splunk.controls.*;
	import com.splunk.data.*;
	import com.splunk.external.*;
	import com.splunk.properties.*;
	import com.splunk.services.*;
	import com.splunk.services.events.*;
	import com.splunk.services.search.*;
	import com.splunk.services.search.data.*;
	import com.splunk.time.*;
	import com.splunk.utils.*;
	import flash.display.*;
	import flash.events.*;
	import flash.geom.*;
	import flash.text.*;
	import flash.ui.*;
	import flash.utils.*;

	public class Charting extends GroupLayout
	{

		// Public Static Constants

		public static const PROCESS_DATA:ValidatePass = new ValidatePass(Charting, "processData", 0.01);
		public static const PROCESS_PROPERTIES:ValidatePass = new ValidatePass(Charting, "processProperties", 0.02);
		public static const DISPATCH_UPDATED:ValidatePass = new ValidatePass(Charting, "dispatchUpdated", 4);

		// Private Static Constants

		private static const _CHART_TYPES:Array = [ "area", "bar", "bubble", "column", "line", "pie", "scatter" ];

		private static const _LEGACY_PROPERTY_MAP:Object = {
			"primaryAxis": "axisX",
			"secondaryAxis": "axisY",
			"primaryAxisLabels": "axisLabelsX",
			"secondaryAxisLabels": "axisLabelsY",
			"primaryAxisTitle": "axisTitleX",
			"secondaryAxisTitle": "axisTitleY",
			"primaryAxisGridLines": "gridLinesX",
			"secondaryAxisGridLines": "gridLinesY"
		};

		private static const _LEGACY_PROPERTY_MAP_2:Object = {
			"primaryAxis": "axisY",
			"secondaryAxis": "axisX",
			"primaryAxisLabels": "axisLabelsY",
			"secondaryAxisLabels": "axisLabelsX",
			"primaryAxisTitle": "axisTitleY",
			"secondaryAxisTitle": "axisTitleX",
			"primaryAxisGridLines": "gridLinesY",
			"secondaryAxisGridLines": "gridLinesX"
		};

		// Private Properties

		private var _timeZone:ITimeZone = TimeZones.LOCAL;

		private var _staticPath:String = "/static";
		private var _hostPath:String = "http://localhost:8000";
		private var _basePath:String = "/splunkd";
		private var _sessionKey:String;

		private var _updateCount:int = 0;
		private var _updatingCount:int = 0;
		private var _updatedCount:int = 0;
		private var _dataLoading:Dictionary;
		private var _dataError:String;
		private var _updateRetryHandle:uint;
		private var _externalLegendConnectHandle:uint;

		private var _propertyManager:PropertyManager;
		private var _numberPropertyParser:NumberPropertyParser;
		private var _booleanPropertyParser:BooleanPropertyParser;
		private var _stringPropertyParser:StringPropertyParser;
		private var _matrixPropertyParser:MatrixPropertyParser;
		private var _marginPropertyParser:MarginPropertyParser;
		private var _brushPropertyParser:BrushPropertyParser;
		private var _spriteStylePropertyParser:SpriteStylePropertyParser;
		private var _layoutSpriteStylePropertyParser:LayoutSpriteStylePropertyParser;
		private var _textBlockStylePropertyParser:TextBlockStylePropertyParser;
		private var _chartPropertyParser:ChartPropertyParser;
		private var _chartArrayPropertyParser:ArrayPropertyParser;
		private var _dataTablePropertyParser:DataTablePropertyParser;
		private var _sliceArrayPropertyParser:ArrayPropertyParser;
		private var _legendPropertyParser:LegendPropertyParser;
		private var _legendArrayPropertyParser:ArrayPropertyParser;
		private var _axisPropertyParser:AxisPropertyParser;
		private var _axisLabelsPropertyParser:AxisLabelsPropertyParser;
		private var _axisLabelsArrayPropertyParser:ArrayPropertyParser;
		private var _axisTitleArrayPropertyParser:ArrayPropertyParser;
		private var _gridLinesPropertyParser:GridLinesPropertyParser;
		private var _gridLinesArrayPropertyParser:ArrayPropertyParser;
		private var _scalePropertyParser:ScalePropertyParser;
		private var _textFormatPropertyParser:TextFormatPropertyParser;
		private var _timeZonePropertyParser:TimeZonePropertyParser;
		private var _tooltipPropertyParser:TooltipPropertyParser;
		private var _dataSpriteTipPropertyParser:DataSpriteTipPropertyParser;
		private var _legacyPropertyValues:Object;

		private var _charts:Array;
		private var _legends:Array;
		private var _processingInstances:Dictionary;
		private var _loadableDataInstances:Dictionary;
		private var _chartAxisInfo:Dictionary;
		private var _needsLegend:Boolean = false;
		private var _needsAxisX:Boolean = false;
		private var _needsAxisY:Boolean = false;

		private var _backgroundBrush:ObservableProperty;
		private var _messageStyle:Style;
		private var _tooltip:Tooltip;
		private var _dataSpriteTip:DataSpriteTip;
		private var _externalLegend:ExternalLegend;

		private var _background:Shape;
		private var _chartLayout:ChartLayout;
		private var _messageField:TextBlock;
		private var _virtualMouse:VirtualMouse;

		private var _enableChartClick:Boolean = false;
		private var _enableLabelClick:Boolean = false;
		private var _enableTitleClick:Boolean = false;
		private var _enableLegendClick:Boolean = false;
		private var _enableOpenAsImage:Boolean = false;
		private var _enableFullScreen:Boolean = true;
		private var _tooltipDataSprite:DataSprite;
		private var _clickedItem:*;
		private var _highlightedItem:*;

		private var _formatSimpleStringCache:Cache;
		private var _formatNumericStringCache:Cache;
		private var _formatNumberCache:Cache;
		private var _formatDateCache:Cache;
		private var _formatTimeCache:Cache;
		private var _formatDateTimeCache:Cache;

		// Constructor

		public function Charting()
		{
			// stage

			var stage:Stage = this.stage;
			if (stage)
			{
				stage.align = StageAlign.TOP_LEFT;
				stage.scaleMode = StageScaleMode.NO_SCALE;
				stage.showDefaultContextMenu = false;

				stage.addEventListener(MouseEvent.MOUSE_OVER, this._stage_mouseOver);
				stage.addEventListener(MouseEvent.MOUSE_OUT, this._stage_mouseOut);
				stage.addEventListener(MouseEvent.CLICK, this._stage_click);

				var stageInfo:LoaderInfo = stage.loaderInfo;
				var params:Object = stageInfo.parameters;

				var staticPath:String = params.staticPath;
				if (!staticPath)
					staticPath = "/static";
				this._staticPath = staticPath;

				var hostPath:String = params.hostPath;
				if (!hostPath)
				{
					var url:String = stageInfo.url;
					var colonIndex:int = url.indexOf("://");
					var slashIndex:int = url.indexOf("/", colonIndex + 4);
					hostPath = url.substring(0, slashIndex);
				}
				this._hostPath = hostPath;

				var basePath:String = params.basePath;
				if (basePath == null)
					basePath = "/splunkd";
				this._basePath = basePath;

				this._sessionKey = params.sessionKey;
			}

			// property manager

			this._propertyManager = new PropertyManager();
			this._numberPropertyParser = NumberPropertyParser.getInstance();
			this._booleanPropertyParser = BooleanPropertyParser.getInstance();
			this._stringPropertyParser = StringPropertyParser.getInstance();
			this._matrixPropertyParser = MatrixPropertyParser.getInstance();
			this._marginPropertyParser = MarginPropertyParser.getInstance();
			this._brushPropertyParser = BrushPropertyParser.getInstance();
			this._spriteStylePropertyParser = SpriteStylePropertyParser.getInstance();
			this._layoutSpriteStylePropertyParser = LayoutSpriteStylePropertyParser.getInstance();
			this._textBlockStylePropertyParser = TextBlockStylePropertyParser.getInstance();
			this._chartPropertyParser = ChartPropertyParser.getInstance();
			this._chartArrayPropertyParser = ArrayPropertyParser.getInstance(ChartPropertyParser.getInstance());
			this._dataTablePropertyParser = DataTablePropertyParser.getInstance();
			this._sliceArrayPropertyParser = ArrayPropertyParser.getInstance(SlicePropertyParser.getInstance());
			this._legendPropertyParser = LegendPropertyParser.getInstance();
			this._legendArrayPropertyParser = ArrayPropertyParser.getInstance(LegendPropertyParser.getInstance());
			this._axisPropertyParser = AxisPropertyParser.getInstance();
			this._axisLabelsPropertyParser = AxisLabelsPropertyParser.getInstance();
			this._axisLabelsArrayPropertyParser = ArrayPropertyParser.getInstance(AxisLabelsPropertyParser.getInstance());
			this._axisTitleArrayPropertyParser = ArrayPropertyParser.getInstance(AxisTitlePropertyParser.getInstance());
			this._gridLinesPropertyParser = GridLinesPropertyParser.getInstance();
			this._gridLinesArrayPropertyParser = ArrayPropertyParser.getInstance(GridLinesPropertyParser.getInstance());
			this._scalePropertyParser = ScalePropertyParser.getInstance();
			this._textFormatPropertyParser = TextFormatPropertyParser.getInstance();
			this._timeZonePropertyParser = TimeZonePropertyParser.getInstance();
			this._tooltipPropertyParser = TooltipPropertyParser.getInstance();
			this._dataSpriteTipPropertyParser = DataSpriteTipPropertyParser.getInstance();
			this._legacyPropertyValues = new Object();

			// caches

			this._formatSimpleStringCache = new Cache(500);
			this._formatNumericStringCache = new Cache(500);
			this._formatNumberCache = new Cache(500);
			this._formatDateCache = new Cache(500);
			this._formatTimeCache = new Cache(500);
			this._formatDateTimeCache = new Cache(500);

			// init

			this._backgroundBrush = new ObservableProperty(this, "backgroundBrush", IBrush, null, this.invalidates(LayoutSprite.LAYOUT));

			this._background = new Shape();

			this._chartLayout = new ChartLayout();
			this._chartLayout.numericAxisFormat = this._numericAxisFormat;
			this._chartLayout.timeAxisFormat = this._timeAxisFormat;

			this._messageField = new TextBlock();
			this._messageField.selectable = false;
			this._messageField.wordWrap = true;
			this._messageField.alignmentX = 0.5;
			this._messageField.alignmentY = 0.5;
			this._messageField.visible = false;
			this._messageField.snap = true;

			this._virtualMouse = new VirtualMouse(stage);

			this.addChild(this._background);
			this.addChild(this._chartLayout);
			this.addChild(this._messageField);

			this._setDefaultProperties();
			this._updateContextMenu();

			this.visibility = Visibility.COLLAPSED;

			// JABridge

			JABridge.addProperty("timeZone", this.getTimeZone, this.setTimeZone);
			JABridge.addProperty("jobID", this.getJobID, this.setJobID, "String", "The id of the job from which to chart results.");
			JABridge.addProperty("resultsOffset", this.getResultsOffset, this.setResultsOffset, "int", "The offset at which to retrieve results.");
			JABridge.addProperty("resultsCount", this.getResultsCount, this.setResultsCount, "int", "The maximum number of results to retrieve.");
			JABridge.addProperty("resultsPreview", this.getResultsPreview, this.setResultsPreview, "Boolean", "Whether to use the results_previeww endpoint.");
			JABridge.addProperty("chartTypes", this.getChartTypes, null, "Array", "The list of available chart types that can be assigned to the chartType property.");
			JABridge.addProperty("fieldListMode", this.getFieldListMode, this.setFieldListMode, "String", "The field list processing order. Valid values are \"show_hide\" and \"hide_show\".");
			JABridge.addProperty("fieldShowList", this.getFieldShowList, this.setFieldShowList, "Array", "A list of fields to explicitly show.");
			JABridge.addProperty("fieldHideList", this.getFieldHideList, this.setFieldHideList, "Array", "A list of fields to explicitly hide.");
			JABridge.addProperty("enableChartClick", this.getEnableChartClick, this.setEnableChartClick, "Boolean");
			JABridge.addProperty("enableLabelClick", this.getEnableLabelClick, this.setEnableLabelClick, "Boolean");
			JABridge.addProperty("enableTitleClick", this.getEnableTitleClick, this.setEnableTitleClick, "Boolean");
			JABridge.addProperty("enableLegendClick", this.getEnableLegendClick, this.setEnableLegendClick, "Boolean");
			JABridge.addProperty("enableOpenAsImage", this.getEnableOpenAsImage, this.setEnableOpenAsImage, "Boolean");
			JABridge.addProperty("enableFullScreen", this.getEnableFullScreen, this.setEnableFullScreen, "Boolean");

			JABridge.addMethod("update", this.update, [], "int");
			JABridge.addMethod("validate", ValidateQueue.validateAll, [], "void");
			JABridge.addMethod("getValue", this.getValue, [ "propertyPath:String", "level:int = 0" ], "String");
			JABridge.addMethod("getValues", this.getValues, [ "values:Object", "level:int = 0" ], "Object");
			JABridge.addMethod("setValue", this.setValue, [ "propertyPath:String", "propertyValue:String" ], "void");
			JABridge.addMethod("setValues", this.setValues, [ "values:Object" ], "void");
			JABridge.addMethod("clearValue", this.clearValue, [ "propertyPath:String" ], "void");
			JABridge.addMethod("clearValues", this.clearValues, [ "values:Object" ], "void");
			JABridge.addMethod("clearAll", this.clearAll, [], "void");
			JABridge.addMethod("getSnapshot", this.getSnapshot, [], "Object");
			JABridge.addMethod("mouseMove", this.mouseMove, [ "x:Number", "y:Number" ], "void");
			JABridge.addMethod("mousePress", this.mousePress, [], "void");
			JABridge.addMethod("mouseRelease", this.mouseRelease, [], "void");
			JABridge.addMethod("mouseClick", this.mouseClick, [], "void");
			JABridge.addMethod("mouseDoubleClick", this.mouseDoubleClick, [], "void");
			JABridge.addMethod("mouseWheel", this.mouseWheel, [ "delta:int" ], "void");
			JABridge.addMethod("getStageBounds", this.getStageBounds, [], "Object");
			JABridge.addMethod("getChartBounds", this.getChartBounds, [], "Object");
			JABridge.addMethod("getChartData", this.getChartData, [], "Object");
			JABridge.addMethod("getChartDataBounds", this.getChartDataBounds, [], "Object");
			JABridge.addMethod("getTooltipBounds", this.getTooltipBounds, [], "Object");
			JABridge.addMethod("getTooltipValue", this.getTooltipValue, [], "Object");

			JABridge.addEvent("updated", [ "event:Object { updateCount:int }" ], "Dispatched after the chart is updated, following a call to update.");
			JABridge.addEvent("chartClicked", [ "event:Object { data:Object, fields:Array, altKey:Boolean, ctrlKey:Boolean, shiftKey:Boolean }" ], "Dispatched when a chart element is clicked.");
			JABridge.addEvent("labelClicked", [ "event:Object { text:String, altKey:Boolean, ctrlKey:Boolean, shiftKey:Boolean }" ], "Dispatched when an axis label is clicked.");
			JABridge.addEvent("titleClicked", [ "event:Object { text:String, altKey:Boolean, ctrlKey:Boolean, shiftKey:Boolean }" ], "Dispatched when an axis title is clicked.");
			JABridge.addEvent("legendClicked", [ "event:Object { text:String, altKey:Boolean, ctrlKey:Boolean, shiftKey:Boolean }" ], "Dispatched when a legend item is clicked.");
			JABridge.addEvent("openAsImage", [ "event:Object { snapshot:Object }" ], "Dispatched when the 'Open as image' context menu item is clicked.");

			try
			{
				JABridge.connect(this._JABridge_connect, this._JABridge_close);
			}
			catch (e:Error)
			{
				trace(e);
			}
		}

		// Public Methods

		public function getTimeZone() : String
		{
			return this.getValue("timeZone");
		}
		public function setTimeZone(value:String) : void
		{
			this.setValue("timeZone", value);
		}

		public function getJobID() : String
		{
			return this.getValue("data.jobID");
		}
		public function setJobID(value:String) : void
		{
			this.setValue("data.jobID", value);
		}

		public function getResultsOffset() : int
		{
			return int(this.getValue("data.offset"));
		}
		public function setResultsOffset(value:int) : void
		{
			this.setValue("data.offset", String(value));
		}

		public function getResultsCount() : int
		{
			return int(this.getValue("data.count"));
		}
		public function setResultsCount(value:int) : void
		{
			this.setValue("data.count", String(value));
		}

		public function getResultsPreview() : Boolean
		{
			return (this.getValue("data.preview") == "true");
		}
		public function setResultsPreview(value:Boolean) : void
		{
			this.setValue("data.preview", String(value));
		}

		public function getChartTypes() : Array
		{
			return Charting._CHART_TYPES;
		}

		public function getFieldListMode() : String
		{
			return this.getValue("data.fieldListMode");
		}
		public function setFieldListMode(value:String) : void
		{
			this.setValue("data.fieldListMode", value);
		}

		public function getFieldShowList() : Array
		{
			var value:String = this.getValue("data.fieldShowList");
			return ParseUtils.prepareArray(value);
		}
		public function setFieldShowList(value:Array) : void
		{
			var propertyParser:ArrayPropertyParser = ArrayPropertyParser.getInstance(StringPropertyParser.getInstance());
			this.setValue("data.fieldShowList", propertyParser.valueToString(null, value));
		}

		public function getFieldHideList() : Array
		{
			var value:String = this.getValue("data.fieldHideList");
			return ParseUtils.prepareArray(value);
		}
		public function setFieldHideList(value:Array) : void
		{
			var propertyParser:ArrayPropertyParser = ArrayPropertyParser.getInstance(StringPropertyParser.getInstance());
			this.setValue("data.fieldHideList", propertyParser.valueToString(null, value));
		}

		public function getEnableChartClick() : Boolean
		{
			return this._enableChartClick;
		}
		public function setEnableChartClick(value:Boolean) : void
		{
			this._enableChartClick = value;
		}

		public function getEnableLabelClick() : Boolean
		{
			return this._enableLabelClick;
		}
		public function setEnableLabelClick(value:Boolean) : void
		{
			this._enableLabelClick = value;
		}

		public function getEnableTitleClick() : Boolean
		{
			return this._enableTitleClick;
		}
		public function setEnableTitleClick(value:Boolean) : void
		{
			this._enableTitleClick = value;
		}

		public function getEnableLegendClick() : Boolean
		{
			return this._enableLegendClick;
		}
		public function setEnableLegendClick(value:Boolean) : void
		{
			this._enableLegendClick = value;
		}

		public function getEnableOpenAsImage() : Boolean
		{
			return this._enableOpenAsImage;
		}
		public function setEnableOpenAsImage(value:Boolean) : void
		{
			this._enableOpenAsImage = value;
			this._updateContextMenu();
		}

		public function getEnableFullScreen() : Boolean
		{
			return this._enableFullScreen;
		}
		public function setEnableFullScreen(value:Boolean) : void
		{
			this._enableFullScreen = value;
			this._updateContextMenu();
		}

		public function update() : int
		{
			this._updateCount++;
			this._update();
			return this._updateCount;
		}

		public function getValue(propertyPath:String, level:int = 0) : String
		{
			return this._propertyManager.getValue(propertyPath, level);
		}

		public function getValues(values:Object, level:int = 0) : Object
		{
			var values2:Object = new Object();
			var propertyManager:PropertyManager = this._propertyManager;
			var propertyPath:String;
			for (propertyPath in values)
				values2[propertyPath] = propertyManager.getValue(propertyPath, level);
			return values2;
		}

		public function setValue(propertyPath:String, propertyValue:String) : void
		{
			if (!this._setLegacyProperty(propertyPath, propertyValue))
				this._propertyManager.setValue(propertyPath, propertyValue);
			this.invalidate(Charting.PROCESS_PROPERTIES);
		}

		public function setValues(values:Object) : void
		{
			var propertyManager:PropertyManager = this._propertyManager;
			var propertyPath:String;
			var propertyValue:String;
			for (propertyPath in values)
			{
				propertyValue = values[propertyPath];
				if (!this._setLegacyProperty(propertyPath, propertyValue))
					propertyManager.setValue(propertyPath, propertyValue);
			}
			this.invalidate(Charting.PROCESS_PROPERTIES);
		}

		public function clearValue(propertyPath:String) : void
		{
			if (!this._clearLegacyProperty(propertyPath))
				this._propertyManager.clearValue(propertyPath);
			this.invalidate(Charting.PROCESS_PROPERTIES);
		}

		public function clearValues(values:Object) : void
		{
			var propertyManager:PropertyManager = this._propertyManager;
			var propertyPath:String;
			for (propertyPath in values)
			{
				if (!this._clearLegacyProperty(propertyPath))
					propertyManager.clearValue(propertyPath);
			}
			this.invalidate(Charting.PROCESS_PROPERTIES);
		}

		public function clearAll() : void
		{
			this._legacyPropertyValues = new Object();
			this._propertyManager.clearAll();
			this.invalidate(Charting.PROCESS_PROPERTIES);
		}

		public function getSnapshot() : Object
		{
			var stage:Stage = this.stage;
			if (!stage)
				return null;

			ValidateQueue.validateAll();

			var width:Number = Math.ceil(stage.stageWidth);
			var height:Number = Math.ceil(stage.stageHeight);
			if ((width < 1) || (height < 1))
				return null;

			// max bitmap size is 2880
			width = Math.min(width, 2880);
			height = Math.min(height, 2880);

			var bitmap:BitmapData = new BitmapData(width, height, false, 0xFFFFFF);
			bitmap.draw(stage);

			var bytes:ByteArray = PNGEncoder.encode(bitmap);

			var base64:String = Base64Encoder.encode(bytes);

			var snapshot:Object = new Object();
			snapshot.width = width;
			snapshot.height = height;
			snapshot.data = "data:image/png;base64," + base64;
			return snapshot;
		}

		public function mouseMove(x:Number, y:Number) : void
		{
			this._virtualMouse.move(x, y);
		}

		public function mousePress() : void
		{
			this._virtualMouse.press();
		}

		public function mouseRelease() : void
		{
			this._virtualMouse.release();
		}

		public function mouseClick() : void
		{
			this._virtualMouse.click();
		}

		public function mouseDoubleClick() : void
		{
			this._virtualMouse.doubleClick();
		}

		public function mouseWheel(delta:int) : void
		{
			this._virtualMouse.wheel(delta);
		}

		public function getStageBounds() : Object
		{
			var stage:Stage = this.stage;
			if (!stage)
				return null;

			return { x:0, y:0, width:stage.stageWidth, height:stage.stageHeight };
		}

		public function getChartBounds() : Object
		{
			ValidateQueue.validateAll();

			var bounds:Array = new Array();

			var series:SeriesLayout;
			var chart:AbstractChart;
			for each (series in this._chartLayout.series)
			{
				for each (chart in series.charts)
					bounds.push(this.getLayoutSpriteBounds(chart));
			}

			if (bounds.length == 0)
				return null;

			if (bounds.length == 1)
				return bounds[0];

			return bounds;
		}

		public function getChartData() : Object
		{
			ValidateQueue.validateAll();

			var data:Array = new Array();

			var series:SeriesLayout;
			var chart:AbstractChart;
			var dataTable:IDataTable;
			var numRows:int;
			var numColumns:int;
			var rowIndex:int;
			var columnIndex:int;
			var rows:Array;
			var row:Array;
			for each (series in this._chartLayout.series)
			{
				for each (chart in series.charts)
				{
					dataTable = chart.data;
					if (dataTable)
					{
						numRows = dataTable.numRows;
						numColumns = dataTable.numColumns;

						rows = new Array();
						for (rowIndex = -1; rowIndex < numRows; rowIndex++)
						{
							row = new Array();
							for (columnIndex = 0; columnIndex < numColumns; columnIndex++)
							{
								if (rowIndex < 0)
									row.push(dataTable.getColumnName(columnIndex));
								else
									row.push(String(dataTable.getValue(rowIndex, columnIndex)));
							}
							rows.push(row);
						}
						data.push(rows);
					}
				}
			}

			if (data.length == 0)
				return null;

			if (data.length == 1)
				return data[0];

			return data;
		}

		public function getChartDataBounds() : Object
		{
			ValidateQueue.validateAll();

			var bounds:Array = new Array();

			var series:SeriesLayout;
			var chart:AbstractChart;
			for each (series in this._chartLayout.series)
			{
				for each (chart in series.charts)
					bounds.push(this.getDataSpriteBounds(this.getDataSprites(chart)));
			}

			if (bounds.length == 0)
				return null;

			if (bounds.length == 1)
				return bounds[0];

			return bounds;
		}

		public function getTooltipBounds() : Object
		{
			ValidateQueue.validateAll();

			return this.getDisplayObjectBounds(this._tooltip);
		}

		public function getTooltipValue() : Object
		{
			ValidateQueue.validateAll();

			var tooltip:Tooltip = this._tooltip;
			if (!tooltip || !tooltip.visible)
				return null;

			var dataSpriteTip:DataSpriteTip = this._dataSpriteTip;
			if (!dataSpriteTip || (dataSpriteTip.parent != tooltip))
				return null;

			// first child is swatchSprite
			// odd children are fields
			// even children are values

			var fields:Array = new Array();
			var values:Array = new Array();

			var textBlock:TextBlock;
			var numChildren:int = dataSpriteTip.numChildren;
			for (var i:int = 1; i < numChildren; i++)
			{
				textBlock = dataSpriteTip.getChildAt(i) as TextBlock;
				if (textBlock)
				{
					if ((i % 2) == 1)
						fields.push(textBlock.text);
					else
						values.push(textBlock.text);
				}
			}

			return { fields:fields, values:values };
		}

		public function getDataSpriteBounds(dataSprites:Array) : Array
		{
			var numDataSprites:int = dataSprites.length;
			var dataSpriteBounds:Array = new Array(numDataSprites);
			var child:*;
			var i:int;

			for (i = 0; i < numDataSprites; i++)
			{
				child = dataSprites[i];
				if (child is DataSprite)
					dataSpriteBounds[i] = this.getDisplayObjectBounds(child);
				else if (child is Array)
					dataSpriteBounds[i] = this.getDataSpriteBounds(child);
				else
					dataSpriteBounds[i] = null;
			}

			return dataSpriteBounds;
		}

		public function getDataSprites(target:DisplayObjectContainer) : Array
		{
			var dataSprites:Array = new Array();

			var numChildren:int = target.numChildren;
			var child:DisplayObject;
			var childDataSprites:Array;
			var i:int;

			for (i = 0; i < numChildren; i++)
			{
				child = target.getChildAt(i);
				if (child.visible)
				{
					if (child is DataSprite)
					{
						dataSprites.push(child);
					}
					else if (child is DisplayObjectContainer)
					{
						childDataSprites = this.getDataSprites(DisplayObjectContainer(child));
						if (childDataSprites.length == 1)
							dataSprites.push(childDataSprites[0]);
						else if (childDataSprites.length > 0)
							dataSprites.push(childDataSprites);
					}
				}
			}

			if ((dataSprites.length == 1) && (dataSprites[0] is Array))
				dataSprites = dataSprites[0];

			return dataSprites;
		}

		public function getAxisTickBounds(axisLabels:AbstractAxisLabels) : Object
		{
			if (!axisLabels)
				return null;

			var axisTickBounds:Object = new Object();

			var axisLabelBounds:Rectangle = axisLabels.actualBounds;
			var axisLabelPlacement:String = axisLabels.placement;
			var tickSize:Number;
			var positions:Array;
			var numPositions:int;
			var tickBounds:Array;
			var bounds:Rectangle;
			var i:int;

			tickSize = axisLabels.majorTickSize;
			positions = axisLabels.majorPositions;
			numPositions = positions.length;
			tickBounds = axisTickBounds.major = new Array(numPositions);
			for (i = 0; i < numPositions; i++)
			{
				if (axisLabelPlacement == Placement.LEFT)
					bounds = new Rectangle(axisLabelBounds.width - tickSize, Math.round(axisLabelBounds.height - axisLabelBounds.height * positions[i]), tickSize, 0);
				else if (axisLabelPlacement == Placement.RIGHT)
					bounds = new Rectangle(0, Math.round(axisLabelBounds.height - axisLabelBounds.height * positions[i]), tickSize, 0);
				else if (axisLabelPlacement == Placement.TOP)
					bounds = new Rectangle(Math.round(axisLabelBounds.width * positions[i]), axisLabelBounds.height - tickSize, 0, tickSize);
				else
					bounds = new Rectangle(Math.round(axisLabelBounds.width * positions[i]), 0, 0, tickSize);

				tickBounds[i] = this.getGlobalBounds(axisLabels, bounds);
			}

			tickSize = axisLabels.minorTickSize;
			positions = axisLabels.minorPositions;
			numPositions = positions.length;
			tickBounds = axisTickBounds.minor = new Array(numPositions);
			for (i = 0; i < numPositions; i++)
			{
				if (axisLabelPlacement == Placement.LEFT)
					bounds = new Rectangle(axisLabelBounds.width - tickSize, Math.round(axisLabelBounds.height - axisLabelBounds.height * positions[i]), tickSize, 0);
				else if (axisLabelPlacement == Placement.RIGHT)
					bounds = new Rectangle(0, Math.round(axisLabelBounds.height - axisLabelBounds.height * positions[i]), tickSize, 0);
				else if (axisLabelPlacement == Placement.TOP)
					bounds = new Rectangle(Math.round(axisLabelBounds.width * positions[i]), axisLabelBounds.height - tickSize, 0, tickSize);
				else
					bounds = new Rectangle(Math.round(axisLabelBounds.width * positions[i]), 0, 0, tickSize);

				tickBounds[i] = this.getGlobalBounds(axisLabels, bounds);
			}

			return axisTickBounds;
		}

		public function getAxisLabelBounds(axisLabels:AbstractAxisLabels) : Object
		{
			if (!axisLabels)
				return null;

			var axisLabelBounds:Object = new Object();

			var labelBounds:Array;
			var labelContainer:Sprite;
			var label:AxisLabel;
			var numChildren:int;
			var i:int;

			labelContainer = (axisLabels.numChildren > 3) ? axisLabels.getChildAt(3) as Sprite : null;
			numChildren = labelContainer ? labelContainer.numChildren : 0;
			labelBounds = axisLabelBounds.major = new Array();
			for (i = 0; i < numChildren; i++)
			{
				label = labelContainer.getChildAt(i) as AxisLabel;
				if (label && label.visible)
					labelBounds.push(this.getLayoutSpriteBounds(label));
			}

			labelContainer = (axisLabels.numChildren > 2) ? axisLabels.getChildAt(2) as Sprite : null;
			numChildren = labelContainer ? labelContainer.numChildren : 0;
			labelBounds = axisLabelBounds.minor = new Array();
			for (i = 0; i < numChildren; i++)
			{
				label = labelContainer.getChildAt(i) as AxisLabel;
				if (label && label.visible)
					labelBounds.push(this.getLayoutSpriteBounds(label));
			}

			return axisLabelBounds;
		}

		public function getAxisLabelValues(axisLabels:AbstractAxisLabels) : Object
		{
			if (!axisLabels)
				return null;

			var axisLabelValues:Object = new Object();

			var labelValues:Array;
			var labelContainer:Sprite;
			var label:AxisLabel;
			var numChildren:int;
			var i:int;

			labelContainer = (axisLabels.numChildren > 3) ? axisLabels.getChildAt(3) as Sprite : null;
			numChildren = labelContainer ? labelContainer.numChildren : 0;
			labelValues = axisLabelValues.major = new Array();
			for (i = 0; i < numChildren; i++)
			{
				label = labelContainer.getChildAt(i) as AxisLabel;
				if (label && label.visible)
					labelValues.push(label.text);
			}

			labelContainer = (axisLabels.numChildren > 2) ? axisLabels.getChildAt(2) as Sprite : null;
			numChildren = labelContainer ? labelContainer.numChildren : 0;
			labelValues = axisLabelValues.minor = new Array();
			for (i = 0; i < numChildren; i++)
			{
				label = labelContainer.getChildAt(i) as AxisLabel;
				if (label && label.visible)
					labelValues.push(label.text);
			}

			return axisLabelValues;
		}

		public function getLayoutSpriteBounds(layoutSprite:LayoutSprite) : Object
		{
			if (!layoutSprite)
				return null;

			var stage:Stage = layoutSprite.stage;
			if (!stage)
				return null;

			var parent:DisplayObjectContainer = layoutSprite.parent;
			if (!parent)
				return null;

			var bounds:Rectangle = layoutSprite.actualBounds;
			bounds.topLeft = parent.localToGlobal(bounds.topLeft);
			bounds.bottomRight = parent.localToGlobal(bounds.bottomRight);

			return { x:bounds.x, y:bounds.y, width:bounds.width, height:bounds.height };
		}

		public function getDisplayObjectBounds(displayObject:DisplayObject) : Object
		{
			if (!displayObject)
				return null;

			var stage:Stage = displayObject.stage;
			if (!stage)
				return null;

			var bounds:Rectangle = displayObject.getBounds(stage);

			return { x:bounds.x, y:bounds.y, width:bounds.width, height:bounds.height };
		}

		public function getGlobalBounds(displayObject:DisplayObject, localBounds:Rectangle) : Object
		{
			if (!displayObject)
				return null;

			if (!localBounds)
				return null;

			var globalBounds:Rectangle = new Rectangle();
			globalBounds.topLeft = displayObject.localToGlobal(localBounds.topLeft);
			globalBounds.bottomRight = displayObject.localToGlobal(localBounds.bottomRight);

			return { x:globalBounds.x, y:globalBounds.y, width:globalBounds.width, height:globalBounds.height };
		}

		public function processData() : void
		{
			this.validatePreceding(Charting.PROCESS_DATA);

			if (this.isValid(Charting.PROCESS_DATA))
				return;

			this.invalidate(Charting.PROCESS_PROPERTIES);

			if (this._dataError)
			{
				this._showMessage("Results Error:", this._dataError);
			}
			else
			{
				var numRows:int = 0;
				var numColumns:int = 0;
				var hasJobID:Boolean = false;
				var loadableData:IDataLoadable;
				var dataTable:IDataTable;
				var resultsDataTable:ResultsDataTable;

				for each (loadableData in this._loadableDataInstances)
				{
					dataTable = loadableData as IDataTable;
					if (dataTable)
					{
						numRows = Math.max(dataTable.numRows, numRows);
						numColumns = Math.max(dataTable.numColumns, numColumns);
					}

					resultsDataTable = loadableData as ResultsDataTable;
					if (resultsDataTable && resultsDataTable.jobID)
						hasJobID = true;
				}

				if ((numRows == 0) || (numColumns == 0))
					this._showMessage("");
				else
					this._hideMessage();
			}

			this.setValid(Charting.PROCESS_DATA);
		}

		public function processProperties() : void
		{
			this.validatePreceding(Charting.PROCESS_PROPERTIES);

			if (this.isValid(Charting.PROCESS_PROPERTIES))
				return;

			this._updateLegacyProperties();

			this._processingInstances = new Dictionary();
			this._loadableDataInstances = new Dictionary();
			this._chartAxisInfo = new Dictionary();
			this._needsLegend = false;
			this._needsAxisX = false;
			this._needsAxisY = false;

			var tooltip:Tooltip;
			var dataSpriteTip:DataSpriteTip;
			var externalLegend:ExternalLegend;
			var charts:Array;
			var legends:Array;
			var axisLabels:Array;
			var axisTitles:Array;
			var gridLines:Array;

			var chart:AbstractChart;
			var legend:ILegend;
			var visualLegend:Legend;
			var axis:IAxis;
			var axisLabel:AbstractAxisLabels;
			var axisTitle:AxisTitle;
			var gridLine:GridLines;

			var chartLayout:ChartLayout = this._chartLayout;

			var propertyManager:PropertyManager = this._propertyManager;

			try
			{
				propertyManager.beginParse();

				this._timeZone = propertyManager.parseProperty("timeZone", this._timeZonePropertyParser);

				this._backgroundBrush.value = propertyManager.parseProperty("backgroundBrush", this._brushPropertyParser);

				this._messageStyle = propertyManager.parseProperty("message", this._textBlockStylePropertyParser, "style");
				if (this._messageStyle)
					propertyManager.parseChildProperty(this._messageStyle, "defaultTextFormat", this._textFormatPropertyParser, "textFormat");

				tooltip = propertyManager.parsePropertyAs("tooltip", this._tooltipPropertyParser, "tooltip");

				dataSpriteTip = propertyManager.parsePropertyAs("dataSpriteTip", this._dataSpriteTipPropertyParser, "dataSpriteTip");
				propertyManager.inheritProperties(dataSpriteTip, "tooltip.content");
				propertyManager.parseChildProperty(dataSpriteTip, "swatchStyle", this._layoutSpriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(dataSpriteTip, "fieldStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(dataSpriteTip, "fieldStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
				propertyManager.parseChildProperty(dataSpriteTip, "valueStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(dataSpriteTip, "valueStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");

				externalLegend = propertyManager.parsePropertyAs("externalLegend", this._legendPropertyParser, "externalLegend");

				charts = this._uniqueList(propertyManager.parseProperty("layout.charts", this._chartArrayPropertyParser, "[@chart]"));
				for each (chart in charts)
					this._processChartProperties(chart);

				var defaultLegends:String;
				if (this._needsLegend)
					defaultLegends = "[@legend]";
				else
					defaultLegends = null;

				legends = this._uniqueList(propertyManager.parseProperty("layout.legends", this._legendArrayPropertyParser, defaultLegends));
				for each (legend in legends)
					this._processLegendProperties(legend);

				var defaultAxisLabels:String;
				if (this._needsAxisX && this._needsAxisY)
					defaultAxisLabels = "[@axisLabelsX,@axisLabelsY]";
				else if (this._needsAxisX)
					defaultAxisLabels = "[@axisLabelsX]";
				else if (this._needsAxisY)
					defaultAxisLabels = "[@axisLabelsY]";
				else
					defaultAxisLabels = null;

				axisLabels = this._uniqueList(propertyManager.parseProperty("layout.axisLabels", this._axisLabelsArrayPropertyParser, defaultAxisLabels));
				for each (axisLabel in axisLabels)
					this._processAxisLabelsProperties(axisLabel);

				var defaultAxisTitles:String;
				if (this._needsAxisX && this._needsAxisY)
					defaultAxisTitles = "[@axisTitleX,@axisTitleY]";
				else if (this._needsAxisX)
					defaultAxisTitles = "[@axisTitleX]";
				else if (this._needsAxisY)
					defaultAxisTitles = "[@axisTitleY]";
				else
					defaultAxisTitles = null;

				axisTitles = this._uniqueList(propertyManager.parseProperty("layout.axisTitles", this._axisTitleArrayPropertyParser, defaultAxisTitles));
				if (axisTitles)
				{
					var numAxisTitles:int = axisTitles.length;
					var numAxisLabels:int = axisLabels ? axisLabels.length : 0;
					for (var i:int = 0; i < numAxisTitles; i++)
					{
						axisTitle = axisTitles[i];
						axisLabel = (i < numAxisLabels) ? axisLabels[i] : null;
						this._processAxisTitleProperties(axisTitle, axisLabel);
					}
				}

				var defaultGridLines:String;
				if (this._needsAxisX && this._needsAxisY)
					defaultGridLines = "[@gridLinesX,@gridLinesY]";
				else if (this._needsAxisX)
					defaultGridLines = "[@gridLinesX]";
				else if (this._needsAxisY)
					defaultGridLines = "[@gridLinesY]";
				else
					defaultGridLines = null;

				gridLines = this._uniqueList(propertyManager.parseProperty("layout.gridLines", this._gridLinesArrayPropertyParser, defaultGridLines));
				for each (gridLine in gridLines)
					this._processGridLinesProperties(gridLine);

				var defaultMargin:String;
				if (this._needsAxisX && this._needsAxisY)
					defaultMargin = "(0,10,10,0)";
				else if (this._needsAxisX)
					defaultMargin = "(0,0,10,0)";
				else if (this._needsAxisY)
					defaultMargin = "(0,10,0,0)";
				else
					defaultMargin = null;

				chartLayout.margin = propertyManager.parseProperty("layout.margin", this._marginPropertyParser, defaultMargin);

				var legendsX:Array = new Array();
				var legendsY:Array = new Array();
				for each (legend in legends)
				{
					visualLegend = legend as Legend;
					if (visualLegend)
					{
						switch (visualLegend.placement)
						{
							case Placement.LEFT:
							case Placement.RIGHT:
								legendsY.push(visualLegend);
								break;
							default:
								legendsX.push(visualLegend);
								break;
						}
					}
				}

				var axisLabelsX:Array = new Array();
				var axisLabelsY:Array = new Array();
				for each (axisLabel in axisLabels)
				{
					switch (axisLabel.placement)
					{
						case Placement.LEFT:
						case Placement.RIGHT:
							axisLabelsY.push(axisLabel);
							break;
						default:
							axisLabelsX.push(axisLabel);
							break;
					}
				}

				// use single legends for no splitSeries or pie and ratioBar charts
				var splitSeries:Boolean = propertyManager.parseProperty("layout.splitSeries", this._booleanPropertyParser);
				if (!splitSeries)
				{
					legendsY = null;
					legendsX = legends;
				}
				else
				{
					for each (chart in charts)
					{
						if ((chart is PieChart) || (chart is RatioBarChart))
						{
							legendsY = null;
							legendsX = legends;
							break;
						}
					}
				}

				chartLayout.series = this._processSeries(charts, legendsY, axisLabelsY, gridLines);
				chartLayout.legends = legendsX;
				chartLayout.axisLabels = axisLabelsX;
				chartLayout.axisTitles = axisTitles;
				chartLayout.updateLayout();
			}
			finally
			{
				propertyManager.endParse();
			}

			this._setExternalLegend(externalLegend);
			this._setDataSpriteTip(dataSpriteTip);
			this._setTooltip(tooltip);

			// create lists of charts and visual legends

			charts = this._charts = new Array();
			legends = this._legends = new Array();

			for each (legend in this._chartLayout.legends)
			{
				if (legend is Legend)
					legends.push(legend);
			}

			for each (var series:SeriesLayout in this._chartLayout.series)
			{
				for each (chart in series.charts)
					charts.push(chart);

				for each (legend in series.legends)
				{
					if (legend is Legend)
						legends.push(legend);
				}
			}

			this._updateClickedItem();

			this.setValid(Charting.PROCESS_PROPERTIES);
		}

		public function dispatchUpdated() : void
		{
			this.validatePreceding(Charting.DISPATCH_UPDATED);

			if (this.isValid(Charting.DISPATCH_UPDATED))
				return;

			setTimeout(this._dispatchUpdated, 0);

			this.setValid(Charting.DISPATCH_UPDATED);
		}

		// Protected Methods

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			var graphics:Graphics = this._background.graphics;
			graphics.clear();

			var backgroundBrush:IBrush = this._backgroundBrush.value;
			if (backgroundBrush)
			{
				backgroundBrush.beginBrush(graphics);
				backgroundBrush.moveTo(0, 0);
				backgroundBrush.lineTo(layoutSize.width, 0);
				backgroundBrush.lineTo(layoutSize.width, layoutSize.height);
				backgroundBrush.lineTo(0, layoutSize.height);
				backgroundBrush.lineTo(0, 0);
				backgroundBrush.endBrush();
			}

			return super.layoutOverride(layoutSize);
		}

		// Private Methods

		private function _processChartProperties(chart:AbstractChart) : void
		{
			if (!chart || this._processingInstances[chart])
				return;

			var propertyManager:PropertyManager = this._propertyManager;
			if (!propertyManager.getPropertyPath(chart))
				return;

			this._processingInstances[chart] = true;

			if (chart is AbstractChart1D)
				this._needsAxisX = true;
			else if ((chart is AbstractChart2D) || (chart is AbstractChart3D) || (chart is AbstractChart4D))
				this._needsAxisX = this._needsAxisY = true;

			if (chart is AnnotationChart)
			{
				propertyManager.inheritProperties(chart, "styles.annotationChart");
			}
			else if (chart is AreaChart)
			{
				propertyManager.inheritProperties(chart, "styles.areaChart");
			}
			else if (chart is BarChart)
			{
				propertyManager.inheritProperties(chart, "styles.barChart");
			}
			else if (chart is BubbleChart)
			{
				propertyManager.inheritProperties(chart, "styles.bubbleChart");
			}
			else if (chart is ColumnChart)
			{
				propertyManager.inheritProperties(chart, "styles.columnChart");
			}
			else if (chart is FillerGauge)
			{
				if (propertyManager.parseChildProperty(chart, "style", this._stringPropertyParser, "shiny") == "shiny")
					propertyManager.inheritProperties(chart, "styles.fillerGaugeShiny");
				propertyManager.inheritProperties(chart, "styles.fillerGauge");
			}
			else if (chart is Histogram)
			{
				propertyManager.inheritProperties(chart, "styles.histogram");
			}
			else if (chart is LineChart)
			{
				propertyManager.inheritProperties(chart, "styles.lineChart");
			}
			else if (chart is MarkerGauge)
			{
				if (propertyManager.parseChildProperty(chart, "style", this._stringPropertyParser, "shiny") == "shiny")
					propertyManager.inheritProperties(chart, "styles.markerGaugeShiny");
				propertyManager.inheritProperties(chart, "styles.markerGauge");
			}
			else if (chart is MotionBubbleChart)
			{
				propertyManager.inheritProperties(chart, "styles.bubbleChart");
			}
			else if (chart is PieChart)
			{
				propertyManager.inheritProperties(chart, "styles.pieChart");
			}
			else if (chart is RadialGauge)
			{
				if (propertyManager.parseChildProperty(chart, "style", this._stringPropertyParser, "shiny") == "shiny")
					propertyManager.inheritProperties(chart, "styles.radialGaugeShiny");
				propertyManager.inheritProperties(chart, "styles.radialGauge");
			}
			else if (chart is RangeMarker)
			{
				propertyManager.inheritProperties(chart, "styles.rangeMarker");
			}
			else if (chart is RatioBarChart)
			{
				propertyManager.inheritProperties(chart, "styles.ratioBarChart");
			}
			else if (chart is ScatterChart)
			{
				propertyManager.inheritProperties(chart, "styles.scatterChart");
			}
			else if (chart is ValueMarker)
			{
				propertyManager.inheritProperties(chart, "styles.valueMarker");
			}

			if (chart is AbstractChart1D)
				propertyManager.inheritProperties(chart, "styles.chart1D");
			else if (chart is AbstractChart2D)
				propertyManager.inheritProperties(chart, "styles.chart2D");
			else if (chart is AbstractChart3D)
				propertyManager.inheritProperties(chart, "styles.chart3D");
			else if (chart is AbstractChart4D)
				propertyManager.inheritProperties(chart, "styles.chart4D");

			propertyManager.inheritProperties(chart, "styles.chart");

			var defaultPrimaryAxisType:String = "category";
			var defaultSecondaryAxisType:String = "numeric";
			var primaryAxisTitleText:String = "";
			var secondaryAxisTitleText:String = "";

			var data:IDataTable = propertyManager.parseChildProperty(chart, "data", this._dataTablePropertyParser);
			if (data)
			{
				this._processDataProperties(data);

				if (data.numColumns > 0)
				{
					if (data.getColumnName(0) == "_time")
						defaultPrimaryAxisType = "time";
					primaryAxisTitleText = data.getColumnName(0);
					if (data.numColumns == 2)
						secondaryAxisTitleText = data.getColumnName(1);
				}
			}

			if ((chart is AreaChart) || (chart is BarChart) || (chart is ColumnChart) || (chart is Histogram) || (chart is LineChart) || (chart is MotionBubbleChart))
				this._needsLegend = true;
			else if ((chart is BubbleChart) && data && (data.numColumns > 3))
				this._needsLegend = true;
			else if ((chart is ScatterChart) && data && (data.numColumns > 2))
				this._needsLegend = true;

			var legend:ILegend = propertyManager.parseChildProperty(chart, "legend", this._legendPropertyParser);
			if (legend)
				this._processLegendProperties(legend);

			if (chart is AbstractChart1D)
			{
				var axis:IAxis = propertyManager.parseChildProperty(chart, "axis", this._axisPropertyParser, defaultPrimaryAxisType);
				if (axis)
					this._processAxisProperties(axis);
			}

			if ((chart is AbstractChart2D) || (chart is AbstractChart3D) || (chart is AbstractChart4D))
			{
				var defaultAxisXType:String;
				var defaultAxisYType:String;
				if (chart is BarChart)
				{
					defaultAxisXType = defaultSecondaryAxisType;
					defaultAxisYType = defaultPrimaryAxisType;
				}
				else
				{
					defaultAxisXType = defaultPrimaryAxisType;
					defaultAxisYType = defaultSecondaryAxisType;
				}

				var axisX:IAxis = propertyManager.parseChildProperty(chart, "axisX", this._axisPropertyParser, defaultAxisXType);
				if (axisX)
				{
					if (!this._chartAxisInfo[axisX])
					{
						var axisXInfo:Object = this._chartAxisInfo[axisX] = new Object();
						axisXInfo.isX = true;
						axisXInfo.includeZero = (chart is BarChart);
						if (chart is BarChart)
						{
							axisXInfo.isSecondary = true;
							axisXInfo.titleText = secondaryAxisTitleText;
						}
						else
						{
							axisXInfo.isPrimary = true;
							axisXInfo.titleText = primaryAxisTitleText;
						}
					}

					this._processAxisProperties(axisX);
				}

				var axisY:IAxis = propertyManager.parseChildProperty(chart, "axisY", this._axisPropertyParser, defaultAxisYType);
				if (axisY)
				{
					if (!this._chartAxisInfo[axisY])
					{
						var axisYInfo:Object = this._chartAxisInfo[axisY] = new Object();
						axisYInfo.isY = true;
						axisYInfo.includeZero = ((chart is AreaChart) || (chart is ColumnChart) || (chart is Histogram) || (chart is LineChart));
						if (chart is BarChart)
						{
							axisYInfo.isPrimary = true;
							axisYInfo.titleText = primaryAxisTitleText;
						}
						else
						{
							axisYInfo.isSecondary = true;
							axisYInfo.titleText = secondaryAxisTitleText;
						}
					}

					this._processAxisProperties(axisY);
				}
			}

			if ((chart is AbstractChart3D) || (chart is AbstractChart4D))
			{
				var axisZ:IAxis = propertyManager.parseChildProperty(chart, "axisZ", this._axisPropertyParser, "numeric");
				if (axisZ)
				{
					this._processAxisProperties(axisZ);

					// legacy support
					if ((chart is BubbleChart) && (axisZ is NumericAxis))
						propertyManager.parseChildProperty(axisZ, "scale", this._scalePropertyParser, "@" + propertyManager.getPropertyPath(chart) + ".bubbleScale");
				}
			}

			if (chart is AbstractChart4D)
			{
				var axisW:IAxis = propertyManager.parseChildProperty(chart, "axisW", this._axisPropertyParser, "numeric");
				if (axisW)
					this._processAxisProperties(axisW);
			}

			if (chart is AnnotationChart)
			{
				propertyManager.parseChildProperty(chart, "markerStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "labelStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "labelStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
			}
			else if (chart is AreaChart)
			{
				propertyManager.parseChildProperty(chart, "areaStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "lineStyle", this._spriteStylePropertyParser, "style");
			}
			else if (chart is BarChart)
			{
				propertyManager.parseChildProperty(chart, "barStyle", this._spriteStylePropertyParser, "style");
			}
			else if (chart is BubbleChart)
			{
				propertyManager.parseChildProperty(chart, "bubbleStyle", this._spriteStylePropertyParser, "style");
			}
			else if (chart is ColumnChart)
			{
				propertyManager.parseChildProperty(chart, "columnStyle", this._spriteStylePropertyParser, "style");
			}
			else if (chart is FillerGauge)
			{
				propertyManager.parseChildProperty(chart, "fillerStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "fillerForegroundStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "fillerBackgroundStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "majorTickStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "minorTickStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "labelStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "labelStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
				propertyManager.parseChildProperty(chart, "valueStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "valueStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
				propertyManager.parseChildProperty(chart, "warningStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "foregroundStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "backgroundStyle", this._spriteStylePropertyParser, "style");

				if (propertyManager.parseChildProperty(chart, "usePercentageRange", this._booleanPropertyParser, "false"))
					chart["labelFormat"] = this._formatPercent;
				else
					chart["labelFormat"] = this._formatNumber;

				if (propertyManager.parseChildProperty(chart, "usePercentageValue", this._booleanPropertyParser, "false"))
					chart["valueFormat"] = this._formatPercent;
				else
					chart["valueFormat"] = this._formatNumber;
			}
			else if (chart is Histogram)
			{
				propertyManager.parseChildProperty(chart, "columnStyle", this._spriteStylePropertyParser, "style");
			}
			else if (chart is LineChart)
			{
				propertyManager.parseChildProperty(chart, "lineStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "markerStyle", this._spriteStylePropertyParser, "style");
			}
			else if (chart is MarkerGauge)
			{
				propertyManager.parseChildProperty(chart, "markerStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "rangeBandStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "majorTickStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "minorTickStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "labelStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "labelStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
				propertyManager.parseChildProperty(chart, "valueStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "valueStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
				propertyManager.parseChildProperty(chart, "warningStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "foregroundStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "backgroundStyle", this._spriteStylePropertyParser, "style");

				if (propertyManager.parseChildProperty(chart, "usePercentageRange", this._booleanPropertyParser, "false"))
					chart["labelFormat"] = this._formatPercent;
				else
					chart["labelFormat"] = this._formatNumber;

				if (propertyManager.parseChildProperty(chart, "usePercentageValue", this._booleanPropertyParser, "false"))
					chart["valueFormat"] = this._formatPercent;
				else
					chart["valueFormat"] = this._formatNumber;
			}
			else if (chart is MotionBubbleChart)
			{
				propertyManager.parseChildProperty(chart, "bubbleStyle", this._spriteStylePropertyParser, "style");
			}
			else if (chart is PieChart)
			{
				propertyManager.parseChildProperty(chart, "sliceStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "labelStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "labelStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
			}
			else if (chart is RadialGauge)
			{
				propertyManager.parseChildProperty(chart, "needleStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "rangeBandStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "majorTickStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "minorTickStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "labelStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "labelStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
				propertyManager.parseChildProperty(chart, "valueStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "valueStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
				propertyManager.parseChildProperty(chart, "warningStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "foregroundStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "backgroundStyle", this._spriteStylePropertyParser, "style");

				if (propertyManager.parseChildProperty(chart, "usePercentageRange", this._booleanPropertyParser, "false"))
					chart["labelFormat"] = this._formatPercent;
				else
					chart["labelFormat"] = this._formatNumber;

				if (propertyManager.parseChildProperty(chart, "usePercentageValue", this._booleanPropertyParser, "false"))
					chart["valueFormat"] = this._formatPercent;
				else
					chart["valueFormat"] = this._formatNumber;
			}
			else if (chart is RatioBarChart)
			{
				propertyManager.parseChildProperty(chart, "barStyle", this._spriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "labelStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(chart, "labelStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
			}
			else if (chart is ScatterChart)
			{
				propertyManager.parseChildProperty(chart, "markerStyle", this._spriteStylePropertyParser, "style");
			}

			delete this._processingInstances[chart];
		}

		private function _processDataProperties(data:IDataTable) : void
		{
			if (!data || this._processingInstances[data])
				return;

			var propertyManager:PropertyManager = this._propertyManager;
			if (!propertyManager.getPropertyPath(data))
				return;

			this._processingInstances[data] = true;

			if (data is IDataLoadable)
				this._loadableDataInstances[data] = data;

			if (data is ResultsDataTable)
				propertyManager.inheritProperties(data, "styles.resultsData");
			else if (data is TimelineDataTable)
				propertyManager.inheritProperties(data, "styles.timelineData");
			else if (data is ViewDataTable)
				propertyManager.inheritProperties(data, "styles.viewData");

			propertyManager.inheritProperties(data, "styles.data");

			if (data is ViewDataTable)
			{
				var table:IDataTable = propertyManager.parseChildProperty(data, "table", this._dataTablePropertyParser);
				if (table)
					this._processDataProperties(table);
			}

			propertyManager.parseChildProperties(data);

			delete this._processingInstances[data];
		}

		private function _processLegendProperties(legend:ILegend) : void
		{
			if (!legend || this._processingInstances[legend])
				return;

			var propertyManager:PropertyManager = this._propertyManager;
			if (!propertyManager.getPropertyPath(legend))
				return;

			this._processingInstances[legend] = true;

			if (legend is Legend)
			{
				var placement:String = propertyManager.parseChildProperty(legend, "placement", this._stringPropertyParser, "right");
				if ((placement == Placement.LEFT) || (placement == Placement.RIGHT) || (placement == Placement.TOP) || (placement == Placement.BOTTOM) || (placement == Placement.CENTER))
					propertyManager.parseChildProperty(legend, "visibility", this._stringPropertyParser, "visible");
				else
					propertyManager.parseChildPropertyAs(legend, "visibility", this._stringPropertyParser, "collapsed");

				if ((placement == Placement.LEFT) || (placement == Placement.RIGHT))
					propertyManager.inheritProperties(legend, "styles.yLegend");
				else
					propertyManager.inheritProperties(legend, "styles.xLegend");

				propertyManager.inheritProperties(legend, "styles.legend");

				propertyManager.parseChildProperty(legend, "swatchStyle", this._layoutSpriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(legend, "labelStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(legend, "labelStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
				propertyManager.parseChildProperty(legend, "itemStyle", this._layoutSpriteStylePropertyParser, "style");

				var masterLegend:ILegend = propertyManager.parseChildProperty(legend, "masterLegend", this._legendPropertyParser);
				if (masterLegend)
					this._processLegendProperties(masterLegend);
			}

			delete this._processingInstances[legend];
		}

		private function _processAxisProperties(axis:IAxis) : void
		{
			if (!axis || this._processingInstances[axis])
				return;

			var propertyManager:PropertyManager = this._propertyManager;
			if (!propertyManager.getPropertyPath(axis))
				return;

			this._processingInstances[axis] = true;

			var defaultReverse:String = "false";
			var defaultIncludeZero:String = "false";

			var axisInfo:Object = this._chartAxisInfo[axis];
			if (axisInfo)
			{
				if (axisInfo.isPrimary)
					propertyManager.inheritProperties(axis, "styles.primaryAxis");
				else if (axisInfo.isSecondary)
					propertyManager.inheritProperties(axis, "styles.secondaryAxis");

				if (axisInfo.isX)
					propertyManager.inheritProperties(axis, "styles.xAxis");
				else if (axisInfo.isY)
					propertyManager.inheritProperties(axis, "styles.yAxis");

				if (axisInfo.isPrimary && axisInfo.isY)
					defaultReverse = "true";

				if (axisInfo.includeZero)
					defaultIncludeZero = "true";
			}

			if (axis is CategoryAxis)
				propertyManager.inheritProperties(axis, "styles.categoryAxis");
			else if (axis is NumericAxis)
				propertyManager.inheritProperties(axis, "styles.numericAxis");
			else if (axis is TimeAxis)
				propertyManager.inheritProperties(axis, "styles.timeAxis");

			propertyManager.inheritProperties(axis, "styles.axis");

			propertyManager.parseChildProperty(axis, "reverse", this._booleanPropertyParser, defaultReverse);
			if (axis is NumericAxis)
				propertyManager.parseChildProperty(axis, "includeZero", this._booleanPropertyParser, defaultIncludeZero);

			delete this._processingInstances[axis];
		}

		private function _processAxisLabelsProperties(axisLabels:AbstractAxisLabels) : void
		{
			if (!axisLabels || this._processingInstances[axisLabels])
				return;

			var propertyManager:PropertyManager = this._propertyManager;
			if (!propertyManager.getPropertyPath(axisLabels))
				return;

			this._processingInstances[axisLabels] = true;

			var defaultPlacement:String = Placement.BOTTOM;

			var axis:IAxis = propertyManager.parseChildProperty(axisLabels, "axis", this._axisPropertyParser);
			if (axis)
			{
				this._processAxisProperties(axis);

				var axisInfo:Object = this._chartAxisInfo[axis];
				if (axisInfo)
				{
					if (axisInfo.isPrimary)
						propertyManager.inheritProperties(axisLabels, "styles.primaryAxisLabels");
					else if (axisInfo.isSecondary)
						propertyManager.inheritProperties(axisLabels, "styles.secondaryAxisLabels");

					if (axisInfo.isY)
						defaultPlacement = Placement.LEFT;
				}
			}

			var placement:String = propertyManager.parseChildProperty(axisLabels, "placement", this._stringPropertyParser, defaultPlacement);
			if ((placement == Placement.LEFT) || (placement == Placement.RIGHT))
				propertyManager.inheritProperties(axisLabels, "styles.yAxisLabels");
			else
				propertyManager.inheritProperties(axisLabels, "styles.xAxisLabels");

			if (axisLabels is CategoryAxisLabels)
				propertyManager.inheritProperties(axisLabels, "styles.categoryAxisLabels");
			else if (axisLabels is NumericAxisLabels)
				propertyManager.inheritProperties(axisLabels, "styles.numericAxisLabels");
			else if (axisLabels is TimeAxisLabels)
				propertyManager.inheritProperties(axisLabels, "styles.timeAxisLabels");

			propertyManager.inheritProperties(axisLabels, "styles.axisLabels");

			propertyManager.parseChildProperty(axisLabels, "majorLabelStyle", this._textBlockStylePropertyParser, "style");
			propertyManager.parseChildProperty(axisLabels, "majorLabelStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
			propertyManager.parseChildProperty(axisLabels, "minorLabelStyle", this._textBlockStylePropertyParser, "style");
			propertyManager.parseChildProperty(axisLabels, "minorLabelStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");

			delete this._processingInstances[axisLabels];
		}

		private function _processAxisTitleProperties(axisTitle:AxisTitle, axisLabels:AbstractAxisLabels = null) : void
		{
			if (!axisTitle || this._processingInstances[axisTitle])
				return;

			var propertyManager:PropertyManager = this._propertyManager;
			if (!propertyManager.getPropertyPath(axisTitle))
				return;

			this._processingInstances[axisTitle] = true;

			var defaultTitleText:String = null;
			var defaultPlacement:String = Placement.BOTTOM;

			if (axisLabels)
			{
				defaultPlacement = axisLabels.placement;

				var axisInfo:Object = this._chartAxisInfo[axisLabels.axis];
				if (axisInfo)
				{
					defaultTitleText = axisInfo.titleText;

					if (axisInfo.isPrimary)
						propertyManager.inheritProperties(axisTitle, "styles.primaryAxisTitle");
					else if (axisInfo.isSecondary)
						propertyManager.inheritProperties(axisTitle, "styles.secondaryAxisTitle");
				}
			}

			var placement:String = propertyManager.parseChildProperty(axisTitle, "placement", this._stringPropertyParser, defaultPlacement);
			if ((placement == Placement.LEFT) || (placement == Placement.RIGHT))
				propertyManager.inheritProperties(axisTitle, "styles.yAxisTitle");
			else
				propertyManager.inheritProperties(axisTitle, "styles.xAxisTitle");

			propertyManager.inheritProperties(axisTitle, "styles.axisTitle");

			propertyManager.parseChildProperty(axisTitle, "defaultTextFormat", this._textFormatPropertyParser, "textFormat");
			var htmlText:String = propertyManager.parseChildProperty(axisTitle, "htmlText", this._stringPropertyParser);
			if (!htmlText)
				propertyManager.parseChildProperty(axisTitle, "text", this._stringPropertyParser, defaultTitleText);

			delete this._processingInstances[axisTitle];
		}

		private function _processGridLinesProperties(gridLines:GridLines) : void
		{
			if (!gridLines || this._processingInstances[gridLines])
				return;

			var propertyManager:PropertyManager = this._propertyManager;
			if (!propertyManager.getPropertyPath(gridLines))
				return;

			this._processingInstances[gridLines] = true;

			var axisLabels:AbstractAxisLabels = propertyManager.parseChildProperty(gridLines, "axisLabels", this._axisLabelsPropertyParser);
			if (axisLabels)
			{
				this._processAxisLabelsProperties(axisLabels);

				var axisInfo:Object = this._chartAxisInfo[axisLabels.axis];
				if (axisInfo)
				{
					if (axisInfo.isPrimary)
						propertyManager.inheritProperties(gridLines, "styles.primaryGridLines");
					else if (axisInfo.isSecondary)
						propertyManager.inheritProperties(gridLines, "styles.secondaryGridLines");

					if (axisInfo.isX)
						propertyManager.inheritProperties(gridLines, "styles.xGridLines");
					else if (axisInfo.isY)
						propertyManager.inheritProperties(gridLines, "styles.yGridLines");
				}
			}

			propertyManager.inheritProperties(gridLines, "styles.gridLines");

			delete this._processingInstances[gridLines];
		}

		private function _processSeries(charts:Array, legends:Array, axisLabels:Array, gridLines:Array) : Array
		{
			if (!charts)
				return null;

			var propertyManager:PropertyManager = this._propertyManager;

			var chart:AbstractChart;
			var legend:Legend;
			var axisLabel:AbstractAxisLabels;
			var gridLine:GridLines;
			var data:IDataTable;
			var chartDataMap:Dictionary = new Dictionary();
			var legendMap:Dictionary = new Dictionary();
			var axisLabelMap:Dictionary = new Dictionary();
			var numSeries:int = 0;
			var i:int;

			for each (chart in charts)
			{
				if (propertyManager.getPropertyPath(chart))
				{
					data = chartDataMap[chart] = propertyManager.parseChildProperty(chart, "data", this._dataTablePropertyParser);
					if (data)
						numSeries = Math.max(numSeries, data.numColumns - 1);
				}
			}

			for each (legend in legends)
				legendMap[legend] = legend;

			for each (axisLabel in axisLabels)
				axisLabelMap[axisLabel] = axisLabel;

			var seriesCharts:Array = new Array();
			var seriesLegends:Array = new Array();
			var seriesAxisLabels:Array = new Array();
			var seriesGridLines:Array = new Array();
			var seriesMargin:Margin;

			var splitSeries:Boolean = propertyManager.parseProperty("layout.splitSeries", this._booleanPropertyParser);
			if (splitSeries)
			{
				seriesMargin = propertyManager.parseProperty("layout.splitSeriesMargin", this._marginPropertyParser);

				var clones:Array;
				var path:String;
				var placement:String;
				for (i = 1; i <= numSeries; i++)
				{
					clones = new Array();
					for each (legend in legends)
					{
						path = propertyManager.getPropertyPath(legend);
						if (path)
						{
							placement = propertyManager.parseChildProperty(legend, "placement", this._stringPropertyParser);
							if (placement == Placement.LEFT)
								propertyManager.parseChildProperty(legend, "swatchPlacement", this._stringPropertyParser, "right");
							propertyManager.parseChildProperties(legend);
							legend = propertyManager.parsePropertyAs(path + "." + i, this._legendPropertyParser, "#" + path);
							propertyManager.parseChildProperties(legend);
							clones.push(legend);
						}
					}
					seriesLegends.push(clones);

					clones = new Array();
					for each (chart in charts)
					{
						path = propertyManager.getPropertyPath(chart);
						if (path)
						{
							legend = propertyManager.parseChildProperty(chart, "legend", this._legendPropertyParser);
							propertyManager.parseChildProperties(chart);
							chart = propertyManager.parsePropertyAs(path + "." + i, this._chartPropertyParser, "#" + path);
							propertyManager.parseChildPropertyAs(chart, "data", this._dataTablePropertyParser, "view");
							propertyManager.parseChildPropertyAs(chart, "data.table", this._dataTablePropertyParser, "@" + path + ".data");
							propertyManager.parseChildPropertyAs(chart, "data.columns", this._sliceArrayPropertyParser, "[0," + i + "]");
							if (legend && legendMap[legend])
							{
								path = propertyManager.getPropertyPath(legend);
								propertyManager.parseChildPropertyAs(chart, "legend", this._legendPropertyParser, "@" + path + "." + i);
							}
							propertyManager.parseChildProperties(chart);
							clones.push(chart);
						}
					}
					seriesCharts.push(clones);

					clones = new Array();
					for each (axisLabel in axisLabels)
					{
						path = propertyManager.getPropertyPath(axisLabel);
						if (path)
						{
							propertyManager.parseChildProperties(axisLabel);
							axisLabel = propertyManager.parsePropertyAs(path + "." + i, this._axisLabelsPropertyParser, "#" + path);
							propertyManager.parseChildProperties(axisLabel);
							clones.push(axisLabel);
						}
					}
					seriesAxisLabels.push(clones);

					clones = new Array();
					for each (gridLine in gridLines)
					{
						path = propertyManager.getPropertyPath(gridLine);
						if (path)
						{
							axisLabel = propertyManager.parseChildProperty(gridLine, "axisLabels", this._axisLabelsPropertyParser);
							propertyManager.parseChildProperties(gridLine);
							gridLine = propertyManager.parsePropertyAs(path + "." + i, this._gridLinesPropertyParser, "#" + path);
							if (axisLabel && axisLabelMap[axisLabel])
							{
								path = propertyManager.getPropertyPath(axisLabel);
								propertyManager.parseChildPropertyAs(gridLine, "axisLabels", this._axisLabelsPropertyParser, "@" + path + "." + i);
							}
							propertyManager.parseChildProperties(gridLine);
							clones.push(gridLine);
						}
					}
					seriesGridLines.push(clones);
				}

				for each (chart in charts)
					chart.data = null;
			}
			else
			{
				numSeries = 1;

				seriesCharts.push(charts);
				seriesLegends.push(legends);
				seriesAxisLabels.push(axisLabels);
				seriesGridLines.push(gridLines);

				for each (chart in charts)
					chart.data = chartDataMap[chart];
			}

			var newSeries:Array = new Array();
			var oldSeries:Array = this._chartLayout.series;
			var numOldSeries:int = oldSeries ? oldSeries.length : 0;
			var series:SeriesLayout;

			if (!seriesMargin)
				seriesMargin = new Margin();

			for (i = 0; i < numSeries; i++)
			{
				if (i < numOldSeries)
				{
					series = oldSeries[i];
				}
				else
				{
					series = new SeriesLayout();
					series.numericAxisFormat = this._numericAxisFormat;
					series.timeAxisFormat = this._timeAxisFormat;
					series.addEventListener(ValidateEvent.VALIDATED, this._chart_validated);
				}

				series.charts = seriesCharts[i];
				series.legends = seriesLegends[i];
				series.axisLabels = seriesAxisLabels[i];
				series.gridLines = seriesGridLines[i];

				series.leftLayout.margin = new Margin(seriesMargin.left, 0, seriesMargin.top, seriesMargin.bottom);
				series.centerLayout.margin = new Margin(0, 0, seriesMargin.top, seriesMargin.bottom);
				series.rightLayout.margin = new Margin(0, seriesMargin.right, seriesMargin.top, seriesMargin.bottom);

				newSeries.push(series);
			}

			return newSeries;
		}

		private function _setDefaultProperties() : void
		{
			var propertyManager:PropertyManager = this._propertyManager;

			propertyManager.addNamespace("default", 1);
			propertyManager.addNamespace("legacy", 2);
			propertyManager.addNamespace("external", 3);

			propertyManager.setNamespace("default");

			var values:Object = {

				"timeZone": "",

				"fontFace": "_sans",
				"fontSize": "11",
				"fontColor": "0x000000",

				"fieldColors": "",
				"fieldShapes": "",

				"foregroundColor": "0x000000",
				"backgroundColor": "0xFFFFFF",
				"seriesColors": "[0x6CB8CA,0xFAC61D,0xD85E3D,0x956E96,0xF7912C,0x9AC23C,0x5479AF,0x999755,0xDD87B0,0x65AA82," +
				                 "0xA7D4DF,0xFCDD77,0xE89E8B,0xBFA8C0,0xFABD80,0xC2DA8A,0x98AFCF,0xC2C199,0xEBB7D0,0xA3CCB4," +
				                 "0x416E79,0x967711,0x823825,0x59425A,0x94571A,0x5C7424,0x324969,0x5C5B33,0x85516A,0x3D664E]",
				"annotationColors": "[0xCC0000,0xCCCC00,0x00CC00,0x00CCCC,0x0000CC]",
				"gaugeColors": "[0x84E900,0xFFE800,0xBF3030]",

				"gaugeFilter1": "glow{color:0x000000,alpha:1,blurX:4,blurY:4,strength:1,quality:2}",
				"gaugeFilter2": "glow{color:0x000000,alpha:1,blurX:4,blurY:4,strength:1,quality:2,inner:true}",
				"gaugeFilter3": "glow{color:0xFFE800,alpha:1,blurX:4,blurY:4,strength:1,quality:1}",
				"gaugeFilter4": "glow{color:0x000000,alpha:0.3,blurX:2,blurY:2,strength:1,quality:2}",
				"gaugeFilter5": "glow{color:0xFFFFFF,alpha:1,blurX:4,blurY:4,strength:1,quality:2}",
				"gaugeFilter6": "glow{color:0x333333,alpha:1,blurX:2,blurY:2,strength:1,quality:2}",

				"backgroundBrush": "solidFill",
				"backgroundBrush.color": "@backgroundColor",

				"axisLineBrush": "solidStroke",
				"axisLineBrush.thickness": "1",
				"axisLineBrush.color": "@foregroundColor",
				"axisLineBrush.alpha": "0.2",
				"axisLineBrush.pixelHinting": "true",
				"axisLineBrush.caps": "square",

				"gridLineBrush": "solidStroke",
				"gridLineBrush.thickness": "1",
				"gridLineBrush.color": "@foregroundColor",
				"gridLineBrush.alpha": "0.1",
				"gridLineBrush.pixelHinting": "true",
				"gridLineBrush.caps": "none",

				"gaugeLineBrush": "solidStroke",
				"gaugeLineBrush.thickness": "1",
				"gaugeLineBrush.color": "@foregroundColor",
				"gaugeLineBrush.caps": "none",

				"gaugeWarningBrush": "imageFill",
				"gaugeWarningBrush.source": this._staticPath + "/img/skins/default/gauge_warning.png",
				"gaugeWarningBrush.smooth": "true",

				"colorPalette": "field",
				"colorPalette.fieldColors": "@fieldColors",
				"colorPalette.defaultColorPalette": "list",
				"colorPalette.defaultColorPalette.colors": "@seriesColors",

				"colorPaletteDark": "brightness",
				"colorPaletteDark.colorPalette": "@colorPalette",
				"colorPaletteDark.brightness": "-0.15",

				"annotationColorPalette": "list",
				"annotationColorPalette.colors": "@annotationColors",

				"annotationColorPaletteDark": "brightness",
				"annotationColorPaletteDark.colorPalette": "@annotationColorPalette",
				"annotationColorPaletteDark.brightness": "-0.15",

				"gaugeColorPalette": "list",
				"gaugeColorPalette.colors": "@gaugeColors",
				"gaugeColorPalette.interpolate": "true",

				"gaugeColorPaletteDark": "brightness",
				"gaugeColorPaletteDark.colorPalette": "@gaugeColorPalette",
				"gaugeColorPaletteDark.brightness": "-0.25",

				"fillBrushPalette": "gradientFill",
				"fillBrushPalette.colorPalettes": "[@colorPalette,@colorPaletteDark]",
				"fillBrushPalette.alphas": "[1,1]",
				"fillBrushPalette.ratios": "[0,255]",
				"fillBrushPalette.tileTransform": "(0,1,-1,0)",

				"lineBrushPalette": "solidStroke",
				"lineBrushPalette.thickness": "2",
				"lineBrushPalette.colorPalette": "@colorPalette",
				"lineBrushPalette.caps": "none",
				"lineBrushPalette.joints": "miter",

				"barBrushPalette": "#fillBrushPalette",
				"barBrushPalette.fitToDrawing": "true",

				"annotationBrushPalette": "#fillBrushPalette",
				"annotationBrushPalette.colorPalettes": "[@annotationColorPalette,@annotationColorPaletteDark]",

				"gaugeBrushPalette": "#fillBrushPalette",
				"gaugeBrushPalette.colorPalettes": "[@gaugeColorPalette,@gaugeColorPaletteDark]",

				"markerShapePalette": "field",
				"markerShapePalette.fieldShapes": "@fieldShapes",

				"message.defaultTextFormat.font": "@fontFace",
				"message.defaultTextFormat.size": "14",
				"message.defaultTextFormat.color": "@fontColor",
				"message.defaultTextFormat.align": "center",

				"tooltip.maximumWidth": "500",
				"tooltip.content.margin": "(5,5,2,2)",
				"tooltip.content.swatchStyle.height": "10",
				"tooltip.content.swatchStyle.margin": "(0,5,0,0)",
				"tooltip.content.fieldStyle.margin": "(0,5,0,0)",
				"tooltip.content.fieldStyle.defaultTextFormat.font": "@fontFace",
				"tooltip.content.fieldStyle.defaultTextFormat.size": "@fontSize",
				"tooltip.content.fieldStyle.defaultTextFormat.color": "0xCCCCCC",
				"tooltip.content.valueStyle.defaultTextFormat.font": "@fontFace",
				"tooltip.content.valueStyle.defaultTextFormat.size": "@fontSize",
				"tooltip.content.valueStyle.defaultTextFormat.color": "0xFFFFFF",

				//"dataSpriteTip",

				"chart": "column",
				"chart.data": "@data",

				"data": "results",

				"legend": "legend",

				"annotationLegend": "legend",
				"annotationLegend.masterLegend": null,

				//"externalLegend",

				//"axisW",

				//"axisX",

				//"axisY",

				//"axisZ",

				"axisLabelsX": "#axisX",
				"axisLabelsX.axis": "@axisX",

				"axisLabelsY": "#axisY",
				"axisLabelsY.axis": "@axisY",

				"axisTitleX": "axisTitle",

				"axisTitleY": "axisTitle",

				"gridLinesX": "gridLines",
				"gridLinesX.axisLabels": "@axisLabelsX",

				"gridLinesY": "gridLines",
				"gridLinesY.axisLabels": "@axisLabelsY",

				"layout.splitSeriesMargin": "(0,0,5,5)",

				"styles.chart.legend": "@legend",

				"styles.chart1D.axis": "@axisX",

				"styles.chart2D.axisX": "@axisX",
				"styles.chart2D.axisY": "@axisY",

				"styles.chart3D.axisX": "@axisX",
				"styles.chart3D.axisY": "@axisY",
				"styles.chart3D.axisZ": "@axisZ",

				"styles.chart4D.axisW": "@axisW",
				"styles.chart4D.axisX": "@axisX",
				"styles.chart4D.axisY": "@axisY",
				"styles.chart4D.axisZ": "@axisZ",

				"styles.annotationChart.legend": "@annotationLegend",
				"styles.annotationChart.markerBrushPalette": "@annotationBrushPalette",
				"styles.annotationChart.labelStyle.margin": "(3,3,0,0)",
				"styles.annotationChart.labelStyle.defaultTextFormat.font": "@fontFace",
				"styles.annotationChart.labelStyle.defaultTextFormat.size": "@fontSize",
				"styles.annotationChart.labelStyle.defaultTextFormat.color": "0xFFFFFF",
				"styles.annotationChart.labelStyle.maximumWidth": "75",

				"styles.areaChart.areaBrushPalette": "@fillBrushPalette",
				"styles.areaChart.areaStyle.alpha": "0.7",
				"styles.areaChart.lineBrushPalette": "@lineBrushPalette",

				"styles.barChart.barBrushPalette": "@barBrushPalette",
				"styles.barChart.barAlignment": "0",
				"styles.barChart.barSpacing": "0.2",

				"styles.bubbleChart.bubbleBrushPalette": "@fillBrushPalette",

				"styles.columnChart.columnBrushPalette": "@fillBrushPalette",
				"styles.columnChart.columnAlignment": "0",
				"styles.columnChart.columnSpacing": "0.2",

				"styles.fillerGauge.fillerBrushPalette": "@gaugeBrushPalette",
				"styles.fillerGauge.fillerPlacement1": "0",
				"styles.fillerGauge.fillerPlacement2": "25",
				"styles.fillerGauge.majorTickBrush": "@gaugeLineBrush",
				"styles.fillerGauge.majorTickPlacement1": "26",
				"styles.fillerGauge.majorTickPlacement2": "35",
				"styles.fillerGauge.minorTickBrush": "@gaugeLineBrush",
				"styles.fillerGauge.minorTickPlacement1": "26",
				"styles.fillerGauge.minorTickPlacement2": "30",
				"styles.fillerGauge.labelStyle.defaultTextFormat.font": "@fontFace",
				"styles.fillerGauge.labelStyle.defaultTextFormat.size": "11",
				"styles.fillerGauge.labelStyle.defaultTextFormat.color": "@fontColor",
				"styles.fillerGauge.labelPlacement": "36",
				"styles.fillerGauge.valueStyle.defaultTextFormat.font": "@fontFace",
				"styles.fillerGauge.valueStyle.defaultTextFormat.size": "16",
				"styles.fillerGauge.valueStyle.defaultTextFormat.color": "@fontColor",
				"styles.fillerGauge.valuePlacement": "-5",
				"styles.fillerGauge.warningBrush": "@gaugeWarningBrush",
				"styles.fillerGauge.warningShape": "rectangle",
				"styles.fillerGauge.warningPlacement": "70",
				"styles.fillerGauge.warningSize": "20",
				"styles.fillerGauge.foregroundPlacement1": "0",
				"styles.fillerGauge.foregroundPlacement2": "25",
				"styles.fillerGauge.backgroundPlacement1": "0",
				"styles.fillerGauge.backgroundPlacement2": "25",
				"styles.fillerGauge.showMinorTicks": "false",

				"styles.fillerGaugeShiny.fillerBrushPalette": "gradientFill",
				"styles.fillerGaugeShiny.fillerBrushPalette.colorPalettes": "[@gaugeColorPaletteDark,@gaugeColorPalette]",
				"styles.fillerGaugeShiny.fillerBrushPalette.alphas": "[1,1]",
				"styles.fillerGaugeShiny.fillerBrushPalette.ratios": "[0,255]",
				"styles.fillerGaugeShiny.fillerPlacement1": "-30",
				"styles.fillerGaugeShiny.fillerPlacement2": "30",
				"styles.fillerGaugeShiny.rangePadding": "20",
				"styles.fillerGaugeShiny.majorTickBrush": "solidStroke",
				"styles.fillerGaugeShiny.majorTickBrush.thickness": "2",
				"styles.fillerGaugeShiny.majorTickBrush.color": "@foregroundColor",
				"styles.fillerGaugeShiny.majorTickBrush.caps": "none",
				"styles.fillerGaugeShiny.majorTickStyle.filters": "[@gaugeFilter4]",
				"styles.fillerGaugeShiny.majorTickPlacement1": "33",
				"styles.fillerGaugeShiny.majorTickPlacement2": "43",
				"styles.fillerGaugeShiny.minorTickBrush": "solidStroke",
				"styles.fillerGaugeShiny.minorTickBrush.thickness": "2",
				"styles.fillerGaugeShiny.minorTickBrush.color": "@foregroundColor",
				"styles.fillerGaugeShiny.minorTickBrush.caps": "none",
				"styles.fillerGaugeShiny.minorTickStyle.filters": "[@gaugeFilter4]",
				"styles.fillerGaugeShiny.minorTickPlacement1": "33",
				"styles.fillerGaugeShiny.minorTickPlacement2": "38",
				"styles.fillerGaugeShiny.labelStyle.defaultTextFormat.size": "12",
				"styles.fillerGaugeShiny.labelStyle.filters": "[@gaugeFilter4]",
				"styles.fillerGaugeShiny.labelPlacement": "44",
				"styles.fillerGaugeShiny.valueStyle.defaultTextFormat.size": "16",
				"styles.fillerGaugeShiny.valueStyle.defaultTextFormat.color": "0x000000",
				"styles.fillerGaugeShiny.valueStyle.filters": "[@gaugeFilter5]",
				"styles.fillerGaugeShiny.valuePlacement": "0",
				"styles.fillerGaugeShiny.warningBrush": "imageFill",
				"styles.fillerGaugeShiny.warningBrush.source": this._staticPath + "/img/skins/default/gauge_warning_1.png",
				"styles.fillerGaugeShiny.warningBrush.smooth": "true",
				"styles.fillerGaugeShiny.warningShape": "rectangle",
				"styles.fillerGaugeShiny.warningPlacement": "80",
				"styles.fillerGaugeShiny.warningSize": "20",
				"styles.fillerGaugeShiny.foregroundBrush": "imageFill",
				"styles.fillerGaugeShiny.foregroundBrush.source": this._staticPath + "/img/skins/default/gauge_filler_foreground_1.png",
				"styles.fillerGaugeShiny.foregroundBrush.smooth": "true",
				"styles.fillerGaugeShiny.foregroundStyle.alpha": "0.75",
				"styles.fillerGaugeShiny.foregroundStyle.blendMode": "screen",
				"styles.fillerGaugeShiny.foregroundPlacement1": "-30",
				"styles.fillerGaugeShiny.foregroundPlacement2": "30",
				"styles.fillerGaugeShiny.foregroundPadding": "20",
				"styles.fillerGaugeShiny.backgroundBrush": "imageFill",
				"styles.fillerGaugeShiny.backgroundBrush.source": this._staticPath + "/img/skins/default/gauge_filler_background_1.png",
				"styles.fillerGaugeShiny.backgroundBrush.smooth": "true",
				"styles.fillerGaugeShiny.backgroundStyle.filters": "[@gaugeFilter6]",
				"styles.fillerGaugeShiny.backgroundPlacement1": "-30",
				"styles.fillerGaugeShiny.backgroundPlacement2": "30",
				"styles.fillerGaugeShiny.backgroundPadding": "20",
				"styles.fillerGaugeShiny.layers": "[value]",
				"styles.fillerGaugeShiny.showMinorTicks": "false",

				"styles.histogram.columnBrushPalette": "@fillBrushPalette",

				"styles.lineChart.lineBrushPalette": "@lineBrushPalette",
				"styles.lineChart.markerBrushPalette": "@fillBrushPalette",
				"styles.lineChart.markerShapePalette": "@markerShapePalette",
				"styles.lineChart.markerSize": "10",
				"styles.lineChart.showMarkers": "false",

				"styles.markerGauge.markerBrush": "solidFill",
				"styles.markerGauge.markerBrush.color": "@foregroundColor",
				"styles.markerGauge.markerPlacement1": "-3",
				"styles.markerGauge.markerPlacement2": "28",
				"styles.markerGauge.markerThickness": "5",
				"styles.markerGauge.rangeBandBrushPalette": "@gaugeBrushPalette",
				"styles.markerGauge.rangeBandPlacement1": "0",
				"styles.markerGauge.rangeBandPlacement2": "25",
				"styles.markerGauge.majorTickBrush": "@gaugeLineBrush",
				"styles.markerGauge.majorTickPlacement1": "26",
				"styles.markerGauge.majorTickPlacement2": "35",
				"styles.markerGauge.minorTickBrush": "@gaugeLineBrush",
				"styles.markerGauge.minorTickPlacement1": "26",
				"styles.markerGauge.minorTickPlacement2": "30",
				"styles.markerGauge.labelStyle.defaultTextFormat.font": "@fontFace",
				"styles.markerGauge.labelStyle.defaultTextFormat.size": "11",
				"styles.markerGauge.labelStyle.defaultTextFormat.color": "@fontColor",
				"styles.markerGauge.labelPlacement": "36",
				"styles.markerGauge.valueStyle.defaultTextFormat.font": "@fontFace",
				"styles.markerGauge.valueStyle.defaultTextFormat.size": "16",
				"styles.markerGauge.valueStyle.defaultTextFormat.color": "@fontColor",
				"styles.markerGauge.valuePlacement": "-5",
				"styles.markerGauge.warningBrush": "@gaugeWarningBrush",
				"styles.markerGauge.warningShape": "rectangle",
				"styles.markerGauge.warningPlacement": "70",
				"styles.markerGauge.warningSize": "20",
				"styles.markerGauge.foregroundPlacement1": "0",
				"styles.markerGauge.foregroundPlacement2": "25",
				"styles.markerGauge.backgroundPlacement1": "0",
				"styles.markerGauge.backgroundPlacement2": "25",
				"styles.markerGauge.showMinorTicks": "false",

				"styles.markerGaugeShiny.markerBrush": "imageFill",
				"styles.markerGaugeShiny.markerBrush.source": this._staticPath + "/img/skins/default/gauge_marker_marker_2.png",
				"styles.markerGaugeShiny.markerBrush.smooth": "true",
				"styles.markerGaugeShiny.markerPlacement1": "-48",
				"styles.markerGaugeShiny.markerPlacement2": "48",
				"styles.markerGaugeShiny.markerThickness": "85",
				"styles.markerGaugeShiny.rangeBandBrushPalette": "gradientFill",
				"styles.markerGaugeShiny.rangeBandBrushPalette.colorPalettes": "[@gaugeColorPaletteDark,@gaugeColorPalette]",
				"styles.markerGaugeShiny.rangeBandBrushPalette.alphas": "[1,1]",
				"styles.markerGaugeShiny.rangeBandBrushPalette.ratios": "[0,255]",
				"styles.markerGaugeShiny.rangeBandStyle.filters": "[@gaugeFilter2]",
				"styles.markerGaugeShiny.rangeBandPlacement1": "-25",
				"styles.markerGaugeShiny.rangeBandPlacement2": "-16",
				"styles.markerGaugeShiny.rangePadding": "55",
				"styles.markerGaugeShiny.majorTickBrush": "solidStroke",
				"styles.markerGaugeShiny.majorTickBrush.thickness": "2",
				"styles.markerGaugeShiny.majorTickBrush.color": "0xCECECE",
				"styles.markerGaugeShiny.majorTickBrush.caps": "none",
				"styles.markerGaugeShiny.majorTickStyle.filters": "[@gaugeFilter1]",
				"styles.markerGaugeShiny.majorTickPlacement1": "-12",
				"styles.markerGaugeShiny.majorTickPlacement2": "0",
				"styles.markerGaugeShiny.minorTickBrush": "solidStroke",
				"styles.markerGaugeShiny.minorTickBrush.thickness": "1",
				"styles.markerGaugeShiny.minorTickBrush.color": "0xCECECE",
				"styles.markerGaugeShiny.minorTickBrush.caps": "none",
				"styles.markerGaugeShiny.minorTickStyle.filters": "[@gaugeFilter1]",
				"styles.markerGaugeShiny.minorTickPlacement1": "-12",
				"styles.markerGaugeShiny.minorTickPlacement2": "-6",
				"styles.markerGaugeShiny.labelStyle.defaultTextFormat.size": "12",
				"styles.markerGaugeShiny.labelStyle.defaultTextFormat.color": "0xCECECE",
				"styles.markerGaugeShiny.labelStyle.filters": "[@gaugeFilter1]",
				"styles.markerGaugeShiny.labelPlacement": "1",
				"styles.markerGaugeShiny.valueStyle.defaultTextFormat.size": "16",
				"styles.markerGaugeShiny.valueStyle.filters": "[@gaugeFilter4]",
				"styles.markerGaugeShiny.valuePlacement": "-50",
				"styles.markerGaugeShiny.warningBrush": "imageFill",
				"styles.markerGaugeShiny.warningBrush.source": this._staticPath + "/img/skins/default/gauge_warning_1.png",
				"styles.markerGaugeShiny.warningBrush.smooth": "true",
				"styles.markerGaugeShiny.warningShape": "rectangle",
				"styles.markerGaugeShiny.warningPlacement": "60",
				"styles.markerGaugeShiny.warningSize": "20",
				"styles.markerGaugeShiny.foregroundPlacement1": "-30",
				"styles.markerGaugeShiny.foregroundPlacement2": "30",
				"styles.markerGaugeShiny.foregroundPadding": "40",
				"styles.markerGaugeShiny.backgroundBrush": "solidFill",
				"styles.markerGaugeShiny.backgroundBrush.color": "0x4D4D4D",
				"styles.markerGaugeShiny.backgroundStyle.filters": "[@gaugeFilter6]",
				"styles.markerGaugeShiny.backgroundPlacement1": "-30",
				"styles.markerGaugeShiny.backgroundPlacement2": "30",
				"styles.markerGaugeShiny.backgroundPadding": "40",
				"styles.markerGaugeShiny.layers": "[marker,value]",
				"styles.markerGaugeShiny.showMinorTicks": "true",
				"styles.markerGaugeShiny.showValue": "false",

				"styles.pieChart.sliceBrushPalette": "@fillBrushPalette",
				"styles.pieChart.labelStyle.defaultTextFormat.font": "@fontFace",
				"styles.pieChart.labelStyle.defaultTextFormat.size": "@fontSize",
				"styles.pieChart.labelStyle.defaultTextFormat.color": "@fontColor",
				"styles.pieChart.labelLineBrush": "@axisLineBrush",

				"styles.radialGauge.needleBrush": "solidFill",
				"styles.radialGauge.needleBrush.color": "@foregroundColor",
				"styles.radialGauge.needleRadius1": "0.1",
				"styles.radialGauge.needleRadius2": "0.96",
				"styles.radialGauge.needleThickness": "0.05",
				"styles.radialGauge.rangeBandBrushPalette": "@gaugeBrushPalette",
				"styles.radialGauge.rangeBandRadius1": "0.89",
				"styles.radialGauge.rangeBandRadius2": "1",
				"styles.radialGauge.majorTickBrush": "@gaugeLineBrush",
				"styles.radialGauge.majorTickRadius1": "0.8",
				"styles.radialGauge.majorTickRadius2": "0.87",
				"styles.radialGauge.minorTickBrush": "@gaugeLineBrush",
				"styles.radialGauge.minorTickRadius1": "0.85",
				"styles.radialGauge.minorTickRadius2": "0.87",
				"styles.radialGauge.labelStyle.defaultTextFormat.font": "@fontFace",
				"styles.radialGauge.labelStyle.defaultTextFormat.size": "11",
				"styles.radialGauge.labelStyle.defaultTextFormat.color": "@fontColor",
				"styles.radialGauge.labelRadius": "0.79",
				"styles.radialGauge.valueStyle.defaultTextFormat.font": "@fontFace",
				"styles.radialGauge.valueStyle.defaultTextFormat.size": "16",
				"styles.radialGauge.valueStyle.defaultTextFormat.color": "@fontColor",
				"styles.radialGauge.valueRadius": "0.8",
				"styles.radialGauge.warningBrush": "@gaugeWarningBrush",
				"styles.radialGauge.warningShape": "rectangle",
				"styles.radialGauge.warningRadius": "1.05",
				"styles.radialGauge.warningSize": "0.2",
				"styles.radialGauge.showMinorTicks": "false",

				"styles.radialGaugeShiny.needleBrush": "imageFill",
				"styles.radialGaugeShiny.needleBrush.source": this._staticPath + "/img/skins/default/gauge_radial_needle_1.png",
				"styles.radialGaugeShiny.needleBrush.smooth": "true",
				"styles.radialGaugeShiny.needleStyle.filters": "[@gaugeFilter1]",
				"styles.radialGaugeShiny.needleRadius1": "-0.15",
				"styles.radialGaugeShiny.needleRadius2": "0.86",
				"styles.radialGaugeShiny.needleThickness": "0.1",
				"styles.radialGaugeShiny.rangeBandBrushPalette": "gradientFill",
				"styles.radialGaugeShiny.rangeBandBrushPalette.type": "radial",
				"styles.radialGaugeShiny.rangeBandBrushPalette.colorPalettes": "[@gaugeColorPalette,@gaugeColorPaletteDark]",
				"styles.radialGaugeShiny.rangeBandBrushPalette.alphas": "[1,1]",
				"styles.radialGaugeShiny.rangeBandBrushPalette.ratios": "[194,214]",
				"styles.radialGaugeShiny.rangeBandStyle.filters": "[@gaugeFilter2]",
				"styles.radialGaugeShiny.rangeBandRadius1": "0.76",
				"styles.radialGaugeShiny.rangeBandRadius2": "0.84",
				"styles.radialGaugeShiny.majorTickBrush": "solidStroke",
				"styles.radialGaugeShiny.majorTickBrush.thickness": "2",
				"styles.radialGaugeShiny.majorTickBrush.color": "0xCECECE",
				"styles.radialGaugeShiny.majorTickBrush.caps": "none",
				"styles.radialGaugeShiny.majorTickStyle.filters": "[@gaugeFilter1]",
				"styles.radialGaugeShiny.majorTickRadius1": "0.63",
				"styles.radialGaugeShiny.majorTickRadius2": "0.73",
				"styles.radialGaugeShiny.minorTickBrush": "solidStroke",
				"styles.radialGaugeShiny.minorTickBrush.thickness": "2",
				"styles.radialGaugeShiny.minorTickBrush.color": "0xCECECE",
				"styles.radialGaugeShiny.minorTickBrush.caps": "none",
				"styles.radialGaugeShiny.minorTickStyle.filters": "[@gaugeFilter1]",
				"styles.radialGaugeShiny.minorTickRadius1": "0.68",
				"styles.radialGaugeShiny.minorTickRadius2": "0.73",
				"styles.radialGaugeShiny.labelStyle.defaultTextFormat.size": "12",
				"styles.radialGaugeShiny.labelStyle.defaultTextFormat.color": "0xCECECE",
				"styles.radialGaugeShiny.labelStyle.filters": "[@gaugeFilter1]",
				"styles.radialGaugeShiny.labelRadius": "0.62",
				"styles.radialGaugeShiny.valueStyle.defaultTextFormat.size": "16",
				"styles.radialGaugeShiny.valueStyle.defaultTextFormat.color": "0xFFFFFF",
				"styles.radialGaugeShiny.valueStyle.filters": "[@gaugeFilter3]",
				"styles.radialGaugeShiny.valueRadius": "0.76",
				"styles.radialGaugeShiny.warningBrush": "imageFill",
				"styles.radialGaugeShiny.warningBrush.source": this._staticPath + "/img/skins/default/gauge_warning_1.png",
				"styles.radialGaugeShiny.warningBrush.smooth": "true",
				"styles.radialGaugeShiny.warningShape": "rectangle",
				"styles.radialGaugeShiny.warningRadius": "1.05",
				"styles.radialGaugeShiny.warningSize": "0.2",
				"styles.radialGaugeShiny.foregroundBrush": "imageFill",
				"styles.radialGaugeShiny.foregroundBrush.source": this._staticPath + "/img/skins/default/gauge_radial_foreground_1.png",
				"styles.radialGaugeShiny.foregroundBrush.smooth": "true",
				"styles.radialGaugeShiny.foregroundStyle.alpha": "0.75",
				"styles.radialGaugeShiny.foregroundStyle.blendMode": "screen",
				"styles.radialGaugeShiny.backgroundBrush": "imageFill",
				"styles.radialGaugeShiny.backgroundBrush.source": this._staticPath + "/img/skins/default/gauge_radial_background_1.png",
				"styles.radialGaugeShiny.backgroundBrush.smooth": "true",
				"styles.radialGaugeShiny.showMinorTicks": "false",

				//"styles.rangeMarker",

				"styles.ratioBarChart.barBrushPalette": "@fillBrushPalette",
				"styles.ratioBarChart.labelStyle.margin": "(3,3,0,0)",
				"styles.ratioBarChart.labelStyle.defaultTextFormat.font": "@fontFace",
				"styles.ratioBarChart.labelStyle.defaultTextFormat.size": "@fontSize",
				"styles.ratioBarChart.labelStyle.defaultTextFormat.color": "@fontColor",
				"styles.ratioBarChart.labelLineBrush": "@axisLineBrush",

				"styles.scatterChart.markerBrushPalette": "@fillBrushPalette",
				"styles.scatterChart.markerShapePalette": "@markerShapePalette",
				"styles.scatterChart.markerSize": "10",

				//"styles.valueMarker",

				//"styles.data",

				"styles.resultsData.hostPath": this._hostPath,
				"styles.resultsData.basePath": this._basePath,
				"styles.resultsData.sessionKey": this._sessionKey,

				"styles.timelineData.hostPath": this._hostPath,
				"styles.timelineData.basePath": this._basePath,
				"styles.timelineData.sessionKey": this._sessionKey,

				//"styles.viewData",

				"styles.legend.defaultSwatchBrushPalette": "@fillBrushPalette",
				"styles.legend.masterLegend": "@externalLegend",
				"styles.legend.swatchStyle.height": "10",
				"styles.legend.swatchStyle.margin": "(2,2,0,0)",
				"styles.legend.labelStyle.maximumWidth": "250",
				"styles.legend.labelStyle.margin": "(2,2,0,0)",
				"styles.legend.labelStyle.defaultTextFormat.font": "@fontFace",
				"styles.legend.labelStyle.defaultTextFormat.size": "@fontSize",
				"styles.legend.labelStyle.defaultTextFormat.color": "@fontColor",
				"styles.legend.itemStyle.margin": "(3,3,0,0)",

				"styles.xLegend.margin": "(0,0,10,10)",

				"styles.yLegend.margin": "(10,10,0,0)",

				//"styles.axis",

				//"styles.categoryAxis",

				//"styles.numericAxis",

				//"styles.timeAxis",

				//"styles.xAxis",

				//"styles.yAxis",

				//"styles.primaryAxis",

				//"styles.secondaryAxis",

				"styles.axisLabels.axisBrush": "@axisLineBrush",
				"styles.axisLabels.majorTickBrush": "@axisLineBrush",
				"styles.axisLabels.majorTickSize": "25",
				"styles.axisLabels.minorTickBrush": "@axisLineBrush",
				"styles.axisLabels.minorTickSize": "10",
				"styles.axisLabels.majorLabelStyle.defaultTextFormat.font": "@fontFace",
				"styles.axisLabels.majorLabelStyle.defaultTextFormat.size": "@fontSize",
				"styles.axisLabels.majorLabelStyle.defaultTextFormat.color": "@fontColor",
				"styles.axisLabels.majorLabelAlignment": "afterTick",
				"styles.axisLabels.minorLabelStyle.defaultTextFormat.font": "@fontFace",
				"styles.axisLabels.minorLabelStyle.defaultTextFormat.size": "@fontSize",
				"styles.axisLabels.minorLabelStyle.defaultTextFormat.color": "@fontColor",
				"styles.axisLabels.minorLabelAlignment": "afterTick",

				"styles.categoryAxisLabels.majorLabelStyle.overflowMode": "ellipsisMiddle",
				"styles.categoryAxisLabels.majorLabelVisibility": "show",

				"styles.numericAxisLabels.integerUnits": "true",

				"styles.timeAxisLabels.timeZone": "@timeZone",
				"styles.timeAxisLabels.extendsAxisRange": "false",

				"styles.xAxisLabels.majorLabelStyle.margin": "(3,3,2,2)",
				"styles.xAxisLabels.majorLabelStyle.alignmentX": "0",
				"styles.xAxisLabels.minorLabelStyle.margin": "(3,3,2,2)",
				"styles.xAxisLabels.minorLabelStyle.alignmentX": "0",

				"styles.yAxisLabels.majorLabelStyle.margin": "(3,3,1,1)",
				"styles.yAxisLabels.majorLabelStyle.alignmentY": "0",
				"styles.yAxisLabels.minorLabelStyle.margin": "(3,3,1,1)",
				"styles.yAxisLabels.minorLabelStyle.alignmentY": "0",

				//"styles.primaryAxisLabels",

				"styles.secondaryAxisLabels.majorTickBrush": "@gridLineBrush",
				"styles.secondaryAxisLabels.minorTickBrush": "@gridLineBrush",
				"styles.secondaryAxisLabels.majorLabelAlignment": "beforeTick",
				"styles.secondaryAxisLabels.minorLabelAlignment": "beforeTick",

				"styles.axisTitle.defaultTextFormat.font": "@fontFace",
				"styles.axisTitle.defaultTextFormat.size": "@fontSize",
				"styles.axisTitle.defaultTextFormat.color": "@fontColor",
				"styles.axisTitle.defaultTextFormat.bold": "true",

				"styles.xAxisTitle.margin": "(0,0,10,10)",

				"styles.yAxisTitle.margin": "(10,10,0,0)",

				//"styles.primaryAxisTitle",

				//"styles.secondaryAxisTitle",

				"styles.gridLines.majorLineBrush": "@gridLineBrush",
				"styles.gridLines.minorLineBrush": "@gridLineBrush",

				//"styles.xGridLines",

				//"styles.yGridLines",

				"styles.primaryGridLines.majorLineBrush": "@axisLineBrush",
				"styles.primaryGridLines.minorLineBrush": "@axisLineBrush",
				"styles.primaryGridLines.showMajorLines": "false"

				//"styles.secondaryGridLines"

			};

			for (var propertyPath:String in values)
				propertyManager.setValue(propertyPath, values[propertyPath]);

			propertyManager.setNamespace("external");
		}

		private function _isLegacyProperty(propertyPath:String) : Boolean
		{
			if (!propertyPath)
				return false;

			var path:Array = propertyPath.split(".");
			if (!Charting._LEGACY_PROPERTY_MAP[path[0]])
				return false;

			return true;
		}

		private function _setLegacyProperty(propertyPath:String, propertyValue:String) : Boolean
		{
			if (!this._isLegacyProperty(propertyPath))
				return false;

			this._legacyPropertyValues[propertyPath] = propertyValue;
			return true;
		}

		private function _clearLegacyProperty(propertyPath:String) : Boolean
		{
			if (!this._isLegacyProperty(propertyPath))
				return false;

			delete this._legacyPropertyValues[propertyPath];
			return true;
		}

		private function _updateLegacyProperties() : void
		{
			var propertyManager:PropertyManager = this._propertyManager;

			propertyManager.setNamespace("legacy");

			propertyManager.clearAll();

			var legacyPropertyMap:Object;
			if (ParseUtils.trimWhiteSpace(propertyManager.getValue("chart", 2)) == "bar")
				legacyPropertyMap = Charting._LEGACY_PROPERTY_MAP_2;
			else
				legacyPropertyMap = Charting._LEGACY_PROPERTY_MAP;

			var legacyPropertyValues:Object = this._legacyPropertyValues;
			var propertyPath:String;
			var propertyValue:String;
			var path:Array;
			for (propertyPath in legacyPropertyValues)
			{
				propertyValue = legacyPropertyValues[propertyPath];

				path = propertyPath.split(".");
				path[0] = legacyPropertyMap[path[0]];
				propertyPath = path.join(".");

				propertyManager.setValue(propertyPath, propertyValue);
			}

			propertyManager.setNamespace("external");
		}

		private function _setTooltip(tooltip:Tooltip) : void
		{
			if (tooltip == this._tooltip)
				return;

			if (this._tooltip)
				this.removeChild(this._tooltip);

			this._tooltip = tooltip;

			if (this._tooltip)
				this.addChild(this._tooltip);
		}

		private function _setDataSpriteTip(dataSpriteTip:DataSpriteTip) : void
		{
			if (dataSpriteTip == this._dataSpriteTip)
				return;

			if (this._dataSpriteTip)
				this._dataSpriteTip.valueFormat = null;

			this._dataSpriteTip = dataSpriteTip;

			if (this._dataSpriteTip)
				this._dataSpriteTip.valueFormat = this._dataSpriteTipFormat;
		}

		private function _setExternalLegend(externalLegend:ExternalLegend) : void
		{
			if (externalLegend == this._externalLegend)
				return;

			if (this._externalLegend)
				this._closeExternalLegend();

			this._externalLegend = externalLegend;

			if (this._externalLegend)
				this._connectExternalLegend();
		}

		private function _connectExternalLegend() : void
		{
			clearTimeout(this._externalLegendConnectHandle);
			this._externalLegendConnectHandle = setTimeout(this._connectExternalLegend2, 0);
		}

		private function _connectExternalLegend2() : void
		{
			if (!this._externalLegend)
				return;

			try
			{
				this._externalLegend.connect();
			}
			catch (e:Error)
			{
			}
		}

		private function _closeExternalLegend() : void
		{
			clearTimeout(this._externalLegendConnectHandle);

			if (!this._externalLegend)
				return;

			this._externalLegend.close();
		}

		private function _update() : void
		{
			if (this._dataLoading)
				return;

			clearTimeout(this._updateRetryHandle);

			if (!ValidateQueue.validateAll())
			{
				this._updateRetryHandle = setTimeout(this._update, 0);
				return;
			}

			this._dataError = null;

			var data:IDataLoadable;
			var dataLoading:Dictionary = new Dictionary();
			var hasData:Boolean = false;

			for each (data in this._loadableDataInstances)
			{
				if (!dataLoading[data])
				{
					data.addEventListener(Event.COMPLETE, this._data_complete);
					data.addEventListener(ErrorEvent.ERROR, this._data_error);
					dataLoading[data] = data;
					hasData = true;
				}
			}

			if (!hasData)
			{
				// we're not going to start an update, so indicate that this is the last one and dispatch the updated event
				this._updatedCount = this._updateCount;
				this.invalidate(Charting.DISPATCH_UPDATED);
				return;
			}

			this._updatingCount = this._updateCount;
			this._dataLoading = dataLoading;

			var loadData:Array = new Array();
			for each (data in dataLoading)
				loadData.push(data);
			for each (data in loadData)
				data.load();
		}

		private function _updateComplete(data:IDataLoadable) : void
		{
			if (!data)
				return;

			data.removeEventListener(Event.COMPLETE, this._data_complete);
			data.removeEventListener(ErrorEvent.ERROR, this._data_error);

			this._updateClickedItem(true);

			if (this._dataLoading)
			{
				delete this._dataLoading[data];
				for each (data in this._dataLoading)
					return;
				this._dataLoading = null;
			}

			// indicate which update the updated event corresponds to
			this._updatedCount = this._updatingCount;

			this.invalidate(Charting.PROCESS_DATA);
			this.invalidate(Charting.DISPATCH_UPDATED);

			if (this._updatingCount < this._updateCount)
				this._update();
		}

		private function _updateTooltip(dataSprite:DataSprite = null) : void
		{
			if (arguments.length == 0)
			{
				dataSprite = this._tooltipDataSprite;
			}
			else if (this._tooltipDataSprite != dataSprite)
			{
				if (this._tooltipDataSprite)
					this._tooltipDataSprite.removeEventListener(MouseEvent.MOUSE_OUT, this._dataSprite_mouseOut);
				this._tooltipDataSprite = dataSprite;
				if (this._tooltipDataSprite)
					this._tooltipDataSprite.addEventListener(MouseEvent.MOUSE_OUT, this._dataSprite_mouseOut);
			}

			var tooltip:Tooltip = this._tooltip;
			var dataSpriteTip:DataSpriteTip = this._dataSpriteTip;
			if (!tooltip || !dataSpriteTip)
				return;

			if (!tooltip.contains(dataSpriteTip))
				tooltip.addChild(dataSpriteTip);

			if (dataSprite)
			{
				dataSpriteTip.dataSprite = null;  // force update
				dataSpriteTip.dataSprite = dataSprite;

				var tipBounds:Rectangle = dataSprite.tipBounds;
				if (tipBounds)
				{
					var p1:Point = dataSprite.localToGlobal(tipBounds.topLeft);
					var p2:Point = dataSprite.localToGlobal(tipBounds.bottomRight);
					tooltip.targetBounds = new Rectangle(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
					tooltip.placement = dataSprite.tipPlacement;
				}
				else
				{
					tooltip.followMouse = true;
				}

				tooltip.show();
			}
			else
			{
				dataSpriteTip.dataSprite = null;
				tooltip.hide();
			}
		}

		private function _updateClickedItem(dataUpdated:Boolean = false) : void
		{
			if (!this._clickedItem)
				return;

			if (dataUpdated)
			{
				if (this._clickedItem is DataSprite)
				{
					if (this._clickedItem == this._highlightedItem)
						this._clickItem(null);
					else
						this._clickedItem = null;
				}
			}
			else
			{
				if (this._clickedItem != this._highlightedItem)
					return;

				if (this._clickedItem is Sprite)
				{
					var sprite:Sprite = Sprite(this._clickedItem);
					if (!sprite.stage)
						this._clickedItem = null;
				}

				this._highlightItem(null);
			}
		}

		private function _clickItem(item:*) : void
		{
			this._clickedItem = item;

			this._highlightItem(item);
		}

		private function _highlightItem(item:*) : void
		{
			if (item == this._highlightedItem)
				return;

			var chart:AbstractChart;
			var legend:Legend;

			if (this._highlightedItem != null)
			{
				if (this._highlightedItem is DataSprite)
				{
					for each (chart in this._charts)
						chart.highlightElement(null);
					for each (legend in this._legends)
						legend.highlightItem(null);
				}
				else if (this._highlightedItem is AxisLabel)
				{
				}
				else if (this._highlightedItem is AxisTitle)
				{
				}
				else if (this._highlightedItem is LegendItem)
				{
					for each (chart in this._charts)
						chart.highlightSeries(null);
					for each (legend in this._legends)
						legend.highlightItem(null);
				}
				else if (this._highlightedItem is String)
				{
					for each (chart in this._charts)
						chart.highlightSeries(null);
					for each (legend in this._legends)
						legend.highlightItem(null);
				}
			}

			this._highlightedItem = (item != null) ? item : this._clickedItem;

			if (this._highlightedItem != null)
			{
				if (this._highlightedItem is DataSprite)
				{
					var dataSprite:DataSprite = DataSprite(this._highlightedItem);
					for each (chart in this._charts)
						chart.highlightElement(dataSprite);
					for each (legend in this._legends)
						legend.highlightItem(dataSprite.seriesName);
				}
				else if (this._highlightedItem is AxisLabel)
				{
				}
				else if (this._highlightedItem is AxisTitle)
				{
				}
				else if (this._highlightedItem is LegendItem)
				{
					var legendItem:LegendItem = LegendItem(this._highlightedItem);
					for each (chart in this._charts)
						chart.highlightSeries(legendItem.label);
					for each (legend in this._legends)
						legend.highlightItem(legendItem.label);
				}
				else if (this._highlightedItem is String)
				{
					var seriesName:String = String(this._highlightedItem);
					for each (chart in this._charts)
						chart.highlightSeries(seriesName);
					for each (legend in this._legends)
						legend.highlightItem(seriesName);
				}
			}
		}

		private function _showMessage(message:String, error:String = null) : void
		{
			if (message)
			{
				message = this._formatSimpleString(message);
				if (error)
					message += "\n" + error;
			}

			Style.applyStyle(this._messageField, this._messageStyle);
			this._messageField.text = message;
			this._messageField.visible = true;
			this._chartLayout.visible = false;
		}

		private function _hideMessage() : void
		{
			this._messageField.text = "";
			this._messageField.visible = false;
			this._chartLayout.visible = true;
		}

		private function _dispatchUpdated() : void
		{
			try
			{
				JABridge.dispatchEvent("updated", { updateCount: this._updatedCount });
			}
			catch (e:Error)
			{
			}
		}

		private function _dataSpriteTipFormat(dataSprite:DataSprite, field:String, value:*) : String
		{
			if (field != "_time")
				return String(value);

			var timeValue:DateTime = this._parseDateTime(value);
			if (!timeValue)
				return String(value);

			timeValue = timeValue.toTimeZone(this._timeZone);

			var dateFormat:String = "medium";
			var timeFormat:String;
			if ((timeValue.seconds % 1) >= 0.001)
				timeFormat = "full";
			else if (timeValue.seconds > 0)
				timeFormat = "medium";
			else if (timeValue.minutes > 0)
				timeFormat = "short";
			else if (timeValue.hours > 0)
				timeFormat = "short";
			else
				timeFormat = "none";

			if (timeFormat == "none")
				return this._formatDate(timeValue, dateFormat);
			else
				return this._formatDateTime(timeValue, dateFormat, timeFormat);
		}

		private function _numericAxisFormat(numericAxisLabels:NumericAxisLabels) : Function
		{
			var self:Charting = this;

			var format:Function = function(value:Number) : String
			{
				return self._formatNumber(value);
			};

			return format;
		}

		private function _timeAxisFormat(timeAxisLabels:TimeAxisLabels) : Function
		{
			var self:Charting = this;
			var prevDate:DateTime;

			var format:Function = function(date:DateTime) : String
			{
				if (!date)
					return "";

				var dateString:String = "";

				var majorUnit:Duration = timeAxisLabels.actualMajorUnit;

				var resYears:int = 0;
				var resMonths:int = 1;
				var resDays:int = 2;
				var resHours:int = 3;
				var resMinutes:int = 4;
				var resSeconds:int = 5;
				var resSubSeconds:int = 6;

				var resMin:int;
				var resMax:int;

				if (!prevDate || (prevDate.time > date.time) || (prevDate.year != date.year))
					resMin = resYears;
				else if (prevDate.month != date.month)
					resMin = resMonths;
				else if (prevDate.day != date.day)
					resMin = resDays;
				else
					resMin = resHours;

				prevDate = date.clone();

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
					dateString += self._formatTime(date, "full");
				else if (resMax == resSeconds)
					dateString += self._formatTime(date, "medium");
				else if (resMax >= resHours)
					dateString += self._formatTime(date, "short");

				if ((resMax >= resDays) && (resMin <= resDays))
					dateString += (dateString ? "\n" : "") + self._formatDate(date, "EEE MMM d");
				else if ((resMax >= resMonths) && (resMin <= resMonths))
					dateString += (dateString ? "\n" : "") + self._formatDate(date, "MMMM");

				if ((resMax >= resYears) && (resMin <= resYears))
					dateString += (dateString ? "\n" : "") + self._formatDate(date, "yyyy");

				return dateString;
			};

			return format;
		}

		private function _formatSimpleString(str:String) : String
		{
			var text:String;

			var cache:Cache = this._formatSimpleStringCache;
			var key:* = str;
			if (cache.contains(key))
			{
				text = cache.getEntry(key);
			}
			else
			{
				try
				{
					text = JABridge.callMethod("formatSimpleString", str);
				}
				catch (e:Error)
				{
					text = str;
				}
				cache.setEntry(key, text);
			}

			return text;
		}

		private function _formatNumericString(strSingular:String, strPlural:String, num:Number) : String
		{
			var text:String;

			num = NumberUtil.toPrecision(num, 12);

			var cache:Cache = this._formatNumericStringCache;
			var key:* = strSingular + "\n" + strPlural + "\n" + num;
			if (cache.contains(key))
			{
				text = cache.getEntry(key);
			}
			else
			{
				try
				{
					text = JABridge.callMethod("formatNumericString", strSingular, strPlural, num);
				}
				catch (e:Error)
				{
					text = (Math.abs(num) == 1) ? strSingular : strPlural;
					text = text.split("%s").join(String(num));
				}
				cache.setEntry(key, text);
			}

			return text;
		}

		private function _formatNumber(num:Number) : String
		{
			var text:String;

			num = NumberUtil.toPrecision(num, 12);

			var cache:Cache = this._formatNumberCache;
			var key:* = num;
			if (cache.contains(key))
			{
				text = cache.getEntry(key);
			}
			else
			{
				try
				{
					text = JABridge.callMethod("formatNumber", num);
				}
				catch (e:Error)
				{
					text = String(num);
				}
				cache.setEntry(key, text);
			}

			return text;
		}

		private function _formatPercent(num:Number) : String
		{
			return this._formatNumber(num) + "%";
		}

		private function _formatDate(dateTime:DateTime, dateFormat:String = "full") : String
		{
			var text:String;

			var cache:Cache = this._formatDateCache;
			var key:* = dateTime.time + "," + dateTime.timeZoneOffset + "," + dateFormat;
			if (cache.contains(key))
			{
				text = cache.getEntry(key);
			}
			else
			{
				try
				{
					text = JABridge.callMethod("formatDate", dateTime.time, dateTime.timeZoneOffset, dateFormat);
				}
				catch (e:Error)
				{
					text = this._pad(dateTime.year, 4) + "-" + this._pad(dateTime.month, 2) + "-" + this._pad(dateTime.day, 2);
				}
				cache.setEntry(key, text);
			}

			return text;
		}

		private function _formatTime(dateTime:DateTime, timeFormat:String = "full") : String
		{
			var text:String;

			var cache:Cache = this._formatTimeCache;
			var key:* = dateTime.time + "," + dateTime.timeZoneOffset + "," + timeFormat;
			if (cache.contains(key))
			{
				text = cache.getEntry(key);
			}
			else
			{
				try
				{
					text = JABridge.callMethod("formatTime", dateTime.time, dateTime.timeZoneOffset, timeFormat);
				}
				catch (e:Error)
				{
					text = this._pad(dateTime.hours, 2) + ":" + this._pad(dateTime.minutes, 2) + ":" + this._pad(dateTime.seconds, 2, 3);
				}
				cache.setEntry(key, text);
			}

			return text;
		}

		private function _formatDateTime(dateTime:DateTime, dateFormat:String = "full", timeFormat:String = "full") : String
		{
			var text:String;

			var cache:Cache = this._formatDateTimeCache;
			var key:* = dateTime.time + "," + dateTime.timeZoneOffset + "," + dateFormat + "," + timeFormat;
			if (cache.contains(key))
			{
				text = cache.getEntry(key);
			}
			else
			{
				try
				{
					text = JABridge.callMethod("formatDateTime", dateTime.time, dateTime.timeZoneOffset, dateFormat, timeFormat);
				}
				catch (e:Error)
				{
					text = this._pad(dateTime.year, 4) + "-" + this._pad(dateTime.month, 2) + "-" + this._pad(dateTime.day, 2) + " " + this._pad(dateTime.hours, 2) + ":" + this._pad(dateTime.minutes, 2) + ":" + this._pad(dateTime.seconds, 2, 3);
				}
				cache.setEntry(key, text);
			}

			return text;
		}

		private function _pad(value:Number, digits:int = 0, fractionDigits:int = 0) : String
		{
			if (value != value)
				return "NaN";
			if (value == Infinity)
				return "Infinity";
			if (value == -Infinity)
				return "-Infinity";

			var str:String = value.toFixed(20);

			var decimalIndex:int = str.indexOf(".");
			if (decimalIndex < 0)
				decimalIndex = str.length;
			else if (fractionDigits < 1)
				str = str.substring(0, decimalIndex);
			else
				str = str.substring(0, decimalIndex) + "." + str.substring(decimalIndex + 1, decimalIndex + fractionDigits + 1);

			for (var i:int = decimalIndex; i < digits; i++)
				str = "0" + str;

			return str;
		}

		private function _parseDateTime(value:*) : DateTime
		{
			if (value == null)
				return null;
			if (value is DateTime)
				return (value.time == value.time) ? value : null;
			if (value is Date)
				return (value.time == value.time) ? new DateTime(value.time / 1000) : null;
			if (value is String)
			{
				if (!value)
					return null;
				var num:Number = Number(value);
				if (num == num)
					return new DateTime(num);
				var date:DateTime = new DateTime(value);
				if (date.time == date.time)
					return date;
				return null;
			}
			if (value is Number)
				return (value == value) ? new DateTime(value) : null;
			return null;
		}

		private function _uniqueList(array:Array) : Array
		{
			var array2:Array = new Array();

			var valueMap:Dictionary = new Dictionary();
			for each (var value:* in array)
			{
				if ((value != null) && !valueMap[value])
				{
					valueMap[value] = true;
					array2.push(value);
				}
			}

			return (array2.length > 0) ? array2 : null;
		}

		private function _updateContextMenu() : void
		{
			var contextMenu:ContextMenu = new ContextMenu();
			contextMenu.hideBuiltInItems();

			var caption:String;
			var contextMenuItem:ContextMenuItem;

			if (this._enableOpenAsImage)
			{
				caption = this._formatSimpleString("Open as image");

				contextMenuItem = new ContextMenuItem(caption);
				contextMenuItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, this._contextMenuItem_openAsImage);

				contextMenu.customItems.push(contextMenuItem);
			}

			if (this._enableFullScreen)
			{
				caption = this._formatSimpleString("Full screen");

				contextMenuItem = new ContextMenuItem(caption);
				contextMenuItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, this._contextMenuItem_fullScreen);

				contextMenu.customItems.push(contextMenuItem);
			}

			this.contextMenu = contextMenu;
		}

		private function _stage_mouseOver(e:MouseEvent) : void
		{
			if (e.buttonDown)
				return;

			var target:Object = e.target;
			if (target is DataSprite)
			{
				var dataSprite:DataSprite = DataSprite(target);
				if (this._enableChartClick)
				{
					dataSprite.buttonMode = true;
					this._highlightItem(dataSprite);
				}
				this._updateTooltip(dataSprite);
			}
			else if (target is AxisLabel)
			{
				var axisLabel:AxisLabel = AxisLabel(target);
				if (this._enableLabelClick)
					axisLabel.buttonMode = true;
			}
			else if (target is AxisTitle)
			{
				var axisTitle:AxisTitle = AxisTitle(target);
				if (this._enableTitleClick)
					axisTitle.buttonMode = true;
			}
			else if (target is LegendItem)
			{
				var legendItem:LegendItem = LegendItem(target);
				if (this._enableLegendClick)
					legendItem.buttonMode = true;
				this._highlightItem(legendItem.label);
			}

			ValidateQueue.validateAll();
		}

		private function _stage_mouseOut(e:MouseEvent) : void
		{
			var sprite:Sprite = e.target as Sprite;
			if (sprite)
				sprite.buttonMode = false;

			this._highlightItem(null);
		}

		private function _stage_click(e:MouseEvent) : void
		{
			var target:Object = e.target;
			if (target is DataSprite)
			{
				if (!this._enableChartClick)
					return;

				var dataSprite:DataSprite = DataSprite(target);

				var data:Object = new Object();
				var fields:Array = dataSprite.fields;

				var p:String;

				var data1:Object = dataSprite.data;
				for (p in data1)
					data[p] = data1[p];

				var chart:AbstractChart = dataSprite.chart;
				if (chart)
				{
					var chartData:ResultsDataTable = chart.data as ResultsDataTable;
					if (chartData)
					{
						var resultsData:ResultsData = chartData.resultsData;
						if (resultsData)
						{
							var results:Array = resultsData.results;
							var dataRowIndex:int = dataSprite.dataRowIndex;
							if ((dataRowIndex >= 0) && (dataRowIndex < results.length))
							{
								var data2:Object = results[dataRowIndex];
								for (p in data2)
									data[p] = data2[p];
							}
						}
					}
				}

				this._clickItem(dataSprite);

				try
				{
					JABridge.dispatchEvent("chartClicked", { data: data, fields: fields, altKey: e.altKey, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey });
				}
				catch (error:Error)
				{
				}
			}
			else if (target is AxisLabel)
			{
				if (!this._enableLabelClick)
					return;

				var axisLabel:AxisLabel = AxisLabel(target);

				this._clickItem(axisLabel);

				try
				{
					JABridge.dispatchEvent("labelClicked", { text: axisLabel.text, altKey: e.altKey, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey });
				}
				catch (error:Error)
				{
				}
			}
			else if (target is AxisTitle)
			{
				if (!this._enableTitleClick)
					return;

				var axisTitle:AxisTitle = AxisTitle(target);

				this._clickItem(axisTitle);

				try
				{
					JABridge.dispatchEvent("titleClicked", { text: axisTitle.text, altKey: e.altKey, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey });
				}
				catch (error:Error)
				{
				}
			}
			else if (target is LegendItem)
			{
				if (!this._enableLegendClick)
					return;

				var legendItem:LegendItem = LegendItem(target);

				this._clickItem(legendItem.label);

				try
				{
					JABridge.dispatchEvent("legendClicked", { text: legendItem.label, altKey: e.altKey, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey });
				}
				catch (error:Error)
				{
				}
			}
		}

		private function _contextMenuItem_openAsImage(e:ContextMenuEvent) : void
		{
			try
			{
				var snapshot:Object = this.getSnapshot();
				JABridge.dispatchEvent("openAsImage", { snapshot: snapshot });
			}
			catch (error:Error)
			{
			}
		}

		private function _contextMenuItem_fullScreen(e:ContextMenuEvent) : void
		{
			try
			{
				var stage:Stage = this.stage;
				if (stage)
					stage.displayState = StageDisplayState.FULL_SCREEN;
			}
			catch (error:Error)
			{
			}
		}

		private function _JABridge_connect() : void
		{
			this._connectExternalLegend();

			this.invalidate(Charting.PROCESS_DATA);

			this.visibility = Visibility.VISIBLE;
		}

		private function _JABridge_close() : void
		{
			this._closeExternalLegend();

			// close loading data objects
			if (this._dataLoading)
			{
				var data:IDataLoadable;
				for each (data in this._dataLoading)
				{
					data.removeEventListener(Event.COMPLETE, this._data_complete);
					data.removeEventListener(ErrorEvent.ERROR, this._data_error);
					data.close();
				}
			}

			this._updateCount = 0;
			this._updatingCount = 0;
			this._updatedCount = 0;
			this._dataLoading = null;
			this._dataError = null;

			this.visibility = Visibility.COLLAPSED;
		}

		private function _data_complete(e:Event) : void
		{
			this._updateComplete(e.target as IDataLoadable);
		}

		private function _data_error(e:ErrorEvent) : void
		{
			if (!this._dataError)
				this._dataError = e.text;

			this._updateComplete(e.target as IDataLoadable);
		}

		private function _chart_validated(e:ValidateEvent) : void
		{
			if (e.pass == AbstractChart.RENDER_CHART)
				this._updateTooltip();
		}

		private function _dataSprite_mouseOut(e:MouseEvent) : void
		{
			this._updateTooltip(null);
		}

	}

}
