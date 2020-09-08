define(
    ['module', 
     'views/Base', 
     'underscore', 
     'backbone', 
     'views/deploymentserver/Search', 
     'views/deploymentserver/editServerclass/ServerClassName', 
     'views/deploymentserver/editServerclass/addClients/Filter', 
     'views/deploymentserver/editServerclass/addApps/SaveButton', 
     'views/deploymentserver/editServerclass/addApps/CancelButton', 
     'views/deploymentserver/editServerclass/addClients/PreviewButton',
     'views/deploymentserver/editServerclass/addClients/SelectedClientsTab', 
     'views/deploymentserver/editServerclass/addClients/UnselectedClientsTab', 
     'views/deploymentserver/editServerclass/addClients/AllClientsTab', 
     'views/deploymentserver/editServerclass/addClients/MachineFiltersList',
     'views/shared/FlashMessages',
     'views/shared/controls/ControlGroup',
     'models/Base',
     'uri/route',
     'contrib/text!views/deploymentserver/editServerclass/addClients/AddClients.html',
     './AddClients.pcss',
     '../../shared.pcss'
    ], 
    function(
        module, 
        BaseView, 
        _, 
        Backbone, 
        Search, 
        ServerClassName,
        FilterView,
        SaveButtonView,
        CancelButtonView,
        PreviewButtonView,
        SelectedClientsTab, 
        UnselectedClientsTab, 
        AllClientsTab, 
        MachineFiltersList,
        FlashMessagesView,
        ControlGroup,
        BaseModel,
        route,
        addClientsTemplate,
        css,
        cssShared) { 
 
        return BaseView.extend({
            moduleId: module.id,
            template: addClientsTemplate, 
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments); 

                // These models will be used by the selected/unselected search views to determine which whitelist/blacklist parameters to send in the post request to splunkd to splunkd. 
                //this.model.machineFilters = new Backbone.Model(); 
                this.model.selectedClientsPaginator = new Backbone.Model(); 
                this.model.unselectedClientsPaginator = new Backbone.Model(); 
                this.model.allClientsPaginator = new Backbone.Model(); 

                var that = this;
                this.model.serverClass.fetch({
                    success: function(model, response){
                         that.extractWhitelistAndBlacklist(); 
                         that.performWhitelistBlacklistFiltering(); 
                     }
                }); 

                var _SelectedClientsTab = this._getSelectedClientsTab();
                var _UnselectedClientsTab = this._getUnselectedClientsTab();
                var _AllClientsTab = this._getAllClientsTab();

                this.model.selectedSearch = new Backbone.Model();
                this.children.selectedSearch = new Search({
                    model: this.model.selectedSearch 
                }); 
                this.children.selectedClientsTab = new _SelectedClientsTab({
                    model: { 
                        //'clientFilters': this.model.clientFilters,
                        'paginator': this.model.selectedClientsPaginator, 
                        'search': this.model.selectedSearch 
                    }, 
                    collection: this.collection.selectedClients
                }); 
                
                this.model.unselectedSearch = new Backbone.Model(); 
                this.children.unselectedSearch = new Search({
                    model: this.model.unselectedSearch 
                }); 
                this.children.unselectedClientsTab = new _UnselectedClientsTab({
                    model: { 
                        //'clientFilters': this.model.clientFilters, 
                        'paginator': this.model.unselectedClientsPaginator, 
                        'search': this.model.unselectedSearch 
                    }, 
                    collection: this.collection.unselectedClients
                }); 
 
                this.model.allClientsSearch = new Backbone.Model(); 
                this.children.allClientsSearch = new Search({
                    model: this.model.allClientsSearch 
                }); 
                this.children.allClientsTab = new _AllClientsTab({
                    model: { 
                        //'clientFilters': this.model.clientFilters, 
                        'paginator': this.model.allClientsPaginator, 
                        'search': this.model.allClientsSearch 
                    }, 
                    collection: this.collection.allClients
                }); 

                this.children.serverClassName = new ServerClassName({model: this.model.serverClass});

                this.children.saveButton = new SaveButtonView(); 
                this.children.saveButton.on("saveClicked", this.handleSaveClicked, this); 

                this.children.cancelButton = new CancelButtonView(); 
                this.children.cancelButton.on("cancelClicked", this.handleCancelClicked, this); 

                this.children.previewButton = new PreviewButtonView(); 
                this.children.previewButton.on("previewClicked", this.performWhitelistBlacklistFiltering, this); 

                // Create a model with the validation logic for whitelist
                var whiteListValidationModel = BaseModel.extend({
                    validation: function() {
                        return {
                            filter: {
                                required: true,
                                msg: _('Include (whitelist) is required.').t()

                            }
                        };
                    }
                });
                this.model.whitelist = new whiteListValidationModel();

                this.children.whitelist = new ControlGroup({
                    className: 'control-group',
	                controlType: 'Textarea',
	                controlOptions: {
                        model: this.model.whitelist,
                        textareaClassName: 'filter-text-area',
                        modelAttribute: 'filter',
                        className: 'regex-box',
                        placeholder: _('Required').t()
	                }
                });

                this.model.blacklist = new Backbone.Model();

                this.children.blacklist = new ControlGroup({
                    className: 'control-group',
	                controlType: 'Textarea',
	                controlOptions: {
                        model: this.model.blacklist,
                        textareaClassName: 'filter-text-area',
                        modelAttribute: 'filter',
                        className: 'regex-box',
                        placeholder: _('Optional').t()
	                }
                });

                this.children.machineFiltersList = new MachineFiltersList({
                    collection: { 
                        machineTypes: this.collection.machineTypes, 
                        selectedMachineTypes: this.collection.selectedMachineTypes
                    }
                });

                this.children.flashMessagesView = new FlashMessagesView({model: [this.model.selectedClientsPaginator,
                    this.model.unselectedClientsPaginator,
                    this.model.allClientsPaginator,
                    this.model.serverClass,
                    this.model.whitelist
                    ],
                    collection: this.collection});

                //all/selected/unselected toggle
                this.model.tabView = new Backbone.Model(); 
                this.model.tabView.set('selectedView', 'all_clients'); 
                this.children.tabToggle = new ControlGroup({
                    label: _("").t(),
                    controlType:'SyntheticRadio',
                    controlOptions: {
                        className: "btn-group btn-group-2",
                        items: [
                            { value: 'all_clients', label: _('All').t() }, 
                            { value: 'selected_clients', label: _('Matched').t() },
                            { value: 'unselected_clients', label: _('Unmatched').t() } 
                        ],
                        model: this.model.tabView,
                        modelAttribute: 'selectedView' 
                    }
                });
                
                this.model.tabView.on('change:selectedView', this.showSelectedView, this); 

            },
            showSelectedView: function() {
                var selectedView = this.model.tabView.get('selectedView'); 
                    this.$('#selected_clients').hide(); 
                    this.$('#unselected_clients').hide(); 
                    this.$('#all_clients').hide(); 
                    this.$('#selectedClientsFilterContainer').hide(); 
                    this.$('#unselectedClientsFilterContainer').hide(); 
                    this.$('#allClientsFilterContainer').hide(); 
                if (selectedView == "selected_clients") {
                    this.$('#selected_clients').show(); 
                    this.$('#selectedClientsFilterContainer').show(); 
                } else if (selectedView == "unselected_clients") {
                    this.$('#unselected_clients').show(); 
                    this.$('#unselectedClientsFilterContainer').show(); 
                } else if (selectedView == "all_clients") {
                    this.$('#all_clients').show(); 
                    this.$('#allClientsFilterContainer').show(); 
                }
            }, 
            //showTab: function(tabName){
            //   this.$('.nav-tabs a[href=#unselected_clients]').tab('show');
            //},

            render: function() {
 
                var filtersDocUrl = this.getFiltersDocUrl(); 
 
                var docUrl = this.getDocUrl(); 


		var html = this.compiledTemplate({backButtonUrl: this.getBackButtonUrl(), sectionTitle: this.getSectionTitle(), nameLabel: this.getNameLabel(), docUrl: docUrl, filtersDocUrl: filtersDocUrl, _:_, serverClass: this.model});
                this.children.machineFiltersList.detach(); //preserve event listeners

                this.$el.html(html); 
                this.$('#controls').append(this.children.tabToggle.render().el); 
                this.$('#serverClassName').append(this.children.serverClassName.render().el); 
                this.$('#whitelist').append(this.children.whitelist.render().el); 
                this.$('#blacklist').append(this.children.blacklist.render().el); 

                this.$('#selected_clients').append(this.children.selectedClientsTab.render().el); 
                this.$('#unselected_clients').append(this.children.unselectedClientsTab.render().el); 
                this.$('#all_clients').append(this.children.allClientsTab.render().el); 

                this.$('#selectedClientsFilterContainer').append(this.children.selectedSearch.render().el); 
                this.$('#unselectedClientsFilterContainer').append(this.children.unselectedSearch.render().el); 
                this.$('#allClientsFilterContainer').append(this.children.allClientsSearch.render().el); 

                this.$('#selected_clients').hide(); 
                this.$('#unselected_clients').hide(); 
                this.$('#selectedClientsFilterContainer').hide(); 
                this.$('#unselectedClientsFilterContainer').hide(); 
                this.$('#page-actions').append(this.children.cancelButton.render().el); 
                this.$('#page-actions').append(this.children.previewButton.render().el); 
                this.$('#page-actions').append(this.children.saveButton.render().el); 
                //this.$('a[href=#unselected_clients]').click();
                //this.$('.nav-tabs a[href=#unselected_clients]').tab('show');
               // this.$('.nav-tabs a[href=#unselected_clients]').click();

                this.$(".flash-messages-placeholder").append(this.children.flashMessagesView.render().el);
                this.children.machineFiltersList.render().$el.appendTo(this.$('#machine-filters-container'));
                return this;
            }, 
            handleSaveClicked: function() {

                //validate
                if (this.model.whitelist.validate()) {
                    return;
                }
                // Clear filters
                var whiteListLength = this.model.serverClass.entry.content.get("whitelist-size"); 
                var i; 
                for (i = 0; i < whiteListLength; i++){
                   this.model.serverClass.entry.content.set("whitelist."+i, null); 
                }
                var blackListLength = this.model.serverClass.entry.content.get("blacklist-size"); 
                for (i = 0; i < blackListLength; i++){
                   this.model.serverClass.entry.content.set("blacklist."+i, null); 
                }
           
               // Add the current filters to the serverclass model
               if(typeof String.prototype.trim !== 'function') {
                   // trim is not supported in IE
                   String.prototype.trim = function() {
                       return this.replace(/^\s+|\s+$/g, ''); 
                   }; 
               }

               var whiteList = ""; 
               var blackList = ""; 
               if (this.model.whitelist.get('filter'))  whiteList = this.model.whitelist.get('filter').replace(/\n/g, "").split(','); 
               if (this.model.blacklist.get('filter'))  blackList = this.model.blacklist.get('filter').replace(/\n/g, "").split(','); 
               var pruned_index = 0; 
               for (i = 0; i < whiteList.length; i++){
                   if (!whiteList[i].trim()) continue; 
                   this.model.serverClass.entry.content.set("whitelist."+pruned_index, whiteList[i]); 
                   pruned_index++;  //Only incrememt the pruned index if the given regex is non-empty.  We are ignoring all empty regex strings (not passing them to splunkd)
               }
               for(i = pruned_index; i< whiteListLength; i++){
                  this.model.serverClass.entry.content.unset("whitelist."+i, whiteList[i]);
               }
               pruned_index = 0; 
               for (i = 0; i < blackList.length; i++){
                   if (!blackList[i].trim()) continue; 
                   this.model.serverClass.entry.content.set("blacklist."+pruned_index, blackList[i]); 
                   pruned_index++;  //Only incrememt the pruned index if the given regex is non-empty.  We are ignoring all empty regex strings (not passing them to splunkd)
               }
               for(i = pruned_index; i< blackListLength; i++){
                  this.model.serverClass.entry.content.unset("blacklist."+i, blackList[i]);
               }
 
               //Add the machine type filters to the serverclass model
               var machineFilters = this.collection.selectedMachineTypes.pluck("name").join(',');

               this.model.serverClass.entry.content.set("machineTypesFilter", machineFilters); 

               this.model.serverClass.entry.content.set("clearOldFilters", true); //TODO: make sure that setting clearFilters will not accidentaly override the whitelist/blacklist if the model is saved somewhere else 

               // Save the serverclass model

               // ...but do not post these attributes
               delete this.model.serverClass.entry.content.attributes.repositoryLocation;  
               delete this.model.serverClass.entry.content.attributes.restartSplunkWeb; 
               delete this.model.serverClass.entry.content.attributes.restartSplunkd;  
               delete this.model.serverClass.entry.content.attributes.stateOnClient; 
               
               this.model.serverClass.save(null, {
                   success: this.goBack.bind(this)
               });

            }, 
            handleCancelClicked: function() {
               this.goBack();
               return false; 
            }, 
            performWhitelistBlacklistFiltering: function() {
               var whiteList = this.model.whitelist.get('filter') || ""; 
               whiteList = whiteList.replace(/\n/g, "");  
               var blackList = this.model.blacklist.get('filter') || ""; 
               blackList = blackList.replace(/\n/g, "");  

               var machineFilters = this.collection.selectedMachineTypes.pluck("name").join(',');

               this.model.selectedClientsPaginator.set('data', {
                   whitelist: whiteList,
                   blacklist: blackList, 
                   machineTypesFilter: machineFilters,
                   sort_key: this.model.selectedSearch.get('sortKey'),
                   sort_dir: this.model.selectedSearch.get('sortDirection')
               }); 

               this.model.unselectedClientsPaginator.set('data', {
                   whitelist: whiteList,
                   blacklist: blackList, 
                   machineTypesFilter: machineFilters, 
                   complement: true ,
                   sort_key: this.model.unselectedSearch.get('sortKey'),
                   sort_dir: this.model.unselectedSearch.get('sortDirection')
               }); 

               this.model.allClientsPaginator.set('data', {
                   whitelist: whiteList,
                   blacklist: blackList, 
                   machineTypesFilter: machineFilters, 
                   selectionAsAttribute: true,
                   sort_key: this.model.allClientsSearch.get('sortKey'),
                   sort_dir: this.model.allClientsSearch.get('sortDirection')
               }); 
            },
            // Overridden by DMC
            extractWhitelistAndBlacklist: function() {
                var whitelist = ""; 
                var blacklist = ""; 

                var whiteListLength = this.model.serverClass.entry.content.get("whitelist-size"); 
                var i; 
                var nextRegex; 
                
                // Exract whitelist filters 
                for (i = 0; i < whiteListLength; i++){
                    nextRegex = this.model.serverClass.entry.content.get("whitelist." + i);     
                    whitelist += nextRegex; 
 
                    if (i < whiteListLength-1) whitelist += ", "; 
                }
                this.model.whitelist.set('filter', whitelist); 

                // Exract blacklist filters 
                var blackListLength = this.model.serverClass.entry.content.get("blacklist-size"); 
                for (i = 0; i < blackListLength; i++){
                    nextRegex = this.model.serverClass.entry.content.get("blacklist." + i);     
                    blacklist += nextRegex; 
                    if (i < blackListLength-1) blacklist += ", "; 
                }
                this.model.blacklist.set('filter', blacklist); 
                this.extractMachineTypes();                
            },
            extractMachineTypes: function() {
                // Exract machine type filters
                if (this.model.serverClass.entry.content.get("machineTypesFilter")) {
                    var machineTypes = this.model.serverClass.entry.content.get("machineTypesFilter").split(',');
                    var i;
                    //var machineTypes = ['Windows'];
                    for (i = 0; i < machineTypes.length; i++) {
                        if (machineTypes[i] == "") continue;
                        var selectedMachineFilter = new Backbone.Model();
                        selectedMachineFilter.set('name', machineTypes[i]);
                        this.collection.selectedMachineTypes.add(selectedMachineFilter);
                    }
                }
            },
            goBack: function(model) {
                model = model || this.model.serverClass;
                window.location.href = this.getReturnTo(model);
            },
            getReturnTo: function(model) {
              model = model || this.model.serverClass;
              return this.options.return_to ? this.options.return_to : route.manager(this.options.application.get('root'), this.options.application.get('locale'), this.options.application.get('app'), 'deploymentserveredit', {data: {id: model.id}});
            },
            getFiltersDocUrl: function() {
                return route.docHelp(
                    this.options.application.get("root"),
                    this.options.application.get("locale"),
                    'learnmore.deployment.filters'
                );
            },
            getDocUrl: function() {
                return route.docHelp(
                    this.options.application.get("root"),
                    this.options.application.get("locale"),
                    'manager.deployment.fm.clients'
                );
            },
            getSectionTitle: function() {
                return _('Edit Clients').t();
            },
            getNameLabel: function() {
                return _('Server Class').t();
            },
            getBackButtonUrl: function() {
                return null;
            },
            _getSelectedClientsTab: function() {
                return SelectedClientsTab;
            },
            _getUnselectedClientsTab: function() {
                return UnselectedClientsTab;
            },
            _getAllClientsTab: function() {
                return AllClientsTab;
            }
        }); 
});


