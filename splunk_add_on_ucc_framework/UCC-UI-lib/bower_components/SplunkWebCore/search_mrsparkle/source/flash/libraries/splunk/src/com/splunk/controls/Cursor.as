package com.splunk.controls
{

	import flash.display.DisplayObject;
	import flash.display.Sprite;
	import flash.display.Stage;
	import flash.display.StageDisplayState;
	import flash.events.Event;
	import flash.events.MouseEvent;
	import flash.geom.Point;
	import flash.ui.Mouse;

	public class Cursor extends Sprite
	{
/*
add listener to stage leave event and hide/show cursor
add listener for observable ICursor for cursor change
should probably make the updateCursor method handle all changes to current ICursor
maybe we shouldn't handle case where ICursor.cursor becomes null since we would
also have to handle the opposite (when lower children become non-null)
this would require listening to the entire chain of ICursors
*/
		// Private Properties

		private var _stage:Stage;
		private var _cursor:DisplayObject;

		// Constructor

		public function Cursor()
		{
			super.mouseEnabled = false;
			super.mouseChildren = false;
			super.tabEnabled = false;
			super.tabChildren = false;

			this.addEventListener(Event.ADDED_TO_STAGE, this._self_addedToStage, false, int.MAX_VALUE);
			this.addEventListener(Event.REMOVED_FROM_STAGE, this._self_removedFromStage, false, int.MAX_VALUE);
		}

		// Public Getters/Setters

		public override function set mouseEnabled(value:Boolean) : void
		{
			// READ-ONLY
		}

		public override function set mouseChildren(value:Boolean) : void
		{
			// READ-ONLY
		}

		public override function set tabEnabled(value:Boolean) : void
		{
			// READ-ONLY
		}

		public override function set tabChildren(value:Boolean) : void
		{
			// READ-ONLY
		}

		// Private Methods

		private function _trySetCursor(target:DisplayObject) : Boolean
		{
			var targetCursor:ICursor;
			while (target && !(target is Stage))
			{
				targetCursor = target as ICursor;
				if (targetCursor && targetCursor.cursor)
				{
					this._setCursor(targetCursor.cursor);
					return true;
				}
				target = target.parent;
			}

			this._setCursor(null);
			return false;
		}

		private function _setCursor(cursor:DisplayObject) : void
		{
			if (cursor == this._cursor)
				return;

			if (this._cursor)
			{
				if (this._cursor.parent == this)
					this.removeChild(this._cursor);

				if (this._stage)
					this._stage.removeEventListener(MouseEvent.MOUSE_MOVE, this._stage_mouseMove);

				Mouse.show();
			}

			this._cursor = cursor;

			if (this._cursor)
			{
				this.addChild(this._cursor);

				if (this._stage)
					this._stage.addEventListener(MouseEvent.MOUSE_MOVE, this._stage_mouseMove, false, int.MAX_VALUE);

				Mouse.hide();
			}
		}

		private function _updateCursor(mousePosition:Point) : void
		{
			var cursor:DisplayObject = this._cursor;
			if (!cursor)
				return;

			mousePosition = this.globalToLocal(mousePosition);

			cursor.x = mousePosition.x;
			cursor.y = mousePosition.y;
		}

		private function _self_addedToStage(e:Event) : void
		{
			var stage:Stage = this.stage;
			if (!stage)
				return;

			this._stage = stage;

			stage.addEventListener(MouseEvent.MOUSE_OVER, this._stage_mouseOver, false, int.MAX_VALUE);
			stage.addEventListener(MouseEvent.MOUSE_OUT, this._stage_mouseOut, false, int.MAX_VALUE);
			stage.addEventListener(MouseEvent.MOUSE_UP, this._stage_mouseUp, false, int.MAX_VALUE);
		}

		private function _self_removedFromStage(e:Event) : void
		{
			this._setCursor(null);

			var stage:Stage = this._stage;
			if (!stage)
				return;

			this._stage = null;

			stage.removeEventListener(MouseEvent.MOUSE_OVER, this._stage_mouseOver);
			stage.removeEventListener(MouseEvent.MOUSE_OUT, this._stage_mouseOut);
			stage.removeEventListener(MouseEvent.MOUSE_UP, this._stage_mouseUp);
		}

		private function _stage_mouseOver(e:MouseEvent) : void
		{
			if (e.buttonDown)
				return;

			if (this._trySetCursor(e.target as DisplayObject))
				this._updateCursor(new Point(e.stageX, e.stageY));
		}

		private function _stage_mouseOut(e:MouseEvent) : void
		{
			if (e.buttonDown)
				return;

			if (this._trySetCursor(e.relatedObject as DisplayObject))
				this._updateCursor(new Point(e.stageX, e.stageY));
		}

		private function _stage_mouseUp(e:MouseEvent) : void
		{
			if (this._trySetCursor(e.target as DisplayObject))
				this._updateCursor(new Point(e.stageX, e.stageY));
		}

		private function _stage_mouseMove(e:MouseEvent) : void
		{
			this._updateCursor(new Point(e.stageX, e.stageY));

			// FlashPayer bug: MouseEvent.updateAfterEvent SLOW when fullscreen
			var stage:Stage = this._stage;
			if (stage && (stage.displayState != StageDisplayState.FULL_SCREEN))
				e.updateAfterEvent();
		}

	}

}
