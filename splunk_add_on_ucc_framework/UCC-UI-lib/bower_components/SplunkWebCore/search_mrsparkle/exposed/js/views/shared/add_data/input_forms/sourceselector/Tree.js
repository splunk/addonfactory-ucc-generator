define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'uri/route',
        'tree.jquery' //NO IMPORT
    ],
    function(
        _,
        $,
        module,
        Base,
        route
    ){
        return Base.extend({
            moduleId: module.id,
            className: 'treeview',
            initialize: function(options) {
                Base.prototype.initialize.apply(this, arguments);
                this.urlArgsOverride = this.options.urlArgsOverride || {};
            },
            events: {
                'tree.select': 'onTreeSelect',
                'keypress .jqtree-title': function(e){
                    if (e.which === 13) {
                        var node_id = e.target.parentNode.getAttribute("nodeid");
                        var node = this.$el.tree('getNodeById', node_id);
                        if (node) {
                            this.trigger('select', node);
                        }
                    }
                },
                'keypress .jqtree-toggler': function(e){
                    if (e.which === 13) {
                        var node_id = e.target.parentNode.getAttribute("nodeid");
                        var node = this.$el.tree('getNodeById', node_id);
                        if (node) {
                            this.$el.tree('toggle', node);
                        }
                    }
                }
            },
            onTreeSelect: function(event){
                if (event.node) {
                    this.trigger('select', event.node);
                }
            },
            render: function() {
                this.fileSystemUrl = this.options.explorerUrl;
                if (!this.fileSystemUrl){
                    return;
                }

                var tree = this.$el.tree({
                    dataUrl: function(node){
                        return this.treeUrl(node);
                    }.bind(this),
                    dataFilter: function(data){
                        var mapped = [];
                        _.each(data.entry, function(obj){
                            var loadOnDemand = false;
                            if (obj.content.hasSubNodes == true ||
                                !obj.content.hasOwnProperty('hasSubNodes') // some root nodes
                            ){
                                loadOnDemand = true;
                            }
                            mapped.push( {
                                id: obj.name,
                                label: obj.content.name || obj.name,
                                hasSubNodes: obj.content.hasSubNodes,
                                load_on_demand: loadOnDemand
                            });
                        });
                        return mapped;
                    },
                    onCanSelectNode: function(node) {
                        return true;
                    },
                    onLoadFailed: function(response) {
                        var msg = response.responseJSON.messages[0];
                        msg['html'] = msg['text'];
                        this.trigger('fetchError', msg);
                    }.bind(this),
                    onCreateLi: function(node, $li) {
                        $li.find("div").attr('nodeid', node.id);
                        $li.find("div > a").attr('tabindex', 0);
                        $li.find("div > span").attr('tabindex', 0);
                        if (!node.isFolder()) {
                            if (node.id === node.parent.id) {
                                // Hide the contents of an empty folder.
                                $li.hide();
                            }
                        }
                    }
                });

                tree.tree('loadDataFromUrl', this.treeUrl('/'), tree.children[0]);

                return this;
            },
            treeUrl: function(node) {
                node = node || {id:''};
                var urlArgs = {
                        output_mode: 'json',
                        count: 10000,
                        sort_key: ['hasSubNodes', 'name'],
                        sort_dir: 'desc',
                        sort_mode: 'num'
                    },
                    nodeid = node.id;
                urlArgs = _.extend(urlArgs, this.urlArgsOverride);
                urlArgs = $.param(urlArgs).replace(/%5B%5D/g,'');

                // we have to work around the issue of http proxies automatically
                // unescaping %2F into /.  if we escape it manually once, THEN urlencode
                // the whole string, we can hide the / from these troublemakers.
                // REF- EAIOutputParameters.cpp
                if (nodeid) {
                    nodeid = nodeid.replace(/\//g, '%2F');
                }
                return this.fileSystemUrl + '/' + encodeURIComponent(nodeid || '') + '?' + urlArgs;
            }
        });
    }
);
