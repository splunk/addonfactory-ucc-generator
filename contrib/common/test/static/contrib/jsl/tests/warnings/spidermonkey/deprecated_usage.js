/*jsl:option explicit*/
function deprecated_usage() {
    /* illegal - getter/setter is deprecated */

    Array.bogon getter = function () { /*warning:deprecated_usage*/
        return "";
    };
    Array.bogon setter = function (o) { /*warning:deprecated_usage*/
        this.push(o);
    };
}
