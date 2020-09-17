define(
    [
         'jquery',
         'underscore',
         'module',
         'models/Base',
         'models/services/authentication/User',
         'views/Base',
         'views/shared/controls/ControlGroup',
         'views/shared/FlashMessages',
         'views/shared/Modal',
         'views/shared/reportcontrols/dialogs/shared/ReportVisualizationControlGroup',
         'views/shared/searchbarinput/Master',
         'views/shared/reportcontrols/dialogs/createreport/Create.pcss',
         'helpers/user_agent',
         'uri/route'
     ],
     function(
         $,
         _,
         module,
         BaseModel,
         UserModel,
         Base,
         ControlGroup,
         FlashMessage,
         Modal,
         ReportVisualizationControlGroup,
         SearchInputView,
         css,
         userAgent,
         route
     )
     {
        return Base.extend({
            moduleId: module.id,
            initialize: function() {
                Base.prototype.initialize.apply(this, arguments);

                this.model.inmem.setTimeRangeWarnings();
                this.children.flashMessage = new FlashMessage({ model: this.model.inmem });

                this.canShowAppSelector = this.model.user &&
                    _.isFunction(this.model.user.canUseApps) &&
                    this.model.user.canUseApps() &&
                    this.options.showSearchField;

                //name
                this.children.title = new ControlGroup({
                    label: _("Title").t(),
                    controlType:'Text',
                    controlClass: 'controls-block',
                    controlOptions: {
                        model: this.model.inmem.entry.content,
                        modelAttribute: 'name'
                    }
                });

                //description
                this.children.description = new ControlGroup({
                    label: _("Description").t(),
                    controlType:'Textarea',
                    controlClass: 'controls-block',
                    controlOptions: {
                        model: this.model.inmem.entry.content,
                        modelAttribute: 'description',
                        placeholder: _('optional').t()
                    }
                });

                //search
                if (this.options.showSearchField) {
                    this.children.search = new SearchInputView({
                        model: {
                            user: this.model.user,
                            content: this.model.inmem.entry.content,
                            application: this.model.application
                        },
                        collection: {
                            searchBNFs: this.collection.searchBNFs
                        },
                        searchAttribute: 'search',
                        searchAssistant: (this.model.user.getSearchAssistant() === UserModel.SEARCH_ASSISTANT.FULL) ? UserModel.SEARCH_ASSISTANT.COMPACT : undefined
                    });

                    var timeRangeHelpLink = route.docHelp(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        'learnmore.manager.relativetime'
                    );
                     var helpText = _('Time specifiers: y, mon, d, h, m, s ').t() +
                          '<a href="' + _.escape(timeRangeHelpLink) + '" target="_blank">' + _('Learn More').t() + ' <i class="icon-external"></i></a>';

                    this.children.earliestTime = new ControlGroup({
                        controlType: 'Text',
                        controlOptions: {
                            modelAttribute: 'dispatch.earliest_time',
                            model: this.model.inmem.entry.content,
                            placeholder: _('optional').t()
                        },
                        label: _('Earliest time').t(),
                        help: helpText
                    });

                    this.children.latestTime = new ControlGroup({
                        controlType: 'Text',
                        controlOptions: {
                            modelAttribute: 'dispatch.latest_time',
                            model: this.model.inmem.entry.content,
                            placeholder: _('optional').t()
                        },
                        label: _('Latest time').t(),
                        help: helpText
                    });
                }

                //viz toggle
                this.children.visualization = new ReportVisualizationControlGroup({
                    model: {
                        report: this.model.inmem,
                        searchJob: this.model.searchJob
                    }
                });

                //timeRangePicker toggle
                this.children.timeRangePickerToggle = new ControlGroup({
                    label: _("Time Range Picker").t(),
                    controlType:'SyntheticRadio',
                    controlClass: 'controls-halfblock',
                    controlOptions: {
                        className: "btn-group btn-group-2",
                        items: [
                            { value: '1', label: _('Yes').t() },
                            { value: '0', label: _('No').t() }
                        ],
                        model: this.model.inmem.entry.content,
                        modelAttribute: 'display.general.timeRangePicker.show'
                    }
                });

                // App selector
                if (this.canShowAppSelector) {
                    this.children.selectApp = new ControlGroup({
                        label: _("App").t(),
                        controlType: 'SyntheticSelect',
                        controlClass: 'controls-block',
                        controlOptions: {
                            modelAttribute: "app",
                            model: this.model.inmem.entry.acl,
                            toggleClassName: 'btn',
                            menuWidth: 'narrow',
                            items: [],
                            popdownOptions: {
                                detachDialog: true
                            }
                        }
                    });
                    this.setAppItems();
                }
            },
            events: {
                "click .modal-btn-primary": function(e) {
                    this.submit();
                    e.preventDefault();
                }
            },
            setAppItems: function(){
                var items = this.buildAppItems(),
                    selectedValue = this.model.inmem.entry.acl.get('app');
                if (!_.where(items, {value:selectedValue}).length) {
                    if (!_.where(items, {value:'search'}).length) {
                        selectedValue = items[0].value;
                    } else {
                        selectedValue = 'search';
                    }
                }
                if (this.children.selectApp.childList) {
                    this.children.selectApp.childList[0].setItems(items);
                    this.children.selectApp.childList[0].setValue(selectedValue);
                }
            },
            buildAppItems: function(){
                var items = [];
                this.collection.appLocals.each(function(app){
                    if (app.entry.acl.get("can_write") &&
                        app.entry.get('name') !== 'launcher') {
                        items.push({
                            value: app.entry.get('name'),
                            label: app.entry.content.get('label') //do not translate app names
                        });
                    }
                });
                return _.sortBy(items, function(item){
                    return (item.label||'').toLowerCase();
                });
            },
            render: function() {
                this.$el.html(Modal.TEMPLATE);

                this.$(Modal.HEADER_TITLE_SELECTOR).html(this.options.showSearchField ? _("Create Report").t() : _("Save As Report").t());

                this.children.flashMessage.render().prependTo(this.$(Modal.BODY_SELECTOR));

                this.$(Modal.BODY_SELECTOR).append(Modal.FORM_HORIZONTAL);

                this.children.title.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                this.children.description.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));

                if (this.options.showSearchField) {
                    this.$(Modal.BODY_FORM_SELECTOR).append('<div class="search-input"></div>');
                    this.$('div.search-input').append('<div class="search-label">' + _('Search').t() + '</div>');
                    this.children.search.render().appendTo(this.$('div.search-input'));
                    this.children.earliestTime.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                    this.children.latestTime.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                }

                if (this.children.selectApp) {
                    this.children.selectApp.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                }

                if (this.options.chooseVisualizationType) {
                    // SPL-77544 - IE by default selects the first button on enter
                    if(userAgent.isIE()) {
                        this.$(Modal.BODY_FORM_SELECTOR).append('<button style="position: absolute; right: 10000px;" />');
                    }

                    if (this.model.searchJob.isReportSearch()) {
                        var type = this.model.inmem.entry.content.get('display.general.type');

                        if (type === 'statistics') {
                            this.model.inmem.entry.content.set({'display.statistics.show': '1'});
                            this.model.inmem.entry.content.set({'display.visualizations.show': '0'});

                        } else if (type === 'visualizations') {
                            this.model.inmem.entry.content.set({'display.statistics.show': '0'});
                            this.model.inmem.entry.content.set({'display.visualizations.show': '1'});
                        }
                        
                    } else {
                        this.model.inmem.entry.content.set({'display.statistics.show': '1'});
                        this.model.inmem.entry.content.set({'display.visualizations.show': '0'});
                    }
                    this.children.visualization.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                }

                if (!this.model.inmem.isAlert()) {
                    this.children.timeRangePickerToggle.render().appendTo(this.$(Modal.BODY_FORM_SELECTOR));
                }

                this.model.inmem.setInmemVizType();
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_CANCEL);
                this.$(Modal.FOOTER_SELECTOR).append(Modal.BUTTON_SAVE);

                return this;
            },
            submit: function() {
                this.model.inmem.setVizType();
                var data = this.model.application.getPermissions("private");
                if (this.canShowAppSelector) {
                    data['app'] = this.model.inmem.entry.acl.get('app');
                }
                this.model.inmem.save({}, {
                    data: data,
                    success: function(model, response) {
                        this.model.inmem.trigger('createSuccess');
                    }.bind(this)
                });
            }
        });
     }
);
