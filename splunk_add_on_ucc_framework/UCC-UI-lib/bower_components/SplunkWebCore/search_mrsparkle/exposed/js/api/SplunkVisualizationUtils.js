define([
            'underscore',
            'util/htmlcleaner',
            'util/general_utils',
            'util/time',
            'moment',
            'splunk/palettes/ColorCodes'
        ],
        function(
            _,
            HtmlCleaner,
            generalUtils,
            timeUtils,
            moment,
            ColorCodes
        ) {

    /*
     * This object contains pre-defined color palettes based on the colors defined in ColorCodes
     * - splunkCategorical
     * - splunkSemantic
     */
    var COLOR_PALETTES = {
        'splunkCategorical': ColorCodes.CATEGORICAL,
        'splunkSemantic': ColorCodes.SEMANTIC
    };

    /*
     * This utility function should be used whenever dynamic content is inserted into HTML.
     * The content will be escaped to prevent XSS injection.
     */
    var escapeHtml = function(inputString) {
        return _.escape(inputString);
    };

    /*
     * This utility function should be used whenever construct a redirection URL based on dynamic content.
     * The content will be stripped of any unsafe URL schemes (e.g. javascript://, data://).
     *
     * In future, this function may be extend to allows admins to restrict what URLs can be redirected to
     * and/or what data can be encoded into redirection URLs.
     */
    var makeSafeUrl = function(inputUrl) {
        return HtmlCleaner.isBadUrl(inputUrl) ? '' : inputUrl;
    };

    /*
     * This utility function can be used to get a pre-defined color palette for categorical colorization.
     * It returns an array of color strings. If no argument is provided it returns the splunk color palette.
     */
    var getColorPalette = function(palette) {
        palette = palette || 'splunkCategorical';
        if (!_.has(COLOR_PALETTES, palette)) {
            throw new Error('The specified color palette does not exist');
        }
        return COLOR_PALETTES[palette];
    };

    /*
     * This utility function should be used whenever a date is initialized with a timestamp
     * It is essential for showing the correct server date / time to a user
     */
    var parseTimestamp = function(timestamp) {
        if (timeUtils.isValidIsoTime(timestamp)) {
            return timeUtils.isoToDateObject(timestamp);
        } else {
            // if it's not an ISO timestamp we can't do timezone correction
            var m = moment(timestamp);
            if (m.isValid()) {
                return m.toDate();
            } else {
                return new Date(NaN);
            }
        }
    };

    return {
        escapeHtml: escapeHtml,
        makeSafeUrl: makeSafeUrl,
        normalizeBoolean: generalUtils.normalizeBoolean,
        getColorPalette: getColorPalette,
        parseTimestamp: parseTimestamp
    };

});