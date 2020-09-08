define(['underscore', 'splunk.util', './color_utils'], function(_, splunkUtils, colorUtils) {

    // normalize a boolean, a default state can optionally be defined for when the value is undefined
    var normalizeBoolean = function(value, defaultState) {
        if(_(value).isUndefined()) {
            return !!defaultState;
        }
        return splunkUtils.normalizeBoolean(value);
    };

    // translates a JSON-style serialized map in to a primitive object
    // cannot handle nested objects
    // value strings should be un-quoted or double-quoted and will be stripped of leading/trailing whitespace
    // will not cast to numbers or booleans
    var stringToObject = function(str) {
        if(!str) {
            return false;
        }
        var i, propList, loopKv, loopKey,
            map = {};

        str = trimWhitespace(str);
        var strLen = str.length;
        if(str.charAt(0) !== '{' || str.charAt(strLen - 1) !== '}') {
            return false;
        }

        if(/^\{\s*\}$/.test(str)) {
            return {};
        }
        str = str.substr(1, strLen - 2);
        propList = escapeSafeSplit(str, ',');
        for(i = 0; i < propList.length; i++) {
            loopKv = escapeSafeSplit(propList[i], ':');
            loopKey = trimWhitespace(loopKv[0]);
            if(loopKey[0] === '"') {
                loopKey = loopKey.substring(1);
            }
            if(_(loopKey).last() === '"') {
                loopKey = loopKey.substring(0, loopKey.length - 1);
            }
            loopKey = unescapeChars(loopKey, ['{', '}', '[', ']', '(', ')', ',', ':', '"']);
            map[loopKey] = trimWhitespace(loopKv[1]);
        }
        return map;
    };

    // translates a JSON-style serialized list in to a primitive array
    // cannot handle nested arrays
    var stringToArray = function(str) {
        if(!str) {
            return false;
        }
        str = trimWhitespace(str);
        var strLen = str.length;

        if(str.charAt(0) !== '[' || str.charAt(strLen - 1) !== ']') {
            return false;
        }
        if(/^\[\s*\]$/.test(str)) {
            return [];
        }
        str = str.substr(1, strLen - 2);
        return splunkUtils.stringToFieldList(str);
    };

    // TODO: replace with $.trim
    var trimWhitespace = function(str) {
        return str.replace(/^\s*/, '').replace(/\s*$/, '');
    };

    var escapeSafeSplit = function(str, delimiter, escapeChar) {
        escapeChar = escapeChar || '\\';
        var unescapedPieces = str.split(delimiter),
        // the escaped pieces list initially contains the first element of the unescaped pieces list
        // we use shift() to also remove that element from the unescaped pieces
            escapedPieces = [unescapedPieces.shift()];

        // now loop over the remaining unescaped pieces
        // if the last escaped piece ends in an escape character, perform a concatenation to undo the split
        // otherwise append the new piece to the escaped pieces list
        _(unescapedPieces).each(function(piece) {
            var lastEscapedPiece = _(escapedPieces).last();
            if(_(lastEscapedPiece).last() === escapeChar) {
                escapedPieces[escapedPieces.length - 1] += (delimiter + piece);
            }
            else {
                escapedPieces.push(piece);
            }
        });
        return escapedPieces;
    };

    var unescapeChars = function(str, charList) {
        _(charList).each(function(chr) {
            // looks weird, but the first four slashes add a single escaped '\' to the regex
            // and the next two escape the character itself within the regex
            var regex = new RegExp('\\\\\\' + chr, 'g');
            str = str.replace(regex, chr);
        });
        return str;
    };

    // this will be improved to do some SVG-specific escaping
    var escapeHtml = function(input){
        return splunkUtils.escapeHtml(input);
    };

    var escapeSVG = function(input) {
        return ("" + input).replace(/</g, '&lt;').replace(/>/g, '&gt;');
    };

    var looseParseColor = function(colorStr) {
        if (_.isNumber(colorStr)) {
            return colorStr;
        }
        if (colorStr.substring(0, 1) === '#') {
            return colorUtils.hexFromColor(colorStr);
        }
        // For legacy reasons, assume that any string is a hex number representation,
        // regardless of whether it starts with a '0x' (SPL-124191)
        return parseInt(colorStr, 16);
    };

    var stringToHexArray = function(colorStr) {
        var i, hexColor, colors;
        
        try {
            colors = JSON.parse(colorStr);
        } catch(e) {
            colors = stringToArray(colorStr);
        }

        if(!colors) {
            return false;
        }
        for(i = 0; i < colors.length; i++) {
            hexColor = looseParseColor(colors[i]);
            if(isNaN(hexColor)) {
                return false;
            }
            colors[i] = hexColor;
        }
        return colors;
    };

    var stringToHexObject = function(colorStr) {
        var parsedInput;
        try {
            parsedInput = JSON.parse(colorStr);
        } catch(e) {
            parsedInput = stringToObject(colorStr);
        }
        if (!parsedInput) {
            return false;
        }
        var hexObject = {};
        _(parsedInput).each(function(color, key) {
            hexObject[key] = looseParseColor(color) || 0;
        });
        return hexObject;
    };

    // a simple utility method for comparing arrays, assumes one-dimensional arrays of primitives,
    // performs strict comparisons
    var arraysAreEquivalent = function(array1, array2) {
        // make sure these are actually arrays
        if(!(array1 instanceof Array) || !(array2 instanceof Array)) {
            return false;
        }
        if(array1 === array2) {
            // true if they are the same object
            return true;
        }
        if(array1.length !== array2.length) {
            // false if they are different lengths
            return false;
        }
        // false if any of their elements don't match
        for(var i = 0; i < array1.length; i++) {
            if(array1[i] !== array2[i]) {
                return false;
            }
        }
        return true;
    };

    var getLegendProperties = function(properties) {
        var remapped = {},
            legendProps = filterPropsByRegex(properties, /legend[.]/);

        _(legendProps).each(function(value, key) {
            remapped[key.replace(/^legend[.]/, '')] = value;
        });
        return remapped;
    };

    // returns a map of properties that apply either to the x-axis or to x-axis labels
    // all axis-related keys are renamed to 'axis' and all axis-label-related keys are renamed to 'axisLabels'
    var getXAxisProperties = function(properties) {
        var key, newKey,
            remapped = {},
            axisProps = filterPropsByRegex(properties, /(axisX|primaryAxis|axisLabelsX|axisTitleX|gridLinesX)/);
        for(key in axisProps) {
            if(axisProps.hasOwnProperty(key)) {
                if(!xAxisKeyIsTrumped(key, properties)) {
                    newKey = key.replace(/(axisX|primaryAxis)/, "axis");
                    newKey = newKey.replace(/axisLabelsX/, "axisLabels");
                    newKey = newKey.replace(/axisTitleX/, "axisTitle");
                    newKey = newKey.replace(/gridLinesX/, "gridLines");
                    remapped[newKey] = axisProps[key];
                }
            }
        }
        return remapped;
    };

    // checks if the given x-axis key is deprecated, and if so returns true if that key's
    // non-deprecated counterpart is set in the properties map, otherwise returns false
    var xAxisKeyIsTrumped = function(key, properties) {
        if(!(/primaryAxis/.test(key))) {
            return false;
        }
        if(/primaryAxisTitle/.test(key)) {
            return properties[key.replace(/primaryAxisTitle/, "axisTitleX")];
        }
        return properties[key.replace(/primaryAxis/, "axisX")];
    };

    // returns a map of properties that apply either to the y-axis or to y-axis labels
    // all axis-related keys are renamed to 'axis' and all axis-label-related keys are renamed to 'axisLabels'
    var getYAxisProperties = function(properties, axisIndex) {
        var key, newKey,
            remapped = {},
            axisProps, 
            initGridLinesValue;
        axisIndex = (properties && splunkUtils.normalizeBoolean(properties['layout.splitSeries']) ? 0 : axisIndex) || 0;
        if(axisIndex === 0) {
            axisProps = filterPropsByRegex(properties, /(axisY[^2]|secondaryAxis|axisLabelsY(?!2.*|\.majorLabelStyle\.rotation|\.majorLabelStyle\.overflowMode)|axisTitleY[^2]|gridLinesY[^2])/); 
        } else if (axisIndex === 1) {
            axisProps = filterPropsByRegex(properties, /(axisY2(?!\.enabled)|axisLabelsY2(?!\.majorLabelStyle\.rotation|\.majorLabelStyle\.overflowMode)|axisTitleY2|gridLinesY2)/); 
            initGridLinesValue = splunkUtils.normalizeBoolean(axisProps['gridLinesY2.showMajorLines']); 
            if(!axisProps['axisY2.scale'] || axisProps['axisY2.scale'] === 'inherit'){
                axisProps['axisY2.scale'] = properties ? (properties['axisY.scale'] || 'linear') : 'linear'; 
            }
            if(typeof initGridLinesValue !== 'boolean'){
                axisProps['gridLinesY2.showMajorLines'] = 0; 
            }
            axisProps['axisLabelsY2.extendsAxisRange'] = properties ? (properties['axisLabelsY.extendsAxisRange'] || true) : true;
        } else {
            throw new Error('Axis index must be 0 or 1'); 
        }

        for(key in axisProps) {
            if(axisProps.hasOwnProperty(key)) {
                if(!yAxisKeyIsTrumped(key, properties)) {
                    newKey = key.replace(/(axisY2|axisY|secondaryAxis)/, "axis");
                    newKey = newKey.replace(/axisLabelsY2|axisLabelsY/, "axisLabels");
                    newKey = newKey.replace(/axisTitleY2|axisTitleY/, "axisTitle");
                    newKey = newKey.replace(/gridLinesY2|gridLinesY/, "gridLines");
                    remapped[newKey] = axisProps[key];
                }
            }
        }
        return remapped;
    };

    // checks if the given y-axis key is deprecated, and if so returns true if that key's
    // non-deprecated counterpart is set in the properties map, otherwise returns false
    var yAxisKeyIsTrumped = function(key, properties) {
        if(!(/secondaryAxis/.test(key))) {
            return false;
        }
        if(/secondaryAxisTitle/.test(key)) {
            return properties[key.replace(/secondaryAxisTitle/, "axisTitleY")];
        }
        return properties[key.replace(/secondaryAxis/, "axisY")];
    };

    // uses the given regex to filter out any properties whose key doesn't match
    // will return an empty object if the props input is not a map
    var filterPropsByRegex = function(props, regex) {
        if(!(regex instanceof RegExp)) {
            return props;
        }
        var key,
            filtered = {};

        for(key in props) {
            if(props.hasOwnProperty(key) && regex.test(key)) {
                filtered[key] = props[key];
            }
        }
        return filtered;
    };

    // gets axis label rotation
    var getRotation = function(rotationProperty){
        var PERMITTED_ROTATIONS = [-90, -45, 0, 45, 90],
            DEFAULT_ROTATION = 0, 
            labelRotation;
        labelRotation = parseInt(rotationProperty, 10); 
        if(_.indexOf(PERMITTED_ROTATIONS, labelRotation) === -1){
            return DEFAULT_ROTATION; 
        }
        return labelRotation;
    };

    return ({

        normalizeBoolean: normalizeBoolean,
        stringToObject: stringToObject,
        stringToArray: stringToArray,
        trimWhitespace: trimWhitespace,
        escapeSafeSplit: escapeSafeSplit,
        unescapeChars: unescapeChars,
        escapeHtml: escapeHtml,
        escapeSVG: escapeSVG,
        stringToHexArray: stringToHexArray,
        stringToHexObject: stringToHexObject,
        arraysAreEquivalent: arraysAreEquivalent,
        getLegendProperties: getLegendProperties,
        getXAxisProperties: getXAxisProperties,
        xAxisKeyIsTrumped: xAxisKeyIsTrumped,
        getYAxisProperties: getYAxisProperties,
        yAxisKeyIsTrumped: yAxisKeyIsTrumped,
        filterPropsByRegex: filterPropsByRegex,
        getRotation: getRotation

    });

});