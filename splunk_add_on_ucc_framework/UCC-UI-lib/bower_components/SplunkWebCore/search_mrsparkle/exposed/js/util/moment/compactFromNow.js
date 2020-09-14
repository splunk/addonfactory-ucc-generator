define(['util/moment'], function(moment) {
    var round = Math.round;
    function formatCompactRelativeTime(milliseconds, withoutSuffix, lang) {
        var seconds = round(Math.abs(milliseconds) / 1000),
                minutes = round(seconds / 60),
                hours = round(minutes / 60),
                days = round(hours / 24),
                years = round(days / 365),
                args = (seconds < 45 && ['s', seconds]) ||
                        (minutes === 1 && ['m']) ||
                        (minutes < 45 && ['mm', minutes]) ||
                        (hours === 1 && ['h']) ||
                        (hours < 22 && ['hh', hours]) ||
                        (days === 1 && ['d']) ||
                        (days <= 25 && ['dd', days]) ||
                        (days <= 45 && ['M']) ||
                        (days < 345 && ['MM', round(days / 30)]) ||
                        (years === 1 && ['y']) || ['yy', years];

        var string = args[0], number = args[1] || 1, isFuture = milliseconds > 0,
                output = (lang._compactRelativeTime || {})[string];
        if(output === undefined) {
            return lang.relativeTime(number, !!withoutSuffix, string, isFuture);
        }
        return (typeof output === 'function') ?
                output(number, withoutSuffix, string, isFuture) :
                output.replace(/%d/i, number);
    }

    moment.duration.fn.humanizeCompact = function(withSuffix) {
        var diff = +this, out = formatCompactRelativeTime(diff, !withSuffix, this.localeData());
        if(withSuffix) {
            out = this.localeData().pastFuture(diff, out);
        }
        return this.localeData().postformat(out);
    };

    moment.fn.compactFromNow = function(noSuffix) {
        return moment.duration(this.diff(moment())).locale(this.localeData()._abbr).humanizeCompact(!noSuffix);
    };

    return moment;

});
