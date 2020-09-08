/**
 * @author jszeto, frobinson
 * @date 5/28/14, 7/31/14
 *
 * Displays breadcrumbs for the full path of a DirectoryListing model
 *
 * Input:
 *
 * model
 * directoryModelAttribute {String} - attribute in the model that holds the full path of the directory
 * rootPathModelAttribute {String} - attribute in the model that holds the root path of the directory. The root path
 * and its ancestors are not clickable
 *
 * Events:
 *
 * pathClicked (partialPath) - triggered when a breadcrumb is clicked. Contains the partialPath string for the clicked breadcrumb
 *
 */
define([
    'jquery',
    'underscore',
    'backbone',
    'module',
    'views/Base',
    'splunk.util'
],
    function (
        $,
        _,
        Backbone,
        module,
        BaseView,
        splunkUtils
        ) {

        var PROTOCOL_HOST_DIVIDER = "://";
        var ROOT_URL = "/";

        return BaseView.extend({
            moduleId: module.id,

            events:{
                'click li a': function(e) {
                    e.preventDefault();
//                    console.log("DirBreadcrumb dir clicked", $(e.target).attr("data-full-path"));
                    this.trigger("pathClicked","dir", $(e.target).attr("data-full-path"));
                }
            },

            initialize: function(options) {
                BaseView.prototype.initialize.call(this, options);
                //  Only listen to the change events on the attributes we care about
                var eventType = "change:" + this.options.directoryModelAttribute +
                                " change:" +  this.options.rootPathModelAttribute +
                                " change:" + this.options.selectedSourceAttribute;
                this.model.on(eventType, this.debouncedRender, this);
            },

            // If we are a full uri path, then extract protocol and host first before
            // generating the array of paths
            splitPath: function(path) {
                var host = "";
                var arrayPath = [];
                var dividerIndex = path.indexOf(PROTOCOL_HOST_DIVIDER);
                if (dividerIndex != -1) {
                    var firstSlash = path.indexOf("/", dividerIndex+PROTOCOL_HOST_DIVIDER.length);
                    if (firstSlash != -1) {
                        host = path.slice(0, firstSlash);
                        path = path.slice(firstSlash+1);
                        arrayPath = path.split("/");
                        arrayPath.unshift(host);
                    }
                } else {
                    arrayPath = path.split("/");
                }

                return arrayPath;
            },

            render: function() {
                // Detach children
                this.$(".breadcrumbs").empty();

                // Use template
                this.$el.html(this.compiledTemplate({}));
                var partialPath = "";
                var selectedPath = this.model.get(this.options.directoryModelAttribute);
                var rootPath = this.model.get(this.options.rootPathModelAttribute);
                var selectedSource = this.model.get(this.options.selectedSourceAttribute);
                var activePathArray = [];
                var activePath;
                var rootPathArray = [];
                var firstClickableIndex;
                var currentPathIndex;
                var lastPathIndex;
                var rowTemplate;
                var isRootClickable = rootPath == ROOT_URL;
                var isFullPath = rootPath ? rootPath.indexOf(PROTOCOL_HOST_DIVIDER) != -1 : false;
                if (!_(selectedPath).isUndefined()) {
                    // Normalize the paths. Sometimes they have forward slashes at the beginning or end of the paths
                    selectedPath = splunkUtils.trim(selectedPath, "/");
                    if (!isRootClickable) {
                        rootPath = splunkUtils.trim(rootPath, "/");
                    }

                    /*if (selectedPath.indexOf(rootPath) === -1) {
                        throw new Error("Breadcrumb error: Root Path [" + rootPath + "] is not in Full Path [" + selectedPath + "]");
                    }*/

                    activePath = selectedPath;

                    if (isRootClickable) {
                        firstClickableIndex = 0;
                    } else {
                        rootPathArray = this.splitPath(rootPath);
                        firstClickableIndex = Math.max(0, rootPathArray.length - 1);
                    }

                    // If selectedSource is set, then use this to construct activePathArray
                    if(!_.isUndefined(selectedSource))
                        activePath = splunkUtils.trim(selectedSource, "/");

                    if (activePath != "")
                        activePathArray = this.splitPath(activePath);

                    // If the rootPath is /, then we special case.
                    // We add / to the path array and then handle that case in the loop below
                    if (isRootClickable)
                        activePathArray.unshift(ROOT_URL);

                    lastPathIndex = !_.isUndefined(selectedSource) ? activePathArray.length - 2 : activePathArray.length - 1;

//                    console.log("DirectoryBreadcrumb root",rootPath,"selected",selectedPath,"source",selectedSource,"activePath length",activePathArray.length);
                    // Attach children and render them
                    _(activePathArray).each(function(path, index) {
                        // If path == /, then don't construct the partialPath or fullPath
                        var fullPath = "";

                        if (isFullPath && index == 0) {
                            partialPath += path;
                        } else if (path != ROOT_URL) {
                            partialPath += "/" + path;
                        }
                        currentPathIndex = activePathArray.indexOf(path);

                        if (currentPathIndex == -1) {
                            throw new Error("Breadcrumb error: Path [" + path + "] is not in Selected Path [" + selectedPath + "]");
                        }

                        if (path != ROOT_URL)
                            fullPath = partialPath + "/";
//                        console.log("Breadcrumb dir [",path,"] full path [",fullPath,"]");
                        // Here's how we calculate which breadcrumbs are clickable
                        // Given a root path (eg. /user/jszeto/) and an selected path (eg. /user/jszeto/data/2000/august)
                        // The following are clickable (jszeto, data, 2000)
                        // If path == /, then show a clickable or non-clickable / as a breadcrumb item
                        if (path == ROOT_URL) {
                            if (currentPathIndex == lastPathIndex)
                                rowTemplate = _(this.nonclickableRootTemplate).template({});
                            else
                                rowTemplate = _(this.clickableRootTemplate).template({});
                        } else if (currentPathIndex < firstClickableIndex || (currentPathIndex == lastPathIndex)) {
                            rowTemplate = _(this.nonclickableTemplate).template({name: path, selectedPath: fullPath, source: selectedSource});
                        } else if (!_(selectedSource).isUndefined() && currentPathIndex == activePathArray.length - 1 ){
                            rowTemplate = _(this.lastCrumbTemplate).template({name: path, selectedPath: fullPath, source: selectedSource});
                        } else {
                            rowTemplate = _(this.clickableTemplate).template({name: path, selectedPath: fullPath, source: selectedSource});
                        }
                        this.$(".breadcrumbs").append(rowTemplate);
                    }, this);
                }
                return this;
            },

            template:

                '\
                <ul class="nav nav-pills breadcrumbs">\
                </ul>\
            ',
            clickableTemplate: '<li><table><tr><td><a href="#" data-full-path="<%= selectedPath%>"><%= name %></a></td><td  style="width: auto">\
            <%-_("/").t() %></td></tr></li></table> \
            ',
            nonclickableTemplate: '<li><table><tr><td><%= name %></td><td  style="width: auto">\
            <%-_("/").t() %></td></tr></table></li>\
            ',
            clickableRootTemplate: '<li><table><tr><td><a href="#" data-full-path="/">/</a></td></tr></li></table> \
            ',
            nonclickableRootTemplate: '<li><table><tr><td>/</td></tr></li></table> \
            ',
            lastCrumbTemplate: '<li><table><tr><td class="last-crumb""><%= name %></td><td  style="width: auto" ></td></tr></table></li>\
            '
        });

    });

