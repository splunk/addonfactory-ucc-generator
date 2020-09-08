package com.splunk.controls
{

	import com.jasongatt.core.ChangedEvent;
	import com.jasongatt.core.ObservableProperty;
	import com.jasongatt.core.ValidatePass;
	import com.jasongatt.layout.LayoutSprite;
	import com.jasongatt.layout.GroupLayoutPolicy;
	import com.jasongatt.layout.Margin;
	import com.jasongatt.layout.Size;
	import flash.display.DisplayObject;
	import flash.display.Stage;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.events.TimerEvent;
	import flash.utils.Timer;

	[Event(name="buttonDown", type="flash.events.Event")]

	public /*abstract*/ class AbstractButton extends AbstractControl
	{

		// Public Static Constants

		public static const BUTTON_DOWN:String = "buttonDown";

		// Private Properties

		private var _padding:ObservableProperty;
		private var _stickyHighlighting:ObservableProperty;
		private var _autoRepeat:ObservableProperty;
		private var _repeatDelay:ObservableProperty;
		private var _repeatInterval:ObservableProperty;

		private var _layoutPolicy:GroupLayoutPolicy;
		private var _stage:Stage;
		private var _delayTimer:Timer;
		private var _intervalTimer:Timer;
		private var _isOver:Boolean = false;
		private var _isDown:Boolean = false;
		private var _isDownTarget:Boolean = false;

		// Constructor

		public function AbstractButton()
		{
			this._padding = new ObservableProperty(this, "padding", Margin, new Margin(), this.invalidates(LayoutSprite.MEASURE));
			this._stickyHighlighting = new ObservableProperty(this, "stickyHighlighting", Boolean, false, this._stickyHighlighting_changed);
			this._autoRepeat = new ObservableProperty(this, "autoRepeat", Boolean, false);
			this._repeatDelay = new ObservableProperty(this, "repeatDelay", Number, 0.5);
			this._repeatInterval = new ObservableProperty(this, "repeatInterval", Number, 0.05);

			this._layoutPolicy = new GroupLayoutPolicy();

			super.buttonMode = true;
			this.mouseEnabled = true;
			this.mouseChildren = false;
			this.tabEnabled = false;
			this.tabChildren = false;

			this.state = "up";

			this.addEventListener(MouseEvent.ROLL_OVER, this._self_rollOver, false, int.MAX_VALUE);
			this.addEventListener(MouseEvent.ROLL_OUT, this._self_rollOut, false, int.MAX_VALUE);
			this.addEventListener(MouseEvent.MOUSE_DOWN, this._self_mouseDown, false, int.MAX_VALUE);
			this.addEventListener(MouseEvent.MOUSE_UP, this._self_mouseUp, false, int.MAX_VALUE);
		}

		// Public Getters/Setters

		public override function get buttonMode() : Boolean
		{
			return super.buttonMode;
		}
		public override function set buttonMode(value:Boolean) : void
		{
			// READ-ONLY
		}

		public function get padding() : Margin
		{
			return this._padding.value.clone();
		}
		public function set padding(value:Margin) : void
		{
			value = value ? value.clone() : new Margin();
			if (!value.equals(this._padding.value))
				this._padding.value = value;
		}

		public function get stickyHighlighting() : Boolean
		{
			return this._stickyHighlighting.value;
		}
		public function set stickyHighlighting(value:Boolean) : void
		{
			this._stickyHighlighting.value = value;
		}

		public function get autoRepeat() : Boolean
		{
			return this._autoRepeat.value;
		}
		public function set autoRepeat(value:Boolean) : void
		{
			this._autoRepeat.value = value;
		}

		public function get repeatDelay() : Number
		{
			return this._repeatDelay.value;
		}
		public function set repeatDelay(value:Number) : void
		{
			this._repeatDelay.value = value;
		}

		public function get repeatInterval() : Number
		{
			return this._repeatInterval.value;
		}
		public function set repeatInterval(value:Number) : void
		{
			this._repeatInterval.value = value;
		}

		// Protected Methods

		protected override function measureOverride(availableSize:Size) : Size
		{
			this._layoutPolicy.padding = this._padding.value;
			return this._layoutPolicy.measure(this, availableSize);
		}

		protected override function layoutOverride(layoutSize:Size) : Size
		{
			return this._layoutPolicy.layout(this, layoutSize);
		}

		protected override function onChildAdded(child:DisplayObject) : void
		{
			this._layoutPolicy.onChildAdded(this, child);
		}

		protected override function onChildRemoved(child:DisplayObject) : void
		{
			this._layoutPolicy.onChildRemoved(this, child);
		}

		protected override function onChildInvalidated(child:DisplayObject, pass:ValidatePass) : void
		{
			this._layoutPolicy.onChildInvalidated(this, child, pass);
		}

		protected override function onDisabled() : void
		{
			this._updateState();
		}

		protected override function onEnabled() : void
		{
			this._updateState();
		}

		// Private Methods

		private function _updateState() : void
		{
			var state:String;

			if (!this.isEnabled)
				state = "disabled";
			else if (this._isDownTarget)
				state = (this._isOver || this._stickyHighlighting.value) ? "down" : "up";
			else if (this._isDown)
				state = (this._isOver || this._stickyHighlighting.value) ? "over" : "up";
			else if (this._isOver)
				state = "over";
			else
				state = "up";

			this.state = state;
		}

		private function _dispatchButtonDown() : void
		{
			if (this.state == "down")
				this.dispatchEvent(new Event(AbstractButton.BUTTON_DOWN));
		}

		private function _stickyHighlighting_changed(e:ChangedEvent) : void
		{
			this._updateState();
		}

		private function _self_rollOver(e:MouseEvent) : void
		{
			if (this._isOver)
				return;

			if (e.buttonDown && !this._isDown)
				return;

			this._isOver = true;

			this._updateState();
		}

		private function _self_rollOut(e:MouseEvent) : void
		{
			if (!this._isOver)
				return;

			this._isOver = false;

			this._updateState();
		}

		private function _self_mouseDown(e:MouseEvent) : void
		{
			var stage:Stage = this.stage;
			if (stage)
			{
				this._stage = stage;
				stage.addEventListener(MouseEvent.MOUSE_UP, this._stage_mouseUp, false, int.MAX_VALUE);
			}

			var isDownTarget:Boolean = (e.target == this);
			if (this._isOver && this._isDown && (this._isDownTarget == isDownTarget))
				return;

			this._isOver = true;
			this._isDown = true;
			this._isDownTarget = isDownTarget;

			this._updateState();

			if (this._isDownTarget)
			{
				if (this._autoRepeat.value)
				{
					this._delayTimer = new Timer(Math.max(this._repeatDelay.value * 1000, 0), 1);
					this._delayTimer.addEventListener(TimerEvent.TIMER, this._delayTimer_timer);
					this._delayTimer.start();
				}

				this._dispatchButtonDown();
			}
		}

		private function _self_mouseUp(e:MouseEvent) : void
		{
			if (this._isOver && !this._isDown && !this._isDownTarget)
				return;

			this._isOver = true;
			this._isDown = false;
			this._isDownTarget = false;

			this._updateState();
		}

		private function _stage_mouseUp(e:MouseEvent) : void
		{
			var stage:Stage = this._stage;
			if (stage)
			{
				this._stage = null;
				stage.removeEventListener(MouseEvent.MOUSE_UP, this._stage_mouseUp);
			}

			if (this._delayTimer)
			{
				this._delayTimer.stop();
				this._delayTimer = null;
			}

			if (this._intervalTimer)
			{
				this._intervalTimer.stop();
				this._intervalTimer = null;
			}

			if (!this._isDown && !this._isDownTarget)
				return;

			this._isDown = false;
			this._isDownTarget = false;

			this._updateState();
		}

		private function _delayTimer_timer(e:TimerEvent) : void
		{
			this._delayTimer.stop();
			this._delayTimer = null;

			this._intervalTimer = new Timer(Math.max(this._repeatInterval.value * 1000), 0);
			this._intervalTimer.addEventListener(TimerEvent.TIMER, this._intervalTimer_timer);
			this._intervalTimer.start();

			this._dispatchButtonDown();
		}

		private function _intervalTimer_timer(e:TimerEvent) : void
		{
			this._dispatchButtonDown();
		}

	}

}
