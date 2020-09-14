Splunk.Legend = {

    // Private Static Properties

    _numLabels: 0,
    _targetMap: {},
    _targetList: [],
    _labelMap: {},
    _labelList: [],
    _isLabelMapValid: true,
    _timeoutID: 0,
    _listeners: {},

    // Public Static Methods

    numLabels: function() {
        this._validateLabelMap();
        return this._numLabels;
    },

    register: function(id) {
        if (id == null)
            throw new Error("Parameter id must be non-null.");

        var targetData = this._getOwn(this._targetMap, id);
        if (targetData)
            return;

        targetData = { labels: null };
        this._targetMap[id] = targetData;
        this._targetList.push(targetData);
    },

    unregister: function(id) {
        var targetData = this._getOwn(this._targetMap, id);
        if (!targetData)
            return;

        for (var i = this._targetList.length - 1; i >= 0; i--)
        {
            if (this._targetList[i] === targetData)
            {
                this._targetList.splice(i, 1);
                break;
            }
        }
        delete this._targetMap[id];

        this._invalidateLabelMap();
    },

    setLabels: function(id, labels) {
        var targetData = this._getOwn(this._targetMap, id);
        if (!targetData)
            return;

        targetData.labels = labels ? labels.concat() : null;

        this._invalidateLabelMap();
    },

    getLabelIndex: function(label) {
        this._validateLabelMap();
        var index = this._getOwn(this._labelMap, label);
        if (index != null)
            return index;
        return -1;
    },

    getLabelAt: function(index) {
        this._validateLabelMap();
        index = Math.floor(index);
        if ((index >= 0) && (index < this._labelList.length))
            return this._labelList[index];
        return null;
    },

    addEventListener: function(event, closure) {
        var listeners = this._getOwn(this._listeners, event);
        if (!listeners)
            listeners = this._listeners[event] = [];

        var numListeners = listeners.length;
        for (var i = 0; i < numListeners; i++)
        {
            if (listeners[i] === closure)
                return;
        }

        listeners.push(closure);
    },

    removeEventListener: function(event, closure) {
        var listeners = this._getOwn(this._listeners, event);
        if (!listeners)
            return;

        var numListeners = listeners.length;
        for (var i = 0; i < numListeners; i++)
        {
            if (listeners[i] === closure)
            {
                listeners.splice(i, 1);
                return;
            }
        }
    },

    dispatchEvent: function(event) {
        var listeners = this._getOwn(this._listeners, event);
        if (listeners)
        {
            listeners = listeners.concat();

            var i;

            var eventParams = [];
            var numArguments = arguments.length;
            for (i = 1; i < numArguments; i++)
                eventParams.push(arguments[i]);

            var numListeners = listeners.length;
            var closure;
            for (i = 0; i < numListeners; i++)
            {
                closure = listeners[i];
                try
                {
                    closure.apply(null, eventParams);
                }
                catch (e)
                {
                }
            }
        }
    },

    // Private Static Methods

    _invalidateLabelMap: function() {
        if (!this._isLabelMapValid)
            return;

        this._isLabelMapValid = false;

        var self = this;
        var f = function() {
            self._validateLabelMap();
        };
        this._timeoutID = setTimeout(f, 0);
    },

    _validateLabelMap: function() {
        if (this._isLabelMapValid)
            return;

        this._isLabelMapValid = true;

        clearTimeout(this._timeoutID);

        this._updateLabelMap();
    },

    _updateLabelMap: function() {
        var currentLabelList = this._labelList;
        var changed = false;

        var labelMap = {};
        var labelList = [];

        var targetList = this._targetList;
        var targetListLength = targetList.length;
        var targetData;
        var targetLabels;
        var targetLabelsLength;
        var targetLabel;

        var numLabels;
        var i;
        var j;

        for (i = 0; i < targetListLength; i++)
        {
            targetData = targetList[i];
            targetLabels = targetData.labels;
            if (targetLabels)
            {
                targetLabelsLength = targetLabels.length;
                for (j = 0; j < targetLabelsLength; j++)
                {
                    targetLabel = targetLabels[j];
                    if (this._getOwn(labelMap, targetLabel) == null)
                    {
                        labelMap[targetLabel] = labelList.length;
                        labelList.push(targetLabel);
                    }
                }
            }
        }

        numLabels = labelList.length;
        if (numLabels !== currentLabelList.length)
        {
            changed = true;
        }
        else
        {
            for (i = 0; i < numLabels; i++)
            {
                if (labelList[i] !== currentLabelList[i])
                {
                    changed = true;
                    break;
                }
            }
        }

        if (changed)
        {
            this._labelMap = labelMap;
            this._labelList = labelList;
            this._numLabels = numLabels;

            this.dispatchEvent("labelIndexMapChanged");
        }
    },

    _getOwn: function(obj, key) {
        return Object.prototype.hasOwnProperty.call(obj, key) ? obj[key] : void(0);
    }

};