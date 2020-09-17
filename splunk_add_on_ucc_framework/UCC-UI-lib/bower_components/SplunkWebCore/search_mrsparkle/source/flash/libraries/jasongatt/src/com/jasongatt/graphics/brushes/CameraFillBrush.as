package com.jasongatt.graphics.brushes
{

	import com.jasongatt.core.ObservableProperty;
	import flash.events.Event;
	import flash.events.StatusEvent;
	import flash.media.Camera;
	import flash.media.Video;
	import flash.system.Security;
	import flash.system.SecurityPanel;

	public class CameraFillBrush extends VisualFillBrush
	{

		// Public Static Constants

		public static const AUTO:Number = NaN;

		// Private Properties

		private var _cameraIndex:ObservableProperty;

		private var _cameraName:String
		private var _camera:Camera;
		private var _video:Video;

		// Constructor

		public function CameraFillBrush(cameraIndex:Number = NaN)
		{
			this._cameraIndex = new ObservableProperty(this, "cameraIndex", Number, cameraIndex, this._updateCameraIndex);

			this._updateCameraIndex();
		}

		// Public Getters/Setters

		public function get cameraIndex() : Number
		{
			return this._cameraIndex.value;
		}
		public function set cameraIndex(value:Number) : void
		{
			this._cameraIndex.value = value;
		}

		// Private Methods

		private function _updateCameraIndex(e:Event = null) : void
		{
			var cameraIndex:Number = this._cameraIndex.value;
			if (cameraIndex < 0)
			{
				this._disposeCamera();
				return;
			}

			this._cameraName = (cameraIndex == cameraIndex) ? String(Math.floor(cameraIndex)) : null;

			this._createCamera();
		}

		private function _createCamera() : void
		{
			this._disposeCamera();

			this._camera = Camera.getCamera(this._cameraName);

			if (!this._camera)
			{
				this._disposeCamera(true);
			}
			else if (this._camera.muted)
			{
				this._camera.addEventListener(StatusEvent.STATUS, this._camera_status);
				Security.showSettings(SecurityPanel.PRIVACY);
			}
			else
			{
				this._createVideo();
			}
		}

		private function _disposeCamera(isError:Boolean = false) : void
		{
			this._disposeVideo(isError);

			if (!this._camera)
				return;

			this._camera.removeEventListener(StatusEvent.STATUS, this._camera_status);
			this._camera = null;
		}

		private function _createVideo() : void
		{
			this._disposeVideo();

			if (!this._camera)
				return;

			this._video = new Video(this._camera.width, this._camera.height);
			this._video.attachCamera(this._camera);

			super.visual = this._video;
		}

		private function _disposeVideo(isError:Boolean = false) : void
		{
			super.visual = null;
			super.bitmap = isError ? BitmapFillBrush.ERROR_BITMAP : null;

			if (!this._video)
				return;

			this._video.clear();
			this._video = null;
		}

		private function _camera_status(e:StatusEvent) : void
		{
			if (e.code == "Camera.Unmuted")
			{
				this._camera.removeEventListener(StatusEvent.STATUS, this._camera_status);
				this._createVideo();
			}
		}

	}

}
