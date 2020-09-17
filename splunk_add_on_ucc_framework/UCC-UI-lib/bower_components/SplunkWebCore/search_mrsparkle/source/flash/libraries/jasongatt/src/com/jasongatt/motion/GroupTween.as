package com.jasongatt.motion
{

	import com.jasongatt.motion.easers.IEaser;

	public class GroupTween extends AbstractTween
	{

		// Private Properties

		private var _tweens:Array;

		private var _runningTweens:Array;

		// Constructor

		public function GroupTween(tweens:Array = null, easer:IEaser = null)
		{
			super(easer);

			this._tweens = tweens ? tweens.concat() : new Array();
		}

		// Public Getters/Setters

		public function get tweens() : Array
		{
			return this._tweens.concat();
		}
		public function set tweens(value:Array) : void
		{
			this._tweens = value ? value.concat() : new Array();
			this.endTween();
		}

		// Protected Methods

		protected override function beginTweenOverride() : Boolean
		{
			var runningTweens:Array = new Array();

			for each (var tween:ITween in this._tweens)
			{
				if (tween.beginTween())
					runningTweens.push(tween);
			}

			if (runningTweens.length == 0)
				return false;

			this._runningTweens = runningTweens;

			return true;
		}

		protected override function endTweenOverride() : void
		{
			for each (var tween:ITween in this._runningTweens)
				tween.endTween();

			this._runningTweens = null;
		}

		protected override function updateTweenOverride(position:Number) : Boolean
		{
			var runningTweens:Array = this._runningTweens;
			var numTweens:int = runningTweens.length;
			var tween:ITween;

			for (var i:int = 0; i < numTweens; i++)
			{
				tween = runningTweens[i];
				if (!tween.updateTween(position))
				{
					tween.endTween();
					runningTweens.splice(i, 1);
					i--;
					numTweens--;
				}
			}

			return (runningTweens.length > 0);
		}

	}

}
