/**
 * @author jszeto
 * @date 7/17/14
 *
 * Displays a DirectoryItem and supports selecting it
 *
 * Inputs:
 *
 *     model: {models/services/data/vix_indexes/DirectoryItem}
 *     index {number} the item index in the collection/array (zero-based),
 *     rowNumber {number} the row number after applying the offset (one-based)
 */

define([
    'jquery',
    'underscore',
    'module',
    'views/Base',
    'splunk.util',
    'util/time',
    'util/format_numbers_utils',
    'splunk.i18n'
],
    function(
        $,
        _,
        module,
        Base,
        splunkUtil,
        timeUtil,
        format_numbers_utils,
        i18n
        ) {

        return Base.extend({
            tagName: 'tr',

            moduleId: module.id,

            _CUSTOM_DATE_FORMATS: {
                "EEE MMM d": {
                    "day_before_month": "EEE d MMM",
                    "ja_JP": "EEE MMM d\u65e5",
                    "ko_KR": "EEE MMM d\uc77c",
                    "zh_CN": "EEE MMM d\u65e5",
                    "zh_TW": "EEE MMM d\u65e5"
                },
                "MMMM": {
                },
                "yyyy": {
                    "ja_JP": "yyyy\u5e74",
                    "ko_KR": "yyyy\ub144",
                    "zh_CN": "yyyy\u5e74",
                    "zh_TW": "yyyy\u5e74"
                }
            },

            events: {
                "click td a" : function(event) {
                    event.preventDefault();
                    var $target = $(event.target);
                    this.trigger("rowClicked",  $target.attr("data-item-type"),
                                                $target.attr("data-item-index"),
                                                $target.attr("data-full-path"));
                }
            },

            initialize: function(options) {
                Base.prototype.initialize.call(this, options);

                this.model.on("change", function() {
                    this.debouncedRender();
                }, this);

                this.timeZoneOffset = splunkUtil.getConfigValue("SERVER_TIMEZONE_OFFSET");
            },

            // TODO [JCS] This really should be moved to a utility like time.js
            epochToDateTime: function(time, timeZoneOffset) {
                var date = new Date(Math.floor((time + timeZoneOffset) * 1000));
                var dateTime = new DateTime({
                    date: date,
                    year: date.getUTCFullYear(),
                    month: date.getUTCMonth() + 1,
                    day: date.getUTCDate(),
                    hour: date.getUTCHours(),
                    minute: date.getUTCMinutes(),
                    second: date.getUTCSeconds(),
                    microsecond: date.getUTCMilliseconds() * 1000
                });
                dateTime.weekday = function() {
                    var d = this.date.getUTCDay() - 1;
                    if (d < 0)
                        d = 6;
                    return d;
                };
                return dateTime;
            },

            formatFileSize : function() {
                var fileSizeInt = this.model.entry.content.get('size');
                return format_numbers_utils.bytesToFileSize(fileSizeInt);
            },

            render: function() {
                var content = this.model.entry.content;

                var formattedTime =  i18n.format_datetime(this.epochToDateTime(content.get("mtime"), this.timeZoneOffset), "medium");
                var theFileSize = this.formatFileSize();

                var html = this.compiledTemplate({
                    index: this.options.index,
                    fullPath : this.model.entry.get("name"),
                    type : content.get("hasSubNodes") ? "folder" : "file",
                    name : content.get("basename"),
                    owner : content.get("owner"),
                    canBrowse: content.get("canBrowse"),
                    //if the type is dir and its size === 0, then just show a dash. Otherwise, show the file size in bytes.
                    fileSize : (content.get("hasSubNodes") && content.get('size') === 0)? _("--").t(): theFileSize,
                    permissions: content.get("permissions"),
                    lastModifiedTime: formattedTime
                });

                this.$el.html(html);

                return this;
            },

            template: '\
                <% if(type === "folder"){%>\
                    <td class="col-type"><i class="icon-folder"></i></td>\
                <%} else { %>\
                    <td class="col-type"><i class="icon-document"></i></td> \
                <% } %>\
                <td class="col-name">\
                    <% if (canBrowse) {%>\
                        <a href="#" data-full-path="<%- fullPath %>" \
                                    data-item-type="<%- type %>" \
                                    data-item-index="<%- index %>"><%- name %></a>\
                    <%} else { %>\
                        <span><%- name %></span>\
                    <% } %>\
                </td>\
                <td class="col-owner"><%- owner %></td>\
                <td class="col-file-size"><%- fileSize %></td>\
                <td class="col-permissions"><%- permissions %></td>\
                <td class="col-last-modified-time"><%- lastModifiedTime %></td>\
            '

        });

    });
