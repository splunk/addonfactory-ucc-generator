package
{

	import com.adobe.images.*;
	import com.jasongatt.controls.*;
	import com.jasongatt.core.*;
	import com.jasongatt.graphics.brushes.*;
	import com.jasongatt.layout.*;
	import com.jasongatt.motion.*;
	import com.jasongatt.motion.easers.*;
	import com.jasongatt.utils.*;
	import com.splunk.charting.axes.*;
	import com.splunk.charting.charts.*;
	import com.splunk.charting.controls.*;
	import com.splunk.charting.distortion.*;
	import com.splunk.charting.labels.*;
	import com.splunk.charting.layout.*;
	import com.splunk.charting.properties.*;
	import com.splunk.charting.scale.*;
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

	public class Timeline extends GroupLayout
	{

		// Public Static Constants

		public static const PROCESS_PROPERTIES:ValidatePass = new ValidatePass(Timeline, "processProperties", 0.02);
		public static const DISPATCH_UPDATED:ValidatePass = new ValidatePass(Timeline, "dispatchUpdated", 4);

		// Private Static Constants

		private static const _LEGACY_PROPERTY_MAP:Object = {
			"primaryAxis": "axisX",
			"secondaryAxis": "axisY",
			"primaryAxisLabels": "axisLabelsX",
			"secondaryAxisLabels": "styles.secondaryAxisLabels",
			"secondaryAxisLabels1": "axisLabelsY1",
			"secondaryAxisLabels2": "axisLabelsY2",
			"primaryAxisGridLines": "gridLinesX",
			"secondaryAxisGridLines": "gridLinesY"
		};

		// Private Properties

		private var _timeZone:ITimeZone = TimeZones.LOCAL;

		private var _hostPath:String = "http://localhost:8000";
		private var _basePath:String = "/splunkd";
		private var _sessionKey:String;
		private var _prevJobID:String;
		private var _timelineData:TimelineData;

		private var _updateCount:int = 0;
		private var _updatingCount:int = 0;
		private var _updatedCount:int = 0;
		private var _dataLoading:Dictionary;
		private var _dataError:String;
		private var _updateRetryHandle:uint;

		private var _propertyManager:PropertyManager;
		private var _numberPropertyParser:NumberPropertyParser;
		private var _booleanPropertyParser:BooleanPropertyParser;
		private var _stringPropertyParser:StringPropertyParser;
		private var _brushPropertyParser:BrushPropertyParser;
		private var _chartPropertyParser:ChartPropertyParser;
		private var _dataTablePropertyParser:DataTablePropertyParser;
		private var _axisPropertyParser:AxisPropertyParser;
		private var _axisLabelsPropertyParser:AxisLabelsPropertyParser;
		private var _axisTitlePropertyParser:AxisTitlePropertyParser;
		private var _gridLinesPropertyParser:GridLinesPropertyParser;
		private var _legendPropertyParser:LegendPropertyParser;
		private var _scalePropertyParser:ScalePropertyParser;
		private var _spriteStylePropertyParser:SpriteStylePropertyParser;
		private var _layoutSpriteStylePropertyParser:LayoutSpriteStylePropertyParser;
		private var _textBlockStylePropertyParser:TextBlockStylePropertyParser;
		private var _textFormatPropertyParser:TextFormatPropertyParser;
		private var _timeZonePropertyParser:TimeZonePropertyParser;
		private var _clickDragRangeMarkerPropertyParser:ClickDragRangeMarkerPropertyParser;
		private var _cursorMarkerPropertyParser:CursorMarkerPropertyParser;
		private var _tooltipPropertyParser:TooltipPropertyParser;
		private var _valueTipPropertyParser:ValueTipPropertyParser;
		private var _dataSpriteTipPropertyParser:DataSpriteTipPropertyParser;
		private var _legacyPropertyValues:Object;

		private var _minimalMode:Boolean = false;
		private var _backgroundBrush:ObservableProperty;
		private var _minimalLineBrush:ObservableProperty;
		private var _rangeMarker:ClickDragRangeMarker;
		private var _cursorMarker:CursorMarker;
		private var _tooltip:Tooltip;
		private var _valueTip:ValueTip;
		private var _dataSpriteTip:DataSpriteTip;
		private var _annotations:AnnotationChart;
		private var _chart:Histogram;
		private var _axisX:TimeAxis;
		private var _axisY:NumericAxis;
		private var _axisLabelsX:TimeAxisLabels;
		private var _axisLabelsY1:NumericAxisLabels;
		private var _axisLabelsY2:NumericAxisLabels;
		private var _gridLinesX:GridLines;
		private var _gridLinesY:GridLines;
		private var _processingInstances:Dictionary;
		private var _loadableDataInstances:Dictionary;

		private var _background:Shape;
		private var _chartLayout:CartesianLayout;
		private var _virtualMouse:VirtualMouse;

		private var _viewMinimum:Number = NaN;
		private var _viewMaximum:Number = NaN;
		private var _selectionMinimum:Number = NaN;
		private var _selectionMaximum:Number = NaN;
		private var _actualSelectionMinimum:Number = NaN;
		private var _actualSelectionMaximum:Number = NaN;

		private var _prevDateFormatPosition:Number = Infinity;
		private var _tooltipDataSprite:DataSprite;

		private var _enableChartClick:Boolean = false;
		private var _enableLabelClick:Boolean = false;
		private var _enableOpenAsImage:Boolean = false;

		private var _formatSimpleStringCache:Cache;
		private var _formatNumericStringCache:Cache;
		private var _formatNumberCache:Cache;
		private var _formatDateCache:Cache;
		private var _formatTimeCache:Cache;
		private var _formatDateTimeCache:Cache;
		private var _formatTooltipCache:Cache;

		// Constructor

		public function Timeline()
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
				stage.addEventListener(MouseEvent.DOUBLE_CLICK, this._stage_doubleClick);

				var stageInfo:LoaderInfo = stage.loaderInfo;
				var params:Object = stageInfo.parameters;

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
			this._brushPropertyParser = BrushPropertyParser.getInstance();
			this._chartPropertyParser = ChartPropertyParser.getInstance();
			this._dataTablePropertyParser = DataTablePropertyParser.getInstance();
			this._axisPropertyParser = AxisPropertyParser.getInstance();
			this._axisLabelsPropertyParser = AxisLabelsPropertyParser.getInstance();
			this._axisTitlePropertyParser = AxisTitlePropertyParser.getInstance();
			this._gridLinesPropertyParser = GridLinesPropertyParser.getInstance();
			this._legendPropertyParser = LegendPropertyParser.getInstance();
			this._scalePropertyParser = ScalePropertyParser.getInstance();
			this._spriteStylePropertyParser = SpriteStylePropertyParser.getInstance();
			this._layoutSpriteStylePropertyParser = LayoutSpriteStylePropertyParser.getInstance();
			this._textBlockStylePropertyParser = TextBlockStylePropertyParser.getInstance();
			this._textFormatPropertyParser = TextFormatPropertyParser.getInstance();
			this._timeZonePropertyParser = TimeZonePropertyParser.getInstance();
			this._clickDragRangeMarkerPropertyParser = ClickDragRangeMarkerPropertyParser.getInstance();
			this._cursorMarkerPropertyParser = CursorMarkerPropertyParser.getInstance();
			this._tooltipPropertyParser = TooltipPropertyParser.getInstance();
			this._valueTipPropertyParser = ValueTipPropertyParser.getInstance();
			this._dataSpriteTipPropertyParser = DataSpriteTipPropertyParser.getInstance();
			this._legacyPropertyValues = new Object();

			// caches

			this._formatSimpleStringCache = new Cache(500);
			this._formatNumericStringCache = new Cache(500);
			this._formatNumberCache = new Cache(500);
			this._formatDateCache = new Cache(500);
			this._formatTimeCache = new Cache(500);
			this._formatDateTimeCache = new Cache(500);
			this._formatTooltipCache = new Cache(500);

			// init

			this._backgroundBrush = new ObservableProperty(this, "backgroundBrush", IBrush, null, this.invalidates(LayoutSprite.LAYOUT));

			this._minimalLineBrush = new ObservableProperty(this, "minimalLineBrush", IBrush, null, this.invalidates(LayoutSprite.LAYOUT));

			this._background = new Shape();

			this._chartLayout = new CartesianLayout();

			this._virtualMouse = new VirtualMouse(stage);

			this.addChild(this._background);
			this.addChild(this._chartLayout);

			this._setDefaultProperties();

			this.visibility = Visibility.COLLAPSED;

			// JABridge

			JABridge.addProperty("timeZone", this.getTimeZone, this.setTimeZone);
			JABridge.addProperty("jobID", this.getJobID, this.setJobID, "String", "The id of the job from which to chart results.");
			JABridge.addProperty("viewMinimum", this.getViewMinimum, null, "Number", "The minimum visible time in UTC seconds.");
			JABridge.addProperty("viewMaximum", this.getViewMaximum, null, "Number", "The maximum visible time in UTC seconds.");
			JABridge.addProperty("selectionMinimum", this.getSelectionMinimum, this.setSelectionMinimum, "Number", "Gets or sets the minimum selection time in UTC seconds.");
			JABridge.addProperty("selectionMaximum", this.getSelectionMaximum, this.setSelectionMaximum, "Number", "Gets or sets the maximum selection time in UTC seconds.");
			JABridge.addProperty("actualSelectionMinimum", this.getActualSelectionMinimum, null, "Number", "Gets the actual minimum selection time in UTC seconds.");
			JABridge.addProperty("actualSelectionMaximum", this.getActualSelectionMaximum, null, "Number", "Gets the actual maximum selection time in UTC seconds.");
			JABridge.addProperty("timelineData", this.getTimelineData, null, "Object", "The detailed timeline data.");
			JABridge.addProperty("timelineScale", this.getTimelineScale, null, "Object", "The scale of each bucket of the timeline data.");
			JABridge.addProperty("enableChartClick", this.getEnableChartClick, this.setEnableChartClick, "Boolean");
			JABridge.addProperty("enableLabelClick", this.getEnableLabelClick, this.setEnableLabelClick, "Boolean");
			JABridge.addProperty("enableOpenAsImage", this.getEnableOpenAsImage, this.setEnableOpenAsImage, "Boolean");

			JABridge.addMethod("update", this.update, [], "int");
			JABridge.addMethod("validate", ValidateQueue.validateAll, [], "void");
			JABridge.addMethod("getSelectedBuckets", this.getSelectedBuckets, [], "Array");
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
			JABridge.addMethod("getChartDataBounds", this.getChartDataBounds, [], "Object");
			JABridge.addMethod("getAxisXBounds", this.getAxisXBounds, [], "Object");
			JABridge.addMethod("getAxisXTickBounds", this.getAxisXTickBounds, [], "Object");
			JABridge.addMethod("getAxisXLabelBounds", this.getAxisXLabelBounds, [], "Object");
			JABridge.addMethod("getAxisXLabelValues", this.getAxisXLabelValues, [], "Object");
			JABridge.addMethod("getAxisY1Bounds", this.getAxisY1Bounds, [], "Object");
			JABridge.addMethod("getAxisY1TickBounds", this.getAxisY1TickBounds, [], "Object");
			JABridge.addMethod("getAxisY1LabelBounds", this.getAxisY1LabelBounds, [], "Object");
			JABridge.addMethod("getAxisY1LabelValues", this.getAxisY1LabelValues, [], "Object");
			JABridge.addMethod("getAxisY2Bounds", this.getAxisY2Bounds, [], "Object");
			JABridge.addMethod("getAxisY2TickBounds", this.getAxisY2TickBounds, [], "Object");
			JABridge.addMethod("getAxisY2LabelBounds", this.getAxisY2LabelBounds, [], "Object");
			JABridge.addMethod("getAxisY2LabelValues", this.getAxisY2LabelValues, [], "Object");
			JABridge.addMethod("getTooltipBounds", this.getTooltipBounds, [], "Object");
			JABridge.addMethod("getTooltipValue", this.getTooltipValue, [], "String");

			JABridge.addEvent("updated", [ "event:Object { updateCount:int }" ], "Dispatched after the timeline is updated, following a call to update.");
			JABridge.addEvent("viewChanged", [ "event:Object { viewMinimum:Number, viewMaximum:Number }" ], "Dispatched whenever the view range changes.");
			JABridge.addEvent("selectionChanged", [ "event:Object { selectionMinimum:Number, selectionMaximum:Number }" ], "Dispatched whenever the selection range changes.");
			JABridge.addEvent("chartClicked", [ "event:Object { data:Object, fields:Array, altKey:Boolean, ctrlKey:Boolean, shiftKey:Boolean }" ], "Dispatched when a chart element is clicked.");
			JABridge.addEvent("chartDoubleClicked", [ "event:Object { data:Object, fields:Array, altKey:Boolean, ctrlKey:Boolean, shiftKey:Boolean }" ], "Dispatched when a chart element is double clicked.");
			JABridge.addEvent("labelClicked", [ "event:Object { text:String, altKey:Boolean, ctrlKey:Boolean, shiftKey:Boolean }" ], "Dispatched when an axis label is clicked.");
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

		public function getViewMinimum() : Number
		{
			return this._viewMinimum;
		}

		public function getViewMaximum() : Number
		{
			return this._viewMaximum;
		}

		public function getSelectionMinimum() : Number
		{
			return this._selectionMinimum;
		}
		public function setSelectionMinimum(value:Number) : void
		{
			if (!this._rangeMarker || this._rangeMarker.isDragging)
				return;

			this._rangeMarker.minimum = isNaN(value) ? null : new DateTime(value);
			this._updateSelectionRange(false);
		}

		public function getSelectionMaximum() : Number
		{
			return this._selectionMaximum;
		}
		public function setSelectionMaximum(value:Number) : void
		{
			if (!this._rangeMarker || this._rangeMarker.isDragging)
				return;

			this._rangeMarker.maximum = isNaN(value) ? null : new DateTime(value);
			this._updateSelectionRange(false);
		}

		public function getActualSelectionMinimum() : Number
		{
			return this._actualSelectionMinimum;
		}

		public function getActualSelectionMaximum() : Number
		{
			return this._actualSelectionMaximum;
		}

		public function getTimelineData() : Object
		{
			return this._parseTimelineData(this._timelineData);
		}

		public function getTimelineScale() : Object
		{
			var timelineData:TimelineData = this._timelineData;
			if (!timelineData)
				return null;

			var buckets:Array = timelineData.buckets;
			if (buckets.length == 0)
				return null;

			var bucket:TimelineData = buckets[0];
			var duration:Duration = TimeUtils.subtractDates(bucket.latestTime, bucket.earliestTime);
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

		public function getEnableOpenAsImage() : Boolean
		{
			return this._enableOpenAsImage;
		}
		public function setEnableOpenAsImage(value:Boolean) : void
		{
			this._enableOpenAsImage = value;
			this._updateContextMenu();
		}

		public function update() : int
		{
			this._updateCount++;
			this._update();
			return this._updateCount;
		}

		public function getSelectedBuckets() : Array
		{
			if (!this._timelineData)
				return null;

			var buckets:Array = this._timelineData.buckets;
			if (!buckets)
				return null;

			var selectedBuckets:Array = new Array();

			var selectionMinimum:Number = this._actualSelectionMinimum;
			var selectionMaximum:Number = this._actualSelectionMaximum;
			var bucket:TimelineData;
			var bucketTime:DateTime;

			for each (bucket in buckets)
			{
				bucketTime = bucket.earliestTime;
				if (!bucketTime || (bucketTime.time < selectionMinimum))
					continue;

				bucketTime = bucket.latestTime;
				if (!bucketTime || (bucketTime.time > selectionMaximum))
					continue;

				selectedBuckets.push(this._parseTimelineData(bucket));
			}

			return selectedBuckets;
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
			this.invalidate(Timeline.PROCESS_PROPERTIES);
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
			this.invalidate(Timeline.PROCESS_PROPERTIES);
		}

		public function clearValue(propertyPath:String) : void
		{
			if (!this._clearLegacyProperty(propertyPath))
				this._propertyManager.clearValue(propertyPath);
			this.invalidate(Timeline.PROCESS_PROPERTIES);
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
			this.invalidate(Timeline.PROCESS_PROPERTIES);
		}

		public function clearAll() : void
		{
			this._legacyPropertyValues = new Object();
			this._propertyManager.clearAll();
			this.invalidate(Timeline.PROCESS_PROPERTIES);
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

			return this.getLayoutSpriteBounds(this._chart);
		}

		public function getChartDataBounds() : Object
		{
			ValidateQueue.validateAll();

			var chart:AbstractChart = this._chart;
			if (!chart)
				return null;

			return this.getDataSpriteBounds(this.getDataSprites(chart));
		}

		public function getAxisXBounds() : Object
		{
			ValidateQueue.validateAll();

			return this.getLayoutSpriteBounds(this._axisLabelsX);
		}

		public function getAxisXTickBounds() : Object
		{
			ValidateQueue.validateAll();

			return this.getAxisTickBounds(this._axisLabelsX);
		}

		public function getAxisXLabelBounds() : Object
		{
			ValidateQueue.validateAll();

			return this.getAxisLabelBounds(this._axisLabelsX);
		}

		public function getAxisXLabelValues() : Object
		{
			ValidateQueue.validateAll();

			return this.getAxisLabelValues(this._axisLabelsX);
		}

		public function getAxisY1Bounds() : Object
		{
			ValidateQueue.validateAll();

			return this.getLayoutSpriteBounds(this._axisLabelsY1);
		}

		public function getAxisY1TickBounds() : Object
		{
			ValidateQueue.validateAll();

			return this.getAxisTickBounds(this._axisLabelsY1);
		}

		public function getAxisY1LabelBounds() : Object
		{
			ValidateQueue.validateAll();

			return this.getAxisLabelBounds(this._axisLabelsY1);
		}

		public function getAxisY1LabelValues() : Object
		{
			ValidateQueue.validateAll();

			return this.getAxisLabelValues(this._axisLabelsY1);
		}

		public function getAxisY2Bounds() : Object
		{
			ValidateQueue.validateAll();

			return this.getLayoutSpriteBounds(this._axisLabelsY2);
		}

		public function getAxisY2TickBounds() : Object
		{
			ValidateQueue.validateAll();

			return this.getAxisTickBounds(this._axisLabelsY2);
		}

		public function getAxisY2LabelBounds() : Object
		{
			ValidateQueue.validateAll();

			return this.getAxisLabelBounds(this._axisLabelsY2);
		}

		public function getAxisY2LabelValues() : Object
		{
			ValidateQueue.validateAll();

			return this.getAxisLabelValues(this._axisLabelsY2);
		}

		public function getTooltipBounds() : Object
		{
			ValidateQueue.validateAll();

			return this.getDisplayObjectBounds(this._tooltip);
		}

		public function getTooltipValue() : String
		{
			ValidateQueue.validateAll();

			var tooltip:Tooltip = this._tooltip;
			if (!tooltip || !tooltip.visible)
				return null;

			var valueTip:ValueTip = this._valueTip;
			if (!valueTip || (valueTip.parent != tooltip))
				return null;

			var textBlock:TextBlock = valueTip.getChildAt(0) as TextBlock;
			if (!textBlock)
				return null;

			return textBlock.text;
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
						if (childDataSprites.length > 0)
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

			var bounds:Rectangle = displayObject.getRect(stage);

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

		public function processProperties() : void
		{
			this.validatePreceding(Timeline.PROCESS_PROPERTIES);

			if (this.isValid(Timeline.PROCESS_PROPERTIES))
				return;

			this._updateLegacyProperties();

			this._processingInstances = new Dictionary();
			this._loadableDataInstances = new Dictionary();

			var propertyManager:PropertyManager = this._propertyManager;

			try
			{
				propertyManager.beginParse();

				this._timeZone = propertyManager.parseProperty("timeZone", this._timeZonePropertyParser);

				this._minimalMode = propertyManager.parseProperty("minimalMode", this._booleanPropertyParser, "false");

				this._backgroundBrush.value = propertyManager.parseProperty("backgroundBrush", this._brushPropertyParser);

				this._minimalLineBrush.value = propertyManager.parseProperty("minimalLineBrush", this._brushPropertyParser);

				var rangeMarker:ClickDragRangeMarker = propertyManager.parsePropertyAs("rangeMarker", this._clickDragRangeMarkerPropertyParser, "clickDragRangeMarker");
				propertyManager.parseChildProperty(rangeMarker, "minimumValueStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(rangeMarker, "minimumValueStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
				propertyManager.parseChildProperty(rangeMarker, "maximumValueStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(rangeMarker, "maximumValueStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
				propertyManager.parseChildProperty(rangeMarker, "rangeValueStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(rangeMarker, "rangeValueStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
				propertyManager.parseChildProperty(rangeMarker, "backgroundStyle", this._spriteStylePropertyParser, "style");

				var cursorMarker:CursorMarker = propertyManager.parsePropertyAs("cursorMarker", this._cursorMarkerPropertyParser, "cursorMarker");
				propertyManager.parseChildProperty(cursorMarker, "valueStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(cursorMarker, "valueStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
				propertyManager.parseChildProperty(cursorMarker, "backgroundStyle", this._spriteStylePropertyParser, "style");

				var tooltip:Tooltip = propertyManager.parsePropertyAs("tooltip", this._tooltipPropertyParser, "tooltip");

				var valueTip:ValueTip = propertyManager.parsePropertyAs("valueTip", this._valueTipPropertyParser, "valueTip");
				propertyManager.inheritProperties(valueTip, "tooltip.content");
				propertyManager.parseChildProperty(valueTip, "valueStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(valueTip, "valueStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");

				var dataSpriteTip:DataSpriteTip = propertyManager.parsePropertyAs("dataSpriteTip", this._dataSpriteTipPropertyParser, "dataSpriteTip");
				propertyManager.inheritProperties(dataSpriteTip, "tooltip.content");
				propertyManager.parseChildProperty(dataSpriteTip, "swatchStyle", this._layoutSpriteStylePropertyParser, "style");
				propertyManager.parseChildProperty(dataSpriteTip, "fieldStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(dataSpriteTip, "fieldStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
				propertyManager.parseChildProperty(dataSpriteTip, "valueStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(dataSpriteTip, "valueStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");

				var data:TimelineDataTable = propertyManager.parsePropertyAs("data", this._dataTablePropertyParser, "timeline");
				this._processDataProperties(data);

				var axisX:TimeAxis = propertyManager.parsePropertyAs("axisX", this._axisPropertyParser, "time");
				propertyManager.inheritProperties(axisX, "styles.primaryAxis");
				propertyManager.inheritProperties(axisX, "styles.xAxis");
				propertyManager.inheritProperties(axisX, "styles.timeAxis");
				propertyManager.inheritProperties(axisX, "styles.axis");

				var axisY:NumericAxis = propertyManager.parsePropertyAs("axisY", this._axisPropertyParser, "numeric");
				propertyManager.inheritProperties(axisY, "styles.secondaryAxis");
				propertyManager.inheritProperties(axisY, "styles.yAxis");
				propertyManager.inheritProperties(axisY, "styles.numericAxis");
				propertyManager.inheritProperties(axisY, "styles.axis");
				propertyManager.parseChildProperty(axisY, "includeZero", this._booleanPropertyParser, "true");

				var chart:Histogram = propertyManager.parsePropertyAs("chart", this._chartPropertyParser, "histogram");
				propertyManager.inheritProperties(chart, "styles.histogram");
				propertyManager.inheritProperties(chart, "styles.chart2D");
				propertyManager.inheritProperties(chart, "styles.chart");
				propertyManager.parseChildPropertyAs(chart, "data", this._dataTablePropertyParser, "@data");
				propertyManager.parseChildPropertyAs(chart, "axisX", this._axisPropertyParser, "@axisX");
				propertyManager.parseChildPropertyAs(chart, "axisY", this._axisPropertyParser, "@axisY");
				propertyManager.parseChildProperty(chart, "columnStyle", this._spriteStylePropertyParser, "style");

				var axisLabelsX:TimeAxisLabels = propertyManager.parsePropertyAs("axisLabelsX", this._axisLabelsPropertyParser, "time");
				propertyManager.inheritProperties(axisLabelsX, "styles.primaryAxisLabels");
				propertyManager.inheritProperties(axisLabelsX, "styles.xAxisLabels");
				propertyManager.inheritProperties(axisLabelsX, "styles.timeAxisLabels");
				propertyManager.inheritProperties(axisLabelsX, "styles.axisLabels");
				propertyManager.parseChildPropertyAs(axisLabelsX, "axis", this._axisPropertyParser, "@axisX");
				propertyManager.parseChildPropertyAs(axisLabelsX, "placement", this._stringPropertyParser, "bottom");
				propertyManager.parseChildProperty(axisLabelsX, "majorLabelStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(axisLabelsX, "majorLabelStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
				propertyManager.parseChildProperty(axisLabelsX, "minorLabelStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(axisLabelsX, "minorLabelStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
				if (this._minimalMode)
				{
					propertyManager.parseChildPropertyAs(axisLabelsX, "visibility", this._stringPropertyParser, "hidden");
					propertyManager.parseChildPropertyAs(axisLabelsX, "height", this._numberPropertyParser, "20");
				}

				var axisLabelsY1:NumericAxisLabels = propertyManager.parsePropertyAs("axisLabelsY1", this._axisLabelsPropertyParser, "numeric");
				propertyManager.inheritProperties(axisLabelsY1, "styles.secondaryAxisLabels");
				propertyManager.inheritProperties(axisLabelsY1, "styles.yAxisLabels");
				propertyManager.inheritProperties(axisLabelsY1, "styles.numericAxisLabels");
				propertyManager.inheritProperties(axisLabelsY1, "styles.axisLabels");
				propertyManager.parseChildPropertyAs(axisLabelsY1, "axis", this._axisPropertyParser, "@axisY");
				propertyManager.parseChildPropertyAs(axisLabelsY1, "placement", this._stringPropertyParser, "left");
				propertyManager.parseChildProperty(axisLabelsY1, "majorLabelStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(axisLabelsY1, "majorLabelStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
				propertyManager.parseChildProperty(axisLabelsY1, "minorLabelStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(axisLabelsY1, "minorLabelStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
				if (this._minimalMode)
				{
					propertyManager.parseChildPropertyAs(axisLabelsY1, "visibility", this._stringPropertyParser, "hidden");
					propertyManager.parseChildPropertyAs(axisLabelsY1, "width", this._numberPropertyParser, "20");
				}

				var axisLabelsY2:NumericAxisLabels = propertyManager.parsePropertyAs("axisLabelsY2", this._axisLabelsPropertyParser, "numeric");
				propertyManager.inheritProperties(axisLabelsY2, "styles.secondaryAxisLabels");
				propertyManager.inheritProperties(axisLabelsY2, "styles.yAxisLabels");
				propertyManager.inheritProperties(axisLabelsY2, "styles.numericAxisLabels");
				propertyManager.inheritProperties(axisLabelsY2, "styles.axisLabels");
				propertyManager.parseChildPropertyAs(axisLabelsY2, "axis", this._axisPropertyParser, "@axisY");
				propertyManager.parseChildPropertyAs(axisLabelsY2, "placement", this._stringPropertyParser, "right");
				propertyManager.parseChildProperty(axisLabelsY2, "majorLabelStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(axisLabelsY2, "majorLabelStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
				propertyManager.parseChildProperty(axisLabelsY2, "minorLabelStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(axisLabelsY2, "minorLabelStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
				if (this._minimalMode)
				{
					propertyManager.parseChildPropertyAs(axisLabelsY2, "visibility", this._stringPropertyParser, "hidden");
					propertyManager.parseChildPropertyAs(axisLabelsY2, "width", this._numberPropertyParser, "20");
				}

				var gridLinesX:GridLines = propertyManager.parsePropertyAs("gridLinesX", this._gridLinesPropertyParser, "gridLines");
				propertyManager.inheritProperties(gridLinesX, "styles.primaryGridLines");
				propertyManager.inheritProperties(gridLinesX, "styles.xGridLines");
				propertyManager.inheritProperties(gridLinesX, "styles.gridLines");
				propertyManager.parseChildPropertyAs(gridLinesX, "axisLabels", this._axisLabelsPropertyParser, "@axisLabelsX");
				if (this._minimalMode)
					propertyManager.parseChildPropertyAs(gridLinesX, "visibility", this._stringPropertyParser, "collapsed");

				var gridLinesY:GridLines = propertyManager.parsePropertyAs("gridLinesY", this._gridLinesPropertyParser, "gridLines");
				propertyManager.inheritProperties(gridLinesY, "styles.secondaryGridLines");
				propertyManager.inheritProperties(gridLinesY, "styles.yGridLines");
				propertyManager.inheritProperties(gridLinesY, "styles.gridLines");
				propertyManager.parseChildPropertyAs(gridLinesY, "axisLabels", this._axisLabelsPropertyParser, "@axisLabelsY1");
				if (this._minimalMode)
					propertyManager.parseChildPropertyAs(gridLinesY, "visibility", this._stringPropertyParser, "collapsed");

				var enableAnnotations:Boolean = propertyManager.parseProperty("annotations.enable", this._booleanPropertyParser, "false");
				var annotations:AnnotationChart;
				var annotationsData:IDataTable;
				if (enableAnnotations)
				{
					annotations = propertyManager.parsePropertyAs("annotations", this._chartPropertyParser, "annotation");
					propertyManager.inheritProperties(annotations, "styles.annotationChart");
					propertyManager.inheritProperties(annotations, "styles.chart1D");
					propertyManager.inheritProperties(annotations, "styles.chart");
					propertyManager.parseChildPropertyAs(annotations, "axis", this._axisPropertyParser, "@axisX");
					propertyManager.parseChildProperty(annotations, "markerStyle", this._spriteStylePropertyParser, "style");
					propertyManager.parseChildProperty(annotations, "labelStyle", this._textBlockStylePropertyParser, "style");
					propertyManager.parseChildProperty(annotations, "labelStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
					annotationsData = propertyManager.parseChildProperty(annotations, "data", this._dataTablePropertyParser);
					this._processDataProperties(annotationsData);
				}
			}
			finally
			{
				propertyManager.endParse();
			}

			var rangeMarkerChanged:Boolean = this._setRangeMarker(rangeMarker);
			var cursorMarkerChanged:Boolean = this._setCursorMarker(cursorMarker);
			var tooltipChanged:Boolean = this._setTooltip(tooltip);
			var valueTipChanged:Boolean = this._setValueTip(valueTip);
			var dataSpriteTipChanged:Boolean = this._setDataSpriteTip(dataSpriteTip);
			var chartChanged:Boolean = this._setChart(chart);
			var axisXChanged:Boolean = this._setAxisX(axisX);
			var axisYChanged:Boolean = this._setAxisY(axisY);
			var axisLabelsXChanged:Boolean = this._setAxisLabelsX(axisLabelsX);
			var axisLabelsY1Changed:Boolean = this._setAxisLabelsY1(axisLabelsY1);
			var axisLabelsY2Changed:Boolean = this._setAxisLabelsY2(axisLabelsY2);
			var gridLinesXChanged:Boolean = this._setGridLinesX(gridLinesX);
			var gridLinesYChanged:Boolean = this._setGridLinesY(gridLinesY);
			var annotationsChanged:Boolean = this._setAnnotations(annotations);

			var childIndex:int = 0;
			if (gridLinesY)
				this._chartLayout.setChildIndex(gridLinesY, childIndex++);
			if (gridLinesX)
				this._chartLayout.setChildIndex(gridLinesX, childIndex++);
			if (axisLabelsY2)
				this._chartLayout.setChildIndex(axisLabelsY2, childIndex++);
			if (axisLabelsY1)
				this._chartLayout.setChildIndex(axisLabelsY1, childIndex++);
			if (axisLabelsX)
				this._chartLayout.setChildIndex(axisLabelsX, childIndex++);
			if (chart)
				this._chartLayout.setChildIndex(chart, childIndex++);
			if (cursorMarker)
				this._chartLayout.setChildIndex(cursorMarker, childIndex++);
			if (rangeMarker)
				this._chartLayout.setChildIndex(rangeMarker, childIndex++);
			if (annotations)
				this._chartLayout.setChildIndex(annotations, childIndex++);

			if (axisXChanged || rangeMarkerChanged)
			{
				if (rangeMarker)
					rangeMarker.axis = axisX;
				if (cursorMarker)
					cursorMarker.axis = axisX;
			}

			if (rangeMarker)
			{
				rangeMarker.minimumSnap = this._minimumSnap;
				rangeMarker.maximumSnap = this._maximumSnap;
			}

			if (cursorMarker)
				cursorMarker.valueSnap = this._cursorValueSnap;

			this._updateViewRange();
			this._updateCountRange();

			this.setValid(Timeline.PROCESS_PROPERTIES);
		}

		public function dispatchUpdated() : void
		{
			this.validatePreceding(Timeline.DISPATCH_UPDATED);

			if (this.isValid(Timeline.DISPATCH_UPDATED))
				return;

			setTimeout(this._dispatchUpdated, 0);

			this.setValid(Timeline.DISPATCH_UPDATED);
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

			if (this._minimalMode)
			{
				var minimalLineBrush:IBrush = this._minimalLineBrush.value;
				if (minimalLineBrush)
				{
					var width:Number = Math.round(layoutSize.width);
					var height:Number = Math.round(Math.max(layoutSize.height - 20, 0));
					var x1:Number = 20;
					var x2:Number = Math.max(x1, width - 20);
					var numLines:int = Math.round(height / 7);
					var y:Number;

					minimalLineBrush.beginBrush(graphics);

					// vertical lines
					minimalLineBrush.moveTo(x1, 0);
					minimalLineBrush.lineTo(x1, height);
					minimalLineBrush.moveTo(x2, 0);
					minimalLineBrush.lineTo(x2, height);

					// horizontal lines
					for (var i:int = 0; i <= numLines; i++)
					{
						y = Math.round(height * (i / numLines));
						minimalLineBrush.moveTo(x1, y);
						minimalLineBrush.lineTo(x2, y);
					}

					minimalLineBrush.endBrush();
				}
			}

			return super.layoutOverride(layoutSize);
		}

		// Private Methods

		private function _processDataProperties(data:IDataTable) : void
		{
			if (!data || this._processingInstances[data])
				return;

			this._processingInstances[data] = true;

			if (data is IDataLoadable)
				this._loadableDataInstances[data] = data;

			var propertyManager:PropertyManager = this._propertyManager;

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

				"foregroundColor": "0x000000",
				"backgroundColor": "0xFFFFFF",
				"seriesColors": "[0x73A550]",
				"annotationColors": "[0xCC0000,0xCCCC00,0x00CC00,0x00CCCC,0x0000CC]",

				"backgroundBrush": "solidFill",
				"backgroundBrush.color": "@backgroundColor",

				"minimalLineBrush": "solidStroke",
				"minimalLineBrush.thickness": "1",
				"minimalLineBrush.color": "@foregroundColor",
				"minimalLineBrush.alpha": "0.1",
				"minimalLineBrush.pixelHinting": "true",
				"minimalLineBrush.caps": "square",

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

				"rangeMarkerFillBrush": "solidFill",
				"rangeMarkerFillBrush.color": "0xD9D9D9",

				"rangeMarkerLineBrush": "solidStroke",
				"rangeMarkerLineBrush.thickness": "1",
				"rangeMarkerLineBrush.color": "@foregroundColor",
				"rangeMarkerLineBrush.alpha": "0.4",

				"borderBrush": "borderStroke",
				"borderBrush.thicknesses": "[0,1,0,0]",
				"borderBrush.colors": "[0x517438]",
				"borderBrush.pixelHinting": "true",
				"borderBrush.caps": "square",

				"colorPalette": "list",
				"colorPalette.colors": "@seriesColors",

				"colorPaletteDark": "brightness",
				"colorPaletteDark.colorPalette": "@colorPalette",
				"colorPaletteDark.brightness": "-0.15",

				"annotationColorPalette": "#colorPalette",
				"annotationColorPalette.colors": "@annotationColors",

				"annotationColorPaletteDark": "#colorPaletteDark",
				"annotationColorPaletteDark.colorPalette": "@annotationColorPalette",

				"fillBrushPalette": "solidFill",
				"fillBrushPalette.colorPalette": "@colorPalette",

				"borderBrushPalette": "list",
				"borderBrushPalette.brushes": "[@borderBrush]",

				"columnBrushPalette": "group",
				"columnBrushPalette.brushPalettes": "[@fillBrushPalette,@borderBrushPalette]",

				"annotationBrushPalette": "#fillBrushPalette",
				"annotationBrushPalette.colorPalettes": "[@annotationColorPalette,@annotationColorPaletteDark]",

				"rangeMarker.minimumFillBrush": "@rangeMarkerFillBrush",
				"rangeMarker.minimumLineBrush": "@rangeMarkerLineBrush",
				"rangeMarker.minimumValueStyle.defaultTextFormat.font": "@fontFace",
				"rangeMarker.minimumValueStyle.defaultTextFormat.size": "@fontSize",
				"rangeMarker.minimumValueStyle.defaultTextFormat.color": "0x000000",
				"rangeMarker.maximumFillBrush": "@rangeMarkerFillBrush",
				"rangeMarker.maximumLineBrush": "@rangeMarkerLineBrush",
				"rangeMarker.maximumValueStyle.defaultTextFormat.font": "@fontFace",
				"rangeMarker.maximumValueStyle.defaultTextFormat.size": "@fontSize",
				"rangeMarker.maximumValueStyle.defaultTextFormat.color": "0x000000",
				"rangeMarker.rangeFillBrush": "@rangeMarkerFillBrush",
				"rangeMarker.rangeValueStyle.defaultTextFormat.font": "@fontFace",
				"rangeMarker.rangeValueStyle.defaultTextFormat.size": "@fontSize",
				"rangeMarker.rangeValueStyle.defaultTextFormat.color": "0x000000",

				"cursorMarker.fillBrush": "@rangeMarkerFillBrush",
				"cursorMarker.lineBrush": "@rangeMarkerLineBrush",
				"cursorMarker.valueStyle.defaultTextFormat.font": "@fontFace",
				"cursorMarker.valueStyle.defaultTextFormat.size": "@fontSize",
				"cursorMarker.valueStyle.defaultTextFormat.color": "0x000000",

				"tooltip.backgroundBrush": "solidFill",
				"tooltip.backgroundBrush.color": "0x444444",
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

				//"valueTip",

				//"dataSpriteTip",

				//"annotations",
				"annotations.enable": "false",
				"annotations.data": "results",

				//"chart",

				//"data",

				//"axisX",

				//"axisY",

				//"axisLabelsX",

				//"axisLabelsY1",

				//"axisLabelsY2",

				//"gridLinesX",

				//"gridLinesY",

				//"styles.chart",

				"styles.chart1D.axis": "@axisX",

				"styles.chart2D.axisX": "@axisX",
				"styles.chart2D.axisY": "@axisY",

				"styles.annotationChart.markerBrushPalette": "@annotationBrushPalette",
				"styles.annotationChart.labelStyle.margin": "(3,3,0,0)",
				"styles.annotationChart.labelStyle.defaultTextFormat.font": "@fontFace",
				"styles.annotationChart.labelStyle.defaultTextFormat.size": "@fontSize",
				"styles.annotationChart.labelStyle.defaultTextFormat.color": "0xFFFFFF",
				"styles.annotationChart.labelStyle.maximumWidth": "75",

				"styles.histogram.columnBrushPalette": "@columnBrushPalette",

				//"styles.data",

				"styles.resultsData.hostPath": this._hostPath,
				"styles.resultsData.basePath": this._basePath,
				"styles.resultsData.sessionKey": this._sessionKey,

				"styles.timelineData.hostPath": this._hostPath,
				"styles.timelineData.basePath": this._basePath,
				"styles.timelineData.sessionKey": this._sessionKey,

				//"styles.viewData",

				//"styles.axis",

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

				"styles.gridLines.majorLineBrush": "@gridLineBrush",
				"styles.gridLines.minorLineBrush": "@gridLineBrush",

				//"styles.xGridLines",

				//"styles.yGridLines",

				"styles.primaryGridLines.majorLineBrush": "@axisLineBrush",
				"styles.primaryGridLines.minorLineBrush": "@axisLineBrush",
				"styles.primaryGridLines.showMajorLines": "false"

				//"styles.secondaryGridLines"

			};

			for (var propertyName:String in values)
				propertyManager.setValue(propertyName, values[propertyName]);

			propertyManager.setNamespace("external");
		}

		private function _isLegacyProperty(propertyPath:String) : Boolean
		{
			if (!propertyPath)
				return false;

			var path:Array = propertyPath.split(".");
			if (!Timeline._LEGACY_PROPERTY_MAP[path[0]])
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

			var legacyPropertyMap:Object = Timeline._LEGACY_PROPERTY_MAP;

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
				this.invalidate(Timeline.DISPATCH_UPDATED);
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

			//this._updateClickedItem(true);
			this._updateTimelineData(data as TimelineDataTable);

			if (this._dataLoading)
			{
				delete this._dataLoading[data];
				for each (data in this._dataLoading)
					return;
				this._dataLoading = null;
			}

			// indicate which update the updated event corresponds to
			this._updatedCount = this._updatingCount;

			//this.invalidate(Timeline.PROCESS_DATA);
			this.invalidate(Timeline.DISPATCH_UPDATED);

			if (this._updatingCount < this._updateCount)
				this._update();
		}

		private function _updateTimelineData(timelineDataTable:TimelineDataTable) : void
		{
			if (!timelineDataTable || !this._chart || (this._chart.data != timelineDataTable))
				return;

			this._timelineData = timelineDataTable.timelineData;

			var jobIDChanged:Boolean = (timelineDataTable.jobID != this._prevJobID);
			this._prevJobID = timelineDataTable.jobID;

			if (jobIDChanged)
			{
				if (this._rangeMarker)
				{
					this._rangeMarker.minimum = null;
					this._rangeMarker.maximum = null;
				}
			}

			if (this._rangeMarker)
			{
				this._rangeMarker.minimumSnap = this._minimumSnap;
				this._rangeMarker.maximumSnap = this._maximumSnap;
			}

			if (this._cursorMarker)
			{
				this._cursorMarker.valueSnap = this._cursorValueSnap;
				this._cursorMarker.value = (this._timelineData && (this._timelineData.buckets.length > 0))? this._timelineData.cursorTime : null;
			}

			this.invalidate(Timeline.PROCESS_PROPERTIES);

			ValidateQueue.validateAll();

			this._updateSelectionRange();
		}

		private function _updateViewRange() : void
		{
			if (!this._axisX)
				return;

			if ((!this._timelineData || (this._timelineData.buckets.length == 0)) && !isNaN(this._viewMinimum))
				return;

			var minimum:Number = this._axisX.extendedMinimum;
			var maximum:Number = this._axisX.extendedMaximum;

			if ((minimum == this._viewMinimum) && (maximum == this._viewMaximum))
				return;

			this._viewMinimum = minimum;
			this._viewMaximum = maximum;

			try
			{
				JABridge.dispatchEvent("viewChanged", { viewMinimum: this._viewMinimum, viewMaximum: this._viewMaximum });
			}
			catch (e:Error)
			{
			}

			var tweenMinimum:PropertyTween = new PropertyTween(this._axisX, "minimum", this._axisX.actualMinimum, this._axisX.extendedMinimum);
			var tweenMaximum:PropertyTween = new PropertyTween(this._axisX, "maximum", this._axisX.actualMaximum, this._axisX.extendedMaximum);
			var tween:GroupTween = new GroupTween([ tweenMinimum, tweenMaximum ], new CubicEaser(EaseDirection.OUT));
			TweenRunner.start(tween, 0.5);

			this._updateSelectionRange();
		}

		private function _updateCountRange() : void
		{
			if (!this._axisY)
				return;

			if (!this._timelineData || (this._timelineData.eventCount == 0))
				return;

			var tweenMinimum:PropertyTween = new PropertyTween(this._axisY, "minimum", this._axisY.actualMinimum, this._axisY.extendedMinimum);
			var tweenMaximum:PropertyTween = new PropertyTween(this._axisY, "maximum", this._axisY.actualMaximum, this._axisY.extendedMaximum);
			var tween:GroupTween = new GroupTween([ tweenMinimum, tweenMaximum ], new CubicEaser(EaseDirection.OUT));
			TweenRunner.start(tween, 0.5);
		}

		private function _updateSelectionRange(dispatchEvent:Boolean = true) : void
		{
			if (!this._rangeMarker || this._rangeMarker.isDragging)
				return;

			var minimumTime:DateTime = this._rangeMarker.minimum as DateTime;
			var maximumTime:DateTime = this._rangeMarker.maximum as DateTime;
			var minimum:Number = minimumTime ? minimumTime.time : NaN;
			var maximum:Number = maximumTime ? maximumTime.time : NaN;
			var actualMinimum:Number = isNaN(minimum) ? this._viewMinimum : this._rangeMarker.actualMinimum.time;
			var actualMaximum:Number = isNaN(maximum) ? this._viewMaximum : this._rangeMarker.actualMaximum.time;

			var minimumChanged:Boolean = isNaN(minimum) ? !isNaN(this._selectionMinimum) : (isNaN(this._selectionMinimum) || (actualMinimum != this._actualSelectionMinimum));
			var maximumChanged:Boolean = isNaN(maximum) ? !isNaN(this._selectionMaximum) : (isNaN(this._selectionMaximum) || (actualMaximum != this._actualSelectionMaximum));

			this._selectionMinimum = minimum;
			this._selectionMaximum = maximum;
			this._actualSelectionMinimum = actualMinimum;
			this._actualSelectionMaximum = actualMaximum;

			if (dispatchEvent && (minimumChanged || maximumChanged))
			{
				minimum = isNaN(minimum) ? NaN : actualMinimum;
				maximum = isNaN(maximum) ? NaN : actualMaximum;
				try
				{
					JABridge.dispatchEvent("selectionChanged", { selectionMinimum: minimum, selectionMaximum: maximum });
				}
				catch (e:Error)
				{
				}
			}
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
			var valueTip:ValueTip = this._valueTip;
			var dataSpriteTip:DataSpriteTip = this._dataSpriteTip;
			if (!tooltip || !valueTip || !dataSpriteTip)
				return;

			if (dataSprite)
			{
				if (dataSprite.chart == this._chart)
				{
					valueTip.value = this._tipFormat(dataSprite.data, dataSprite.fields);

					if (tooltip.contains(dataSpriteTip))
						tooltip.removeChild(dataSpriteTip);
					if (!tooltip.contains(valueTip))
						tooltip.addChild(valueTip);
				}
				else if (dataSprite.chart is AnnotationChart)
				{
					valueTip.value = (dataSprite.fields.length > 3) ? dataSprite.data[dataSprite.fields[3]] : "";

					if (tooltip.contains(dataSpriteTip))
						tooltip.removeChild(dataSpriteTip);
					if (!tooltip.contains(valueTip))
						tooltip.addChild(valueTip);
				}
				else
				{
					dataSpriteTip.dataSprite = null;  // force update
					dataSpriteTip.dataSprite = dataSprite;

					if (tooltip.contains(valueTip))
						tooltip.removeChild(valueTip);
					if (!tooltip.contains(dataSpriteTip))
						tooltip.addChild(dataSpriteTip);
				}

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
				valueTip.value = null;
				dataSpriteTip.dataSprite = null;
				tooltip.hide();
			}
		}

		private function _setRangeMarker(rangeMarker:ClickDragRangeMarker) : Boolean
		{
			if (rangeMarker == this._rangeMarker)
				return false;

			if (this._rangeMarker)
			{
				this._rangeMarker.removeEventListener(ClickDragRangeMarker.DRAG_COMPLETE, this._rangeMarker_dragComplete);
				this._rangeMarker.removeEventListener(ChangedEvent.CHANGED, this._rangeMarker_changed);
				this._chartLayout.removeChild(this._rangeMarker);
			}

			this._rangeMarker = rangeMarker;

			if (this._rangeMarker)
			{
				this._rangeMarker.minimumSnap = this._minimumSnap;
				this._rangeMarker.maximumSnap = this._maximumSnap;
				this._rangeMarker.minimumFormat = this._minimumFormat;
				this._rangeMarker.maximumFormat = this._maximumFormat;
				this._rangeMarker.rangeFormat = this._rangeFormat;
				this._rangeMarker.addEventListener(ClickDragRangeMarker.DRAG_COMPLETE, this._rangeMarker_dragComplete);
				this._rangeMarker.addEventListener(ChangedEvent.CHANGED, this._rangeMarker_changed);
				this._chartLayout.addChild(this._rangeMarker);
			}

			return true;
		}

		private function _setCursorMarker(cursorMarker:CursorMarker) : Boolean
		{
			if (cursorMarker == this._cursorMarker)
				return false;

			if (this._cursorMarker)
				this._chartLayout.removeChild(this._cursorMarker);

			this._cursorMarker = cursorMarker;

			if (this._cursorMarker)
			{
				this._cursorMarker.valueSnap = this._cursorValueSnap;
				this._cursorMarker.valueFormat = this._cursorValueFormat;
				this._chartLayout.addChild(this._cursorMarker);
			}

			return true;
		}

		private function _setTooltip(tooltip:Tooltip) : Boolean
		{
			if (tooltip == this._tooltip)
				return false;

			if (this._tooltip)
				this.removeChild(this._tooltip);

			this._tooltip = tooltip;

			if (this._tooltip)
				this.addChild(this._tooltip);

			return true;
		}

		private function _setValueTip(valueTip:ValueTip) : Boolean
		{
			if (valueTip == this._valueTip)
				return false;

			this._valueTip = valueTip;

			return true;
		}

		private function _setDataSpriteTip(dataSpriteTip:DataSpriteTip) : Boolean
		{
			if (dataSpriteTip == this._dataSpriteTip)
				return false;

			if (this._dataSpriteTip)
				this._dataSpriteTip.valueFormat = null;

			this._dataSpriteTip = dataSpriteTip;

			if (this._dataSpriteTip)
				this._dataSpriteTip.valueFormat = this._dataSpriteTipFormat;

			return true;
		}

		private function _setAnnotations(annotations:AnnotationChart) : Boolean
		{
			if (annotations == this._annotations)
				return false;

			if (this._annotations)
			{
				this._annotations.removeEventListener(ValidateEvent.VALIDATED, this._chart_validated);
				this._chartLayout.removeChild(this._annotations);
			}

			this._annotations = annotations;

			if (this._annotations)
			{
				this._annotations.addEventListener(ValidateEvent.VALIDATED, this._chart_validated);
				this._chartLayout.addChild(this._annotations);
			}

			return true;
		}

		private function _setChart(chart:Histogram) : Boolean
		{
			if (chart == this._chart)
				return false;

			if (this._chart)
			{
				this._chart.removeEventListener(ValidateEvent.VALIDATED, this._chart_validated);
				this._chartLayout.removeChild(this._chart);
			}

			this._chart = chart;

			if (this._chart)
			{
				this._chart.addEventListener(ValidateEvent.VALIDATED, this._chart_validated);
				this._chartLayout.addChild(this._chart);
			}

			return true;
		}

		private function _setAxisX(axisX:TimeAxis) : Boolean
		{
			if (axisX == this._axisX)
				return false;

			if (this._axisX)
			{
				this._axisX.removeEventListener(ChangedEvent.CHANGED, this._axisX_changed);
				this._axisX = null;
			}

			this._axisX = axisX;

			if (this._axisX)
			{
				this._axisX.minimum = this._axisX.actualMinimum;
				this._axisX.maximum = this._axisX.actualMaximum;
				this._axisX.addEventListener(ChangedEvent.CHANGED, this._axisX_changed);
			}

			return true;
		}

		private function _setAxisY(axisY:NumericAxis) : Boolean
		{
			if (axisY == this._axisY)
				return false;

			if (this._axisY)
			{
				this._axisY.removeEventListener(ChangedEvent.CHANGED, this._axisY_changed);
				this._axisY = null;
			}

			this._axisY = axisY;

			if (this._axisY)
			{
				this._axisY.minimum = this._axisY.actualMinimum;
				this._axisY.maximum = this._axisY.actualMaximum;
				this._axisY.addEventListener(ChangedEvent.CHANGED, this._axisY_changed);
			}

			return true;
		}

		private function _setAxisLabelsX(axisLabelsX:TimeAxisLabels) : Boolean
		{
			if (axisLabelsX == this._axisLabelsX)
				return false;

			if (this._axisLabelsX)
				this._chartLayout.removeChild(this._axisLabelsX);

			this._axisLabelsX = axisLabelsX;

			if (this._axisLabelsX)
			{
				this._axisLabelsX.majorLabelFormat = this._timeAxisFormat(this._axisLabelsX);
				this._axisLabelsX.minorLabelFormat = this._timeAxisFormat(this._axisLabelsX);
				this._chartLayout.addChild(this._axisLabelsX);
			}

			return true;
		}

		private function _setAxisLabelsY1(axisLabelsY1:NumericAxisLabels) : Boolean
		{
			if (axisLabelsY1 == this._axisLabelsY1)
				return false;

			if (this._axisLabelsY1)
				this._chartLayout.removeChild(this._axisLabelsY1);

			this._axisLabelsY1 = axisLabelsY1;

			if (this._axisLabelsY1)
			{
				this._axisLabelsY1.majorLabelFormat = this._numberFormat;
				this._axisLabelsY1.minorLabelFormat = this._numberFormat;
				this._chartLayout.addChild(this._axisLabelsY1);
			}

			return true;
		}

		private function _setAxisLabelsY2(axisLabelsY2:NumericAxisLabels) : Boolean
		{
			if (axisLabelsY2 == this._axisLabelsY2)
				return false;

			if (this._axisLabelsY2)
				this._chartLayout.removeChild(this._axisLabelsY2);

			this._axisLabelsY2 = axisLabelsY2;

			if (this._axisLabelsY2)
			{
				this._axisLabelsY2.majorLabelFormat = this._numberFormat;
				this._axisLabelsY2.minorLabelFormat = this._numberFormat;
				this._chartLayout.addChild(this._axisLabelsY2);
			}

			return true;
		}

		private function _setGridLinesX(gridLinesX:GridLines) : Boolean
		{
			if (gridLinesX == this._gridLinesX)
				return false;

			if (this._gridLinesX)
				this._chartLayout.removeChild(this._gridLinesX);

			this._gridLinesX = gridLinesX;

			if (this._gridLinesX)
				this._chartLayout.addChild(this._gridLinesX);

			return true;
		}

		private function _setGridLinesY(gridLinesY:GridLines) : Boolean
		{
			if (gridLinesY == this._gridLinesY)
				return false;

			if (this._gridLinesY)
				this._chartLayout.removeChild(this._gridLinesY);

			this._gridLinesY = gridLinesY;

			if (this._gridLinesY)
				this._chartLayout.addChild(this._gridLinesY);

			return true;
		}

		private function _cursorValueSnap(value:*) : *
		{
			return this._ceilToBucket(value);
		}

		private function _minimumSnap(value:*, floor:Boolean = false) : *
		{
			return floor ? this._floorToBucket(value) : this._roundToBucket(value);
		}

		private function _maximumSnap(value:*, ceil:Boolean = false) : *
		{
			return ceil ? this._ceilToBucket(value) : this._roundToBucket(value);
		}

		private function _floorToBucket(value:*) : *
		{
			var timeValue:DateTime = value as DateTime;
			if (!timeValue)
				return value;

			var timelineData:TimelineData = this._timelineData;
			if (timelineData)
			{
				var buckets:Array = timelineData.buckets;
				if (buckets && (buckets.length > 0))
				{
					var numBuckets:int = buckets.length;
					var bucket:TimelineData;
					var bucketTime:DateTime;
					for (var i:int = numBuckets - 1; i >= 0; i--)
					{
						bucket = buckets[i];
						bucketTime = bucket.earliestTime;
						if (bucketTime && (bucketTime.time <= timeValue.time))
							break;
					}
					if (bucketTime && (bucketTime.time == bucketTime.time))
						timeValue = bucketTime;
				}
			}

			if (this._axisLabelsX)
				timeValue = timeValue.toTimeZone(this._axisLabelsX.timeZone);
			else
				timeValue = timeValue.toLocal();

			return timeValue;
		}

		private function _ceilToBucket(value:*) : *
		{
			var timeValue:DateTime = value as DateTime;
			if (!timeValue)
				return value;

			var timelineData:TimelineData = this._timelineData;
			if (timelineData)
			{
				var buckets:Array = timelineData.buckets;
				if (buckets && (buckets.length > 0))
				{
					var numBuckets:int = buckets.length;
					var bucket:TimelineData;
					var bucketTime:DateTime;
					for (var i:int = 0; i < numBuckets; i++)
					{
						bucket = buckets[i];
						bucketTime = bucket.latestTime;
						if (bucketTime && (bucketTime.time >= timeValue.time))
							break;
					}
					if (bucketTime && (bucketTime.time == bucketTime.time))
						timeValue = bucketTime;
				}
			}

			if (this._axisLabelsX)
				timeValue = timeValue.toTimeZone(this._axisLabelsX.timeZone);
			else
				timeValue = timeValue.toLocal();

			return timeValue;
		}

		private function _roundToBucket(value:*) : *
		{
			var timeValue:DateTime = value as DateTime;
			if (!timeValue)
				return value;

			var timelineData:TimelineData = this._timelineData;
			if (timelineData)
			{
				var buckets:Array = timelineData.buckets;
				if (buckets && (buckets.length > 0))
				{
					var bestTime:DateTime = timeValue;
					var bestDiff:Number = Infinity;
					var numBuckets:int = buckets.length;
					var bucket:TimelineData;
					var bucketTime:DateTime;
					var diff:Number;
					for (var i:int = 0; i < numBuckets; i++)
					{
						bucket = buckets[i];
						bucketTime = bucket.earliestTime;
						if (bucketTime && (bucketTime.time == bucketTime.time))
						{
							diff = Math.abs(bucketTime.time - timeValue.time);
							if (diff < bestDiff)
							{
								bestTime = bucketTime;
								bestDiff = diff;
							}
						}
						bucketTime = bucket.latestTime;
						if (bucketTime && (bucketTime.time == bucketTime.time))
						{
							diff = Math.abs(bucketTime.time - timeValue.time);
							if (diff < bestDiff)
							{
								bestTime = bucketTime;
								bestDiff = diff;
							}
						}
					}
					timeValue = bestTime;
				}
			}

			if (this._axisLabelsX)
				timeValue = timeValue.toTimeZone(this._axisLabelsX.timeZone);
			else
				timeValue = timeValue.toLocal();

			return timeValue;
		}

		private function _cursorValueFormat(value:*) : String
		{
			var timeValue:DateTime = value as DateTime;
			if (!timeValue)
				return "";

			return this._minMaxFormat(timeValue);
		}

		private function _minimumFormat(value:*) : String
		{
			var timeValue:DateTime = value as DateTime;
			if (!timeValue)
				return "";

			timeValue = this._minimumSnap(timeValue);

			return this._minMaxFormat(timeValue);
		}

		private function _maximumFormat(value:*) : String
		{
			var timeValue:DateTime = value as DateTime;
			if (!timeValue)
				return "";

			timeValue = this._maximumSnap(timeValue);

			return this._minMaxFormat(timeValue);
		}

		private function _minMaxFormat(timeValue:DateTime) : String
		{
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

		private function _rangeFormat(minimum:*, maximum:*) : String
		{
			var minimumTime:DateTime = minimum as DateTime;
			var maximumTime:DateTime = maximum as DateTime;
			if (!minimumTime || !maximumTime)
				return "";

			minimumTime = this._minimumSnap(minimumTime);
			maximumTime = this._maximumSnap(maximumTime);

			var duration:Duration = TimeUtils.subtractDates(maximumTime, minimumTime);

			var str:String = "";
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
		}

		private function _tipFormat(data:Object, fields:Array) : String
		{
			if ((data.earliestTime is DateTime) && (data.latestTime is DateTime) && (data.eventCount is int))
				return this._formatTooltip(data.earliestTime, data.latestTime, data.eventCount);
			return "";
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

		private function _numberFormat(value:Number) : String
		{
			return this._formatNumber(value);
		}

		private function _timeAxisFormat(timeAxisLabels:TimeAxisLabels) : Function
		{
			var self:Timeline = this;
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

		private function _formatTooltip(earliestTime:DateTime, latestTime:DateTime, eventCount:int) : String
		{
			var text:String;

			var cache:Cache = this._formatTooltipCache;
			var key:* = earliestTime.time + "," + latestTime.time + "," + earliestTime.timeZoneOffset + "," + latestTime.timeZoneOffset + "," + eventCount;
			if (cache.contains(key))
			{
				text = cache.getEntry(key);
			}
			else
			{
				try
				{
					text = JABridge.callMethod("formatTooltip", earliestTime.time, latestTime.time, earliestTime.timeZoneOffset, latestTime.timeZoneOffset, eventCount);
				}
				catch (e:Error)
				{
					text = eventCount + " events from " + earliestTime + " to " + latestTime;
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

		private function _parseTimelineData(timelineData:TimelineData) : Object
		{
			if (!timelineData)
				return null;

			var parsedTimelineData:Object = new Object();
			parsedTimelineData.earliestTime = timelineData.earliestTime ? timelineData.earliestTime.time : null;
			parsedTimelineData.latestTime = timelineData.latestTime ? timelineData.latestTime.time : null;
			parsedTimelineData.cursorTime = timelineData.cursorTime ? timelineData.cursorTime.time : null;
			parsedTimelineData.duration = timelineData.duration;
			parsedTimelineData.earliestOffset = timelineData.earliestTime ? timelineData.earliestTime.timeZoneOffset : 0;
			parsedTimelineData.latestOffset = timelineData.latestTime ? timelineData.latestTime.timeZoneOffset : 0;
			parsedTimelineData.eventCount = timelineData.eventCount;
			parsedTimelineData.eventAvailableCount = timelineData.eventAvailableCount;
			parsedTimelineData.isComplete = timelineData.isComplete;

			var buckets:Array = timelineData.buckets;
			var numBuckets:int = buckets.length;
			var parsedBuckets:Array = parsedTimelineData.buckets = new Array(numBuckets);
			for (var i:int = 0; i < numBuckets; i++)
				parsedBuckets[i] = this._parseTimelineData(buckets[i]);

			return parsedTimelineData;
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

		private function _updateContextMenu() : void
		{
			var contextMenu:ContextMenu = new ContextMenu();
			contextMenu.hideBuiltInItems();

			if (this._enableOpenAsImage)
			{
				var caption:String = this._formatSimpleString("Open as image");

				var contextMenuItem:ContextMenuItem = new ContextMenuItem(caption);
				contextMenuItem.addEventListener(ContextMenuEvent.MENU_ITEM_SELECT, this._contextMenuItem_menuItemSelect);

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
				var dataSprite:DataSprite = DataSprite(e.target);
				if (this._enableChartClick)
					dataSprite.buttonMode = true;
				this._updateTooltip(dataSprite);
			}
			else if (target is AxisLabel)
			{
				var axisLabel:AxisLabel = AxisLabel(target);
				if (this._enableLabelClick)
					axisLabel.buttonMode = true;
			}

			ValidateQueue.validateAll();
		}

		private function _stage_mouseOut(e:MouseEvent) : void
		{
			var sprite:Sprite = e.target as Sprite;
			if (sprite)
				sprite.buttonMode = false;
		}

		private function _stage_click(e:MouseEvent) : void
		{
			var target:Object = e.target;
			if (target is DataSprite)
			{
				if (!this._enableChartClick)
					return;

				var dataSprite:DataSprite = DataSprite(target);
				dataSprite.doubleClickEnabled = true;

				try
				{
					JABridge.dispatchEvent("chartClicked", { data: dataSprite.data, fields: dataSprite.fields, altKey: e.altKey, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey });
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

				try
				{
					JABridge.dispatchEvent("labelClicked", { text: axisLabel.text, altKey: e.altKey, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey });
				}
				catch (error:Error)
				{
				}
			}
		}

		private function _stage_doubleClick(e:MouseEvent) : void
		{
			var target:Object = e.target;
			if (target is DataSprite)
			{
				if (!this._enableChartClick)
					return;

				var dataSprite:DataSprite = DataSprite(target);
				try
				{
					JABridge.dispatchEvent("chartDoubleClicked", { data: dataSprite.data, fields: dataSprite.fields, altKey: e.altKey, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey });
				}
				catch (error:Error)
				{
				}
			}
		}

		private function _dataSprite_mouseOut(e:MouseEvent) : void
		{
			this._updateTooltip(null);
		}

		private function _chart_validated(e:ValidateEvent) : void
		{
			if (e.pass == AbstractChart.RENDER_CHART)
				this._updateTooltip();
		}

		private function _axisX_changed(e:ChangedEvent) : void
		{
			if (e.changeType == AxisChangeType.EXTENDED_RANGE)
				this._updateViewRange();
		}

		private function _axisY_changed(e:ChangedEvent) : void
		{
			if (e.changeType == AxisChangeType.EXTENDED_RANGE)
				this._updateCountRange();
		}

		private function _rangeMarker_dragComplete(e:Event) : void
		{
			this._updateSelectionRange();
		}

		private function _rangeMarker_changed(e:ChangedEvent) : void
		{
			var pce:PropertyChangedEvent = e as PropertyChangedEvent;
			if (!pce || (pce.propertyName != "labelOpacity"))
				return;

			if (this._cursorMarker)
				this._cursorMarker.labelOpacity = 1 - pce.newValue;
		}

		private function _contextMenuItem_menuItemSelect(e:ContextMenuEvent) : void
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

		private function _JABridge_connect() : void
		{
			this.invalidate(Timeline.PROCESS_PROPERTIES);

			this.visibility = Visibility.VISIBLE;
		}

		private function _JABridge_close() : void
		{
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

	}

}
