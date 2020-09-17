/**
 * @author lbudchenko
 * @date 11/16/15
 *
 * Represents a row in the table. The row contains links to perform
 * operations on the given saml group.
 */
define([
    'jquery',
    'underscore',
    'module',
    'views/shared/basemanager/GridRow'
],
    function (
        $,
        _,
        module,
        BaseView
        ) {
        return BaseView.extend({
        }, {
            columns: [
                {
                    id: 'name',
                    title: _('Name').t(),
                    sorts: true
                }, {
                    id: 'roles',
                    title: _('Roles').t(),
                    sorts: true
                }]
        });
    });

