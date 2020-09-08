define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base'
    ],
    function(
        $,
        _,
        module,
        BaseView
        )
    {
        /**
         * @constructor
         * @memberOf views
         * @name Section
         * @description Section is an ordered collection of views with label, description and added
         * functionality.
         * @extends {views.Base}
         *
         * @param {Object} options
         * @param {Backbone.View[]} options.children A list of view objects.
         * @param {String[]} options.order An array of view object names that defines the order in
         * which they should appear.
         * @param {Backbone.Model} [options.model] Bus model for signalling when dynamic views are
         * loaded and ready to be rendered. We listen for 'update' event, which passes the name of
         * the updated view object.
         * @param {String} [options.id] DOM id of the section's first element
         * @param {String} [options.label] Text label of the section
         * @param {String} [options.Description] Description of the section
         */
        return BaseView.extend(/** @lends views.Section.prototype */{
            moduleId: module.id,

            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                var defaults = {
                    id: '',
                    label: '',
                    children: [],
                    isVisible: true
                };
                _.defaults(this.options, defaults);
                this.order = this.options.order;
                this.children = this.options.children;

                this.loadStatusDfd= $.Deferred(); // are all of the children done loading
                this.waitingList = []; // which children we're waiting for
                this.doneList = []; // which children are done
                _.each(this.order, function(name) {
                    if (!this.children.hasOwnProperty(name)) {
                        this.waitingList.push(name);
                    }
                }, this);
                if (this.waitingList.length == 0) {
                    this.loadStatusDfd.resolve();
                }
                this.model = this.model || {};
                // when children report they're done loading, check if waiting list is over and resolve deferred
                if (this.model.form) {
                    this.model.form.on('update', function(childName) {
                        $('#'+childName+'-placeholder').replaceWith(this.children[childName].render().el);
                        if ($.inArray(childName,this.waitingList)>-1) {
                            this.doneList.push(childName);
                        }
                        if (this.doneList.length == this.waitingList.length) {
                            this.loadStatusDfd.resolve();
                        }
                    }, this);
                }

            },
            events: {
                'click .section-toggle': function(e) {
                    $(e.currentTarget).toggle();
                    e.preventDefault();
                }
            },
            getLoadStatusDfd: function() {
                return this.loadStatusDfd;
            },
            getChildren: function() {
                return _.map(this.order, function(childName) {
                    if (this.children.hasOwnProperty(childName)) {
                        return this.children[childName];
                    }
                }, this);

            },
            // TODO [JCS] This API really should take an animation attribute and pass that directly to the call to
            // this.$el.show. For now we add the disableAnimation flag to minimize the number of files we need to modify to fix
            // https://jira.splunk.com/browse/ERP-686
            show: function(disableAnimation) {
                this.options.isVisible = true;
                disableAnimation ? this.$el.show() : this.$el.show('fast');

                if (this.model.data && this.model.data.hasOwnProperty('enableAttr')) {
                    _.each(this.order, function(childName) {
                        if (this.children.hasOwnProperty(childName) &&
                            this.children[childName].hasOwnProperty('getModelAttributes')
                            ) {
                            _.each(this.children[childName].getModelAttributes(), function(attr) {
                                this.model.data.enableAttr(attr);
                            }, this);
                        }
                    }, this);
                }
            },
            // TODO [JCS] This API really should take an animation attribute and pass that directly to the call to
            // this.$el.hide. For now we add the disableAnimation flag to minimize the number of files we need to modify to fix
            // https://jira.splunk.com/browse/ERP-686
            hide: function(disableAnimation) {
                this.options.isVisible = false;
                disableAnimation ? this.$el.hide() : this.$el.hide('fast');

                // blacklist model attributes of all section's children to prevent hidden elements from being POSTed
                if (this.model.data && this.model.data.hasOwnProperty('disableAttr')) {
                    _.each(this.order, function(childName) {
                        if (this.children.hasOwnProperty(childName) &&
                            this.children[childName].hasOwnProperty('getModelAttributes')
                            ) {
                            _.each(this.children[childName].getModelAttributes(), function(attr) {
                                this.model.data.disableAttr(attr);
                            }, this);
                        }
                    }, this);
                }
            },
            /*
            Clears model values for all children of this section. Assumes the section contains only ControlGroups.
             */
            clear: function() {
                _.each(this.getChildren(), function(child) {
                    _.each(child.children, function(grandChild) {
                        grandChild.model.set(grandChild.options.modelAttribute, '', {silent: true});
                    }, this);
                }, this);
            },
            isHidden: function() {
                return !this.options.isVisible;
            },
            render: function() {
                var html = this.compiledTemplate({
                    options: this.options
                });
                this.$el.html(html);
                _.each(this.order, function(childName) {
                    var el;
                    if (this.children.hasOwnProperty(childName)) {
                        el = this.children[childName].render().el;
                    } else {
                        el = '<div id="'+childName+'-placeholder"/>';
                    }
                    this.$('.children').append(el);
                }, this);
                return this;
            },
            template: '\
                <h5 class="section"><%- options.label %></h5>\
                <p><%- options.description %></p>\
                <div class="children"></div>\
                '
        });
    }
);
