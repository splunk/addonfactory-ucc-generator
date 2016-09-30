/*global define,document,setTimeout*/
/*jslint unparam: true*/
define([
    'jquery',
    'bootstrap',
    'underscore',
    'contrib/text!app/templates/Popover/EditText.html',
    'contrib/text!app/templates/Popover/EditNumber.html'
], function (
    $,
    Bootstrap,
    _,
    EditTextTemplate,
    EditNumberTemplate
) {
    var ATTRIBUTE_CANDIDATES = [
            "name",
            "value",
            "type",
            "title",
            "unit",
            "errorMessage",
            "config"
        ],
        GLOBAL_LISTENER = false,
        popoverList = [],
        util = {};

    function hideAll(except) {
        _.each(_.difference(popoverList, [except]), function (dom) {
            $(dom).popover("hide").data("popoverVisible", false);
        });
    }

    function addGlobalListener() {
        document.addEventListener("click", function () {
            hideAll();
        });
    }

    function getTemplate(type) {
        var template;
        switch (type) {
        case "text":
            template = EditTextTemplate;
            break;
        case "number":
            template = EditNumberTemplate;
            break;
        default:
            template = EditTextTemplate;
        }
        return template;
    }

    function getAttributesFromDOM(dom, attrs) {
        var $el = $(dom),
            ret = {};
        attrs = attrs || ATTRIBUTE_CANDIDATES;
        _.each(attrs, function (attr) {
            var val = $el.data(attr);
            if (val !== null) {
                ret[attr] = val;
            }
        });
        return ret;
    }

    function generateTitle(name, unit) {
        var title = "";
        title += "Enter new value of ";
        title += name;
        if (unit) {
            title += " in ";
            title += unit;
            title += "(s).";
        } else {
            title += ".";
        }
        return title;
    }

    function insertErrorMessage(message) {
        var $content, oHeight, $error, dHeight, $popover, oTop;
        $content = $(".popover-edit .popover-content");
        if (!$content.find(".error-message").length) {
            oHeight = $content.height();

            $error = $("<p class='error-message'>" + message + "</p>");
            $error.insertBefore($content[0].firstChild);

            // adjust popover's position
            dHeight = $content.height() - oHeight;
            $popover = $(".popover-edit");
            oTop = parseFloat($popover.css("top"));
            $popover.css("top", (oTop - dHeight) + "px");
        }
    }

    function onConfirmHandler($el, args, attrs) {
        var val = $(".popover-edit .input-edit").val(),
            confirmed = true;
        if (_.isFunction(args.onConfirming)) {
            confirmed = args.onConfirming.call(args.scope, $el, val);
        }
        if (confirmed) {
            $el.popover("hide").data("popoverVisible", false);
            if (_.isFunction(args.onConfirmed)) {
                args.onConfirmed.call(args.scope, $el, val);
            }
        } else {
            if (attrs.errormessage) {
                insertErrorMessage(attrs.errormessage);
            }
            $(".popover-edit .input-edit").addClass("shake").focus();
            setTimeout(function () {
                $(".popover-edit .input-edit").removeClass("shake");
            }, 500);
        }
    }

    function onCancelHandler($el, args) {
        $el.popover("hide").data("popoverVisible", false);
        if (_.isFunction(args.onCanceled)) {
            args.onCanceled.call(args.scope, $el);
        }
    }

    function showPopover($el, event, args, attrs) {
        if ($el.data("popoverVisible")) {
            hideAll($el[0]);
        } else {
            hideAll($el[0]);
            $el.popover("show");
            $(".popover-edit .popover-content .error-message").remove();
            $(".popover-edit").off("click").on("click", function (e) {
                e.stopPropagation();
            });
            $(".popover-edit .btn.icon-check").off("click").on("click", function () {
                onConfirmHandler($el, args, attrs);
            });
            $(".popover-edit .btn.icon-close").off("click").on("click", function () {
                onCancelHandler($el, args);
            });
            $(".popover-edit .input-edit").off("keydown").on("keydown", function (e) {
                if (e.keyCode === 13) { //Enter is pressed
                    onConfirmHandler($el, args, attrs);
                    e.preventDefault();
                } else if (e.keyCode === 27) {
                    onCancelHandler($el, args);
                    e.preventDefault();
                }
            });
            $el.data("popoverVisible", true);
        }
        event.stopPropagation();
    }

    util.addPopover = function ($el, args) {
        if (!GLOBAL_LISTENER) {
            GLOBAL_LISTENER = true;
            addGlobalListener();
        }
        $el.each(function () {
            var attrs, options;
            popoverList = _.union(popoverList, [this]);
            attrs = getAttributesFromDOM(this);
            if (!attrs.title) {
                attrs.title = generateTitle(attrs.name, attrs.unit);
            }
            options = $.extend(true, {}, args, {
                trigger: "manual",
                title: attrs.title,
                template: _.template(getTemplate(attrs.type), {
                    config: attrs.config || {}
                })
            });
            $(this).data("popoverVisible", false)
                .popover(options)
                .on("shown.bs.popover", function () {
                    $(".popover-edit .input-edit").val(attrs.value).focus();
                })
                .on("click", function (e) {
                    showPopover($(this), e, args, attrs);
                });
        });
    };

    util.removePopover = function ($el) {
        $el.each(function () {
            popoverList = _.difference(popoverList, [this]);
        });
        $el.off("click").popover("destroy");
    };

    util.hideAll = function () {
        hideAll();
    };

    return util;
});
