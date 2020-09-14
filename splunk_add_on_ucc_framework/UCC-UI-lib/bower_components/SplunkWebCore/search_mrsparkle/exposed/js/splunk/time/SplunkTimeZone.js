define(function(require, exports, module) {

    var Class = require("jg/Class");
    var ArrayUtil = require("jg/utils/ArrayUtil");
    var TimeZone = require("splunk/time/TimeZone");

    return Class(module.id, TimeZone, function(SplunkTimeZone, base) {

        // Private Properties

        this._standardOffset = 0;
        this._serializedTimeZone = null;

        this._isConstant = false;
        this._offsetList = null;
        this._timeList = null;
        this._indexList = null;

        // Constructor

        this.constructor = function(serializedTimeZone) {
            if (serializedTimeZone == null) {
                throw new Error("Parameter serializedTimeZone must be non-null.");
            }
            if (!Class.isString(serializedTimeZone)) {
                throw new Error("Parameter serializedTimeZone must be of type String.");
            }

            this._serializedTimeZone = serializedTimeZone;

            this._offsetList = [];
            this._timeList = [];
            this._indexList = [];

            this._parseSerializedTimeZone(serializedTimeZone);
        };

        // Public Methods

        this.getSerializedTimeZone = function() {
            return this._serializedTimeZone;
        };

        this.getStandardOffset = function() {
            return this._standardOffset;
        };

        this.getOffset = function(time) {
            if (this._isConstant) {
                return this._standardOffset;
            }

            var offsetList = this._offsetList;
            var numOffsets = offsetList.length;
            if (numOffsets == 0) {
                return 0;
            }

            if (numOffsets == 1) {
                return offsetList[0];
            }

            var timeList = this._timeList;
            var numTimes = timeList.length;
            if (numTimes == 0) {
                return 0;
            }

            var timeIndex;
            if (numTimes == 1) {
                timeIndex = 0;
            } else {
                timeIndex = ArrayUtil.binarySearch(timeList, time);
                if (timeIndex < -1) {
                    timeIndex = -timeIndex - 2;
                } else if (timeIndex == -1) {
                    timeIndex = 0;
                }
            }

            var offsetIndex = this._indexList[timeIndex];
            return offsetList[offsetIndex];
        };

        // Private Methods

        this._parseSerializedTimeZone = function(serializedTimeZone) {
            // ### SERIALIZED TIMEZONE FORMAT 1.0
            // Y-25200 YW 50 44 54
            // Y-28800 NW 50 53 54
            // Y-25200 YW 50 57 54
            // Y-25200 YG 50 50 54
            // @-1633269600 0
            // @-1615129200 1
            // @-1601820000 0
            // @-1583679600 1

            // ### SERIALIZED TIMEZONE FORMAT 1.0
            // C0
            // Y0 NW 47 4D 54

            if (!serializedTimeZone) {
                return;
            }

            var entries = serializedTimeZone.split(";");
            var entry;
            for (var i = 0, l = entries.length; i < l; i++) {
                entry = entries[i];
                if (entry) {
                    switch (entry.charAt(0)) {
                        case "C":
                            if (this._parseC(entry.substring(1, entry.length))) {
                                return;
                            }
                            break;
                        case "Y":
                            this._parseY(entry.substring(1, entry.length));
                            break;
                        case "@":
                            this._parseAt(entry.substring(1, entry.length));
                            break;
                    }
                }
            }

            this._standardOffset = this.getOffset(0);
        };

        this._parseC = function(entry) {
            // 0

            if (!entry) {
                return false;
            }

            var time = Number(entry);
            if (isNaN(time)) {
                return false;
            }

            this._standardOffset = time;
            this._isConstant = true;

            return true;
        };

        this._parseY = function(entry) {
            // -25200 YW 50 44 54

            if (!entry) {
                return;
            }

            var elements = entry.split(" ");
            if (elements.length < 1) {
                return;
            }

            var element = elements[0];
            if (!element) {
                return;
            }

            var offset = Number(element);
            if (isNaN(offset)) {
                return;
            }

            this._offsetList.push(offset);
        };

        this._parseAt = function(entry) {
            // -1633269600 0

            if (!entry) {
                return;
            }

            var elements = entry.split(" ");
            if (elements.length < 2) {
                return;
            }

            var element = elements[0];
            if (!element) {
                return;
            }

            var time = Number(element);
            if (isNaN(time)) {
                return;
            }

            element = elements[1];
            if (!element) {
                return;
            }

            var index = Number(element);
            if (isNaN(index)) {
                return;
            }

            index = Math.floor(index);
            if ((index < 0) || (index >= this._offsetList.length)) {
                return;
            }

            this._timeList.push(time);
            this._indexList.push(index);
        };

    });

});
