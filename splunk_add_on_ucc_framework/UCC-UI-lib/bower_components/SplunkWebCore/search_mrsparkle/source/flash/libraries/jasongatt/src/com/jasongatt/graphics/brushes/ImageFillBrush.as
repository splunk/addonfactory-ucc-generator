package com.jasongatt.graphics.brushes
{

	import com.jasongatt.core.ObservableProperty;
	import flash.display.Bitmap;
	import flash.display.BitmapData;
	import flash.display.Loader;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.net.URLRequest;

	public class ImageFillBrush extends BitmapFillBrush
	{

		// Private Properties

		private var _source:ObservableProperty;

		private var _imageSource:String;
		private var _loader:Loader;
		private var _image:BitmapData;

		// Constructor

		public function ImageFillBrush(source:String = null)
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
			this._disposeLoader();

			this._imageSource = this._source.value;

			if (this._imageSource)
				this._createLoader();
		}

		private function _createLoader() : void
		{
			this._disposeLoader();

			this._loader = new Loader();
			this._loader.contentLoaderInfo.addEventListener(Event.INIT, this._loader_init);
			this._loader.contentLoaderInfo.addEventListener(IOErrorEvent.IO_ERROR, this._loader_error);

			try
			{
				this._loader.load(new URLRequest(this._imageSource));
			}
			catch (e:Error)
			{
				this._disposeLoader(true);
			}
		}

		private function _disposeLoader(isError:Boolean = false) : void
		{
			this._disposeImage(isError);

			if (!this._loader)
				return;

			try
			{
				this._loader.close();
			}
			catch (e:Error)
			{
				// an error occurs if you call close after the content is loaded
				// this is the most reliable way to ensure the connection is closed
			}

			this._loader = null;
		}

		private function _createImage() : void
		{
			this._disposeImage();

			if (!this._loader)
				return;

			var bitmap:Bitmap;
			try
			{
				bitmap = this._loader.content as Bitmap;
			}
			catch (e:Error)
			{
			}

			if (bitmap)
			{
				this._image = bitmap.bitmapData;
				super.bitmap = this._image;
			}
			else
			{
				this._disposeLoader(true);
			}
		}

		private function _disposeImage(isError:Boolean = false) : void
		{
			super.bitmap = isError ? BitmapFillBrush.ERROR_BITMAP : null;

			if (!this._image)
				return;

			this._image.dispose();
			this._image = null;
		}

		private function _loader_init(e:Event) : void
		{
			this._createImage();
		}

		private function _loader_error(e:Event) : void
		{
			this._disposeLoader(true);
		}

	}

}
