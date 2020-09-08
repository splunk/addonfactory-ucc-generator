package com.splunk.particles.controls
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.ObservableArrayProperty;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.layout.ILayoutPolicy;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Orientation;
	import com.jasongatt.layout.DistributedStackLayoutPolicy;
	import com.splunk.particles.IParticle;
	import com.splunk.utils.Style;

	public class GroupElementRenderer extends AbstractElementRenderer
	{

		// Private Properties

		private var _elementRenderers:ObservableArrayProperty;
		private var _layoutPolicy:ObservableProperty;
		private var _layoutStyle:ObservableProperty;

		private var _isElementRenderersValid:Boolean = true;
		private var _isLayoutPolicyValid:Boolean = true;
		private var _isLayoutStyleValid:Boolean = true;

		// Constructor

		public function GroupElementRenderer()
		{
			this._elementRenderers = new ObservableArrayProperty(this, "elementRenderers", new Array(), this._elementRenderers_changed);
			this._layoutPolicy = new ObservableProperty(this, "layoutPolicy", ILayoutPolicy, new DistributedStackLayoutPolicy(Orientation.X), this._layoutPolicy_changed);
			this._layoutStyle = new ObservableProperty(this, "layoutStyle", Style, null, this._layoutStyle_changed);
		}

		// Public Getters/Setters

		public function get elementRenderers() : Array
		{
			return this._elementRenderers.value.concat();
		}
		public function set elementRenderers(value:Array) : void
		{
			this._elementRenderers.value = value ? value.concat() : new Array();
		}

		public function get layoutPolicy() : ILayoutPolicy
		{
			return this._layoutPolicy.value;
		}
		public function set layoutPolicy(value:ILayoutPolicy) : void
		{
			this._layoutPolicy.value = value;
		}

		public function get layoutStyle() : Style
		{
			return this._layoutStyle.value;
		}
		public function set layoutStyle(value:Style) : void
		{
			this._layoutStyle.value = value;
		}

		// Protected Methods

		protected override function updateElementsOverride(elements:Array) : void
		{
			var groupElement:GroupElement;

			if (!this._isElementRenderersValid)
			{
				this._isElementRenderersValid = true;

				var elementRenderers:Array = this._elementRenderers.value;
				var elementRenderer:IElementRenderer;
				var oldElementInfoList:Array;
				var newElementInfoList:Array;
				var elementInfo:ElementInfo;
				var elementIndex:int;
				var element:LayoutSprite;
				var i:int;

				for each (groupElement in elements)
				{
					oldElementInfoList = groupElement.elementInfoList;
					newElementInfoList = groupElement.elementInfoList = new Array();

					for each (elementRenderer in elementRenderers)
					{
						elementIndex = -1;
						for (i = 0; i < oldElementInfoList.length; i++)
						{
							elementInfo = oldElementInfoList[i];
							if (elementInfo.elementRenderer == elementRenderer)
							{
								elementIndex = i;
								break;
							}
						}

						if (elementIndex < 0)
						{
							element = elementRenderer.createElement(groupElement.fieldValue);
							if (element)
							{
								newElementInfoList.push(new ElementInfo(elementRenderer, element));
								groupElement.addChildAt(element, newElementInfoList.length - 1);
							}
						}
						else
						{
							elementInfo = oldElementInfoList[elementIndex];
							oldElementInfoList.splice(elementIndex, 1);
							newElementInfoList.push(elementInfo);
							groupElement.setChildIndex(elementInfo.element, newElementInfoList.length - 1);
						}
					}

					for each (elementInfo in oldElementInfoList)
					{
						element = elementInfo.element;
						groupElement.removeChild(element);
						elementInfo.elementRenderer.disposeElement(element);
					}
				}
			}

			if (!this._isLayoutPolicyValid)
			{
				this._isLayoutPolicyValid = true;

				var layoutPolicy:ILayoutPolicy = this._layoutPolicy.value;
				for each (groupElement in elements)
					groupElement.layoutPolicy = layoutPolicy;
			}

			if (!this._isLayoutStyleValid)
			{
				this._isLayoutStyleValid = true;

				var layoutStyle:Style = this._layoutStyle.value;
				for each (groupElement in elements)
					Style.applyStyle(groupElement, layoutStyle);
			}
		}

		protected override function createElementOverride(fieldValue:*) : LayoutSprite
		{
			var elementRenderers:Array = this._elementRenderers.value;
			var layoutPolicy:ILayoutPolicy = this._layoutPolicy.value;
			var layoutStyle:Style = this._layoutStyle.value;

			var groupElement:GroupElement = new GroupElement(fieldValue);

			Style.applyStyle(groupElement, layoutStyle);

			groupElement.layoutPolicy = layoutPolicy;

			var elementInfoList:Array = groupElement.elementInfoList;
			var element:LayoutSprite;
			for each (var elementRenderer:IElementRenderer in elementRenderers)
			{
				element = elementRenderer.createElement(fieldValue);
				if (element)
				{
					elementInfoList.push(new ElementInfo(elementRenderer, element));
					groupElement.addChild(element);
				}
			}

			return groupElement;
		}

		protected override function disposeElementOverride(element:LayoutSprite) : void
		{
			var groupElement:GroupElement = element as GroupElement;
			if (!groupElement)
				return;

			var element:LayoutSprite;
			for each (var elementInfo:ElementInfo in groupElement.elementInfoList)
			{
				element = elementInfo.element;
				groupElement.removeChild(element);
				elementInfo.elementRenderer.disposeElement(element);
			}
		}

		protected override function onParticleCollectedOverride(particle:IParticle, element:LayoutSprite) : void
		{
			var groupElement:GroupElement = element as GroupElement;
			if (!groupElement)
				return;

			for each (var elementInfo:ElementInfo in groupElement.elementInfoList)
				elementInfo.elementRenderer.onParticleCollected(particle, elementInfo.element);
		}

		// Private Methods

		private function _elementRenderers_changed(e:ChangedEvent) : void
		{
			if (e.source == this._elementRenderers)
			{
				this._isElementRenderersValid = false;

				this.invalidate(AbstractElementRenderer.UPDATE_ELEMENTS);
			}
		}

		private function _layoutPolicy_changed(e:ChangedEvent) : void
		{
			if (e.source == this._layoutPolicy)
			{
				this._isLayoutPolicyValid = false;

				this.invalidate(AbstractElementRenderer.UPDATE_ELEMENTS);
			}
		}

		private function _layoutStyle_changed(e:ChangedEvent) : void
		{
			this._isLayoutStyleValid = false;

			this.invalidate(AbstractElementRenderer.UPDATE_ELEMENTS);
		}

	}

}

import com.jasongatt.layout.LayoutContainer;
import com.jasongatt.layout.LayoutSprite;
import com.splunk.particles.controls.IElementRenderer;

class GroupElement extends LayoutContainer
{

	// Public Properties

	public var fieldValue:*;
	public var elementInfoList:Array;

	// Constructor

	public function GroupElement(fieldValue:*)
	{
		this.fieldValue = fieldValue;
		this.elementInfoList = new Array();

		this.snap = true;
	}

}

class ElementInfo
{

	// Public Properties

	public var elementRenderer:IElementRenderer;
	public var element:LayoutSprite;

	// Constructor

	public function ElementInfo(elementRenderer:IElementRenderer, element:LayoutSprite)
	{
		this.elementRenderer = elementRenderer;
		this.element = element;
	}

}
