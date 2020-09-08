package com.jasongatt.graphics.brushes
{

	import com.jasongatt.core.ObservableProperty;
	import flash.display.DisplayObject;
	import flash.display.Loader;
	import flash.events.Event;
	import flash.events.IOErrorEvent;
	import flash.net.URLRequest;

	public class MovieFillBrush extends VisualFillBrush
	{

		// Private Properties

		private var _source:ObservableProperty;

		private var _movieSource:String;
		private var _loader:Loader;
		private var _movie:DisplayObject;

		// Constructor

		public function MovieFillBrush(source:String = null)
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

			this._movieSource = this._source.value;

			if (this._movieSource)
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
				this._loader.load(new URLRequest(this._movieSource));
			}
			catch (e:Error)
			{
				this._disposeLoader(true);
			}
		}

		private function _disposeLoader(isError:Boolean = false) : void
		{
			this._disposeMovie(isError);

			if (!this._loader)
				return;

			try
			{
				this._loader.unload();
				this._loader.close();
			}
			catch (e:Error)
			{
				// an error occurs if you call close after the content is loaded
				// this is the most reliable way to ensure the connection is closed
			}

			this._loader = null;
		}

		private function _createMovie() : void
		{
			this._disposeMovie();

			if (!this._loader)
				return;

			try
			{
				this._movie = this._loader.content;
			}
			catch (e:Error)
			{
			}

			if (this._movie)
				super.visual = this._movie;
			else
				this._disposeLoader(true);
		}

		private function _disposeMovie(isError:Boolean = false) : void
		{
			super.visual = null;
			super.bitmap = isError ? BitmapFillBrush.ERROR_BITMAP : null;

			if (!this._movie)
				return;

			this._movie = null;
		}

		private function _loader_init(e:Event) : void
		{
			this._createMovie();
		}

		private function _loader_error(e:Event) : void
		{
			this._disposeLoader(true);
		}

	}

}
