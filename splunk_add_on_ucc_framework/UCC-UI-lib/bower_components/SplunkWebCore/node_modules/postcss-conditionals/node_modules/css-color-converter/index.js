var colorNames = require('color-name'),
	converter = require('color-convert')();

var Color = function (obj) {
	if (!(this instanceof Color)) return new Color(obj);

	if (typeof obj == "string") {
		var hex = /^#([0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?)$/,
			shortHex = /^#([0-9a-fA-F]{3}[0-9a-fA-F]?)$/,
			rgb = /^rgb\(\s*([0-9]+%?)\s*,\s*([0-9]+%?)\s*,\s*([0-9]+%?)\s*\)$/,
			rgba = /^rgba\(\s*([0-9]+%?)\s*,\s*([0-9]+%?)\s*,\s*([0-9]+%?)\s*,\s*([0-1]|0?\.[0-9]+)\s*\)$/,
			hsl = /^hsl\(\s*([0-9]+)\s*,\s*([0-9]+)%\s*,\s*([0-9]+)%\s*\)$/,
			hsla = /^hsla\(\s*([0-9]+)\s*,\s*([0-9]+)%\s*,\s*([0-9]+)%\s*,\s*([0-1]|0?\.[0-9]+)\s*\)$/,
			match;

		if (match = colorNames[obj]) {
			return this.fromRgb(match);
		}
		else if (match = hex.exec(obj)) {
			var rgb = [];
			for (var i = 0; i < match[1].length / 2; i++) {
				rgb[i] = parseInt(match[1].slice(i * 2, i * 2 + 2), 16);
			}
			if (rgb.length == 4) {
				rgb[3] = (rgb[3] / 255).toPrecision(1);
				return this.fromRgba(rgb);
			}
			return this.fromRgb(rgb);
		}
		else if (match = shortHex.exec(obj)) {
			var rgb = [];
			for (var i = 0; i < match[1].length; i++) {
				rgb[i] = parseInt(match[1][i] + match[1][i], 16);
			}
			if (rgb.length == 4) {
				rgb[3] = (rgb[3] / 255).toPrecision(1);
				return this.fromRgba(rgb);
			}
			return this.fromRgb(rgb);
		}
		else if (match = rgb.exec(obj)) {
			var rgb = [
				parseInt(match[1]),
				parseInt(match[2]),
				parseInt(match[3])
			];
			if (match[1].indexOf("%") > -1) rgb[0] = rgb[0]*255/100;
			if (match[2].indexOf("%") > -1) rgb[1] = rgb[1]*255/100;
			if (match[3].indexOf("%") > -1) rgb[2] = rgb[2]*255/100;

			return this.fromRgb(rgb);
		}
		else if (match = rgba.exec(obj)) {
			var rgba = [
				parseInt(match[1]),
				parseInt(match[2]),
				parseInt(match[3]),
				parseFloat(match[4])
			];
			if (match[1].indexOf("%") > -1) rgba[0] = rgba[0]*255/100;
			if (match[2].indexOf("%") > -1) rgba[1] = rgba[1]*255/100;
			if (match[3].indexOf("%") > -1) rgba[2] = rgba[2]*255/100;

			return this.fromRgba(rgba);
		}
		else if (match = hsl.exec(obj)) {
			var hsl = [
				parseInt(match[1]),
				parseInt(match[2]),
				parseInt(match[3])
			];
			return this.fromHsl(hsl);
		}
		else if (match = hsla.exec(obj)) {
			var hsla = [
				parseInt(match[1]),
				parseInt(match[2]),
				parseInt(match[3]),
				parseFloat(match[4])
			];
			return this.fromHsla(hsla);
		}
	}

	if (Array.isArray(obj)) {

		if (obj.length < 3)
			throw new Error("Insufficient number of parameters");

		this.values = [
			Math.min(parseInt(obj[0]), 255),
			Math.min(parseInt(obj[1]), 255),
			Math.min(parseInt(obj[2]), 255),
			parseFloat(obj[3] || 1)
		];
	}
};

Color.prototype = {
	fromRgba: function (vals) {
		return new Color(vals);
	},
	fromHsla: function (vals) {
		var rgb = converter.hsl(vals).rgb();
		rgb[3] = vals[3];
		return this.fromRgba(rgb);
	},
	fromRgb: function (vals) {
		vals[3] = 1;
		return this.fromRgba(vals);
	},
	fromHsl: function (vals) {
		vals[3] = 1;
		return this.fromHsla(vals);
	},

	toRgbString: function () {
		var rgb = this.values;
		if (rgb[3] === 1) return "rgb("+rgb[0]+", "+rgb[1]+", "+rgb[2]+")";
		return "rgba("+rgb[0]+", "+rgb[1]+", "+rgb[2]+", "+rgb[3]+")";
	},
	toHslString: function () {
		var hsl = converter.rgb(this.values).hsl();
		if (this.values[3] === 1) return "hsl("+hsl[0]+", "+hsl[1]+"%, "+hsl[2]+"%)";
		return "hsla("+hsl[0]+", "+hsl[1]+"%, "+hsl[2]+"%, "+this.values[3]+")";
	},
	toHexString: function () {
		var hex = "#";
		var r = this.values[0].toString(16);
		var g = this.values[1].toString(16);
		var b = this.values[2].toString(16);
		var a = parseInt(this.values[3] * 255).toString(16);
		if (r.length == 1) r = "0" + r;
		if (g.length == 1) g = "0" + g;
		if (b.length == 1) b = "0" + b;
		if (a.length == 1) a = "0" + a;
		hex += r + g + b;
		if (a !== "ff") hex += a;
		return hex;
	},
	toRgbaArray: function () {
		return this.values;
	},
	toHslaArray: function () {
		var hsla = converter.rgb(this.values).hsl();
		hsla[3] = this.values[3];
		return hsla;
	}
};


module.exports = Color;
