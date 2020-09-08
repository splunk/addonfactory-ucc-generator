define(
[
    'module',
    '../splunkbar/user/Master'
],
function(
    module,
    UserMenu
){
    return UserMenu.extend({
        moduleId: module.id,
        updateName: function() {
            this.toggle.set({label: ' ', title: this._getName()});
        }
    });
});
