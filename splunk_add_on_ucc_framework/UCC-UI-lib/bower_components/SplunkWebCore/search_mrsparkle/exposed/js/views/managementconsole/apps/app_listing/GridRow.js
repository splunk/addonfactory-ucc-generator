define([
        'jquery',
        'underscore',
        'backbone',
        'module',
        'models/managementconsole/DmcBase',
        'models/managementconsole/App',
        'views/shared/basemanager/GridRow'
    ],
    function (
        $,
        _,
        Backbone,
        module,
        DmcBaseModel,
        AppModel,
        BaseManagerGridRow
    ) {
        return BaseManagerGridRow.extend({

            // This overrides the method in the base class
            prepareTemplate: function() {
                var template = BaseManagerGridRow.prototype.prepareTemplate.apply(this, arguments);

                return $.extend(true, template, {
                    name: this.model.entity.entry.content.get('@label') || this.model.entity.entry.get('name'),
                    folderName: this.model.entity.entry.get('name'),
                    version: this.model.entity.getVersion(),
                    dependencies: this.model.entity.getPrettyPackageDependenciesString()
                });
            },

            // This overrides the method in the base class
            template: '\
            <td class="cell-name app-name">\
                <%- name %>\
            </td>\
            <td class="cell-actions">\
                <div class="action-cell-placeholder"></div>\
            </td>\
            <td class="cell-folder-name">\
                <%- folderName %>\
            </td>\
            <td class="cell-version">\
                <%- version %>\
            </td>\
            <td class="cell-dependencies">\
                <%- dependencies %>\
            </td>'
        }, {
            columns: [
                {
                    id: '@label',
                    title: _('Name').t(),
                    noSort: true
                },
                {
                    id: 'name',
                    title: _('Folder Name').t(),
                    noSort: false
                },
                {
                    id: '@version',
                    title: _('Version').t(),
                    noSort: true
                },
                {
                    id: '@dependencies',
                    title: _('Dependencies').t(),
                    noSort: true
                }
            ]
        });
    });
