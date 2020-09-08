/**
 * @author ahebert
 * @date 4/15/16
 *
 * Base Router for Manager Pages
 */
define(
    [
        'underscore',
        'jquery',
        'routers/Base'
    ],
    function(
        _,
        $,
        BaseRouter
    ) {
        return BaseRouter.extend({
            /**
             * Allows for landing directly to the create entity view of the manager page.
             *
             * @param locale - locale of the user
             * @param app - current application
             * @param fragments - URL fragments of the page (Example: ['data', 'indexes']
             */
            pageNew: function(locale, app, fragments){
                this.page(locale, app, fragments, 'createEntityFromURL');
            },

            /**
             * Allows for landing directly to the edit entity view of the manager page.
             *
             * @param locale - locale of the user
             * @param app - current application
             * @param fragments - URL fragments of the page (Example: ['data', 'indexes']
             */
            pageEdit: function(locale, app, fragments){
                this.page(locale, app, fragments, 'editEntityFromURL');
            },

            /**
             * Allows for landing directly to the list entities view of the manager page.
             *
             * @param locale - locale of the user
             * @param app - current application
             * @param fragments - URL fragments of the page (Example: ['data', 'indexes']
             */
            pageList: function(locale, app, fragments){
                this.page(locale, app, fragments, 'listEntities');
            },
            
            _setRoot: function(root){
                this.model.application.set({
                    root: root
                }, {silent: true});
            },

            /**
             * Allows a rooted URL for landing directly to the create entity view of the manager page.
             * @param root -
             * @param locale - locale of the user
             * @param app - current application
             * @param fragments - URL fragments of the page (Example: ['data', 'indexes']
             */
            pageNewRooted: function(root, locale, app, fragments) {
                this._setRoot(root);
                this.pageNew(locale, app, fragments);
            },

            /**
             * Allows a rooted URL for landing directly to the edit entity view of the manager page.
             * @param root -
             * @param locale - locale of the user
             * @param app - current application
             * @param fragments - URL fragments of the page (Example: ['data', 'indexes']
             */
            pageEditRooted: function(root, locale, app, fragments) {
                this._setRoot(root);
                this.pageEdit(locale, app, fragments);
            },

            /**
             * Allows a rooted URL for landing directly to the list entities view of the manager page.
             * @param root -
             * @param locale - locale of the user
             * @param app - current application
             * @param fragments - URL fragments of the page (Example: ['data', 'indexes']
             */
            pageListRooted: function(root, locale, app, fragments) {
                this._setRoot(root);
                this.pageList(locale, app, fragments);
            }
        });
    }
);
