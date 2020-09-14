define(['underscore', 'util/time', 'splunk.i18n'], function(_, splunkTimeUtils, i18n) {

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // TimeUtils

    
    var TimeUtils = {

        SECS_PER_MIN: 60,
        SECS_PER_HOUR: 60 * 60,

        convertTimeToCategories: function(timeData, numLabelCutoff) {
            // debugging
            // un-commenting this will print the time series to console in a way that can be copy-pasted to a unit test
            // console.log('[\n' + JSON.stringify(timeData).replace(/\[|\]/g, '').split(',').join(',\n') + '\n]');

            var i, labelIndex, prettyLabelInfo, prettyLabels, prettyLabel, labelIndexes,
                // find the indexes (a list of numbers) where the labels should go
                rawLabels    = [],
                categories   = [];


            labelIndexes = this.findLabelIndexes(timeData, numLabelCutoff);

            // based on the label indexes, look up the raw labels from the original list
            _(labelIndexes).each(function(i){
                rawLabels.push(timeData[i]);
            });

            prettyLabelInfo = this.getPrettyLabelInfo(rawLabels);
            prettyLabels    = prettyLabelInfo.prettyLabels;

            // now assemble the full category list to return
            // start with a list of all blanks
            _(timeData).each(function(i){ categories.push(' ');});

            // then put the pretty labels in the right places
            _(labelIndexes).each(function(labelIndex,j){
                categories[labelIndex] = prettyLabels[j];
            });

            return ({
                categories: categories,
                rawLabels: rawLabels,
                granularity: prettyLabelInfo.granularity
            });
        },

        findLabelIndexes: function(timeData, numLabelCutoff) {
            var i, labelIndex, indexes = [];

            // if there are less data points than the cutoff, should label all points
            if(timeData.length <= numLabelCutoff) {
                i=0;
                while(i<timeData.length){
                    indexes.push(i++);
                }
                return indexes;
            }

            var pointSpan = this.getPointSpan(timeData),
                totalSpan = this.getTotalSpan(timeData);

            if(this.couldLabelFirstOfMonth(pointSpan, totalSpan)) {
                var firstIndexes = this.findFirstOfMonthIndexes(timeData);
                var indexLen = firstIndexes.length;
                if(indexLen >= 3){
                    var step = Math.ceil(indexLen / numLabelCutoff),
                        newIndexes = [];
                    for(i = 0; i < indexLen; i += step) {
                        labelIndex = firstIndexes[i];
                        newIndexes.push(labelIndex);
                    }
                    firstIndexes = newIndexes;
                    return firstIndexes;
                }

             }

            // find major unit (in number of points, not time)
            var majorUnit       = this.findMajorUnit(timeData, numLabelCutoff, pointSpan, totalSpan),
                firstMajorSlice = timeData.slice(0, majorUnit),
                roundestIndex   = this.getRoundestIndex(firstMajorSlice, majorUnit, pointSpan),
                index           = roundestIndex;

            if(this.couldLabelMidnight(majorUnit, pointSpan)){
                var midnightIndexes = this.findMidnightIndexes(timeData);
                if(midnightIndexes.length > numLabelCutoff){
                    step = Math.ceil(midnightIndexes.length / numLabelCutoff);
                    newIndexes = [];
                    for(i = 0; i < midnightIndexes.length; i += step) {
                        labelIndex = midnightIndexes[i];
                        newIndexes.push(labelIndex);
                    }
                    midnightIndexes = newIndexes;
                }
                return midnightIndexes;
            }

            if (majorUnit <= 0) {
                // This really shouldn't happen, but better to throw an error than go into an infinite loop.
                throw new Error(
                    'Error parsing timestamp information: Major unit is not a positive number.  This should not happen.'
                );
            }
            while(index < timeData.length) {
                indexes.push(index);
                index += majorUnit;
            }
            return indexes;
        },

        couldLabelMidnight: function(majorUnit, pointSpan){
            return ((majorUnit % 24 === 0) && (pointSpan === 60*60));
        },

        couldLabelFirstOfMonth: function(pointSpan, totalSpan) {
            if(pointSpan > this.MAX_SECS_PER_DAY) {
                return false;
            }
            if(pointSpan < this.SECS_PER_HOUR) {
                return false;
            }
            // prevent a user-defined span like 4003 seconds from derailing things
            if(pointSpan < this.MIN_SECS_PER_DAY && (24 * this.SECS_PER_HOUR) % pointSpan !== 0) {
                return false;
            }
            if(totalSpan < 2 * this.MIN_SECS_PER_MONTH) {
                return false;
            }
            return true;
        },

        findMidnightIndexes: function(timeData){
            var i, bdTime,
                bdTimes = [],
                midnightIndexes = [];
                for(i = 0; i < timeData.length; i++) {
                    bdTimes.push(splunkTimeUtils.extractBdTime(timeData[i]));
                }
                for(i = 0; i < bdTimes.length; i++) {
                    bdTime = bdTimes[i];
                    if((bdTime.hour === 0) && (bdTime.minute === 0)) {
                        midnightIndexes.push(i);
                    }
                }
                return midnightIndexes;
        },

        findFirstOfMonthIndexes: function(timeData) {
            var bdTimes = [],
                firstIndexes = [];

            _(timeData).each(function(dataPoint, i){
                bdTimes.push(splunkTimeUtils.extractBdTime(dataPoint));
            });
            _(bdTimes).each(function(bdTime, i){
                if(bdTime.day === 1 && bdTime.hour === 0){
                    firstIndexes.push(i);
                }
            });
            return firstIndexes;
        },

        // Always returns a positive number, even if timeData is in reverse order.
        getPointSpan: function(timeData) {
            if(timeData.length < 2) {
                return 0.001;
            }
            if(timeData.length < 4) {
                return Math.abs(this.getSpanBetween(timeData[0], timeData[1]));
            }
            var firstSpan  = Math.abs(this.getSpanBetween(timeData[0], timeData[1])),
                secondSpan = Math.abs(this.getSpanBetween(timeData[1], timeData[2])),
                thirdSpan  = Math.abs(this.getSpanBetween(timeData[2], timeData[3]));

            // sample the three spans to avoid the case where daylight savings might produce an erroneous result
            if(firstSpan === secondSpan) {
                return firstSpan;
            }
            if(secondSpan === thirdSpan) {
                return secondSpan;
            }
            if(firstSpan === thirdSpan) {
                return firstSpan;
            }
            return firstSpan;
        },

        // Always returns a positive number, even if timeData is in reverse order.
        getTotalSpan: function(timeData) {
            var i, lastPoint;
            for(i = timeData.length - 1; i >= 0; i--) {
                lastPoint = timeData[i];
                if(splunkTimeUtils.isValidIsoTime(lastPoint)) {
                    break;
                }
            }
            return Math.abs(this.getSpanBetween(timeData[0], lastPoint));
        },

        getSpanBetween: function(start, end) {
            var startDate  = splunkTimeUtils.isoToDateObject(start),
                endDate    = splunkTimeUtils.isoToDateObject(end),
                millisDiff = endDate.getTime() - startDate.getTime();

            return millisDiff / 1000;
        },

        // use a 23-hour day as a minimum to protect against daylight savings errors
        MIN_SECS_PER_DAY: 23 * 60 * 60,
        // use a 25-hour day as a maximum to protect against daylight savings errors
        MAX_SECS_PER_DAY: 25 * 60 * 60,

        MAJOR_UNITS_MILLISECONDS: [
            1 / 1000,
            2 / 1000,
            5 / 1000,
            10 / 1000,
            20 / 1000,
            50 / 1000,
            100 / 1000,
            200 / 1000,
            250 / 1000,
            500 / 1000,
            1
        ],

        MAJOR_UNITS_SECONDS: [
            1,
            2,
            5,
            10,
            15,
            30,
            60,
            2 * 60,
            3 * 60,
            5 * 60,
            10 * 60,
            15 * 60,
            30 * 60,
            60 * 60,
            2 * 60 * 60,
            4 * 60 * 60,
            6 * 60 * 60,
            12 * 60 * 60,
            24 * 60 * 60,
            48 * 60 * 60,
            96 * 60 * 60,
            168 * 60 * 60
        ],

        MAJOR_UNIT_DAYS: [
            1,
            2,
            4,
            7,
            14,
            28,
            56,
            112,
            224,
            364,
            476,
            728
        ],

        // this is ok because daylight savings is never in February
        MIN_SECS_PER_MONTH: 28 * 24 * 60 * 60,

        MAJOR_UNIT_MONTHS: [
            1,
            2,
            4,
            6,
            12,
            24,
            48,
            96
        ],

        findMajorUnit: function(timeData, numLabelCutoff, pointSpan, totalSpan) {
            var i, majorUnit, unitsPerSpan;
            if(pointSpan < 1) {
                for(i = 0; i < this.MAJOR_UNITS_MILLISECONDS.length; i++) {
                    majorUnit = this.MAJOR_UNITS_MILLISECONDS[i];
                    unitsPerSpan = totalSpan / majorUnit;
                    if(unitsPerSpan <= numLabelCutoff) {
                        return majorUnit / pointSpan;
                    }
                }
            } else if(pointSpan < this.MIN_SECS_PER_DAY) {
                for(i = 0; i < this.MAJOR_UNITS_SECONDS.length; i++) {
                    majorUnit = this.MAJOR_UNITS_SECONDS[i];
                    unitsPerSpan = totalSpan / majorUnit;
                    if((unitsPerSpan >= 3) && (unitsPerSpan <= numLabelCutoff) && (majorUnit % pointSpan === 0)) {
                        // SPL-55264, 3 minutes is included in the major units list to prevent this loop from failing to find
                        // a major unit at all, but if 5 minutes would fit it is preferred over 3 minutes
                        if(majorUnit === 3 * 60 && totalSpan >= 15 * 60) {
                            continue;
                        }
                        return majorUnit / pointSpan;
                    }
                }
            }
            else if(pointSpan < this.MIN_SECS_PER_MONTH) {
                var secsPerDay = 24 * 60 * 60,
                    dayPointSpan = Math.round(pointSpan / secsPerDay),
                    dayTotalSpan = Math.round(totalSpan / secsPerDay);

                for(i = 0; i < this.MAJOR_UNIT_DAYS.length; i++) {
                    majorUnit = this.MAJOR_UNIT_DAYS[i];
                    unitsPerSpan = dayTotalSpan / majorUnit;
                    if((unitsPerSpan >= 3) && (unitsPerSpan <= numLabelCutoff) && (majorUnit % dayPointSpan === 0)) {
                        return majorUnit / dayPointSpan;
                    }
                }
            }
            else {
                var secsPerMonth = 30 * 24 * 60 * 60,
                    monthPointSpan = Math.round(pointSpan / secsPerMonth),
                    monthTotalSpan = Math.round(totalSpan / secsPerMonth);

                for(i = 0; i < this.MAJOR_UNIT_MONTHS.length; i++) {
                    majorUnit = this.MAJOR_UNIT_MONTHS[i];
                    unitsPerSpan = monthTotalSpan / majorUnit;
                    if((unitsPerSpan >= 3) && (unitsPerSpan <= numLabelCutoff) && (majorUnit % monthPointSpan === 0)) {
                        return majorUnit / monthPointSpan;
                    }
                }
            }
            // if we exit the loop without finding a major unit, we just punt and divide the points evenly
            return Math.ceil(timeData.length / numLabelCutoff);
        },

        getRoundestIndex: function(timeData, majorUnit, pointSpan) {
            var i, roundest, roundestIndex,
                bdTimes = [],
                secsMajorUnit = majorUnit * pointSpan;

            _(timeData).each(function(label){
                bdTimes.push(splunkTimeUtils.extractBdTime(label));
            });

            roundest = bdTimes[0];
            roundestIndex = 0;
            for(i = 1; i < bdTimes.length; i++) {
                if(this.isRounderThan(bdTimes[i], roundest, pointSpan) && this.bdTimeMatchesUnit(bdTimes[i], secsMajorUnit)) {
                    roundest = bdTimes[i];
                    roundestIndex = i;
                }
            }
            return roundestIndex;
        },

        isRounderThan: function(first, second, pointSpan) {
            if(first.month === 1 && first.day === 1 && first.hour === 0
                    && second.month !== 1 && second.day === 1 && second.hour === 0) {
                return true;
            }

            if(first.hour === 0 && second.hour !== 0) {
                return true;
            }
            if(first.hour % 12 === 0 && second.hour % 12 !== 0) {
                return true;
            }
            if(first.hour % 6 === 0 && second.hour % 6 !== 0) {
                return true;
            }
            if(first.hour % 4 === 0 && second.hour % 4 !== 0) {
                return true;
            }
            if(first.hour % 2 === 0 && second.hour % 2 !== 0) {
                return true;
            }

            if(first.minute === 0 && second.minute !== 0) {
                return true;
            }
            if(first.minute % 30 === 0 && second.minute % 30 !== 0) {
                return true;
            }
            if(first.minute % 15 === 0 && second.minute % 15 !== 0) {
                return true;
            }
            if(first.minute % 10 === 0 && second.minute % 10 !== 0) {
                return true;
            }
            if(first.minute % 5 === 0 && second.minute % 5 !== 0) {
                return true;
            }
            if(first.minute % 2 === 0 && second.minute % 2 !== 0) {
                return true;
            }

            if(first.second === 0 && second.second !== 0) {
                return true;
            }
            if(first.second % 30 === 0 && second.second % 30 !== 0) {
                return true;
            }
            if(first.second % 15 === 0 && second.second % 15 !== 0) {
                return true;
            }
            if(first.second % 10 === 0 && second.second % 10 !== 0) {
                return true;
            }
            if(first.second % 5 === 0 && second.second % 5 !== 0) {
                return true;
            }
            if(first.second % 2 === 0 && second.second % 2 !== 0) {
                return true;
            }
            if(first.millisecond % 500 === 0 && second.millisecond % 500 !== 0) {
                return true;
            }
            if(first.millisecond % 250 === 0 && second.millisecond % 250 !== 0) {
                return true;
            }
            if(first.millisecond % 100 === 0 && second.millisecond % 100 !== 0) {
                return true;
            }
            if(first.millisecond % 50 === 0 && second.millisecond % 50 !== 0) {
                return true;
            }
            if(first.millisecond % 50 === 0 && second.millisecond % 50 !== 0) {
                return true;
            }
            if(first.millisecond % 25 === 0 && second.millisecond % 25 !== 0) {
                return true;
            }
            if(first.millisecond % 10 === 0 && second.millisecond % 10 !== 0) {
                return true;
            }
            if(first.millisecond % 5 === 0 && second.millisecond % 5 !== 0) {
                return true;
            }
            if(first.millisecond % 2 === 0 && second.millisecond % 2 !== 0) {
                return true;
            }
            return false;
        },

        bdTimeMatchesUnit: function(bdTime, secsMajor) {
            if(secsMajor < 1) {
                return (bdTime.millisecond % (secsMajor * 1000) === 0);
            }
            if(secsMajor < 60) {
                return (bdTime.second % secsMajor === 0);
            }
            if(secsMajor < 60 * 60) {
                var minutes = Math.floor(secsMajor / 60);
                return (bdTime.minute % minutes === 0);
            }
            else {
                var hours = Math.floor(secsMajor / (60 * 60));
                return (bdTime.hour % hours === 0);
            }
            return true;
        },

        getPrettyLabelInfo: function(rawLabels) {
            var i, prettyLabel,
                bdTimes = [],
                prettyLabels = [];

            _(rawLabels).each(function(label){
                bdTimes.push(splunkTimeUtils.extractBdTime(label));
            });
            var granularity = splunkTimeUtils.determineLabelGranularity(bdTimes);
            for(i = 0; i < bdTimes.length; i++) {
                if(i === 0) {
                    prettyLabel = this.formatBdTimeAsAxisLabel(bdTimes[i], null, granularity);
                }
                else {
                    prettyLabel = this.formatBdTimeAsAxisLabel(bdTimes[i], bdTimes[i - 1], granularity);
                }

                if(prettyLabel) {
                    prettyLabels.push(prettyLabel.join('<br/>'));
                }
                else {
                    prettyLabels.push("");
                }
            }

            return {
                prettyLabels: prettyLabels,
                granularity: granularity
            };
        },

        formatBdTimeAsAxisLabel: function(time, prevBdTime, granularity) {
            if(time.isInvalid) {
                return null;
            }
            var dateTime     = splunkTimeUtils.bdTimeToDateObject(time),
                showDay      = (granularity in { 'millisecond': true, 'second': true, 'minute': true, 'hour': true, 'day': true }),
                showTimes    = (granularity in { 'millisecond': true, 'second': true, 'minute': true, 'hour': true}),
                showSeconds  = (granularity in { 'millisecond': true, 'second': true }),
                showMillis   = (granularity === 'millisecond'),
                timeFormat   = (showSeconds) ? 'medium' : 'short',
                dateFormat   = (showDay) ? 'ccc MMM d' : 'MMMM',

                formatTime = function(dt, format) {
                    if(showMillis) {
                        return i18n.format_time_microseconds(dt, format);
                    }
                    return i18n.format_time(dt, format);
                };

            if(granularity === 'year') {
                return [i18n.format_date(dateTime, 'YYYY')];
            }
            if(prevBdTime && prevBdTime.year === time.year && time.month === prevBdTime.month && time.day === prevBdTime.day) {
                return [formatTime(dateTime, timeFormat)];
            }
            var formattedPieces =  (showTimes) ?
                [formatTime(dateTime, timeFormat), i18n.format_date(dateTime, dateFormat)] :
                [i18n.format_date(dateTime, dateFormat)];

            if(!prevBdTime || time.year !== prevBdTime.year) {
                formattedPieces.push(i18n.format_date(dateTime, 'YYYY'));
            }
            return formattedPieces;
        },

        // returns null if string cannot be parsed
        formatIsoStringAsTooltip: function(isoString, pointSpan) {
            var bdTime = splunkTimeUtils.extractBdTime(isoString),
                dateObject;

            if(bdTime.isInvalid) {
                return null;
            }
            dateObject = splunkTimeUtils.bdTimeToDateObject(bdTime);

            if(pointSpan >= this.MIN_SECS_PER_DAY) { // day or larger
                return i18n.format_date(dateObject);
            }
            if(pointSpan >= this.SECS_PER_MIN) { // minute or longer
                return i18n.format_datetime(dateObject, 'medium', 'short');
            }
            if(pointSpan >= 1) { // second or longer
                return i18n.format_datetime(dateObject);
            }
            return i18n.format_datetime_microseconds(dateObject, 'medium');
        }
    };

	return TimeUtils;

});
