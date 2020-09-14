package
{

	import com.adobe.images.*;
	import com.jasongatt.controls.*;
	import com.jasongatt.core.*;
	import com.jasongatt.graphics.brushes.*;
	import com.jasongatt.layout.*;
	import com.jasongatt.motion.clocks.*;
	import com.jasongatt.utils.*;
	import com.splunk.controls.*;
	import com.splunk.external.*;
	import com.splunk.palettes.brush.*;
	import com.splunk.palettes.color.*;
	import com.splunk.palettes.shape.*;
	import com.splunk.particles.*;
	import com.splunk.particles.actions.*;
	import com.splunk.particles.collectors.*;
	import com.splunk.particles.controls.*;
	import com.splunk.particles.distributions.*;
	import com.splunk.particles.emitters.*;
	import com.splunk.particles.events.*;
	import com.splunk.particles.filters.*;
	import com.splunk.particles.initializers.*;
	import com.splunk.particles.properties.*;
	import com.splunk.particles.renderers.*;
	import com.splunk.properties.*;
	import com.splunk.time.*;
	import com.splunk.utils.*;
	import flash.display.*;
	import flash.events.*;
	import flash.geom.*;
	import flash.media.*;
	import flash.text.*;
	import flash.ui.*;
	import flash.utils.*;

	public class Particles extends GroupLayout
	{

		// Public Static Constants

		public static const PROCESS_DATA:ValidatePass = new ValidatePass(Particles, "processData", 0.01);
		public static const PROCESS_PROPERTIES:ValidatePass = new ValidatePass(Particles, "processProperties", 0.02);
		public static const DISPATCH_UPDATED:ValidatePass = new ValidatePass(Particles, "dispatchUpdated", 4);

		// Private Properties

		private var _cursor:Cursor;
		private var _fpsMonitor:FrameRateMonitor;
		private var _epsMonitor:HitRateMonitor;
		private var _epsHistogram:MarioHitRateHistogram;
		private var _addButton:LabelButton;
		private var _removeButton:LabelButton;
		private var _dragResizeHandle:DragResizeHandle;
		private var _linkSourcesHandle:LinkSourcesHandle;
		private var _fieldSplitterInspector:FieldSplitterInspector;
		private var _shelfBackground:Sprite;
		private var _unfocusArea:Sprite;
		private var _cascadeCount:int = 0;
		private var _fieldSplitterAdded:Boolean = false;
		private var _properties:Object;

		private var _timeZone:String = null;

		private var _hostPath:String = "http://localhost:8000";
		private var _basePath:String = "/splunkd";
		private var _sessionKey:String;

		private var _updateCount:int = 0;
		private var _updatedCount:int = 0;
		private var _dataError:String;

		private var _propertyManager:PropertyManager;
		private var _numberPropertyParser:NumberPropertyParser;
		private var _booleanPropertyParser:BooleanPropertyParser;
		private var _stringPropertyParser:StringPropertyParser;
		private var _brushPropertyParser:BrushPropertyParser;
		private var _spriteStylePropertyParser:SpriteStylePropertyParser;
		private var _layoutSpriteStylePropertyParser:LayoutSpriteStylePropertyParser;
		private var _textBlockStylePropertyParser:TextBlockStylePropertyParser;
		private var _textFormatPropertyParser:TextFormatPropertyParser;
		private var _elementPropertyParser:ElementPropertyParser;
		private var _elementArrayPropertyParser:ArrayPropertyParser;
		private var _elementRendererPropertyParser:ElementRendererPropertyParser;
		private var _elementRendererArrayPropertyParser:ArrayPropertyParser;
		private var _rendererPropertyParser:RendererPropertyParser;

		private var _clock:FrameClock;
		private var _rootEmitter:EventsEmitterControl;
		private var _bounds:RectangleDistribution2D;
		private var _boundsCollector:Collector;
		private var _dropCollector:Collector;
		private var _renderer:DelegatedRenderer;
		private var _defaultRenderer:AbstractRenderer;
		private var _dropRenderer:AbstractRenderer;
		private var _system:ParticleSystem;
		private var _processingInstances:Dictionary;
		private var _emitterElements:Dictionary;
		private var _collectorElements:Dictionary;
		private var _layoutSpriteElements:Dictionary;
		private var _histogramElementRenderers:Dictionary;

		private var _messageStyle:Style;
		private var _messageField:TextBlock;
		private var _monitorContainer:StackLayout;
		private var _contentContainer:Sprite;
		private var _backgroundBrush:ObservableProperty;
		private var _background:Shape;
		private var _isBackgroundValid:Boolean = false;

		private var _enableOpenAsImage:Boolean = false;
		private var _enableFullScreen:Boolean = true;

		private var _formatSimpleStringCache:Cache;
		private var _formatNumericStringCache:Cache;
		private var _formatNumberCache:Cache;
		private var _formatDateCache:Cache;
		private var _formatTimeCache:Cache;
		private var _formatDateTimeCache:Cache;

		private var _marioCode:Array = "MARIO".split("");
		private var _marioCodeIndex:int = 0;
		private var _marioMode:Boolean = false;
		private var _marioLoop:Sound;
		private var _marioChannel:SoundChannel;

		// Constructor

		public function Particles()
		{
			// stage

			var stage:Stage = this.stage;
			if (stage)
			{
				stage.align = StageAlign.TOP_LEFT;
				stage.scaleMode = StageScaleMode.NO_SCALE;
				stage.showDefaultContextMenu = false;

				//stage.addEventListener(MouseEvent.MOUSE_OVER, this._stage_mouseOver);
				//stage.addEventListener(MouseEvent.MOUSE_OUT, this._stage_mouseOut);
				stage.addEventListener(MouseEvent.MOUSE_DOWN, this._stage_mouseDown);
				//stage.addEventListener(MouseEvent.CLICK, this._stage_click);
				stage.addEventListener(KeyboardEvent.KEY_DOWN, this._mario_keyDown);

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
			this._propertyManager.addEventListener(PropertyManager.PROPERTY_MAP_CHANGED, this.invalidates(Particles.PROCESS_PROPERTIES));

			this._numberPropertyParser = NumberPropertyParser.getInstance();
			this._booleanPropertyParser = BooleanPropertyParser.getInstance();
			this._stringPropertyParser = StringPropertyParser.getInstance();
			this._brushPropertyParser = BrushPropertyParser.getInstance();
			this._spriteStylePropertyParser = SpriteStylePropertyParser.getInstance();
			this._layoutSpriteStylePropertyParser = LayoutSpriteStylePropertyParser.getInstance();
			this._textBlockStylePropertyParser = TextBlockStylePropertyParser.getInstance();
			this._textFormatPropertyParser = TextFormatPropertyParser.getInstance();
			this._elementPropertyParser = MarioElementPropertyParser.getInstance();
			this._elementArrayPropertyParser = ArrayPropertyParser.getInstance(this._elementPropertyParser);
			this._elementRendererPropertyParser = ElementRendererPropertyParser.getInstance();
			this._elementRendererArrayPropertyParser = ArrayPropertyParser.getInstance(this._elementRendererPropertyParser);
			this._rendererPropertyParser = RendererPropertyParser.getInstance();

			// caches

			this._formatSimpleStringCache = new Cache(500);
			this._formatNumericStringCache = new Cache(500);
			this._formatNumberCache = new Cache(500);
			this._formatDateCache = new Cache(500);
			this._formatTimeCache = new Cache(500);
			this._formatDateTimeCache = new Cache(500);

			// init

			this._clock = new FrameClock();

			this._cursor = new Cursor();

			this._fpsMonitor = new FrameRateMonitor();
			this._fpsMonitor.alignmentX = 1;

			this._epsMonitor = new HitRateMonitor();
			this._epsMonitor.clock = this._clock;
			this._epsMonitor.label = "eps";
			this._epsMonitor.alignmentX = 1;

			this._epsHistogram = new MarioHitRateHistogram();
			this._epsHistogram.clock = this._clock;
			this._epsHistogram.columnSize = 4;
			this._epsHistogram.alpha = 0.15;
			this._epsHistogram.alignmentY = 1;

			this._bounds = new RectangleDistribution2D();

			this._boundsCollector = new Collector();
			this._boundsCollector.actions = [ new MoveAction(), new KillZoneAction(this._bounds, true) ];
			this._boundsCollector.priority = int.MIN_VALUE;
			this._boundsCollector.addEventListener(ParticleEvent.COLLECTED, this._boundsCollector_collected);

			this._dropCollector = new Collector();
			this._dropCollector.filter = new FieldFilter("dropCount");
			this._dropCollector.priority = int.MIN_VALUE + 1;
			this._dropCollector.actions = [ new MoveAction(), new KillZoneAction(this._bounds, true) ];

			this._renderer = new MarioDelegatedRenderer();
			this._renderer.addCollector(this._boundsCollector);
			this._renderer.addCollector(this._dropCollector);

			this._system = new ParticleSystem();
			this._system.clock = this._clock;
			this._system.addCollector(this._boundsCollector);
			this._system.addCollector(this._dropCollector);

			this._messageField = new TextBlock();
			this._messageField.selectable = false;
			this._messageField.wordWrap = true;
			this._messageField.alignmentX = 0.5;
			this._messageField.alignmentY = 0.5;
			this._messageField.visibility = Visibility.COLLAPSED;
			this._messageField.snap = true;

			this._monitorContainer = new StackLayout();
			this._monitorContainer.alignmentX = 1;
			this._monitorContainer.alignmentY = 0;
			this._monitorContainer.addChild(this._fpsMonitor);
			this._monitorContainer.addChild(this._epsMonitor);

			this._addButton = new LabelButton();
			this._addButton.label.text = "Add splitter";
			this._addButton.margin = new Margin(40, 0, 0, 40);
			this._addButton.alignmentX = 0;
			this._addButton.alignmentY = 1;
			this._addButton.addEventListener(MouseEvent.CLICK, this._addFieldSplitter);

			this._removeButton = new LabelButton();
			this._removeButton.label.text = "Remove splitter";
			this._removeButton.margin = new Margin(40, 0, 0, 10);
			this._removeButton.alignmentX = 0;
			this._removeButton.alignmentY = 1;
			this._removeButton.visible = false;
			this._removeButton.addEventListener(MouseEvent.CLICK, this._removeFieldSplitter);

			this._dragResizeHandle = new DragResizeHandle(this._propertyManager);

			this._linkSourcesHandle = new LinkSourcesHandle(this._propertyManager);

			this._fieldSplitterInspector = new FieldSplitterInspector(this._propertyManager);
			this._fieldSplitterInspector.margin = new Margin(160, 0, 10, 10);
			this._fieldSplitterInspector.alignmentX = 0;
			this._fieldSplitterInspector.alignmentY = 1;

			this._shelfBackground = new Sprite();

			this._unfocusArea = new Sprite();

			this._contentContainer = new Sprite();

			this._backgroundBrush = new ObservableProperty(this, "backgroundBrush", IBrush, null, this._backgroundBrush_changed);
			this._background = new Shape();

			this._marioLoop = new mario_loop();

			this.addChild(this._background);
			this.addChild(this._unfocusArea);
			this.addChild(this._epsHistogram);
			this.addChild(this._renderer);
			this.addChild(this._contentContainer);
			this.addChild(this._dragResizeHandle);
			this.addChild(this._linkSourcesHandle);
			this.addChild(this._shelfBackground);
			this.addChild(this._addButton);
			this.addChild(this._removeButton);
			this.addChild(this._fieldSplitterInspector);
			this.addChild(this._monitorContainer);
			this.addChild(this._messageField);
			this.addChild(this._cursor);

			this._setDefaultProperties();
			this._updateContextMenu();

			this.visibility = Visibility.COLLAPSED;

			// JABridge

			JABridge.addProperty("timeZone", this.getTimeZone, this.setTimeZone);
			JABridge.addProperty("enableOpenAsImage", this.getEnableOpenAsImage, this.setEnableOpenAsImage, "Boolean");
			JABridge.addProperty("enableFullScreen", this.getEnableFullScreen, this.setEnableFullScreen, "Boolean");

			JABridge.addMethod("update", this.update, [], "int");
			JABridge.addMethod("validate", ValidateQueue.validateAll, [], "void");
			JABridge.addMethod("getValue", this.getValue, [ "propertyPath:String", "level:int = 0" ], "String");
			JABridge.addMethod("getValues", this.getValues, [ "values:Object", "level:int = 0" ], "Object");
			JABridge.addMethod("getAll", this.getAll, [ "propertyPath:String = null" ], "Object");
			JABridge.addMethod("setValue", this.setValue, [ "propertyPath:String", "propertyValue:String" ], "void");
			JABridge.addMethod("setValues", this.setValues, [ "values:Object" ], "void");
			JABridge.addMethod("clearValue", this.clearValue, [ "propertyPath:String" ], "void");
			JABridge.addMethod("clearValues", this.clearValues, [ "values:Object" ], "void");
			JABridge.addMethod("clearAll", this.clearAll, [ "propertyPath:String = null" ], "void");
			JABridge.addMethod("getSnapshot", this.getSnapshot, [], "Object");

			JABridge.addEvent("updated", [ "event:Object { updateCount:int }" ], "Dispatched after the chart is updated, following a call to update.");
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
			return this._timeZone;
		}
		public function setTimeZone(value:String) : void
		{
			this._timeZone = value;
			this.invalidate(Particles.PROCESS_PROPERTIES);
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
			var propertyManager:PropertyManager = this._propertyManager;
			var value:String;
			try
			{
				propertyManager.setNamespace("external");
				value = propertyManager.getValue(propertyPath, level);
			}
			finally
			{
				propertyManager.setNamespace("stored");
			}
			return value;
		}

		public function getValues(values:Object, level:int = 0) : Object
		{
			var propertyManager:PropertyManager = this._propertyManager;
			var propertyPath:String;
			var values2:Object;
			try
			{
				propertyManager.setNamespace("external");
				values2 = new Object();
				for (propertyPath in values)
					values2[propertyPath] = propertyManager.getValue(propertyPath, level);
			}
			finally
			{
				propertyManager.setNamespace("stored");
			}
			return values2;
		}

		public function getAll(propertyPath:String = null) : Object
		{
			var propertyManager:PropertyManager = this._propertyManager;
			var properties:Object;
			try
			{
				propertyManager.setNamespace("external");
				properties = propertyManager.getAll(propertyPath);
			}
			finally
			{
				propertyManager.setNamespace("stored");
			}
			return properties;
		}

		public function setValue(propertyPath:String, propertyValue:String) : void
		{
			var propertyManager:PropertyManager = this._propertyManager;
			try
			{
				propertyManager.setNamespace("external");
				propertyManager.setValue(propertyPath, propertyValue);
			}
			finally
			{
				propertyManager.setNamespace("stored");
			}
		}

		public function setValues(values:Object) : void
		{
			var propertyManager:PropertyManager = this._propertyManager;
			var propertyPath:String;
			var propertyValue:String;
			try
			{
				propertyManager.setNamespace("external");
				for (propertyPath in values)
				{
					propertyValue = values[propertyPath];
					propertyManager.setValue(propertyPath, propertyValue);
				}
			}
			finally
			{
				propertyManager.setNamespace("stored");
			}
		}

		public function clearValue(propertyPath:String) : void
		{
			var propertyManager:PropertyManager = this._propertyManager;
			try
			{
				propertyManager.setNamespace("external");
				propertyManager.clearValue(propertyPath);
			}
			finally
			{
				propertyManager.setNamespace("stored");
			}
		}

		public function clearValues(values:Object) : void
		{
			var propertyManager:PropertyManager = this._propertyManager;
			var propertyPath:String;
			try
			{
				propertyManager.setNamespace("external");
				for (propertyPath in values)
					propertyManager.clearValue(propertyPath);
			}
			finally
			{
				propertyManager.setNamespace("stored");
			}
		}

		public function clearAll(propertyPath:String = null) : void
		{
			var propertyManager:PropertyManager = this._propertyManager;
			try
			{
				propertyManager.setNamespace("external");
				propertyManager.clearAll(propertyPath);
			}
			finally
			{
				propertyManager.setNamespace("stored");
			}
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

		public function processData() : void
		{
			this.validatePreceding(Particles.PROCESS_DATA);

			if (this.isValid(Particles.PROCESS_DATA))
				return;

			this.invalidate(Particles.PROCESS_PROPERTIES);

			if (this._dataError)
				this._showMessage("Results Error:", this._dataError);
			else
				this._hideMessage();

			this.setValid(Particles.PROCESS_DATA);
		}

		public function processProperties() : void
		{
			this.validatePreceding(Particles.PROCESS_PROPERTIES);

			if (this.isValid(Particles.PROCESS_PROPERTIES))
				return;

			this._processingInstances = new Dictionary();

			var oldEmitterElements:Dictionary = this._emitterElements;
			var oldCollectorElements:Dictionary = this._collectorElements;
			var oldLayoutSpriteElements:Dictionary = this._layoutSpriteElements;
			var oldHistogramElementRenderers:Dictionary = this._histogramElementRenderers;

			var newEmitterElements:Dictionary = this._emitterElements = new Dictionary();
			var newCollectorElements:Dictionary = this._collectorElements = new Dictionary();
			var newLayoutSpriteElements:Dictionary = this._layoutSpriteElements = new Dictionary();
			var newHistogramElementRenderers:Dictionary = this._histogramElementRenderers = new Dictionary();

			var debug:Boolean;
			var foregroundColor:uint;
			var defaultRenderer:AbstractRenderer;
			var dropRenderer:AbstractRenderer;
			var rootEmitter:EventsEmitterControl;
			var elements:Array;
			var element:*;

			var propertyManager:PropertyManager = this._propertyManager;

			try
			{
				propertyManager.beginParse();

				debug = propertyManager.parseProperty("debug", this._booleanPropertyParser, "false");

				foregroundColor = propertyManager.parseProperty("foregroundColor", this._numberPropertyParser);

				this._backgroundBrush.value = propertyManager.parseProperty("backgroundBrush", this._brushPropertyParser);

				this._messageStyle = propertyManager.parseProperty("message", this._textBlockStylePropertyParser, "style");
				if (this._messageStyle)
					propertyManager.parseChildProperty(this._messageStyle, "defaultTextFormat", this._textFormatPropertyParser, "textFormat");

				defaultRenderer = propertyManager.parseProperty("defaultRenderer", this._rendererPropertyParser);
				this._processRendererProperties(defaultRenderer);

				dropRenderer = propertyManager.parseProperty("dropRenderer", this._rendererPropertyParser);
				this._processRendererProperties(dropRenderer);

				rootEmitter = propertyManager.parsePropertyAs("rootEmitter", this._elementPropertyParser, "eventsEmitter");
				this._processElementProperties(rootEmitter);

				elements = propertyManager.parseProperty("elements", this._elementArrayPropertyParser);
				for each (element in elements)
					this._processElementProperties(element);
			}
			finally
			{
				propertyManager.endParse();
			}

			this._setDefaultRenderer(defaultRenderer);
			this._setDropRenderer(dropRenderer);
			this._setRootEmitter(rootEmitter);

			var system:ParticleSystem = this._system;
			var renderer:AbstractRenderer = this._renderer;
			var contentContainer:Sprite = this._contentContainer;

			for each (var emitter:IEmitter in oldEmitterElements)
			{
				if (!newEmitterElements[emitter])
					system.removeEmitter(emitter);
			}

			for each (var collector:ICollector in oldCollectorElements)
			{
				if (!newCollectorElements[collector])
				{
					system.removeCollector(collector);
					renderer.removeCollector(collector);
				}
			}

			for each (var layoutSprite:LayoutSprite in oldLayoutSpriteElements)
			{
				if (!newLayoutSpriteElements[layoutSprite])
					contentContainer.removeChild(layoutSprite);
			}

			for each (var histogramElementRenderer:HistogramElementRenderer in oldHistogramElementRenderers)
			{
				if (!newHistogramElementRenderers[histogramElementRenderer])
					histogramElementRenderer.clock = null;
			}

			this._fpsMonitor.textColor = foregroundColor;
			this._epsMonitor.textColor = foregroundColor;
			this._epsHistogram.columnColor = foregroundColor;
			this._dragResizeHandle.color = foregroundColor;
			this._linkSourcesHandle.color = foregroundColor;

			if (debug)
			{
				this._fpsMonitor.visibility = Visibility.VISIBLE;
				this._epsMonitor.visibility = Visibility.VISIBLE;
			}
			else
			{
				this._fpsMonitor.visibility = Visibility.COLLAPSED;
				this._epsMonitor.visibility = Visibility.COLLAPSED;
			}

			if (this._fieldSplitterAdded)
			{
				this._fieldSplitterAdded = false;

				if (elements)
				{
					for (var i:int = elements.length - 1; i >= 0; i--)
					{
						element = elements[i];
						if (element is FieldSplitter)
						{
							this._setInspectTarget(element);
							break;
						}
					}
				}
			}

			this.setValid(Particles.PROCESS_PROPERTIES);

			this._writeProperties();
		}

		public function dispatchUpdated() : void
		{
			this.validatePreceding(Particles.DISPATCH_UPDATED);

			if (this.isValid(Particles.DISPATCH_UPDATED))
				return;

			setTimeout(this._dispatchUpdated, 0);

			this.setValid(Particles.DISPATCH_UPDATED);
		}

		// Protected Methods

		protected override function measureOverride(availableSize:Size) : Size
		{
			this._epsHistogram.height = Math.round(availableSize.height / 2);

			return super.measureOverride(availableSize);
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			var graphics:Graphics;

			if (!this._isBackgroundValid)
			{
				graphics = this._background.graphics;
				graphics.clear();

				var backgroundBrush:IBrush = this._marioMode ? new SolidFillBrush(0x7CA0FF) : this._backgroundBrush.value;
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

				this._isBackgroundValid = true;
			}

			if ((this._bounds.width != layoutSize.width) || (this._bounds.height != layoutSize.height))
			{
				graphics = this._unfocusArea.graphics;
				graphics.clear();
				graphics.beginFill(0x000000, 0);
				graphics.drawRect(0, 0, layoutSize.width, layoutSize.height);
				graphics.endFill();

				this._bounds.width = layoutSize.width;
				this._bounds.height = layoutSize.height;
			}

			graphics = this._shelfBackground.graphics;
			graphics.clear();
			if (this._fieldSplitterInspector.target is FieldSplitter)
			{
				var y1:Number = Math.round(layoutSize.height - this._fieldSplitterInspector.measuredHeight);

				graphics.beginFill(0xEDEDE7);
				graphics.lineStyle(1, 0xCCCCCC);
				graphics.moveTo(0, y1);
				graphics.lineTo(layoutSize.width, y1);
				graphics.lineStyle();
				graphics.lineTo(layoutSize.width, layoutSize.height);
				graphics.lineTo(0, layoutSize.height);
				graphics.lineTo(0, y1);
				graphics.endFill();
			}

			return super.layoutOverride(layoutSize);
		}

		// Private Methods

		private function _readProperties() : void
		{
			var propertyManager:PropertyManager = this._propertyManager;

			propertyManager.clearAll();
			this._properties = null;

			try
			{
				var properties:Object = this._properties = JABridge.callMethod("readProperties");
				var propertyName:String;
				var propertyValue:String;
				for (propertyName in properties)
				{
					propertyValue = properties[propertyName];
					if (propertyValue != null)
						propertyManager.setValue(propertyName, propertyValue);
				}
			}
			catch (e:Error)
			{
			}
		}

		private function _writeProperties() : void
		{
			var propertyManager:PropertyManager = this._propertyManager;
			var oldProperties:Object = this._properties;
			var newProperties:Object = this._properties = propertyManager.getAll();
			var changedProperties:Object = new Object();
			var changed:Boolean = false;
			var propertyName:String;

			if (!oldProperties)
				oldProperties = new Object();

			for (propertyName in newProperties)
			{
				if (newProperties[propertyName] != oldProperties[propertyName])
				{
					changedProperties[propertyName] = newProperties[propertyName];
					changed = true;
				}
			}

			for (propertyName in oldProperties)
			{
				if (newProperties[propertyName] == null)
				{
					changedProperties[propertyName] = null;
					changed = true;
				}
			}

			if (!changed)
				return;

			try
			{
				JABridge.callMethod("writeProperties", changedProperties);
			}
			catch (e:Error)
			{
			}
		}

		private function _processElementProperties(element:*) : void
		{
			if (!element || this._processingInstances[element])
				return;

			var propertyManager:PropertyManager = this._propertyManager;
			if (!propertyManager.getPropertyPath(element))
				return;

			this._processingInstances[element] = true;

			// inherit properties

			if (element is FieldSplitter)
				propertyManager.inheritProperties(element, "styles.fieldSplitter");

			if (element is EventsEmitterControl)
				propertyManager.inheritProperties(element, "styles.eventsEmitter");

			if (element is IEmitter)
				propertyManager.inheritProperties(element, "styles.emitter");

			if (element is ICollector)
				propertyManager.inheritProperties(element, "styles.collector");

			propertyManager.inheritProperties(element, "styles.element");

			// parse properties

			if (element is FieldSplitter)
			{
				propertyManager.parseChildProperty(element, "fieldNameStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(element, "fieldNameStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");

				var fieldRenderer:IElementRenderer = propertyManager.parseChildProperty(element, "fieldRenderer", this._elementRendererPropertyParser);
				if (fieldRenderer)
					this._processElementRendererProperties(fieldRenderer);

				var emitRenderer:AbstractRenderer = propertyManager.parseChildProperty(element, "emitRenderer", this._rendererPropertyParser);
				if (emitRenderer)
					this._processRendererProperties(emitRenderer);
			}

			if (element is IEmitter)
			{
				this._emitterElements[element] = element;

				this._system.addEmitter(element);
			}

			if (element is ICollector)
			{
				this._collectorElements[element] = element;

				var sources:Array = propertyManager.parseChildProperty(element, "sources", this._elementArrayPropertyParser);
				for each (var source:* in sources)
					this._processElementProperties(source);

				this._system.addCollector(element);
				this._renderer.addCollector(element);
			}

			if (element is LayoutSprite)
			{
				this._layoutSpriteElements[element] = element;

				if (element.parent != this._contentContainer)
					this._contentContainer.addChild(element);
			}

			delete this._processingInstances[element];
		}

		private function _processElementRendererProperties(elementRenderer:IElementRenderer) : void
		{
			if (!elementRenderer || this._processingInstances[elementRenderer])
				return;

			var propertyManager:PropertyManager = this._propertyManager;
			if (!propertyManager.getPropertyPath(elementRenderer))
				return;

			this._processingInstances[elementRenderer] = true;

			// inherit properties

			if (elementRenderer is GroupElementRenderer)
				propertyManager.inheritProperties(elementRenderer, "styles.groupElementRenderer");
			else if (elementRenderer is HistogramElementRenderer)
				propertyManager.inheritProperties(elementRenderer, "styles.histogramElementRenderer");
			else if (elementRenderer is LabelElementRenderer)
				propertyManager.inheritProperties(elementRenderer, "styles.labelElementRenderer");
			else if (elementRenderer is SwatchElementRenderer)
				propertyManager.inheritProperties(elementRenderer, "styles.swatchElementRenderer");

			propertyManager.inheritProperties(elementRenderer, "styles.elementRenderer");

			// parse properties

			if (elementRenderer is GroupElementRenderer)
			{
				var groupElementRenderers:Array = propertyManager.parseChildProperty(elementRenderer, "elementRenderers", this._elementRendererArrayPropertyParser);
				for each (var groupElementRenderer:IElementRenderer in groupElementRenderers)
					this._processElementRendererProperties(groupElementRenderer);

				propertyManager.parseChildProperty(elementRenderer, "layoutStyle", this._layoutSpriteStylePropertyParser, "style");
			}
			else if (elementRenderer is HistogramElementRenderer)
			{
				this._histogramElementRenderers[elementRenderer] = elementRenderer;

				propertyManager.parseChildProperty(elementRenderer, "columnStyle", this._layoutSpriteStylePropertyParser, "style");

				HistogramElementRenderer(elementRenderer).clock = this._clock;
			}
			else if (elementRenderer is LabelElementRenderer)
			{
				propertyManager.parseChildProperty(elementRenderer, "labelStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(elementRenderer, "labelStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
			}
			else if (elementRenderer is SwatchElementRenderer)
			{
				propertyManager.parseChildProperty(elementRenderer, "swatchStyle", this._layoutSpriteStylePropertyParser, "style");
			}

			delete this._processingInstances[elementRenderer];
		}

		private function _processRendererProperties(renderer:AbstractRenderer) : void
		{
			if (!renderer || this._processingInstances[renderer])
				return;

			var propertyManager:PropertyManager = this._propertyManager;
			if (!propertyManager.getPropertyPath(renderer))
				return;

			this._processingInstances[renderer] = true;

			// inherit properties

			if (renderer is LabelRenderer)
				propertyManager.inheritProperties(renderer, "styles.labelRenderer");
			else if (renderer is SimpleRenderer)
				propertyManager.inheritProperties(renderer, "styles.simpleRenderer");
			else if (renderer is SwatchRenderer)
				propertyManager.inheritProperties(renderer, "styles.swatchRenderer");

			propertyManager.inheritProperties(renderer, "styles.renderer");

			// parse properties

			if (renderer is LabelRenderer)
			{
				propertyManager.parseChildProperty(renderer, "labelStyle", this._textBlockStylePropertyParser, "style");
				propertyManager.parseChildProperty(renderer, "labelStyle.defaultTextFormat", this._textFormatPropertyParser, "textFormat");
			}
			else if (renderer is SwatchRenderer)
			{
				propertyManager.parseChildProperty(renderer, "swatchStyle", this._spriteStylePropertyParser, "style");
			}

			delete this._processingInstances[renderer];
		}

		private function _addFieldSplitter(e:Event = null) : void
		{
			var propertyManager:PropertyManager = this._propertyManager;

			var nextId:int = 0;
			var elementsString:String = propertyManager.getValue("elements", 2);
			var elementsArray:Array = ParseUtils.prepareArray(elementsString);
			var elementName:String;
			var id:int;
			for each (elementName in elementsArray)
			{
				if (elementName.indexOf("@fieldSplitter") == 0)
				{
					id = NumberUtil.parseNumber(elementName.substring(14));
					if (id == id)
						nextId = Math.max(nextId, id);
				}
			}
			nextId++;

			var name:String = "fieldSplitter" + nextId;

			var values:Object = new Object();
			values[name] = "fieldSplitter";
			values[name + ".sources"] = "[]";
			values[name + ".fieldRenderer"] = "@histogramLabelElementRenderer";
			values[name + ".emitRenderer"] = "simple";
			values[name + ".x"] = String(100 + 20 * this._cascadeCount);
			values[name + ".y"] = String(100 + 20 * this._cascadeCount);
			values[name + ".width"] = "400";
			values[name + ".height"] = "300";

			if (!elementsArray)
				elementsArray = new Array();
			elementsArray.push("@" + name);

			values["elements"] = "[" + elementsArray.join(",") + "]";

			this._cascadeCount++;
			this._fieldSplitterAdded = true;

			for (var propertyPath:String in values)
				propertyManager.setValue(propertyPath, values[propertyPath]);
		}

		private function _removeFieldSplitter(e:Event = null) : void
		{
			var fieldSplitter:FieldSplitter = this._fieldSplitterInspector.target;
			if (!fieldSplitter)
				return;

			this._setInspectTarget(null);

			var propertyManager:PropertyManager = this._propertyManager;
			var path:String = propertyManager.getPropertyPath(fieldSplitter);
			if (!path)
				return;

			// remove all references

			var sources:Array;
			var source:*;
			var sourcesChanged:Boolean;
			var collectorPath:String;
			var sourcePaths:Array;
			var sourcePath:String;
			var i:int;
			for each (var collector:ICollector in this._collectorElements)
			{
				sources = collector.sources;
				if (sources)
				{
					sourcesChanged = false;

					for (i = sources.length - 1; i >= 0; i--)
					{
						source = sources[i];
						if (source == fieldSplitter)
						{
							sources.splice(i, 1);
							sourcesChanged = true;
						}
					}

					if (sourcesChanged)
					{
						collector.sources = sources;

						collectorPath = propertyManager.getPropertyPath(collector);
						if (collectorPath)
						{
							sourcePaths = new Array();
							for each (source in sources)
							{
								sourcePath = propertyManager.getPropertyPath(source);
								if (sourcePath)
									sourcePaths.push("@" + sourcePath);
							}

							propertyManager.setValue(collectorPath + ".sources", "[" + sourcePaths.join(",") + "]");
						}
					}
				}
			}

			// clear all properties

			propertyManager.clearAll(path);

			// remove from elements list

			path = "@" + path;

			var elementsString:String = propertyManager.getValue("elements", 2);
			var elementsArray:Array = ParseUtils.prepareArray(elementsString);
			var elementName:String;
			var numElements:int = elementsArray ? elementsArray.length : 0;
			for (i = 0; i < numElements; i++)
			{
				elementName = elementsArray[i];
				if (elementName == path)
				{
					elementsArray.splice(i, 1);
					break;
				}
			}

			elementsString = elementsArray ? "[" + elementsArray.join(",") + "]" : "[]";

			propertyManager.setValue("elements", elementsString);
		}

		private function _setDefaultProperties() : void
		{
			var propertyManager:PropertyManager = this._propertyManager;

			propertyManager.addNamespace("default", 1);
			propertyManager.addNamespace("external", 2);
			propertyManager.addNamespace("stored", 3);

			propertyManager.setNamespace("default");

			var values:Object = {

				"fontFace": "_sans",
				"fontSize": "11",
				"fontColor": "0x000000",

				"particleSize": "4",

				"imagePath": "",
				"imageExtension": "",
				"imageWidth": "30",
				"imageHeight": "30",

				"fieldColors": "",
				"fieldImages": "",

				"foregroundColor": "0x000000",
				"backgroundColor": "0xFFFFFF",
				"minimumColor": "0x000000",
				"maximumColor": "0x999999",

				"backgroundBrush": "solidFill",
				"backgroundBrush.color": "@backgroundColor",

				"colorPalette": "field",
				"colorPalette.fieldColors": "@fieldColors",
				"colorPalette.defaultColorPalette": "random",
				"colorPalette.defaultColorPalette.minimumColor": "@minimumColor",
				"colorPalette.defaultColorPalette.maximumColor": "@maximumColor",

				"fillBrushPalette": "solidFill",
				"fillBrushPalette.colorPalette": "@colorPalette",

				"imageBrushPalette": "fieldImageFill",
				"imageBrushPalette.fieldSources": "@fieldImages",
				"imageBrushPalette.sourcePath": "@imagePath",
				"imageBrushPalette.sourceExtension": "@imageExtension",
				"imageBrushPalette.useFieldAsSource": "true",
				"imageBrushPalette.smooth": "true",

				"message.defaultTextFormat.font": "@fontFace",
				"message.defaultTextFormat.size": "14",
				"message.defaultTextFormat.color": "@fontColor",
				"message.defaultTextFormat.align": "center",

				"defaultRenderer": "simple",

				"dropRenderer": "label",
				"dropRenderer.fieldName": "dropCount",
				"dropRenderer.labelColorPalette": "list",
				"dropRenderer.labelColorPalette.colors": "[0xFF0000]",
				"dropRenderer.labelStyle.defaultTextFormat.size": "14",

				"rootEmitter.x": "20",
				"rootEmitter.y": "0",

				"labelElementRenderer": "label",

				"histogramElementRenderer": "histogram",

				"swatchElementRenderer": "swatch",

				"histogramLabelElementRenderer": "group",
				"histogramLabelElementRenderer.elementRenderers": "[@histogramElementRenderer,@labelElementRenderer]",
				"histogramLabelElementRenderer.layoutPolicy": "centeredDistributedStack",
				"histogramLabelElementRenderer.layoutPolicy.orientation": "x",

				"swatchLabelElementRenderer": "group",
				"swatchLabelElementRenderer.elementRenderers": "[@swatchElementRenderer,@labelElementRenderer]",

				"stackedLabelHistogramElementRenderer": "group",
				"stackedLabelHistogramElementRenderer.elementRenderers": "[@labelElementRenderer,@histogramElementRenderer]",
				"stackedLabelHistogramElementRenderer.layoutPolicy": "stack",

				"swatchLabelHistogramElementRenderer": "group",
				"swatchLabelHistogramElementRenderer.elementRenderers": "[@swatchElementRenderer,@stackedLabelHistogramElementRenderer]",

				//"elements"

				//"styles.element"

				//"styles.collector"

				//"styles.emitter"

				"styles.eventsEmitter.hostPath": this._hostPath,
				"styles.eventsEmitter.basePath": this._basePath,
				"styles.eventsEmitter.sessionKey": this._sessionKey,
				"styles.eventsEmitter.emitVelocity": "vector",
				"styles.eventsEmitter.emitVelocity.length": "200",
				"styles.eventsEmitter.emitVelocity.lengthVariance": "0.1",
				"styles.eventsEmitter.emitVelocity.angle": "90",

				"styles.fieldSplitter.fieldNameStyle.defaultTextFormat.font": "@fontFace",
				"styles.fieldSplitter.fieldNameStyle.defaultTextFormat.size": "@fontSize",
				"styles.fieldSplitter.fieldNameStyle.defaultTextFormat.color": "@fontColor",
				"styles.fieldSplitter.fieldSort": "natural",
				"styles.fieldSplitter.fieldRenderer": "label",
				"styles.fieldSplitter.lineBrush": "solidStroke",
				"styles.fieldSplitter.lineBrush.thickness": "1",
				"styles.fieldSplitter.lineBrush.color": "@foregroundColor",
				"styles.fieldSplitter.lineBrush.alpha": "0.3",
				"styles.fieldSplitter.emitVelocity": "vector",
				"styles.fieldSplitter.emitVelocity.length": "200",
				"styles.fieldSplitter.emitVelocity.lengthVariance": "0.1",
				"styles.fieldSplitter.emitVelocity.angle": "0",

				//"styles.elementRenderer"

				"styles.groupElementRenderer.layoutStyle.alignmentX": "0",
				"styles.groupElementRenderer.layoutStyle.alignmentY": "0.5",

				"styles.histogramElementRenderer.columnOrientation": "x",
				"styles.histogramElementRenderer.columnBrushPalette": "@fillBrushPalette",
				"styles.histogramElementRenderer.columnStyle.margin": "(0,2,2,0)",
				"styles.histogramElementRenderer.columnStyle.alignmentX": "0",
				"styles.histogramElementRenderer.columnStyle.alignmentY": "0.5",
				"styles.histogramElementRenderer.columnSize": "4",
				"styles.histogramElementRenderer.defaultColumnBrush": "solidFill",
				"styles.histogramElementRenderer.defaultColumnBrush.color": "@foregroundColor",

				"styles.labelElementRenderer.labelColorPalette": "@colorPalette",
				"styles.labelElementRenderer.labelStyle.defaultTextFormat.font": "@fontFace",
				"styles.labelElementRenderer.labelStyle.defaultTextFormat.size": "@fontSize",
				"styles.labelElementRenderer.labelStyle.overflowMode": "ellipsisMiddle",
				"styles.labelElementRenderer.labelStyle.alignmentX": "0",
				"styles.labelElementRenderer.labelStyle.alignmentY": "0.5",
				"styles.labelElementRenderer.defaultLabelColor": "@foregroundColor",

				"styles.swatchElementRenderer.swatchBrushPalette": "@imageBrushPalette",
				"styles.swatchElementRenderer.swatchStyle.margin": "(0,2,2,0)",
				"styles.swatchElementRenderer.swatchStyle.alignmentX": "0",
				"styles.swatchElementRenderer.swatchStyle.alignmentY": "0.5",
				"styles.swatchElementRenderer.swatchWidth": "@imageWidth",
				"styles.swatchElementRenderer.swatchHeight": "@imageHeight",
				"styles.swatchElementRenderer.defaultSwatchBrush": "solidFill",
				"styles.swatchElementRenderer.defaultSwatchBrush.color": "@foregroundColor",

				//"styles.renderer"

				"styles.labelRenderer.labelColorPalette": "@colorPalette",
				"styles.labelRenderer.labelStyle.defaultTextFormat.font": "@fontFace",
				"styles.labelRenderer.labelStyle.defaultTextFormat.size": "@fontSize",
				"styles.labelRenderer.defaultLabelColor": "@foregroundColor",

				"styles.simpleRenderer.particleColorPalette": "@colorPalette",
				"styles.simpleRenderer.particleSize": "@particleSize",
				"styles.simpleRenderer.defaultParticleColor": "@foregroundColor",

				"styles.swatchRenderer.swatchBrushPalette": "@imageBrushPalette",
				"styles.swatchRenderer.swatchWidth": "@imageWidth",
				"styles.swatchRenderer.swatchHeight": "@imageHeight",
				"styles.swatchRenderer.defaultSwatchBrush": "solidFill",
				"styles.swatchRenderer.defaultSwatchBrush.color": "@foregroundColor"

			};

			for (var propertyPath:String in values)
				propertyManager.setValue(propertyPath, values[propertyPath]);

			propertyManager.setNamespace("stored");
		}

		private function _setDefaultRenderer(defaultRenderer:AbstractRenderer) : void
		{
			if (defaultRenderer == this._defaultRenderer)
				return;

			if (this._defaultRenderer)
			{
				this._renderer.defaultRenderer = null;
			}

			this._defaultRenderer = defaultRenderer;

			if (this._defaultRenderer)
			{
				this._renderer.defaultRenderer = this._defaultRenderer;
			}
		}

		private function _setDropRenderer(dropRenderer:AbstractRenderer) : void
		{
			if (dropRenderer == this._dropRenderer)
				return;

			this._dropRenderer = dropRenderer;
		}

		private function _setRootEmitter(rootEmitter:EventsEmitterControl) : void
		{
			if (rootEmitter == this._rootEmitter)
				return;

			if (this._rootEmitter)
			{
				this._rootEmitter.close();
				this._rootEmitter.removeEventListener(ParticleEvent.EMITTED, this._rootEmitter_emitted);
				this._rootEmitter.removeEventListener(DropEvent.DROPPED, this._rootEmitter_dropped);
				this._rootEmitter.removeEventListener(ErrorEvent.ERROR, this._rootEmitter_error);
				this._system.removeEmitter(this._rootEmitter);
			}

			this._rootEmitter = rootEmitter;

			if (this._rootEmitter)
			{
				this._rootEmitter.addEventListener(ParticleEvent.EMITTED, this._rootEmitter_emitted);
				this._rootEmitter.addEventListener(DropEvent.DROPPED, this._rootEmitter_dropped);
				this._rootEmitter.addEventListener(ErrorEvent.ERROR, this._rootEmitter_error);
				this._system.addEmitter(this._rootEmitter);
			}
		}

		private function _setInspectTarget(target:DisplayObject) : void
		{
			var parent:DisplayObjectContainer = target ? target.parent : null;
			if (parent)
				parent.addChild(target);

			this._dragResizeHandle.target = target as LayoutSprite;
			this._linkSourcesHandle.target = target as LayoutSprite;
			this._fieldSplitterInspector.target = target as FieldSplitter;
			this._removeButton.visible = (target is FieldSplitter);

			this.invalidate(LayoutSprite.LAYOUT);
		}

		private function _update() : void
		{
			ValidateQueue.validateAll();

			this._dataError = null;

			if (this._rootEmitter)
				this._rootEmitter.open();

			this._updatedCount = this._updateCount;

			this.invalidate(Particles.PROCESS_DATA);
			this.invalidate(Particles.DISPATCH_UPDATED);
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
			this._messageField.visibility = Visibility.VISIBLE;
		}

		private function _hideMessage() : void
		{
			this._messageField.text = "";
			this._messageField.visibility = Visibility.COLLAPSED;
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

		private function _stage_mouseDown(e:MouseEvent) : void
		{
			var target:DisplayObject = e.target as DisplayObject;
			if (!target)
				return;

			var unfocusArea:Sprite = this._unfocusArea;

			while (target && !(target is Stage))
			{
				if ((target is FieldSplitter) || (target is EventsEmitterControl))
				{
					this._setInspectTarget(target);
					return;
				}
				else if (target == unfocusArea)
				{
					this._setInspectTarget(null);
					return;
				}

				target = target.parent;
			}
		}

		private function _rootEmitter_emitted(e:ParticleEvent) : void
		{
			this._epsMonitor.hit();
			this._epsHistogram.hit();

			var particle:IParticle = e.particle;
			if (!particle || particle.metadata.isDropped)
				return;

			var data:Object = particle.metadata.data;
			if (!data)
				return;

			var fieldNames:Array = new Array();
			for (var fieldName:String in data)
				fieldNames.push(fieldName);

			this._fieldSplitterInspector.addFields(fieldNames);
		}

		private function _rootEmitter_dropped(e:DropEvent) : void
		{
			var particle:Particle2D = new Particle2D();
			particle.metadata.data = { dropCount: e.count };
			particle.metadata.renderer = this._dropRenderer;
			particle.metadata.isDropped = true;

			this._rootEmitter.emit(particle);
		}

		private function _rootEmitter_error(e:ErrorEvent) : void
		{
			if (!this._dataError)
				this._dataError = e.text;

			this.invalidate(Particles.PROCESS_DATA);
		}

		private function _boundsCollector_collected(e:ParticleEvent) : void
		{
			var particle:IParticle  = e.particle;
			particle.metadata.alpha = 0.3;
		}

		private function _backgroundBrush_changed(e:ChangedEvent) : void
		{
			this._isBackgroundValid = false;
			this.invalidate(LayoutSprite.LAYOUT);
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
			this._clock.start();

			this.invalidate(Particles.PROCESS_DATA);

			this.visibility = Visibility.VISIBLE;

			this._readProperties();
		}

		private function _JABridge_close() : void
		{
			if (this._rootEmitter)
				this._rootEmitter.close();

			this._clock.stop();

			this._updateCount = 0;
			this._updatedCount = 0;
			this._dataError = null;

			this.visibility = Visibility.COLLAPSED;
		}

		private function _mario_keyDown(e:KeyboardEvent) : void
		{
			var char:String = String.fromCharCode(e.keyCode);
			var marioChar:String = this._marioCode[this._marioCodeIndex];
			if (char != marioChar)
			{
				this._marioCodeIndex = 0;
				marioChar = this._marioCode[this._marioCodeIndex];
			}

			if (char == marioChar)
				this._marioCodeIndex++;

			if (this._marioCodeIndex >= this._marioCode.length)
			{
				this._marioCodeIndex = 0;
				this._marioMode = !this._marioMode;

				var rootEmitter:MarioEventsEmitterControl = this._rootEmitter as MarioEventsEmitterControl;
				if (rootEmitter)
					rootEmitter.marioMode = this._marioMode;

				var renderer:MarioDelegatedRenderer = this._renderer as MarioDelegatedRenderer;
				if (renderer)
					renderer.marioMode = this._marioMode;

				this._epsHistogram.marioMode = this._marioMode;
				this._epsHistogram.alpha = this._marioMode ? 1 : 0.15;

				this._isBackgroundValid = false;
				this.invalidate(LayoutSprite.LAYOUT);

				if (this._marioChannel)
				{
					this._marioChannel.stop();
					this._marioChannel = null;
				}

				if (this._marioMode)
					this._marioChannel = this._marioLoop.play(0, int.MAX_VALUE);
			}
		}

	}

}
