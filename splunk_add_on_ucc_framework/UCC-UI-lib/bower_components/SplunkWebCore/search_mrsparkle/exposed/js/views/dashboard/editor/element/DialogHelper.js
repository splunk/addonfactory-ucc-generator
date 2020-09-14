define([
    'jquery',
    'underscore',
    'splunk.util',
    'views/shared/dialogs/TextDialog',
    'views/dashboard/editor/dialogs/EditSearch',
    'views/dashboard/editor/dialogs/CreateReport',
    'views/dashboard/editor/dialogs/SelectReport'
], function($,
            _,
            splunkUtils,
            TextDialog,
            EditSearchDialog,
            CreateReportDialog,
            SelectReportDialog) {

    return {
        openEditSearchDialog: function(options) {
            var editSearchDialog = new EditSearchDialog({
                model: options.model,
                manager: options.manager,
                onHiddenRemove: true
            });
            $("body").append(editSearchDialog.render().el);
            editSearchDialog.show();
            return editSearchDialog;
        },
        openCreateReportDialog: function(options) {
            var createReportDialog = new CreateReportDialog({
                model: options.model,
                manager: options.manager,
                onHiddenRemove: true
            });
            $("body").append(createReportDialog.render().el);
            createReportDialog.show();
            return createReportDialog;
        },
        confirmConvertToInline: function(options) {
            var name = options.isPivot ? "Pivot Search" : "Inline Search";
            var dfd = $.Deferred();
            var dialog = new TextDialog({
                id: "modal_inline",
                onHiddenRemove: true
            });
            dialog.settings.set("primaryButtonLabel", _("Clone to " + name + "").t());
            dialog.settings.set("cancelButtonLabel", _("Cancel").t());
            dialog.settings.set("titleLabel", _("Clone to " + name + "").t());
            dialog.setText('<div>\
                <p>' + _("The report will be cloned to an " + name.toLowerCase() + ".").t() + '</p>\
                <p>' + _("The " + name.toLowerCase() + ":").t() + '\
                </p><ul>\
                <li>' + _("Cannot be scheduled.").t() + '</li>\
                <li>' + _("Will run every time the dashboard is loaded.").t() + '</li>\
                <li>' + _("Will use the permissions of the dashboard.").t() + '</li>\
                </ul>\
                </div>');
            $("body").append(dialog.render().el);
            dialog.once('click:primaryButton', dfd.resolve);
            dialog.once('hide hidden', dfd.reject);
            dialog.show();
            return dfd.promise();
        },
        openSelectReportDialog: function(options) {
            var dialog = new SelectReportDialog({
                model: options.model,
                collection: options.collection,
                reportLimit: options.reportLimit,
                onHiddenRemove: true
            });
            $("body").append(dialog.render().el);
            dialog.show();
            return dialog;
        },
        confirmUseReportSetting: function(options) {
            var dfd = $.Deferred();
            var dialog = new TextDialog({
                id: "modal_use_report_formatting"
            });
            dialog.settings.set("primaryButtonLabel", _("Use Report's Formatting").t());
            dialog.settings.set("cancelButtonLabel", _("Cancel").t());
            dialog.settings.set("titleLabel", _("Use Report's Formatting").t());
            dialog.setText(_("This will change the content's formatting to the report's formatting. Are you sure you want use the report's formatting?").t());
            $("body").append(dialog.render().el);
            dialog.once('click:primaryButton', dfd.resolve);
            dialog.once('hide hidden', dfd.reject);
            dialog.show();
            return dfd.promise();
        }
    };
});