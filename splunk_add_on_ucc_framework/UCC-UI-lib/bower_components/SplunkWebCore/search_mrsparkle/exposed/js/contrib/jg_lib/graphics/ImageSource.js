/*!
 * Copyright (c) 2007-2016 Jason Gatt
 * 
 * Released under the MIT license:
 * http://opensource.org/licenses/MIT
 */
define(function(require, exports, module)
{

	var Class = require("../Class");
	var ErrorEventData = require("../events/ErrorEventData");
	var Event = require("../events/Event");
	var EventData = require("../events/EventData");
	var MEventTarget = require("../events/MEventTarget");
	var MObservableTarget = require("../events/MObservableTarget");
	var MPropertyTarget = require("../properties/MPropertyTarget");
	var ObservableProperty = require("../properties/ObservableProperty");
	var FunctionUtil = require("../utils/FunctionUtil");
	var Global = require("../utils/Global");
	var URL = require("../utils/URL");

	return Class(module.id, Object, function(ImageSource, base)
	{

		Class.mixin(this, MEventTarget, MObservableTarget, MPropertyTarget);

		// Public Static Methods

		ImageSource.load = function(resourceName, parentRequire, onLoad, config)
		{
			if (config.isBuild)
			{
				onLoad();
				return;
			}

			var url = new URL(parentRequire.toUrl(resourceName)).toString();
			var imageSource = new ImageSource(null, true);
			imageSource.on(imageSource.loaded, function(e)
			{
				onLoad(imageSource);
			});
			imageSource.on(imageSource.error, function(e)
			{
				onLoad.error(e.error);
			});
			imageSource.set(imageSource.url, url);
		};

		ImageSource.fromString = function(str)
		{
			return new ImageSource(str);
		};

		// Public Events

		this.loaded = new Event("loaded", EventData);
		this.unloaded = new Event("unloaded", EventData);
		this.error = new Event("error", ErrorEventData);

		// Public Properties

		this.url = new ObservableProperty("url", String, null)
			.writeFilter(function(value)
			{
				if (this._readOnly && this._image)
					throw new Error("ImageSource \"" + this.getInternal(this.url) + "\" is read-only.");

				return value;
			})
			.onChange(function(e)
			{
				if (e.oldValue)
					this._unload();
				if (e.newValue)
					this._load(e.newValue);
			});

		// Private Properties

		this._image = null;
		this._width = 0;
		this._height = 0;
		this._readOnly = false;
		this._isLoaded = false;

		// Constructor

		this.constructor = function(url, readOnly)
		{
			this._readOnly = (readOnly === true);

			if (url != null)
				this.set(this.url, url);
		};

		// Public Accessor Methods

		this.width = function()
		{
			return this._width;
		};

		this.height = function()
		{
			return this._height;
		};

		this.readOnly = function()
		{
			return this._readOnly;
		};

		this.isLoaded = function()
		{
			return this._isLoaded;
		};

		// Public Methods

		this.toRaw = function(copy)
		{
			if (!this._isLoaded)
				return null;

			if (copy === false)
				return this._image;

			var raw = new Global.Image();
			raw.src = this._image.src;
			return raw;
		};

		this.toString = function()
		{
			return this.getInternal(this.url) || "";
		};

		// Private Methods

		this._load = function(url)
		{
			try
			{
				var image = this._image = new Global.Image();
				image.onload = FunctionUtil.bind(this._onLoaded, this);
				image.onerror = FunctionUtil.bind(this._onError, this, url);
				image.src = url;
			}
			catch (e)
			{
				this._onError(url);
			}
		};

		this._unload = function()
		{
			var image = this._image;
			if (!image)
				return;

			image.onerror = null;
			image.onload = null;
			if (image.removeAttribute)
				image.removeAttribute("src");

			this._image = null;

			if (!this._isLoaded)
				return;

			this._width = 0;
			this._height = 0;
			this._isLoaded = false;

			this.fire(this.unloaded);
		};

		this._onLoaded = function()
		{
			var image = this._image;
			image.onload = null;
			image.onerror = null;

			this._width = image.width;
			this._height = image.height;
			this._isLoaded = true;

			this.fire(this.change);
			if (this._image === image)
				this.fire(this.loaded);
		};

		this._onError = function(url)
		{
			this._unload();

			this.fire(this.error, new ErrorEventData("Failed to load image \"" + url + "\"."));
		};

	});

});
