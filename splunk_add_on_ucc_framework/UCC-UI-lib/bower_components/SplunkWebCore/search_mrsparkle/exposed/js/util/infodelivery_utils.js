define([
    'underscore',
    'jquery',
    'splunk.util',
    'util/splunkd_utils',
    'util/console'
],

    function(
        _,
        $,
        splunkUtil,
        splunkd_utils,
        console
    ) {
        /**
         * Gets the info delivery flags from user-prefs and checks to see if the app is installed.
         *
         * @param apps, list of locally installed apps
         * @param userPref, model containing information from user-prefs.conf
         * @returns deferred containing object with infoDeliveryEnabled, infoDeliveryInstalled flags as well as the
         * the info delivery collection
         */
        var getInfoDeliveryFlags = function (apps, userPref) {
            var dfd = $.Deferred();
            var app = getInfoDeliveryAppInfo(apps);

            var enabled = splunkUtil.normalizeBoolean(userPref.entry.content.get('infodelivery_enabled')),
                installed = !_.isUndefined(app),
                configured = installed ? app.entry.content.get('configured') : false;

            dfd.resolve({
                infoDeliveryEnabled: enabled,
                infoDeliveryInstalled: installed,
                infoDeliveryConfigured: configured,
                infoDeliveryAvailable: enabled && installed && configured,
                showInfoAdModal: splunkUtil.normalizeBoolean(userPref.entry.content.get('infodelivery_show_ad_modal')),
                showConfigureModal: splunkUtil.normalizeBoolean(userPref.entry.content.get('infodelivery_show_configure_modal'))
            });


            return dfd.promise();
        };

        /**
         * Retrieves information about the info delivery app.
         *
         * @private
         * @param apps, list of locally installed apps
         * @returns app model
         */
        var getInfoDeliveryAppInfo = function (apps) {
            if (!apps) {
                return;
            }
            var appName = "info-delivery";
            return _.find(apps, function (app) {
                return app.getAppId() === appName;
            });
        };

        /**
         * Updates the value saved in memory when do not show this again is pressed.
         *
         * @param key, which modal to not show again
         * @param value, the value to set in conf file
         * @param userPref, user specific conf settings
         * @returns jQuery deferred object which is resolved on success, otherwise it is rejected.
         */
        var hideModal = function (key, value, userPref) {
            var dfd = $.Deferred();

            var modal;
            switch (key) {
                case 'ad':
                    modal = 'infodelivery_show_ad_modal';
                    break;
                case 'config':
                    modal = 'infodelivery_show_configure_modal';
                    break;
            }

            // update the value at a given location based on the key
            userPref.entry.content.set(modal, value);

            // saves the updated model
            userPref.save().done(function () {
                dfd.resolve(userPref);
            }).fail(function () {
                dfd.reject();
            });

        return dfd.promise();
    };


    /**
     * Sends request to download a dashboard.
     * Required: dashboardName, app, exportFormat
     * Optional: sids, exportWidth, exportHeight
     *
     * @param app the app the dashboard|report is defined in
     * @param dashboardName the name of the dashboard|report
     * @param sids a object containing a list of sids for dashboard panels
     * @param exportFormat a string either png, pdf, html
     * @param preview a boolean if dashboard is to be previewed
     * @param params a object containing additional parameters
     */
    var dashboardDownload = function (app, dashboardName, sids, exportFormat, preview, params) {
        var relativeUrl = "splunkd/__raw/services/infodelivery/render";

        // if preview has been specified, add query string preview=true to request
        if(preview) {
            relativeUrl = relativeUrl + '?preview=true';
        }
        var baseURL = splunkUtil.make_full_url(relativeUrl);
        var form = $('<form method="POST" target="_blank"></form>').attr('action', baseURL);
        $('<input/>').attr({ type: 'hidden', name: 'namespace', value: app }).appendTo(form);
        $('<input/>').attr({ type: 'hidden', name: 'input_dashboard', value: dashboardName}).appendTo(form);
        // sets the keys as sid_0, sid_1, etc ... and the value is the sid itself
        _.each(sids,  function (sid, sidKey) {
            $('<input/>').attr({ type: 'hidden', name: sidKey, value: sid }).appendTo(form);
        });
        $('<input/>').attr({ type: 'hidden', name: 'format', value: exportFormat}).appendTo(form);
        $('<input/>').attr({ type: 'hidden', name: 'splunk_form_key', value: splunkUtil.getFormKey() }).appendTo(form);
        $('<input/>').attr({ type: 'hidden', name: 'locale', value: window._i18n_locale.locale_name}).appendTo(form);
        // if specifying extra parameters
        if(params) {
            _.each(params, function(v, k) {
                $('<input/>').attr({ type: 'hidden', name: k, value: v }).appendTo(form);
            });
        }
        console.log('submitting form', form[0]);
        form.appendTo(document.body).submit();
        _.defer(function() {
            form.remove();
        });
    };

    /**
     * Sends request to download a chart.
     * Required: vizProperties, searchString, exportFormat
     * Optional: sid, exportWidth, exportHeight
     *
     * @param props
     * @param searchString
     * @param sid
     * @param earliestTime
     * @param latestTime
     * @param exportFormat either png or pdf
     */
    var chartDownload = function (props, searchString, sid, earliestTime, latestTime, exportFormat) {
        var baseURL = splunkUtil.make_full_url("splunkd/__raw/services/infodelivery/render");
        var form = $('<form method="POST" target="_blank"></form>').attr('action', baseURL);
        $('<input/>').attr({ type: 'hidden', name: 'props', value: props }).appendTo(form);
        $('<input/>').attr({ type: 'hidden', name: 'search_string', value: searchString}).appendTo(form);
        $('<input/>').attr({ type: 'hidden', name: 'sid', value: sid}).appendTo(form);
        $('<input/>').attr({ type: 'hidden', name: 'earliestTime', value: earliestTime}).appendTo(form);
        $('<input/>').attr({ type: 'hidden', name: 'latestTime', value: latestTime}).appendTo(form);
        $('<input/>').attr({ type: 'hidden', name: 'format', value: exportFormat}).appendTo(form);
        $('<input/>').attr({ type: 'hidden', name: 'splunk_form_key', value: splunkUtil.getFormKey() }).appendTo(form);
        console.log('submitting form', form[0]);
        form.appendTo(document.body).submit();
        _.defer(function() {
            form.remove();
        });
    };
    
    return {
        hideModal: hideModal,
        getInfoDeliveryFlags: getInfoDeliveryFlags,
        dashboardDownload: dashboardDownload,
        chartDownload: chartDownload
    };
});
