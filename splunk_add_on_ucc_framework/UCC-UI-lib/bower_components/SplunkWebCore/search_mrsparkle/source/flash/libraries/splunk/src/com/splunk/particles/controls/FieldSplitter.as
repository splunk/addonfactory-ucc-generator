package com.splunk.particles.controls
{

	import com.jasongatt.controls.OverflowMode;
	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.ValidatePass;
	import com.jasongatt.graphics.brushes.IBrush;
	import com.jasongatt.graphics.brushes.SolidStrokeBrush;
	import com.jasongatt.layout.AnimatedLayoutContainer;
	import com.jasongatt.layout.ILayoutPolicy;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Size;
	import com.jasongatt.layout.StackLayoutPolicy;
	import com.jasongatt.motion.easers.IEaser;
	import com.jasongatt.utils.IComparator;
	import com.jasongatt.utils.LinkedList;
	import com.splunk.controls.Label;
	import com.splunk.particles.IParticle;
	import com.splunk.particles.IParticle2D;
	import com.splunk.particles.collectors.Collector;
	import com.splunk.particles.collectors.ICollector;
	import com.splunk.particles.distributions.IDistribution2D;
	import com.splunk.particles.distributions.VectorDistribution2D;
	import com.splunk.particles.emitters.Emitter;
	import com.splunk.particles.emitters.IEmitter;
	import com.splunk.particles.events.ParticleEvent;
	import com.splunk.particles.renderers.AbstractRenderer;
	import com.splunk.utils.Style;
	import flash.display.DisplayObject;
	import flash.display.Graphics;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	import flash.utils.Dictionary;

	[Event(name="collected", type="com.splunk.particles.events.ParticleEvent")]
	[Event(name="released", type="com.splunk.particles.events.ParticleEvent")]
	[Event(name="emitted", type="com.splunk.particles.events.ParticleEvent")]
	[Event(name="collectorUpdated", type="com.splunk.particles.events.UpdateEvent")]
	[Event(name="emitterUpdated", type="com.splunk.particles.events.UpdateEvent")]

	public class FieldSplitter extends LayoutSprite implements ICollector, IEmitter
	{

		// Private Properties

		private var _fieldName:ObservableProperty;
		private var _fieldNameStyle:ObservableProperty;
		private var _fieldSort:ObservableProperty;
		private var _fieldRenderer:ObservableProperty;
		private var _lineBrush:ObservableProperty;
		private var _collectDuration:ObservableProperty;
		private var _collectEaser:ObservableProperty;
		private var _emitVelocity:ObservableProperty;
		private var _emitRenderer:ObservableProperty;
		private var _layoutPolicy:ObservableProperty;
		private var _convergeRatio:ObservableProperty;
		private var _sources:ObservableProperty;
		private var _priority:ObservableProperty;

		private var _fieldLabel:Label;
		private var _fieldElementContainer:AnimatedLayoutContainer;
		private var _fieldInfoMap:Dictionary;
		private var _fieldInfoOrderedList:LinkedList;
		private var _fieldInfoHitList:LinkedList;
		private var _particleInfoMap:Dictionary;
		private var _releasedParticles:Array;
		private var _refreshElements:Boolean = false;

		private var _filter:FieldSplitterFilter;
		private var _action:FieldSplitterAction;
		private var _collector:Collector;
		private var _emitter:Emitter;

		// Constructor

		public function FieldSplitter(fieldName:String = null, fieldSort:IComparator = null)
		{
			this._fieldName = new ObservableProperty(this, "fieldName", String, fieldName, this._fieldName_changed);
			this._fieldNameStyle = new ObservableProperty(this, "fieldNameStyle", Style, null, this.invalidates(LayoutSprite.MEASURE));
			this._fieldSort = new ObservableProperty(this, "fieldSort", IComparator, fieldSort, this.invalidates(LayoutSprite.MEASURE));
			this._fieldRenderer = new ObservableProperty(this, "fieldRenderer", IElementRenderer, null, this._fieldRenderer_changed);
			this._lineBrush = new ObservableProperty(this, "lineBrush", IBrush, new SolidStrokeBrush(1, 0x000000, 0.3), this.invalidates(LayoutSprite.LAYOUT));
			this._collectDuration = new ObservableProperty(this, "collectDuration", Number, 1);
			this._collectEaser = new ObservableProperty(this, "collectEaser", IEaser);
			this._emitVelocity = new ObservableProperty(this, "emitVelocity", IDistribution2D, new VectorDistribution2D(200, 0.1));
			this._emitRenderer = new ObservableProperty(this, "emitRenderer", AbstractRenderer);
			this._layoutPolicy = new ObservableProperty(this, "layoutPolicy", ILayoutPolicy, new StackLayoutPolicy());
			this._convergeRatio = new ObservableProperty(this, "convergeRatio", Number, 0.5);
			this._sources = new ObservableProperty(this, "sources", Array);
			this._priority = new ObservableProperty(this, "priority", Number, 0);

			this._fieldLabel = new Label();
			this._fieldLabel.overflowMode = OverflowMode.ELLIPSIS_MIDDLE;

			this._fieldElementContainer = new AnimatedLayoutContainer();
			this._fieldElementContainer.layoutPolicy = this._layoutPolicy.value;
			this._fieldElementContainer.snap = true;

			this._fieldInfoMap = new Dictionary();
			this._fieldInfoOrderedList = new LinkedList();
			this._fieldInfoHitList = new LinkedList();
			this._particleInfoMap = new Dictionary();
			this._releasedParticles = new Array();

			this._filter = new FieldSplitterFilter(fieldName);

			this._action = new FieldSplitterAction(this._fieldElementContainer, this._particleInfoMap);

			this._collector = new Collector(this);
			this._collector.filter = this._filter;
			this._collector.actions = [ this._action ];

			this._emitter = new Emitter(this);

			this.snap = true;
			this.width = 400;
			this.height = 300;

			this.addEventListener(ParticleEvent.COLLECTED, this._self_collected, false, int.MAX_VALUE);
			this.addEventListener(ParticleEvent.RELEASED, this._self_released, false, int.MAX_VALUE);
			this.addEventListener(ParticleEvent.EMITTED, this._self_emitted, false, int.MAX_VALUE);

			this.addChild(this._fieldLabel);
			this.addChild(this._fieldElementContainer);
		}

		// Public Getters/Setters

		public function get fieldName() : String
		{
			return this._fieldName.value;
		}
		public function set fieldName(value:String) : void
		{
			this._fieldName.value = this._filter.fieldName = value;
		}

		public function get fieldNameStyle() : Style
		{
			return this._fieldNameStyle.value;
		}
		public function set fieldNameStyle(value:Style) : void
		{
			this._fieldNameStyle.value = value;
		}

		public function get fieldSort() : IComparator
		{
			return this._fieldSort.value;
		}
		public function set fieldSort(value:IComparator) : void
		{
			this._fieldSort.value = value;
		}

		public function get fieldRenderer() : IElementRenderer
		{
			return this._fieldRenderer.value;
		}
		public function set fieldRenderer(value:IElementRenderer) : void
		{
			this._fieldRenderer.value = value;
		}

		public function get lineBrush() : IBrush
		{
			return this._lineBrush.value;
		}
		public function set lineBrush(value:IBrush) : void
		{
			this._lineBrush.value = value;
		}

		public function get collectDuration() : Number
		{
			return this._collectDuration.value;
		}
		public function set collectDuration(value:Number) : void
		{
			this._collectDuration.value = this._action.collectDuration = value;
		}

		public function get collectEaser() : IEaser
		{
			return this._collectEaser.value;
		}
		public function set collectEaser(value:IEaser) : void
		{
			this._collectEaser.value = this._action.collectEaser = value;
		}

		public function get emitVelocity() : IDistribution2D
		{
			return this._emitVelocity.value;
		}
		public function set emitVelocity(value:IDistribution2D) : void
		{
			this._emitVelocity.value = value;
		}

		public function get emitRenderer() : AbstractRenderer
		{
			return this._emitRenderer.value;
		}
		public function set emitRenderer(value:AbstractRenderer) : void
		{
			this._emitRenderer.value = value;
		}

		public function get layoutPolicy() : ILayoutPolicy
		{
			return this._fieldElementContainer.layoutPolicy;
		}
		public function set layoutPolicy(value:ILayoutPolicy) : void
		{
			this._fieldElementContainer.layoutPolicy = value;
			this._layoutPolicy.value = this._fieldElementContainer.layoutPolicy;
		}

		public function get convergeRatio() : Number
		{
			return this._fieldElementContainer.convergeRatio;
		}
		public function set convergeRatio(value:Number) : void
		{
			this._fieldElementContainer.convergeRatio = value;
			this._convergeRatio.value = this._fieldElementContainer.convergeRatio;
		}

		public function get sources() : Array
		{
			return this._collector.sources;
		}
		public function set sources(value:Array) : void
		{
			this._collector.sources = value;
			this._sources.value = this._collector.sources;
		}

		public function get priority() : Number
		{
			return this._collector.priority;
		}
		public function set priority(value:Number) : void
		{
			this._collector.priority = value;
			this._priority.value = this._collector.priority;
		}

		public function get particles() : Array
		{
			return this._collector.particles;
		}

		// Public Methods

		public function collect(particle:IParticle) : Boolean
		{
			return this._collector.collect(particle);
		}

		public function release(particle:IParticle) : void
		{
			this._collector.release(particle);
		}

		public function emit(particle:IParticle) : void
		{
			this._emitter.emit(particle);
		}

		public function updateCollector(time:Number) : void
		{
			this._action.updateCount++;

			this._collector.updateCollector(time);
		}

		public function updateEmitter(time:Number) : void
		{
			var particles:Array = this._releasedParticles;
			this._releasedParticles = new Array();

			for each (var particle:IParticle in particles)
				this.emit(particle);

			this._emitter.updateEmitter(time);
		}

		// Protected Methods

		protected override function measureOverride(availableSize:Size) : Size
		{
			var fieldElementContainer:AnimatedLayoutContainer = this._fieldElementContainer;
			var fieldInfoMap:Dictionary = this._fieldInfoMap;
			var fieldInfoOrderedList:LinkedList = this._fieldInfoOrderedList;
			var fieldInfoHitList:LinkedList = this._fieldInfoHitList;
			var fieldInfoArray:Array;
			var fieldInfo:FieldInfo;
			var element:LayoutSprite;

			if (this._refreshElements)
			{
				this._refreshElements = false;

				fieldInfoArray = fieldInfoOrderedList.toArray();

				var fieldRenderer:IElementRenderer = this._fieldRenderer.value;

				for each (fieldInfo in fieldInfoArray)
				{
					element = fieldInfo.element;
					if (element)
					{
						fieldElementContainer.removeChild(element);
						fieldInfo.elementRenderer.disposeElement(element);
					}

					element = fieldRenderer ? fieldRenderer.createElement(fieldInfo.value) : null;

					fieldInfo.elementRenderer = fieldRenderer;
					fieldInfo.element = element;
					fieldInfo.resetBounds();

					if (element)
						fieldElementContainer.addChild(element);
				}
			}

			fieldInfoArray = fieldInfoOrderedList.toArray();

			var fieldSort:IComparator = this._fieldSort.value;
			if (fieldSort)
			{
				fieldSort = new FieldInfoComparator(fieldSort);
				fieldInfoArray.sort(fieldSort.compare);
			}

			var elementIndex:int = 0;
			for each (fieldInfo in fieldInfoArray)
			{
				element = fieldInfo.element;
				if (element)
					fieldElementContainer.setChildIndex(element, elementIndex++);
			}

			var fieldName:String = this._fieldName.value;
			var fieldNameStyle:Style = this._fieldNameStyle.value;
			var fieldLabel:Label = this._fieldLabel;
			fieldLabel.text = fieldName ? fieldName : "<assign field>";
			Style.applyStyle(fieldLabel, fieldNameStyle);
			fieldLabel.measure(availableSize);

			var availableSize2:Size = new Size(availableSize.width, Math.max(availableSize.height - fieldLabel.measuredHeight, 0));

			fieldElementContainer.measure(availableSize2);
			while ((fieldElementContainer.measuredWidth > availableSize2.width) || (fieldElementContainer.measuredHeight > availableSize2.height))
			{
				fieldInfo = fieldInfoHitList.removeLast();
				if (!fieldInfo)
					break;

				delete fieldInfoMap[fieldInfo.value];
				fieldInfoOrderedList.remove(fieldInfo);

				element = fieldInfo.element;
				if (element)
				{
					fieldElementContainer.removeChild(element);
					fieldInfo.elementRenderer.disposeElement(element);
					fieldElementContainer.measure(availableSize2);
				}

				fieldInfo.elementRenderer = null;
				fieldInfo.element = null;
			}

			var measuredSize:Size = new Size();
			measuredSize.width = Math.min(Math.max(fieldLabel.measuredWidth, fieldElementContainer.measuredWidth), availableSize.width);
			measuredSize.height = Math.min(fieldLabel.measuredHeight + fieldElementContainer.measuredHeight, availableSize.height);

			return measuredSize;
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			var fieldLabelHeight:Number = this._fieldLabel.measuredHeight;

			var graphics:Graphics = this.graphics;
			graphics.clear();
			graphics.beginFill(0x000000, 0);
			graphics.drawRect(0, 0, layoutSize.width, layoutSize.height);
			graphics.endFill();

			var lineBrush:IBrush = this._lineBrush.value;
			if (lineBrush)
			{
				lineBrush.beginBrush(graphics);
				lineBrush.moveTo(0, Math.round(fieldLabelHeight));
				lineBrush.lineTo(Math.round(layoutSize.width), Math.round(fieldLabelHeight));
				lineBrush.endBrush();
			}

			this._fieldLabel.layout(new Rectangle(0, 0, layoutSize.width, fieldLabelHeight));
			this._fieldElementContainer.layout(new Rectangle(0, fieldLabelHeight, layoutSize.width, layoutSize.height - fieldLabelHeight));

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

		private function _fieldRenderer_changed(e:ChangedEvent) : void
		{
			if (e.source == this._fieldRenderer)
			{
				this._refreshElements = true;

				this.invalidate(LayoutSprite.MEASURE);
			}
		}

		private function _fieldName_changed(e:ChangedEvent) : void
		{
			var fieldElementContainer:AnimatedLayoutContainer = this._fieldElementContainer;
			var fieldInfoMap:Dictionary = this._fieldInfoMap;
			var fieldInfoOrderedList:LinkedList = this._fieldInfoOrderedList;
			var fieldInfoHitList:LinkedList = this._fieldInfoHitList;
			var fieldInfo:FieldInfo = fieldInfoHitList.removeLast();
			var element:LayoutSprite;

			while (fieldInfo)
			{
				delete fieldInfoMap[fieldInfo.value];
				fieldInfoOrderedList.remove(fieldInfo);

				element = fieldInfo.element;
				if (element)
				{
					fieldElementContainer.removeChild(element);
					fieldInfo.elementRenderer.disposeElement(element);
				}

				fieldInfo.elementRenderer = null;
				fieldInfo.element = null;

				fieldInfo = fieldInfoHitList.removeLast();
			}

			this.invalidate(LayoutSprite.MEASURE);
		}

		private function _self_collected(e:ParticleEvent) : void
		{
			var particle2D:IParticle2D = e.particle as IParticle2D;
			if (!particle2D)
				return;

			var data:Object = particle2D.metadata.data;
			if (!data)
				return;

			var fieldName:String = this._fieldName.value;
			if (!fieldName)
				return;

			var fieldValue:* = data[fieldName];
			if (fieldValue == null)
				return;

			var fieldInfo:FieldInfo = this._fieldInfoMap[fieldValue];
			if (!fieldInfo)
			{
				var fieldRenderer:IElementRenderer = this._fieldRenderer.value;
				var element:LayoutSprite = fieldRenderer ? fieldRenderer.createElement(fieldValue) : null;

				fieldInfo = this._fieldInfoMap[fieldValue] = new FieldInfo();
				fieldInfo.value = fieldValue;
				fieldInfo.elementRenderer = fieldRenderer;
				fieldInfo.element = element;

				if (element)
					this._fieldElementContainer.addChild(element);

				this._fieldInfoOrderedList.addLast(fieldInfo);
			}

			this._fieldInfoHitList.addFirst(fieldInfo);

			var emitVelocity:IDistribution2D = this._emitVelocity.value;

			var particleInfo:ParticleInfo = this._particleInfoMap[particle2D] = new ParticleInfo();
			particleInfo.fieldInfo = fieldInfo;
			particleInfo.emitVelocity = emitVelocity ? emitVelocity.getRandomPoint() : new Point();
		}

		private function _self_released(e:ParticleEvent) : void
		{
			var particle2D:IParticle2D = e.particle as IParticle2D;
			if (!particle2D)
				return;

			var particleInfo:ParticleInfo = this._particleInfoMap[particle2D];
			if (!particleInfo)
				return;

			var fieldInfo:FieldInfo = particleInfo.fieldInfo;
			var elementRenderer:IElementRenderer = fieldInfo.elementRenderer;
			var element:LayoutSprite = fieldInfo.element;
			if (elementRenderer && element)
				elementRenderer.onParticleCollected(particle2D, element);

			this._releasedParticles.push(particle2D);
		}

		private function _self_emitted(e:ParticleEvent) : void
		{
			var particle2D:IParticle2D = e.particle as IParticle2D;
			if (!particle2D)
				return;

			var particleInfo:ParticleInfo = this._particleInfoMap[particle2D];
			if (!particleInfo)
				return;

			delete this._particleInfoMap[particle2D];

			var emitPosition:Point = particleInfo.emitPosition;
			var emitVelocity:Point = particleInfo.emitVelocity;

			var position:Point = particle2D.position;
			var velocity:Point = particle2D.velocity;

			position.x = emitPosition.x;
			position.y = emitPosition.y;
			velocity.x = emitVelocity.x;
			velocity.y = emitVelocity.y;
			particle2D.metadata.renderer = this._emitRenderer.value;
		}

	}

}

import com.jasongatt.layout.LayoutSprite;
import com.jasongatt.motion.easers.IEaser;
import com.jasongatt.utils.IComparator;
import com.splunk.particles.IParticle;
import com.splunk.particles.IParticle2D;
import com.splunk.particles.actions.AgeAction;
import com.splunk.particles.actions.EaseToTargetAction;
import com.splunk.particles.actions.IAction;
import com.splunk.particles.actions.MoveAction;
import com.splunk.particles.controls.IElementRenderer;
import com.splunk.particles.filters.IFilter;
import flash.geom.Point;
import flash.geom.Rectangle;
import flash.utils.Dictionary;

class FieldSplitterFilter implements IFilter
{

	// Public Properties

	public var fieldName:String;

	// Constructor

	public function FieldSplitterFilter(fieldName:String)
	{
		this.fieldName = fieldName;
	}

	// Public Methods

	public function contains(particle:IParticle) : Boolean
	{
		var particle2D:IParticle2D = particle as IParticle2D;
		if (!particle2D)
			return false;

		var data:Object = particle2D.metadata.data;
		if (!data)
			return false;

		var fieldName:String = this.fieldName;
		if (!fieldName)
			return false;

		var fieldValue:* = data[fieldName];
		if (fieldValue == null)
			return false;

		return true;
	}

}

class FieldSplitterAction implements IAction
{

	// Public Properties

	public var collectDuration:Number = 1;
	public var collectEaser:IEaser;
	public var updateCount:Number = 0;

	// Private Properties

	private var _fieldElementContainer:LayoutSprite;
	private var _particleInfoMap:Dictionary;
	private var _ageAction:AgeAction;
	private var _easeToTargetAction:EaseToTargetAction;
	private var _moveAction:MoveAction;

	// Constructor

	public function FieldSplitterAction(fieldElementContainer:LayoutSprite, particleInfoMap:Dictionary)
	{
		this._fieldElementContainer = fieldElementContainer;
		this._particleInfoMap = particleInfoMap;
		this._ageAction = new AgeAction();
		this._easeToTargetAction = new EaseToTargetAction();
		this._moveAction = new MoveAction();
	}

	// Public Methods

	public function apply(particle:IParticle, time:Number) : void
	{
		var particle2D:IParticle2D = particle as IParticle2D;
		if (!particle2D)
			return;

		var particleInfo:ParticleInfo = this._particleInfoMap[particle2D];
		if (!particleInfo)
			return;

		particleInfo.updatePositions(this._fieldElementContainer, this.updateCount);

		var easeToTargetAction:EaseToTargetAction = this._easeToTargetAction;
		easeToTargetAction.targetPosition = particleInfo.collectPosition;
		easeToTargetAction.targetVelocity = particleInfo.emitVelocity;
		easeToTargetAction.duration = this.collectDuration;
		easeToTargetAction.easer = this.collectEaser;

		this._ageAction.apply(particle2D, time);
		easeToTargetAction.apply(particle2D, time);
		this._moveAction.apply(particle2D, time);
	}

}

class FieldInfo
{

	// Public Properties

	public var value:*;
	public var elementRenderer:IElementRenderer;
	public var element:LayoutSprite;
	public var halfWidth:Number = 0;
	public var halfHeight:Number = 0;
	public var centerPointLocal:Point;
	public var centerPointGlobal:Point;
	public var updateCount:Number = 0;

	// Constructor

	public function FieldInfo()
	{
		this.centerPointLocal = new Point();
		this.centerPointGlobal = new Point();
	}

	// Public Methods

	public function updateBounds(parent:LayoutSprite, updateCount:Number) : void
	{
		this.updateCount = updateCount;

		var element:LayoutSprite = this.element;
		if (element && (element.parent == parent))
		{
			var bounds:Rectangle = element.renderBounds;

			this.halfWidth = bounds.width / 2;
			this.halfHeight = bounds.height / 2;
			this.centerPointLocal = new Point(bounds.x + this.halfWidth, bounds.y + this.halfHeight);
		}

		this.centerPointGlobal = parent.localToGlobal(this.centerPointLocal);
	}

	public function resetBounds() : void
	{
		this.halfWidth = 0;
		this.halfHeight = 0;
		this.centerPointLocal = new Point();
		this.updateCount = 0;
	}

}

class ParticleInfo
{

	// Public Properties

	public var fieldInfo:FieldInfo;
	public var collectPosition:Point;
	public var emitPosition:Point;
	public var emitVelocity:Point;

	// Constructor

	public function ParticleInfo()
	{
		this.collectPosition = new Point();
		this.emitPosition = new Point();
	}

	// Public Methods

	public function updatePositions(parent:LayoutSprite, updateCount:Number) : void
	{
		if (fieldInfo.updateCount < updateCount)
			fieldInfo.updateBounds(parent, updateCount);

		var centerPointLocal:Point = fieldInfo.centerPointLocal;
		var centerPointGlobal:Point = fieldInfo.centerPointGlobal;

		var velocity:Point = this.emitVelocity.clone();
		velocity.x += centerPointGlobal.x;
		velocity.y += centerPointGlobal.y;

		velocity = parent.globalToLocal(velocity);
		velocity.x -= centerPointLocal.x;
		velocity.y -= centerPointLocal.y;

		var scaleVX:Number;
		if (velocity.x > 0)
			scaleVX = fieldInfo.halfWidth / velocity.x;
		else if (velocity.x < 0)
			scaleVX = fieldInfo.halfWidth / -velocity.x;
		else
			scaleVX = Infinity;

		var scaleVY:Number;
		if (velocity.y > 0)
			scaleVY = fieldInfo.halfHeight / velocity.y;
		else if (velocity.y < 0)
			scaleVY = fieldInfo.halfHeight / -velocity.y;
		else
			scaleVY = Infinity;

		if (scaleVX < scaleVY)
		{
			velocity.x *= scaleVX;
			velocity.y *= scaleVX;
		}
		else if (scaleVY < scaleVX)
		{
			velocity.x *= scaleVY;
			velocity.y *= scaleVY;
		}
		else
		{
			velocity.x = 0;
			velocity.y = 0;
		}

		this.collectPosition = parent.localToGlobal(new Point(centerPointLocal.x - velocity.x, centerPointLocal.y - velocity.y));
		this.emitPosition = parent.localToGlobal(new Point(centerPointLocal.x + velocity.x, centerPointLocal.y + velocity.y));
	}

}

class FieldInfoComparator implements IComparator
{

	// Private Properties

	private var _fieldComparator:IComparator;

	// Constructor

	public function FieldInfoComparator(fieldComparator:IComparator)
	{
		this._fieldComparator = fieldComparator;
	}

	// Public Methods

	public function compare(value1:*, value2:*) : Number
	{
		var fieldInfo1:FieldInfo = FieldInfo(value1);
		var fieldInfo2:FieldInfo = FieldInfo(value2);

		return this._fieldComparator.compare(fieldInfo1.value, fieldInfo2.value);
	}

}
