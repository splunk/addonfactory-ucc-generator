/* version 0.1: http://dren.ch/ */

Number.prototype.pad =
	function (n,p) {
		var s = '' + this;
		p = p || '0';
		while (s.length < n) s = p + s;
		return s;
	};

Date.prototype.months = [
		'January', 'February', 'March', 'April', 'May', 'June', 'July',
		'August', 'September', 'October', 'November', 'December'
	];
Date.prototype.weekdays = [
		'Sunday', 'Monday', 'Tuesday', 'Wednesday',
		'Thursday', 'Friday', 'Saturday'
	];
Date.prototype.dpm = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

Date.prototype.strftime_f = {
		A: function (d) { return d.weekdays[d.getDay()] },
		a: function (d) { return d.weekdays[d.getDay()].substring(0,3) },
		B: function (d) { return d.months[d.getMonth()] },
		b: function (d) { return d.months[d.getMonth()].substring(0,3) },
		C: function (d) { return Math.floor(d.getFullYear()/100); },
		c: function (d) { return d.toString() },
		D: function (d) {
				return d.strftime_f.m(d) + '/' +
					d.strftime_f.d(d) + '/' + d.strftime_f.y(d);
			},
		d: function (d) { return d.getDate().pad(2,'0') },
		e: function (d) { return d.getDate()},
		F: function (d) {
				return d.strftime_f.Y(d) + '-' + d.strftime_f.m(d) + '-' +
					d.strftime_f.d(d);
			},
		H: function (d) { return d.getHours().pad(2,'0') },
		I: function (d) { return ((d.getHours() % 12 || 12).pad(2)) },
		j: function (d) {
				var t = d.getDate();
				var m = d.getMonth() - 1;
				if (m > 1) {
					var y = d.getYear();
					if (((y % 100) == 0) && ((y % 400) == 0)) ++t;
					else if ((y % 4) == 0) ++t;
				}
				while (m > -1) t += d.dpm[m--];
				return t.pad(3,'0');
			},
		k: function (d) { return d.getHours().pad(2,' ') },
		l: function (d) { return ((d.getHours() % 12 || 12)) },
		M: function (d) { return d.getMinutes().pad(2,'0') },
		m: function (d) { return (d.getMonth()+1).pad(2,'0') },
		n: function (d) { return "\n" },
		p: function (d) { return (d.getHours() > 11) ? 'PM' : 'AM' },
		
		Q: function (d) { return (d.getMilliseconds()==0) ? "000" : d.getMilliseconds().pad(3,'0')},
		
		R: function (d) { return d.strftime_f.H(d) + ':' + d.strftime_f.M(d) },
		r: function (d) {
				return d.strftime_f.I(d) + ':' + d.strftime_f.M(d) + ':' +
					d.strftime_f.S(d) + ' ' + d.strftime_f.p(d);
			},
		S: function (d) { return d.getSeconds().pad(2,'0') },
		s: function (d) { return Math.floor(d.getTime()/1000) },
		T: function (d) {
				return d.strftime_f.H(d) + ':' + d.strftime_f.M(d) + ':' +
					d.strftime_f.S(d);
			},
		t: function (d) { return "\t" },
/*		U: function (d) { return false }, */
		u: function (d) { return(d.getDay() || 7) },
/*		V: function (d) { return false }, */
		v: function (d) {
				return d.strftime_f.e(d) + '-' + d.strftime_f.b(d) + '-' +
					d.strftime_f.Y(d);
			},
/*		W: function (d) { return false }, */
		w: function (d) { return d.getDay() },
		X: function (d) { return d.toTimeString() }, // wrong?
		x: function (d) { return d.toDateString() }, // wrong?
		Y: function (d) { return d.getFullYear() },
		y: function (d) { return (d.getYear() % 100).pad(2) },
		z: function (d) { return '' }, // don't support time offset rendering
		Z: function (d) { return '' }, // don't support time offset rendering
		'%': function (d) { return '%' }
	};

Date.prototype.strftime_f['+'] = Date.prototype.strftime_f.c;
Date.prototype.strftime_f.h = Date.prototype.strftime_f.b;


Date.prototype.strftime = // revised 1/23/08 jthane for performance
	function (fmt) {
    var rv;
    if (rv = this[fmt]) return rv;  // caching reduces avg. time from .32ms to .06ms for typical actions
    
		var r = []; // '';
		var n = 0;
		while(n < fmt.length) {
			var c = fmt.charAt(n);
			if (c == '%') {
				c = fmt.charAt(++n);
				r.push((this.strftime_f[c]) ? this.strftime_f[c](this) : c);
			} else r.push(c);
			++n;
		}
    return this[fmt] = r.join('');
	};