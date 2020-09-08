define([
    'underscore',
    'jquery',
    'backbone',
    'module',
    'views/Base',
    'views/shared/controls/SyntheticCheckboxControl'
    ],
    function(
        _,
        $,
        Backbone,
        module,
        BaseView,
        SyntheticCheckboxControl
    ) {
    return BaseView.extend({
        moduleId: module.id,
        className: 'push-margins',
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);

            this.children.read = new BaseView();
            this.children.write = new BaseView();

            //listeners
            this.model.perms.on('change:Everyone.read', function() {
                this.toggleEveryone('read');
            }, this);
            this.model.perms.on('change:Everyone.write', function() {
                this.toggleEveryone('write');
            }, this);
            this.model.inmem.on('change:sharing', function() {
                this.render();
            }, this);
        },
        appendRow: function(role) {
            var className = role !== "Everyone" ? 'role' : '';
            var escapedRoleName = _.escape(this.model.perms.get(role + '.name'));
            this.$('tbody').append(
                '<tr class="'+ role + '" data-role="' + escapedRoleName + '" >\
                    <td class="role-name">' + escapedRoleName + '</td>\
                    <td class="perms-read ' + role + '-checkbox"></td>\
                    <td class="perms-write ' + role + '-checkbox"></td>\
                </tr>'
            );
            this.children.readCheckbox = new SyntheticCheckboxControl({
                modelAttribute: role +'.read',
                model: this.model.perms,
                checkboxClassName: className + " read btn"
            });
            this.children.writeCheckbox = new SyntheticCheckboxControl({
                modelAttribute: role + '.write',
                model: this.model.perms,
                checkboxClassName: className + " write btn"
            });

            this.children.readCheckbox.render().appendTo(this.$('td.perms-read.'+ role + '-checkbox'));
            this.children.writeCheckbox.render().appendTo(this.$('td.perms-write.'+ role + '-checkbox'));
            if (this.isReadOnly(role, 'read')) {
                this.children.readCheckbox.disable();
            }
            if (this.isReadOnly(role, 'write')) {
                this.children.writeCheckbox.disable();
            }
            this.children.read.children[role] = this.children.readCheckbox;
            this.children.write.children[role] = this.children.writeCheckbox;
        },
        isReadOnly: function(role, col) {
            if (role === 'Everyone') {
                return !(this.model.inmem.get('can_change_perms') && this.model.inmem.get('sharing') !== 'user');
            }
            if (col === 'read') {
                return !(this.model.inmem.get('can_change_perms') && !this.model.perms.get('Everyone.read') &&
                    this.model.inmem.get('sharing') !== 'user');
            } else {
                // col === 'write'
                return !(this.model.inmem.get('can_change_perms') && !this.model.perms.get('Everyone.write') &&
                    this.model.inmem.get('sharing') !== 'user');
            }
        },
        toggleEveryone: function(col) {
            var everyoneChecked = this.model.perms.get('Everyone.' + col),
                checkboxes = this.children[col];
            _.each(checkboxes.children, function(checkbox, role) {
                if (this.model.inmem.get('can_change_perms')) {
                    if (role !== 'Everyone') {
                        if (everyoneChecked) {
                            checkbox.disable();
                        } else {
                            checkbox.enable();
                        }
                    }
                }
            }.bind(this));
        },
        render: function() {
            this.$el.html(this.compiledTemplate({
                _: _
            }));

            var isLite = this.model.serverInfo && this.model.serverInfo.isLite();

            _(this.model.perms.toJSON()).each(function(value, key){
                var splitKey = key.split('.'),
                    role = splitKey[0],
                    type = splitKey[1];
                if (type === 'name') {
                    var roleName = this.model.perms.get(role + '.name');
                    if (!isLite || (role === 'Everyone') || (roleName === 'admin') || (roleName === 'user')) {
                        this.appendRow(role);
                    }
                }
            }.bind(this));

            this.toggleEveryone('read');
            this.toggleEveryone('write');

            return this;
        },
        template: '\
            <table class="table table-striped table-condensed table-scroll table-border-row">\
                <thead>\
                    <tr>\
                        <td></td>\
                        <th class="perms-read"><%- _("Read").t() %></th>\
                        <th class="perms-write"><%- _("Write").t() %></th>\
                    </tr>\
                </thead>\
                <tbody>\
                </tbody>\
            </table>\
        '
    });
});
