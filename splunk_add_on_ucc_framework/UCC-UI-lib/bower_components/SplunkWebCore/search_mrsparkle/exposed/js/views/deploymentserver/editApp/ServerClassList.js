define(
    [
     'module',
     'views/deploymentserver/shared/DropDownMenuWithCounts',
     'views/deploymentserver/shared/CreateServerClassDialog',
     'views/deploymentserver/editServerclass/addClients/SelectedMachineTypesList',
     'underscore',
     'models/services/deploymentserver/DeploymentServerClass',
     'views/shared/dialogs/TextInputDialog',
     'uri/route',
     'views/Base'
    ],
function(
    module,
    DropDownMenu,
    CreateServerClassDialog,
    SelectedServerclassList,
    _,
    DeploymentServerClassModel,
    TextInputDialog,
    route,
    BaseView
) {

         return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.children.serverclassList = new SelectedServerclassList({collection: this.collection.selectedServerclasses});
                this.collection.allServerclasses.on('reset', this.render, this);

            },
            renderDropDropDownMenu: function() {
            },
            render: function() {
                var template = this.compiledTemplate();
                this.$el.html(template);

               var serverclassesTableWithCounts = [];
               this.collection.allServerclasses.each(function(sc){
                    serverclassesTableWithCounts.push({label1: sc.entry.get('name'), label2:'', value: sc.entry.get('name')});
               });

               var menuOptions = [];
               menuOptions.push(serverclassesTableWithCounts);
               menuOptions.push([{label1: _('New Server Class').t(), value: "create_sc"}]);


                // Set the machine filters drop down
                this.children.serverclassesDropDown = new DropDownMenu({
                    label: '+',
                    className: 'create-drop-down',
                    anchorClassName: 'btn',
                    items: menuOptions,
                    //items: items,
                    //items: serverclassesTableWithCounts,
                    collection: this.collection.selectedServerclasses
                });
                this.children.serverclassesDropDown.on("itemClicked", function(itemValue) {
                    if (itemValue == "create_sc") {
                        this.showCreateServerclassDialog();
                    }
                }, this);

                this.$('#serverclasses-selecter').html(this.children.serverclassesDropDown.render().el);

                this.$('#selected-serverclasses').append(this.children.serverclassList.render().el);
                return this;
            },
            template: '\
                <label><%-_("Server Classes").t()%></label>\
                <div id="selected-serverclasses" class="selected-serverclasses"></div>\
                <div id="serverclasses-selecter" class="serverclasses-selecter"></div>\
            ',
            showCreateServerclassDialog: function()  {
                this.children.createServerClassDialog = new CreateServerClassDialog({id: "modal_rename", parent: this});
                this.children.createServerClassDialog.show();
                this.children.createServerClassDialog.on("action:createdServerClass", function(serverClass) {
                    window.location.href = route.manager(this.options.application.get('root'),
                        this.options.application.get('locale'),
                        this.options.application.get('app'),
                        'deploymentserveredit',
                        {data: {id: serverClass.id}});
                }, this);


            }

        });
});





