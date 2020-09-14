package com.splunk.controls
{

	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.ValidateEvent;
	import com.jasongatt.core.ValidatePass;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.Margin;
	import com.jasongatt.layout.Size;
	import com.jasongatt.utils.MarginUtil;
	import com.splunk.skins.DropDownListSkin;
	import com.splunk.skins.IBorderSkin;
	import com.splunk.skins.IGraphicSkin;
	import com.splunk.skins.ISkin;
	import com.splunk.skins.IStyleSkin;
	import com.splunk.utils.Style;
	import flash.display.DisplayObject;
	import flash.display.DisplayObjectContainer;
	import flash.display.Graphics;
	import flash.display.Sprite;
	import flash.display.Stage;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.geom.Point;
	import flash.geom.Rectangle;
	import flash.utils.Dictionary;

	[Event(name="opened", type="flash.events.Event")]
	[Event(name="closed", type="flash.events.Event")]
	[Event(name="selectionChanged", type="flash.events.Event")]

	public class DropDownList extends AbstractControl
	{

		// Public Static Constants

		public static const OPENED:String = "opened";
		public static const CLOSED:String = "closed";
		public static const SELECTION_CHANGED:String = "selectionChanged";

		// Private Properties

		private var _prompt:ObservableProperty;
		private var _options:ObservableProperty;
		private var _selectedOption:ObservableProperty;

		private var _isOpen:Boolean = false;
		private var _layoutWidth:Number = 0;
		private var _layoutHeight:Number = 0;
		private var _stage:Stage;
		private var _cachedSkin:ISkin;
		private var _cachedPromptSkin:ISkin;
		private var _cachedPromptTextSkin:ISkin;
		private var _cachedState:String;
		private var _cachedBorder:Margin;

		private var _anchorButton:Button;
		private var _promptDefaultLabel:Label;
		private var _promptSelectedLabel:Label;
		private var _promptSprite:Sprite;
		private var _list:List;
		private var _listSprite:Sprite;

		// Constructor

		public function DropDownList()
		{
			this._prompt = new ObservableProperty(this, "prompt", String, null, this.invalidates(LayoutSprite.MEASURE));
			this._options = new ObservableProperty(this, "options", Array, new Array());
			this._selectedOption = new ObservableProperty(this, "selectedOption", ListOption, null, this.invalidates(LayoutSprite.MEASURE));

			this._list = new List(this._options);
			this._list.visible = false;  // visibility is toggled on open/close to mask render delay when listSprite is added to the stage
			this._list.addEventListener(ValidateEvent.INVALIDATED, this._descendant_invalidated, false, int.MAX_VALUE);
			this._list.addEventListener(MouseEvent.CLICK, this._list_click, false, int.MAX_VALUE);

			this._listSprite = new Sprite();
			this._listSprite.addChild(this._list);

			this._promptDefaultLabel = new Label();
			this._promptDefaultLabel.clip = true;
			this._promptDefaultLabel.addEventListener(ValidateEvent.INVALIDATED, this._descendant_invalidated, false, int.MAX_VALUE);

			this._promptSelectedLabel = new Label();
			this._promptSelectedLabel.clip = true;
			this._promptDefaultLabel.addEventListener(ValidateEvent.INVALIDATED, this._descendant_invalidated, false, int.MAX_VALUE);

			this._promptSprite = new Sprite();
			this._promptSprite.addChild(this._promptDefaultLabel);
			this._promptSprite.addChild(this._promptSelectedLabel);

			this._anchorButton = new Button();
			this._anchorButton.hitArea = this._promptSprite;
			this._anchorButton.addEventListener(AbstractButton.BUTTON_DOWN, this._anchorButton_buttonDown, false, int.MAX_VALUE);

			this.skin = new DropDownListSkin();

			this.addChild(this._promptSprite);
			this.addChild(this._anchorButton);
		}

		// Public Getters/Setters

		public function get options() : Array
		{
			return this._options.value.concat();
		}
		public function set options(value:Array) : void
		{
			this._options.value = this._uniqueList(value);
			this._updateSelection(this._selectedOption.value);
		}

		public function get prompt() : String
		{
			return this._prompt.value;
		}
		public function set prompt(value:String) : void
		{
			this._prompt.value = value;
		}

		public function get selectedOption() : ListOption
		{
			return this._selectedOption.value;
		}
		public function set selectedOption(value:ListOption) : void
		{
			this._updateSelection(value);
		}

		public function get isOpen() : Boolean
		{
			return this._isOpen;
		}

		// Public Methods

		public function open() : void
		{
			if (this._isOpen)
				return;

			var stage:Stage = this.stage;
			if (!stage)
				return;

			this._stage = stage;
			this._isOpen = true;

			stage.addEventListener(MouseEvent.MOUSE_DOWN, this._stage_mouseDown, false, int.MAX_VALUE);

			var pointTop:Point = this.localToGlobal(new Point(0, 0));
			var pointBottom:Point = this.localToGlobal(new Point(0, this._layoutHeight));
			var heightTop:Number = Math.max(pointTop.y * 0.8, 0);
			var heightBottom:Number = Math.max((stage.stageHeight - pointBottom.y) * 0.8, 0);

			this._list.visible = true;
			this._list.maximumHeight = Math.max(heightTop, heightBottom);
			this._list.measure();
			this._list.scrollToSelection(this._selectedOption.value);

			var listHeight:Number = this._list.measuredHeight;
			if ((listHeight > heightBottom) && (heightTop > heightBottom))
			{
				this._listSprite.x = Math.round(pointTop.x);
				this._listSprite.y = Math.round(pointTop.y - listHeight);
			}
			else
			{
				this._listSprite.x = Math.round(pointBottom.x);
				this._listSprite.y = Math.round(pointBottom.y);
			}

			this._anchorButton.mouseEnabled = false;

			stage.addChild(this._listSprite);

			this.dispatchEvent(new Event(DropDownList.OPENED));
		}

		public function close() : void
		{
			if (!this._isOpen)
				return;

			var stage:Stage = this._stage;
			if (!stage)
				return;

			this._stage = null;
			this._isOpen = false;

			stage.removeEventListener(MouseEvent.MOUSE_DOWN, this._stage_mouseDown);

			this._anchorButton.mouseEnabled = true;

			var parent:DisplayObjectContainer = this._listSprite.parent;
			if (parent)
				parent.removeChild(this._listSprite);

			this._list.visible = false;

			this.dispatchEvent(new Event(DropDownList.CLOSED));
		}

		// Protected Methods

		protected override function updateSkinOverride(skin:ISkin) : void
		{
			var anchorSkin:ISkin;
			var promptSkin:ISkin;
			var promptTextSkin:ISkin;
			var listSkin:ISkin;

			if (skin)
			{
				anchorSkin = skin.getChildSkin("anchor");
				promptSkin = skin.getChildSkin("prompt");
				if (promptSkin)
					promptTextSkin = promptSkin.getChildSkin("text");
				listSkin = skin.getChildSkin("list");
			}

			this._anchorButton.skin = anchorSkin;
			this._anchorButton.updateSkin();

			this._list.skin = listSkin;
			this._list.updateSkin();

			this._cachedSkin = skin;
			this._cachedPromptSkin = promptSkin;
			this._cachedPromptTextSkin = promptTextSkin;
		}

		protected override function updateStateOverride(state:String) : void
		{
			this.invalidate(LayoutSprite.LAYOUT);

			var promptDefaultTextStyle:Style;
			var promptSelectedTextStyle:Style;
			var promptTextStyleSkin:IStyleSkin = this._cachedPromptTextSkin as IStyleSkin;
			if (promptTextStyleSkin)
			{
				promptDefaultTextStyle = promptTextStyleSkin.getStyle("disabled");
				promptSelectedTextStyle = promptTextStyleSkin.getStyle(state);
			}
			Style.applyStyle(this._promptDefaultLabel, promptDefaultTextStyle);
			Style.applyStyle(this._promptSelectedLabel, promptSelectedTextStyle);

			var promptStyle:Style;
			var promptStyleSkin:IStyleSkin = this._cachedPromptSkin as IStyleSkin;
			if (promptStyleSkin)
				promptStyle = promptStyleSkin.getStyle(state);
			Style.applyStyle(this._promptSprite, promptStyle);

			var style:Style;
			var styleSkin:IStyleSkin = this._cachedSkin as IStyleSkin;
			if (styleSkin)
				style = styleSkin.getStyle(state);
			Style.applyStyle(this, style);

			this._cachedState = state;
		}

		protected override function measureOverride(availableSize:Size) : Size
		{
			var availableWidth:Number = Math.floor(availableSize.width);
			var availableHeight:Number = Math.floor(availableSize.height);

			var measuredSize:Size = new Size();

			var promptGraphicSkin:IGraphicSkin = this._cachedPromptSkin as IGraphicSkin;
			var promptSkinSize:Size = promptGraphicSkin ? promptGraphicSkin.getPreferredSize(new Size(availableWidth, availableHeight)) : new Size();

			var promptBorderSkin:IBorderSkin = this._cachedPromptSkin as IBorderSkin;
			var border:Margin = promptBorderSkin ? MarginUtil.round(promptBorderSkin.getBorderMargin()) : new Margin();
			var borderX:Number = border.left + border.right;
			var borderY:Number = border.top + border.bottom;

			availableWidth = Math.max(availableWidth - borderX, 0);
			availableHeight = Math.max(availableHeight - borderY, 0);

			this._anchorButton.measure(new Size(availableWidth, availableHeight));
			availableWidth = Math.round(Math.max(availableWidth - this._anchorButton.measuredWidth));

			var selectedOption:ListOption = this._selectedOption.value;

			this._promptDefaultLabel.text = this._prompt.value;
			this._promptDefaultLabel.visible = selectedOption ? false : true;
			this._promptDefaultLabel.measure(new Size(availableWidth, availableHeight));

			if (!selectedOption)
				this._promptSelectedLabel.text = "";
			else if (!selectedOption.label)
				this._promptSelectedLabel.text = String(selectedOption.value);
			else
				this._promptSelectedLabel.text = selectedOption.label;
			this._promptSelectedLabel.visible = selectedOption ? true : false;
			this._promptSelectedLabel.measure(new Size(availableWidth, availableHeight));

			measuredSize.width = Math.round(Math.max(Math.min(Math.max(this._promptDefaultLabel.measuredWidth, this._promptSelectedLabel.measuredWidth), availableWidth) + this._anchorButton.measuredWidth + borderX, promptSkinSize.width, 0));
			measuredSize.height = Math.round(Math.max(Math.max(Math.min(Math.max(this._promptDefaultLabel.measuredHeight, this._promptSelectedLabel.measuredHeight), availableHeight), this._anchorButton.measuredHeight) + borderY, promptSkinSize.height, 0));

			this._list.measure(new Size(availableSize.width, Infinity));
			measuredSize.width = Math.max(measuredSize.width, Math.round(this._list.measuredWidth));

			this._cachedBorder = border;

			return measuredSize;
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			var layoutWidth:Number = this._layoutWidth = Math.round(layoutSize.width);
			var layoutHeight:Number = this._layoutHeight = Math.round(layoutSize.height);

			var border:Margin = this._cachedBorder;
			var borderX:Number = border.left + border.right;
			var borderY:Number = border.top + border.bottom;

			var layoutWidth2:Number = Math.max(layoutWidth - borderX, 0);
			var layoutHeight2:Number = Math.max(layoutHeight - borderY, 0);

			var x1:Number = border.left;
			var y1:Number = border.top;
			var x2:Number = x1 + Math.max(layoutWidth2 - Math.round(this._anchorButton.measuredWidth), 0);

			this._anchorButton.layout(new Rectangle(x2, y1, Math.round(this._anchorButton.measuredWidth), layoutHeight2));
			this._promptDefaultLabel.layout(new Rectangle(x1, y1, x2 - x1, layoutHeight2));
			this._promptSelectedLabel.layout(new Rectangle(x1, y1, x2 - x1, layoutHeight2));
			this._list.layout(new Rectangle(0, 0, layoutWidth, Math.round(this._list.measuredHeight)));

			var promptGraphics:Graphics = this._promptSprite.graphics;
			promptGraphics.clear();

			var promptGraphicSkin:IGraphicSkin = this._cachedPromptSkin as IGraphicSkin;
			if (promptGraphicSkin)
				promptGraphicSkin.draw(promptGraphics, 0, 0, layoutWidth, layoutHeight, this._cachedState);

			return layoutSize;
		}

		protected override function onChildAdded(child:DisplayObject) : void
		{
			this.invalidate(LayoutSprite.MEASURE);
		}

		protected override function onChildRemoved(child:DisplayObject) : void
		{
			this.invalidate(LayoutSprite.MEASURE);
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

		protected override function onDisabled() : void
		{
			this.close();

			super.onDisabled();
		}

		// Private Methods

		private function _updateSelection(option:ListOption) : void
		{
			var options:Array = this._options.value;
			var optionIndex:int = options.indexOf(option);
			if (optionIndex < 0)
				option = null;

			if (option == this._selectedOption.value)
				return;

			this._selectedOption.value = option;

			this.dispatchEvent(new Event(DropDownList.SELECTION_CHANGED));
		}

		private function _uniqueList(list:Array) : Array
		{
			var list2:Array = new Array();

			var valueMap:Dictionary = new Dictionary();
			for each (var value:* in list)
			{
				if ((value != null) && !valueMap[value])
				{
					valueMap[value] = true;
					list2.push(value);
				}
			}

			return list2;
		}

		private function _descendant_invalidated(e:ValidateEvent) : void
		{
			switch (e.pass)
			{
				case LayoutSprite.MEASURE:
					this.invalidate(LayoutSprite.MEASURE);
					break;
			}
		}

		private function _list_click(e:MouseEvent) : void
		{
			var listItem:ListItem = e.target as ListItem;
			if (!listItem)
				return;

			this.selectedOption = listItem.option;

			this.close();
		}

		private function _anchorButton_buttonDown(e:Event) : void
		{
			this.open();
		}

		private function _stage_mouseDown(e:MouseEvent) : void
		{
			var target:DisplayObject = e.target as DisplayObject;
			while (target && !(target is Stage))
			{
				if ((target == this._anchorButton) || (target == this._listSprite))
					return;
				target = target.parent;
			}

			this.close();
		}

	}

}

import com.jasongatt.core.ChangedEvent;
import com.jasongatt.core.ObservableProperty;
import com.jasongatt.core.ValidatePass;
import com.jasongatt.layout.LayoutSprite;
import com.jasongatt.layout.Margin;
import com.jasongatt.layout.ScrollableStackLayout;
import com.jasongatt.layout.Size;
import com.jasongatt.utils.MarginUtil;
import com.jasongatt.utils.NumberUtil;
import com.splunk.controls.AbstractControl;
import com.splunk.controls.LabelButton;
import com.splunk.controls.ListOption;
import com.splunk.controls.ScrollBar;
import com.splunk.skins.IBorderSkin;
import com.splunk.skins.IGraphicSkin;
import com.splunk.skins.ISkin;
import com.splunk.skins.IStyleSkin;
import com.splunk.utils.Style;
import flash.display.DisplayObject;
import flash.display.Graphics;
import flash.events.Event;
import flash.events.MouseEvent;
import flash.geom.Rectangle;
import flash.utils.Dictionary;

class List extends AbstractControl
{

	// Private Properties

	private var _options:ObservableProperty;

	private var _cachedSkin:ISkin;
	private var _cachedState:String;
	private var _cachedBorder:Margin;

	private var _itemsMap:Dictionary;
	private var _itemsList:Array;
	private var _itemsContainer:ScrollableStackLayout;
	private var _scrollBar:ScrollBar;
	private var _highlightedItem:ListItem;

	// Constructor

	public function List(options:ObservableProperty)
	{
		this._options = options;
		this._options.addEventListener(ChangedEvent.CHANGED, this.invalidates(AbstractControl.UPDATE_SKIN), false, int.MAX_VALUE);

		this._itemsMap = new Dictionary();
		this._itemsList = new Array();

		this._itemsContainer = new ScrollableStackLayout();

		this._scrollBar = new ScrollBar();
		this._scrollBar.target = this._itemsContainer;

		// disabling mouse wheel support since it doesn't work properly on many players/platforms (flash player bug)
		//this.addEventListener(MouseEvent.MOUSE_WHEEL, this._self_mouseWheel, false, int.MAX_VALUE);

		this.addChild(this._itemsContainer);
		this.addChild(this._scrollBar);
	}

	// Public Methods

	public function scrollToSelection(option:ListOption) : void
	{
		var selectedIndex:int = -1;

		var selectedItem:ListItem = this._itemsMap[option];
		if (selectedItem)
			selectedIndex = this._itemsList.indexOf(selectedItem);

		this._highlightItem(selectedItem);

		this._itemsContainer.scrollPosition = NumberUtil.maxMin(selectedIndex, this._itemsContainer.scrollSize, 0);
	}

	// Protected Methods

	protected override function updateSkinOverride(skin:ISkin) : void
	{
		var itemSkin:ISkin;
		var scrollBarSkin:ISkin;

		if (skin)
		{
			itemSkin = skin.getChildSkin("item");
			scrollBarSkin = skin.getChildSkin("scrollBar");
		}

		this._scrollBar.skin = scrollBarSkin;
		this._scrollBar.updateSkin();

		var oldItemsMap:Dictionary = this._itemsMap;
		var oldItemsList:Array = this._itemsList;

		var newItemsMap:Dictionary = this._itemsMap = new Dictionary();
		var newItemsList:Array = this._itemsList = new Array();

		var itemsContainer:ScrollableStackLayout = this._itemsContainer;
		var item:ListItem;

		var topItemIndex:int = (itemsContainer.scrollPosition > 0) ? Math.min(Math.floor(itemsContainer.scrollPosition), oldItemsList.length - 1) : -1;
		var topItem:ListItem = (topItemIndex >= 0) ? oldItemsList[topItemIndex] : null;

		var options:Array = this._options.value;
		var numOptions:int = options.length;
		var option:ListOption;

		for (var i:int = 0; i < numOptions; i++)
		{
			option = options[i];

			item = oldItemsMap[option];
			if (!item)
				item = new ListItem(option);
			else
				delete oldItemsMap[option];

			newItemsMap[option] = item;
			newItemsList.push(item);

			if (item.parent != itemsContainer)
				itemsContainer.addChildAt(item, i);
			else if (itemsContainer.getChildIndex(item) != i)
				itemsContainer.setChildIndex(item, i);

			item.skin = itemSkin;
			item.updateSkin();
		}

		for each (item in oldItemsMap)
		{
			if (item.parent == itemsContainer)
				itemsContainer.removeChild(item);
		}

		// adjust scrollPosition to previous top item
		if (topItem)
		{
			var newTopItemIndex:int = newItemsList.indexOf(topItem);
			if (newTopItemIndex >= 0)
				itemsContainer.scrollPosition += newTopItemIndex - topItemIndex;
			else
				itemsContainer.scrollPosition = 0;
		}

		this._cachedSkin = skin;
	}

	protected override function updateStateOverride(state:String) : void
	{
		this.invalidate(LayoutSprite.LAYOUT);

		var style:Style;
		var styleSkin:IStyleSkin = this._cachedSkin as IStyleSkin;
		if (styleSkin)
			style = styleSkin.getStyle(state);
		Style.applyStyle(this, style);

		this._cachedState = state;
	}

	protected override function measureOverride(availableSize:Size) : Size
	{
		var availableWidth:Number = Math.floor(availableSize.width);
		var availableHeight:Number = Math.floor(availableSize.height);

		var measuredSize:Size = new Size();

		var graphicSkin:IGraphicSkin = this._cachedSkin as IGraphicSkin;
		var skinSize:Size = graphicSkin ? graphicSkin.getPreferredSize(new Size(availableWidth, availableHeight)) : new Size();

		var borderSkin:IBorderSkin = this._cachedSkin as IBorderSkin;
		var border:Margin = borderSkin ? MarginUtil.round(borderSkin.getBorderMargin()) : new Margin();
		var borderX:Number = border.left + border.right;
		var borderY:Number = border.top + border.bottom;

		availableWidth = Math.max(availableWidth - borderX, 0);
		availableHeight = Math.max(availableHeight - borderY, 0);

		this._scrollBar.measure(new Size(availableWidth, availableHeight));
		availableWidth = Math.round(Math.max(availableWidth - this._scrollBar.measuredWidth, 0));

		this._itemsContainer.measure(new Size(availableWidth, availableHeight));

		measuredSize.width = Math.round(Math.max(this._itemsContainer.measuredWidth + this._scrollBar.measuredWidth + borderX, skinSize.width));
		measuredSize.height = Math.round(Math.max(this._itemsContainer.measuredHeight + borderY, skinSize.height));

		this._cachedBorder = border;

		return measuredSize;
	}

	protected override function layoutOverride(layoutSize:Size) : Size
	{
		var layoutWidth:Number = Math.round(layoutSize.width);
		var layoutHeight:Number = Math.round(layoutSize.height);

		var border:Margin = this._cachedBorder;
		var borderX:Number = border.left + border.right;
		var borderY:Number = border.top + border.bottom;

		var layoutWidth2:Number = Math.max(layoutWidth - borderX, 0);
		var layoutHeight2:Number = Math.max(layoutHeight - borderY, 0);

		var x1:Number = border.left;
		var y1:Number = border.top;
		var x2:Number = x1 + Math.max(layoutWidth2 - Math.round(this._scrollBar.measuredWidth), 0);

		this._scrollBar.layout(new Rectangle(x2, y1, Math.round(this._scrollBar.measuredWidth), layoutHeight2));
		if (this._itemsContainer.scrollSize > 0)
		{
			this._itemsContainer.layout(new Rectangle(x1, y1, x2 - x1, layoutHeight2));
			this._scrollBar.visible = true;
		}
		else
		{
			this._itemsContainer.layout(new Rectangle(x1, y1, layoutWidth2, layoutHeight2));
			this._scrollBar.visible = false;
		}

		var graphics:Graphics = this.graphics;
		graphics.clear();

		// draw invisible background to capture mouse and keyboard events
		graphics.beginFill(0x000000, 0);
		graphics.drawRect(0, 0, layoutWidth, layoutHeight);
		graphics.endFill();

		var graphicSkin:IGraphicSkin = this._cachedSkin as IGraphicSkin;
		if (graphicSkin)
			graphicSkin.draw(graphics, 0, 0, layoutWidth, layoutHeight, this._cachedState);

		return layoutSize;
	}

	protected override function onChildAdded(child:DisplayObject) : void
	{
		this.invalidate(LayoutSprite.MEASURE);
	}

	protected override function onChildRemoved(child:DisplayObject) : void
	{
		this.invalidate(LayoutSprite.MEASURE);
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

	private function _highlightItem(item:ListItem) : void
	{
		this._unhighlightItem();

		if (!item)
			return;

		this._highlightedItem = item;

		if (item.isEnabled)
			item.state = "over";

		this._itemsContainer.addEventListener(MouseEvent.MOUSE_OVER, this._itemsContainer_mouseOver, false, int.MAX_VALUE);
	}

	private function _unhighlightItem() : void
	{
		var item:ListItem = this._highlightedItem;
		if (!item)
			return;

		this._highlightedItem = null;

		if (item.isEnabled)
			item.state = "up";

		this._itemsContainer.removeEventListener(MouseEvent.MOUSE_OVER, this._itemsContainer_mouseOver);
	}

	private function _itemsContainer_mouseOver(e:MouseEvent) : void
	{
		var item:ListItem = e.target as ListItem;
		if (!item || (item == this._highlightedItem))
			return;

		this._unhighlightItem();
	}

	private function _self_mouseWheel(e:MouseEvent) : void
	{
		var itemsContainer:ScrollableStackLayout = this._itemsContainer;
		itemsContainer.scrollPosition = NumberUtil.maxMin(itemsContainer.scrollPosition + itemsContainer.getLineSize(-e.delta), itemsContainer.scrollSize, 0);
	}

}

class ListItem extends LabelButton
{

	// Private Properties

	private var _option:ObservableProperty;

	// Constructor

	public function ListItem(option:ListOption)
	{
		this._option = new ObservableProperty(this, "option", ListOption, option, this._updateOption);

		this.useBoundsHitTest = true;

		this._updateOption();
	}

	// Public Getters/Setters

	public function get option() : ListOption
	{
		return this._option.value;
	}

	// Private Methods

	private function _updateOption(e:Event = null) : void
	{
		var option:ListOption = this._option.value;
		this.label.text = option.label ? option.label : String(option.value);
	}

}
