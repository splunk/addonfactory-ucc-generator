define(
    [
     'module',
     'views/deploymentserver/shared/DropDownMenuWithCounts',
     'views/deploymentserver/editServerclass/addClients/SelectedMachineTypesList',
     'underscore',
     'views/Base',
    'bootstrap.tooltip'
    ],
function(
    module,
    DropDownMenu,
    SelectedMachineTypesList,
    _,
    BaseView
) {
         var STRINGS = {
             noResultsFound: _('No results found').t()
         };

         return BaseView.extend({
            moduleId: module.id,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.children.machineTypesList = new SelectedMachineTypesList({collection: this.collection.selectedMachineTypes});

                this.collection.machineTypes.on('reset', this.debouncedRender, this);
            },
            render: function() {
                var template = this.compiledTemplate({_:_});
                this.$el.html(template);

                //Grab the table of machine types from the first item of the machineTypes collection (This collection only returns one object)
                var machineTypesModel = this.collection.machineTypes.length ? this.collection.machineTypes.first() :  null;
                if (!machineTypesModel) return this;

                var machineTypesTable = [];
                var counts = machineTypesModel.entry.content.get('counts');
                for (var key in counts){
                    if (counts.hasOwnProperty(key)){
                        machineTypesTable.push({label1: key, label2: counts[key], value: key});
                    }
                }

                //TODO: remove this
                //machineTypesTable.push({label1: 'Windows', label2: 0, value: 'Windows'});

                // Set the machine filters drop down
                this.children.machineFiltersDropDown = new DropDownMenu({
                        label: '+',
                        className: 'create-drop-down',
                        items: machineTypesTable,
                        collection: this.collection.selectedMachineTypes
                });

                //this.$('#selected-machine-filters').html(this.children.machineTypesList.render().el);
                this.$('#machine-filters-selecter').html(this.children.machineFiltersDropDown.render().el);

                if (machineTypesTable.length === 0) {
                    this.children.machineFiltersDropDown.disable();
                    this.children.machineFiltersDropDown.$('a.dropdown-toggle').tooltip({
                        title: STRINGS.noResultsFound
                    });
                }

                this.$('#selected-machine-filters').append(this.children.machineTypesList.render().el);
                return this;
            },
            template: '\
                <div class="list-inner">\
                    <label><strong><%- _("Filter by Machine Type").t() %></strong><%-_(" (machineTypesFilter)").t()%></label>\
                    <div id="selected-machine-filters"></div>\
                    <div id="machine-filters-selecter"></div>\
                    <div class="help-block">\
                    <%-_("Optional").t()%>\
                    </div>\
                </div>\
            '

        });
});





