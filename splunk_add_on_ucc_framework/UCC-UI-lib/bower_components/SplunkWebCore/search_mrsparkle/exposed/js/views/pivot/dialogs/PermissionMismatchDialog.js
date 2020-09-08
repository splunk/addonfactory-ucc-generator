define([
            'jquery',
            'underscore',
            'module',
            'models/shared/Application',
            'views/extensions/DeclarativeDependencies',
            'views/shared/Modal',
            'uri/route'
        ],
        function(
            $,
            _,
            module,
            Application,
            DeclarativeDependencies,
            Modal,
            route
        ) {

    var PermissionMismatchDialog = Modal.extend({

        moduleId: module.id,

        /**
         * @constructor
         * not overriden
         *
         * @param options {
         *     model: {
         *         application <models.Application>
         *     }
         * }
         */

        render: function() {
            this.$el.html(Modal.TEMPLATE);
            this.$(Modal.HEADER_TITLE_SELECTOR).text(_('Permission Mismatch').t());
            this.$(Modal.BODY_SELECTOR).append(
                $('<h5></h5>').text(_('A pivot report cannot be shared if it references a private data model.').t()).css('margin-bottom', '10px')
            );

            var pageRouter = route.getContextualPageRouter(this.model.application),
                reportsHref = pageRouter.reports(),
                dataModelManagerHref = pageRouter.data_model_manager();

            this.$(Modal.BODY_SELECTOR).append(
                $('<a></a>').text(_('Manage Data Models').t()).attr('href', dataModelManagerHref).css('margin-right', '15px')
            );
            this.$(Modal.BODY_SELECTOR).append(
                $('<a></a>').text(_('Manage Reports').t()).attr('href', reportsHref)
            );

            this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_DONE);
        }

    },
    {
        apiDependencies: {
            application: Application
        }
    });

    return DeclarativeDependencies(PermissionMismatchDialog);

});