define([
        'jquery',
        'underscore',
        '../util/dom_utils', 
        './font_data/widths/helvetica'
    ], 
    function(
        $,
        _,
        domUtils, 
        helveticaWidths
    ) {

    var Formatter = function(renderer) {
        this.renderer = renderer;
        this.charWidths = helveticaWidths;  // char width hash
        this.DEFAULT_CHAR_WIDTH = 1000; // width of widest char in char set 
        this.ELLIPSIS_WIDTH = 834;  // per Adobe font format specifications - width of 3 periods
        this.ELLIPSIS = "...";
        this.PX_TO_PT_RATIO = {};   // memoized hash of a px:pt ratio for each font size  
        this.boldFontScale = 1.0555; // approximated bold:normal font ratio
        this.KERNING_FACTOR = 0.006;    // approximated value to compensate for width estimation algorithm's lack of kerning predictions
    };

    Formatter.prototype = {
        /*
            Font Units of Measurement:
            "All measurements in AFM, AMFM, and ACFM ﬁles are given in terms of 
            units equal to 1/1000 of the scale factor (point size) of the font being used. To 
            compute actual sizes in a document (in points; with 72 points = 1 inch), these 
            amounts should be multiplied by (scale factor of font) / 1000." - Adobe specifications 
            // So: 
             // Point width = AFM width * (fontSize / 1000)
        */

        // Memoizes or returns actual:predicted widths ratio 
        _getPxScale: function(fontSize, css){
            var chars = "foo",  // arbitrary string 
                pxScale; 
            // Currently, the only css property supported is 'font-weight: bold'
            if(css && css['font-weight'] && css['font-weight'] === 'bold'){
                pxScale = this.PX_TO_PT_RATIO[fontSize]['bold'];
                if(!pxScale){
                    pxScale = this._calculatePxScale(chars, fontSize, css);
                    this.PX_TO_PT_RATIO[fontSize]['bold'] = pxScale;
                }
                return pxScale;
            }else{
                pxScale = this.PX_TO_PT_RATIO[fontSize];
                if(!pxScale){
                    pxScale = this._calculatePxScale(chars, fontSize);
                    this.PX_TO_PT_RATIO[fontSize] = pxScale; 
                }
                return pxScale;
            }
        }, 

        // Renders text to get actual width and predicts text using widths hash to return ratio of actual:predicted
        _calculatePxScale: function(chars, fontSize, css){
            var pxWidth = this.getTextBBox(chars, fontSize, css).width;
            var widthInAFM = this._widthOfString(chars, css); 
            var ptWidth = widthInAFM * fontSize / 1000; 
            return pxWidth / ptWidth; 
        }, 

        // Returns width of string in AFM units 
        _widthOfString: function(str, css){
            var fontScale = 1; 
            if(css && css['font-weight'] && css['font-weight'] === 'bold'){
                fontScale = this.boldFontScale;
            }
            if(!str || str === ""){
                return 0;
            }
            var width = 0, 
                strLen = str.length; 
            for(var i = 0; i < strLen; i++){
                // if char is not found (e.g. non-English char), return default width 
                width += this.charWidths[str.charCodeAt(i)] || this.DEFAULT_CHAR_WIDTH; 
            }
            return width * fontScale;
        },

        ellipsize: function(str, maxWidthInPixels, fontSize, css, ellipsisPlacement){
            if(_(str).isArray()) {
                str = str.join(',');
            }
            str = $.trim(str);
            var strLen = str.length; 
            if(!str || str === ""){
                return "";
            }
            if(strLen <= 3 || !fontSize || isNaN(fontSize) || fontSize <= 0){
                return str; 
            }
            if(!maxWidthInPixels || isNaN(maxWidthInPixels) || maxWidthInPixels <= 0){
                return this.ELLIPSIS;
            }
            var kerningFactor = this.KERNING_FACTOR * fontSize * strLen, // must account for lack of kerning prediction in AFM width estimation in our px usage
                maxWidthInPoints = (maxWidthInPixels + kerningFactor) / this._getPxScale(fontSize), // do not pass css to _getPxScale() as maxWidth is independent of css
                strWidth = this._widthOfString(str, css),   // predict string width in AFM
                maxWidth = maxWidthInPoints * 1000 / fontSize,  // convert max pt width to AFM
                excessWidth = strWidth - maxWidth,
                widthCounter = 0,
                concatText = "", 
                i, strLenMinusOne, strMiddle; 
            if(excessWidth > 0){
                var maxCharsWidth = maxWidth - this.ELLIPSIS_WIDTH; // how many chars and an ellipsis fit within max width 
                switch(ellipsisPlacement){
                    case 'end':
                        for(i = 0; i < strLen; i++){
                            widthCounter += this.charWidths[str.charCodeAt(i)] || this.DEFAULT_CHAR_WIDTH;
                            if(widthCounter > maxCharsWidth){
                                return concatText + this.ELLIPSIS;
                            }
                            concatText += str[i];
                        }
                        break;
                    case 'start':
                        strLenMinusOne = strLen - 1; 
                        for(i = strLenMinusOne; i >= 0; i--){
                            widthCounter += this.charWidths[str.charCodeAt(i)] || this.DEFAULT_CHAR_WIDTH;
                            if(widthCounter > maxCharsWidth){
                                return this.ELLIPSIS + concatText;
                            }
                            concatText = str[i].concat(concatText);
                        }
                        break;
                    default:
                        // default to middle ellipsization 
                        strMiddle = Math.floor(str.length/2);
                        for(i = 0; i <= strMiddle; i++){
                            // try including leftmost unexamined char 
                            widthCounter += this.charWidths[str.charCodeAt(i)] || this.DEFAULT_CHAR_WIDTH; 
                            if(widthCounter > maxCharsWidth){
                                // char does not fit - drop it and insert ellipsis in its place 
                                return (str.substring(0, i) + this.ELLIPSIS + str.substring(strLen - i, strLen));
                            }else if(widthCounter === maxCharsWidth){
                                // char fits but no more chars will - insert ellipsis in middle, after this char 
                                return (str.substring(0, i + 1) + this.ELLIPSIS + str.substring(strLen - i, strLen));
                            }
                            // try including rightmost unexamined char
                            widthCounter += this.charWidths[str.charCodeAt(strLen - i - 1)] || this.DEFAULT_CHAR_WIDTH; 
                            if(widthCounter > maxCharsWidth){
                                // char does not fit - drop it and insert ellipsis in its place 
                                return (str.substring(0, i + 1) + this.ELLIPSIS + str.substring(strLen - i, strLen));
                            }else if(widthCounter === maxCharsWidth){
                                // char fits but no more chars will - insert ellipsis in middle, before this char 
                                return (str.substring(0, i + 1) + this.ELLIPSIS + str.substring(strLen - i - 1, strLen));
                            }
                        }
                        break; 
                }
            }else{
                // no need to ellipsize
                return str;
            }
        },

        // NOTE: it is up to caller to test that the entire string does not already fit
        // even if it does, this method will do log N work and may or may not truncate the last character
        trimStringToWidth: function(text, width, fontSize, css) {
            var that = this,
                binaryFindEndIndex = function(start, end) {
                    var testIndex;
                    while(end > start + 1) {
                        testIndex = Math.floor((start + end) / 2);
                        if(that.predictTextWidth(text.substr(0, testIndex), fontSize, css) > width) {
                            end = testIndex;
                        }
                        else {
                            start = testIndex;
                        }
                    }
                    return start;
                },
                endIndex = binaryFindEndIndex(0, text.length);

            return text.substr(0, endIndex);
        },

        reverseString: function(str) {
            return str.split("").reverse().join("");
        },

        //Returns width of string in px units
        predictTextWidth: function(str, fontSize, css) {
            if(_(str).isArray()) {
                str = str.join(',');
            }
            if(!str || str === "" || !fontSize || isNaN(fontSize)){
                return 0;
            }
            // split lines by break tag, trimming leading and trailing whitespaces 
            var multilineArray = str.split(/\s*<br\s*\/?>\s*/),
                multilineArrayLen = multilineArray.length; 
            if(multilineArrayLen > 1){
                // if multiple lines are passed (<br> || <br/> || <br />) then return width of widest line 
                var maxWidth = 0; 
                for(var i = 0; i < multilineArrayLen; i++){
                    if(multilineArray[i] && multilineArray[i] !== ""){
                        var thisLineWidth = this._predictLineWidth(multilineArray[i], fontSize, css); 
                        if(thisLineWidth > maxWidth){
                            maxWidth = thisLineWidth; 
                        } 
                    }
                }
                return maxWidth; 
            }else{
                // single line string 
                var width = this._predictLineWidth($.trim(str), fontSize, css);
                return width; 
            }
        },

        _predictLineWidth: function(str, fontSize, css){
            // predict string width by adding each char's width from the AFM char hash 
            var widthInAFM = this._widthOfString(str, css); 
            // convert AFM width to point units
            var widthInPt = widthInAFM * fontSize / 1000; 
            // convert point width to pixel units 
            var widthInPx = widthInPt * (this._getPxScale(fontSize)); 
            return widthInPx - (this.KERNING_FACTOR * fontSize * str.length); 
        },

        predictTextHeight: function(text, fontSize, css) {
            if(_(text).isArray()) {
                text = text.join(',');
            }
            if(!fontSize || !text) {
                return 0;
            }
            var bBox = (this.getTextBBox(text, fontSize, css));
            return (bBox) ? bBox.height : 0;
        },

        getTextBBox: function(text, fontSize, css) {
            // fontSize is required; css is any other styling that determines size (italics, bold, etc.)
            css = $.extend(css, {
                fontSize: fontSize + 'px'
            });

            if(isNaN(parseFloat(fontSize, 10))) {
                return undefined;
            }
            if(this.textPredicter) {
                this.textPredicter.destroy();
            }
            this.textPredicter = this.renderer.text(text, 0, 0)
                .attr({
                    visibility: 'hidden'
                })
                .css(css)
                .add();

            return this.textPredicter.getBBox();
        },

        adjustLabels: function(originalLabels, width, minFont, maxFont, ellipsisMode) {
            var i, fontSize, shouldEllipsize,
                labels = $.extend(true, [], originalLabels),
                maxWidths = this.getMaxWidthForFontRange(labels, minFont, maxFont);

            // adjust font and try to fit longest
            if(maxWidths[maxFont] <= width) {
                shouldEllipsize = false;
                fontSize = maxFont;
            }
            else {
                shouldEllipsize = true;
                for(fontSize = maxFont - 1; fontSize > minFont; fontSize--) {
                    if(maxWidths[fontSize] <= width) {
                        shouldEllipsize = false;
                        break;
                    }
                }
            }

            if(shouldEllipsize && ellipsisMode !== 'none') {
                for(i = 0; i < labels.length; i++) {
                    labels[i] = this.ellipsize(labels[i], width, fontSize, {}, ellipsisMode);
                }
            }
            return {
                labels: labels,
                fontSize: fontSize,
                areEllipsized: shouldEllipsize,
                longestWidth: maxWidths[fontSize]
            };
        },

        getMaxWidthForFontRange: function(labels, minFont, maxFont) {
            var longestLabelIndex,
                fontSizeToWidthMap = {};

            // find the longest label
            fontSizeToWidthMap[minFont] = 0;
            for(var i = 0; i < labels.length; i++) {
                var labelLength = this.predictTextWidth(labels[i] || '', minFont);
                if(labelLength > fontSizeToWidthMap[minFont]) {
                    longestLabelIndex = i;
                    fontSizeToWidthMap[minFont] = labelLength;
                }
            }
            // fill in the widths for the rest of the font sizes
            for(var fontSize = minFont + 1; fontSize <= maxFont; fontSize++) {
                fontSizeToWidthMap[fontSize] = this.predictTextWidth(labels[longestLabelIndex] || '', fontSize);
            }
            return fontSizeToWidthMap;
        },

        bBoxesOverlap: function(bBox1, bBox2, marginX, marginY) {
            marginX = marginX || 0;
            marginY = marginY || 0;
            var box1Left = bBox1.x - marginX,
                box2Left = bBox2.x - marginX,
                box1Right = bBox1.x + bBox1.width + 2 * marginX,
                box2Right = bBox2.x + bBox2.width + 2 * marginX,
                box1Top = bBox1.y - marginY,
                box2Top = bBox2.y - marginY,
                box1Bottom = bBox1.y + bBox1.height + 2 * marginY,
                box2Bottom = bBox2.y + bBox2.height + 2 * marginY;

            return ((box1Left < box2Right) && (box1Right > box2Left)
                && (box1Top < box2Bottom) && (box1Bottom > box2Top));
        },

        destroy: function() {
            if(this.textPredicter) {
                this.textPredicter.destroy();
                this.textPredicter = false;
            }
        }

    };

    return Formatter;

});