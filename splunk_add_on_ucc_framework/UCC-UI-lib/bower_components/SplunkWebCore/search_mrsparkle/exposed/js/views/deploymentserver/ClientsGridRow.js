/**
 * @author jszeto
 * @date 7/30/13
 *
 * The tagName must be set by the parent view to be a TR. Backbone requires this value be passed into the options hash
 * of the constructor, so unfortunately we can't define it in this class.
 *
 */

define([
    'jquery',
    'underscore',
    'backbone', 
    'module',
    'uri/route',
    'util/time',
    'views/Base',
    'collections/services/deploymentserver/DeploymentApplications',
    'collections/services/deploymentserver/DeploymentServerClasses',
    'views/deploymentserver/shared/MoreAppsLink', 
    'views/deploymentserver/shared/MoreServerclassesLink', 
    'views/shared/delegates/RowExpandCollapse',
    'views/deploymentserver/DeleteClientLink',
    'contrib/text!views/deploymentserver/ClientsGridRow.html'
],
    function(
        $,
        _,
        Backbone, 
        module,
        route,
        time_utils,
        BaseView,
        DeploymentAppsCollection, 
        ServerclassesCollection, 
        MoreAppsLink, 
        MoreServerclassesLink,
        RowExpandCollapse,
        DeleteClientLink,
        clientsGridRowHtml
        ) {

        return BaseView.extend({
            tagName: 'tr',

            moduleId: module.id,

            isExpanded: false,
            template: clientsGridRowHtml,

            events: (function() {
                var events = {};
                events['click td.' + RowExpandCollapse.TOGGLE_CELL_CLASS + ', .col-deployed a'] = 'toggleCellClickHandler';
                return events;
            })(),

            toggleCellClickHandler: function() {
                this.isExpanded = !this.isExpanded;
                this.debouncedRender();
                return false;
            },

            /**
             * @constructor
             * @param options {Object} {
             * }
             */

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                this.className = this.options.rowClass;
            },
            renderMoreAppsLink: function() {
                        var that = this; 
                        var applications = this.model.client.entry.content.get("applications");
                        if (_.size(applications) > 3) {
                                var appsWithClient = new DeploymentAppsCollection(); 
                                appsWithClient.fetch({
                                    data:{
                                        clientId: this.model.client.entry.get("name"), 
                                        count: 10 
                                    }, 
                                    success: function(apps, response){
                                        var moreapps_id = "#more_apps_" + that.model.client.entry.get("name");  
                                        var filtersModel = new Backbone.Model(); 
                                        var paginatorModel = new Backbone.Model(); 
                                        var data = {};
                                        data.clientId = that.model.client.entry.get("name");  
                                        paginatorModel.set('data', data);
                                        var moreAppsView  = new MoreAppsLink({
                                            model: {
                                               filters: filtersModel,   
                                               paginator: paginatorModel 
                                            }, 
                                            collection: appsWithClient
                                        });  
                                        that.$(moreapps_id).html(', ');  
                                        that.$(moreapps_id).append(moreAppsView.render().el); 
                                        that.$(moreapps_id).show(); 
                                    }
                                }); 
                       }
           },
           renderMoreServerclassesLink: function() {
                        var that = this; 
                        var serverclasses = this.model.client.entry.content.get("serverClasses");
                        if (_.size(serverclasses) > 3) {
                                var serverclassesWithClient = new ServerclassesCollection(); 
                                serverclassesWithClient.fetch({
                                    data:{
                                        clientId: that.model.client.entry.get("name"), 
                                        count: 10 
                                    }, 
                                    success: function(serverclasses, response){
                                        var moreserverclasses_id = "#more_serverclasses_" + that.model.client.entry.get("name");  
                                        var filtersModel = new Backbone.Model(); 
                                        var paginatorModel = new Backbone.Model(); 
                                        var data = {};
                                        data.clientId = that.model.client.entry.get("name");  
                                        paginatorModel.set('data', data);
                                        var moreServerclassesView  = new MoreServerclassesLink({
                                            model: {
                                               filters: filtersModel,   
                                               paginator: paginatorModel 
                                            }, 
                                            collection: serverclassesWithClient
                                        });  
                                        that.$(moreserverclasses_id).html(', ');  
                                        that.$(moreserverclasses_id).append(moreServerclassesView.render().el); 
                                        that.$(moreserverclasses_id).show(); 
                                    }
                                }); 
                       }
           }, 
            render: function() {

                var clientModel = this.model.client;

                var searchUrl = "";
                var applications = clientModel.entry.content.get("applications");
                var numSuccessfulDownloads = 0;
                var numApps = 0;
                var key;

                for (key in applications) {
                    numApps++;
                    var result = applications[key]["result"];
                    if (result  == "Ok"){
                        numSuccessfulDownloads++;
                    }
                }

                var deployedRatio = '' +  numSuccessfulDownloads + '/' + numApps;
                var errorStyle = 'display:none';
                var numErrors = numApps - numSuccessfulDownloads;
                if (numErrors > 0) {
                    errorStyle = '';
                }

                var lastPhoneHomeTime = new Date(clientModel.entry.content.get("lastPhoneHomeTime"));
                var curTime = (new Date()).getTime()/1000;
                var avgPhonehomeInterval = clientModel.entry.content.get("averagePhoneHomeInterval");

                var phonehomeErrorStyle = 'display:none';
                var timeSinceLastPhoneHome = curTime - lastPhoneHomeTime;
                if (avgPhonehomeInterval > 0 && timeSinceLastPhoneHome > 3 * avgPhonehomeInterval ) {
                    phonehomeErrorStyle = '';
                }

                var relativeLastPhoneHomeTime = time_utils.convertToRelativeTime(lastPhoneHomeTime);

                var numItems = 0;
                var isFirstItem = true;
                var applicationList = "";
                for (key in applications) {
                    if (!applications.hasOwnProperty(key))
                        continue;
                    numItems++;
                    if (numItems > 3)
                        break;
                    if (applications[key]["result"] != "Ok")
                        continue;
                    if (!isFirstItem)
                        applicationList += ", ";
                    applicationList += key;

                    isFirstItem = false;
                }

                if (applicationList == "")
                    applicationList = _("None").t();

                var serverClassesList = "";
                var serverClasses = clientModel.entry.content.get("serverClasses");
                isFirstItem = true;
                numItems = 0;
                for (key in serverClasses) {
                    if (!serverClasses.hasOwnProperty(key))
                        continue;
                    numItems++;
                    if (numItems > 3)
                        break;
                    if (!isFirstItem)
                        serverClassesList += ", ";
                    serverClassesList += key;
                    isFirstItem = false;
                }

                if (serverClassesList == "")
                    serverClassesList = _("None").t();

                var errorList = "";
                if (numErrors > 0)  {
                    searchUrl = route.page(this.model.application.get('root'), this.model.application.get('locale'), 'search', 'search', {data: {q: 'index=_internal sourcetype=splunkd record (New OR Updating) name=' + clientModel.entry.content.get('name') + " result=Fail | head 100"}});

                    isFirstItem = true;
                    for (key in applications) {
                        if (!applications.hasOwnProperty(key))
                            continue;
                        if (applications[key]["result"] == "Ok")
                            continue;
                        if (!isFirstItem)
                            errorList += ", ";
                        errorList += key;
                        isFirstItem = false;
                    }
                }

                if (errorList == "")
                    errorList = _("None").t();

                var html = this.compiledTemplate({model: clientModel,
                                                  isExpanded: this.isExpanded,
                                                  numSuccessfulDownloads: numSuccessfulDownloads,
                                                  numErrors: numErrors,
                                                  phonehomeErrorStyle: phonehomeErrorStyle,
                                                  errorStyle: errorStyle,
                                                  relativeLastPhoneHomeTime: relativeLastPhoneHomeTime,
                                                  applicationList: applicationList,
                                                  serverClassesList: serverClassesList,
                                                  errorList: errorList,
                                                  searchUrl: searchUrl,
                                                  rowClass: this.options.rowClass,
                                                  toggleCellClass: RowExpandCollapse.TOGGLE_CELL_CLASS,
                                                  expandedCellBody: RowExpandCollapse.EXPANDED_CELL_MARKUP,
                                                  collapsedCellBody: RowExpandCollapse.COLLAPSED_CELL_MARKUP,
                                                  rowIdAttribute: RowExpandCollapse.ROW_ID_ATTR});

                this.$el.html(html);

                var delete_link_id = '#delete_' + clientModel.entry.get("name");
                var deleteLinkView = new DeleteClientLink({
                    model: {
                        client: clientModel,
                        paginator: this.model.paginator
                    }
                });
                this.$(delete_link_id).html(deleteLinkView.render().el);

                // Set the row id attribute on the root tag which is a TR
                this.$el.attr(RowExpandCollapse.ROW_ID_ATTR, clientModel.entry.get("name"));
                if (this.isExpanded) {
                    this.$el.addClass(RowExpandCollapse.EXPANDED_ROW_CLASS);

                } else {
                    this.$el.removeClass(RowExpandCollapse.EXPANDED_ROW_CLASS);
                }

                this.renderMoreAppsLink();  
                this.renderMoreServerclassesLink();  
                return this;
            }
        });

    });
