package com.jasongatt.graphics.brushes
{

	import com.jasongatt.core.ObservableProperty;
	import flash.events.AsyncErrorEvent;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.events.NetStatusEvent;
	import flash.events.SecurityErrorEvent;
	import flash.media.Video;
	import flash.net.NetConnection;
	import flash.net.NetStream;

	public class VideoFillBrush extends VisualFillBrush
	{

		// Private Properties

		private var _source:ObservableProperty;

		private var _videoSource:String;
		private var _connection:NetConnection;
		private var _stream:NetStream;
		private var _video:Video;

		// Constructor

		public function VideoFillBrush(source:String = null)
		{
			this._source = new ObservableProperty(this, "source", String, source, this._updateSource);

			this._updateSource();
		}

		// Public Getters/Setters

		public function get source() : String
		{
			return this._source.value;
		}
		public function set source(value:String) : void
		{
			this._source.value = value;
		}

		// Private Methods

		private function _updateSource(e:Event = null) : void
		{
			this._disposeConnection();

			this._videoSource = this._source.value;

			if (this._videoSource)
				this._createConnection();
		}

		private function _createConnection() : void
		{
			this._disposeConnection();

			this._connection = new NetConnection();
			this._connection.addEventListener(NetStatusEvent.NET_STATUS, this._connection_netStatus);
			this._connection.addEventListener(AsyncErrorEvent.ASYNC_ERROR, this._ignore_error);
			this._connection.addEventListener(IOErrorEvent.IO_ERROR, this._connection_error);
			this._connection.addEventListener(SecurityErrorEvent.SECURITY_ERROR, this._connection_error);

			try
			{
				this._connection.connect(null);
			}
			catch (e:Error)
			{
				this._disposeConnection(true);
			}
		}

		private function _disposeConnection(isError:Boolean = false) : void
		{
			this._disposeStream(isError);

			if (!this._connection)
				return;

			this._connection.close();
			this._connection = null;
		}

		private function _createStream() : void
		{
			this._disposeStream();

			if (!this._connection)
				return;

			this._stream = new NetStream(this._connection);
			this._stream.addEventListener(NetStatusEvent.NET_STATUS, this._stream_netStatus);
			this._stream.addEventListener(AsyncErrorEvent.ASYNC_ERROR, this._ignore_error);
			this._stream.addEventListener(IOErrorEvent.IO_ERROR, this._stream_error);

			try
			{
				this._stream.play(this._videoSource);
			}
			catch (e:Error)
			{
				this._disposeConnection(true);
			}
		}

		private function _disposeStream(isError:Boolean = false) : void
		{
			this._disposeVideo(isError);

			if (!this._stream)
				return;

			this._stream.close();
			this._stream = null;
		}

		private function _createVideo() : void
		{
			this._disposeVideo();

			if (!this._stream)
				return;

			this._video = new Video();
			this._video.attachNetStream(this._stream);
			this._video.addEventListener(Event.ENTER_FRAME, this._video_enterFrame);

			super.visual = this._video;
		}

		private function _disposeVideo(isError:Boolean = false) : void
		{
			super.visual = null;
			super.bitmap = isError ? BitmapFillBrush.ERROR_BITMAP : null;

			if (!this._video)
				return;

			this._video.removeEventListener(Event.ENTER_FRAME, this._video_enterFrame);
			this._video.clear();
			this._video = null;
		}

		private function _connection_netStatus(e:NetStatusEvent) : void
		{
			switch (e.info.code)
			{
				case "NetConnection.Connect.Success":
					this._createStream();
					break;
				case "NetStream.Play.StreamNotFound":
					this._disposeConnection(true);
					break;
			}
		}

		private function _connection_error(e:Event) : void
		{
			this._disposeConnection(true);
		}

		private function _stream_netStatus(e:NetStatusEvent) : void
		{
			switch (e.info.code)
			{
				case "NetStream.Play.Start":
					if (!this._video)
						this._createVideo();
					break;
				case "NetStream.Play.Stop":
					this._stream.seek(0);
					break;
				case "NetStream.Play.StreamNotFound":
					this._disposeConnection(true);
					break;
			}
		}

		private function _stream_error(e:Event) : void
		{
			this._disposeConnection(true);
		}

		private function _video_enterFrame(e:Event) : void
		{
			var videoWidth:Number = this._video.videoWidth;
			var videoHeight:Number = this._video.videoHeight;
			if ((videoWidth > 0) && (videoHeight > 0))
			{
				this._video.removeEventListener(Event.ENTER_FRAME, this._video_enterFrame);
				this._video.width = videoWidth;
				this._video.height = videoHeight;
			}
		}

		private function _ignore_error(e:Event) : void
		{
		}

	}

}
