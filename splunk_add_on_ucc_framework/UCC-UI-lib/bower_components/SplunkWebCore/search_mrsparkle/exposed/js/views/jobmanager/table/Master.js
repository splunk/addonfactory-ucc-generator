define(
    [
        'module',
        'jquery',
        'underscore',
        'views/Base',
        'views/shared/TableHead',
        'views/jobmanager/table/TableRow',
        'views/jobmanager/table/EmptyTableRow',
        'views/jobmanager/table/MoreInfo',
        'views/shared/delegates/TableDock',
        'util/keyboard'
    ],
    function(
        module,
        $,
        _,
        BaseView,
        TableHead,
        TableRow,
        EmptyTableRow,
        MoreInfo,
        TableDock,
        keyboard
    ){
        return BaseView.extend({
            moduleId: module.id,
            /**
             * @param {Object} options {
             *     model: {
             *         application: this.model.application,
             *         user: this.model.user,
             *         appLocal: this.model.appLocal,
             *         serverInfo: this.model.serverInfo,
             *         state: this.model.state,
             *         checkAllCheckbox: this.model.checkAllCheckbox
             *     },
             *     collection: {
             *         jobs: this.collection.jobs,
             *         apps: this.collection.apps
             *     }
             * }
             */
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);
                this.children.head = new TableHead({
                    model: {
                        state: this.model.state,
                        checkbox: this.model.checkAllCheckbox
                    },
                    checkboxClassName: 'col-select-all',
                    columns: [
                        {
                            className: 'expands'
                        },
                        {
                            className: 'col-select-all'
                        },
                        {
                            label: _("Owner").t(),
                            className: 'col-owner',
                            sortKey: 'user'
                        },
                        {
                            label: _("Application").t(),
                            className: 'col-application',
                            sortKey: 'eai:acl.app',
                            visible: function() {
                                return this.model.user.canUseApps();
                            }.bind(this)
                        },
                        {
                            label: _("Events").t(),
                            className: 'col-events',
                            sortKey: 'eventCount'
                        },
                        {
                            label: _("Size").t(),
                            className: 'col-size',
                            sortKey: 'diskUsage'
                        },
                        {
                            label: _("Created at").t(),
                            className: 'col-created',
                            sortKey: 'dispatch_time'
                        },
                        {
                            label: _("Expires").t(),
                            className: 'col-expires',
                            sortKey: 'ttl'
                        },
                        {
                            label: _("Runtime").t(),
                            className: 'col-runtime',
                            sortKey: 'runDuration'
                        },
                        {
                            label: _("Status").t(),
                            className: 'col-status'
                        },
                        {
                            label: _("Actions").t(),
                            className: 'col-actions'
                        }
                    ]
                });
                this.children.rows = this.rowsFromCollection();
                this.children.tableDock = new TableDock({
                    el: this.el,
                    offset: 87,
                    dockScrollBar: false,
                    proxyThEvents: ['click label.checkbox']
                });

                this.activate();
            },
            
            events: {
                'click .col-select-all': function(e) {
                    // Must listen to click and not change of selectAll because
                    // selectAll can be updated from other places
                    var value = this.model.checkAllCheckbox.get('selectAll');
                    this.collection.jobs.forEach(function(job) {
                        if (job.entry.acl.canWrite()) {
                            job.set('selected', value);
                        }
                    });
                },
                'click td.expands': function(e) {
                    this.toggleRow($(e.currentTarget));
                },
                'keydown td.expands': function(e) {
                    if (e.which === keyboard.KEYS.ENTER) {
                        this.toggleRow($(e.currentTarget));
                        e.preventDefault();
                    }
                },
                'click td.expands a': function(e) {
                    e.preventDefault();
                }
            },
            
            startListening: function() {
                this.listenTo(this.collection.jobs, 'reset', this.renderRows);

                this.listenTo(this.model.checkAllCheckbox, 'change', function() {
                    this.children.tableDock.update();
                });

                $(window).on('resize.' + this.nameSpace, _.debounce(this.disableNonTruncatedExpands.bind(this)));
            },

            toggleRow: function($expandsTD) {
                if (!$expandsTD.hasClass('disabled')) {
                    var $arrow = $expandsTD.find('i'),
                        $details = $expandsTD.parent().next().find('td.details'),
                        expanded = $details.hasClass('expanded');

                    if (expanded) {
                        $arrow.addClass('icon-triangle-right-small').removeClass('icon-triangle-down-small');
                        $details.removeClass('expanded');
                    } else {
                        $arrow.removeClass('icon-triangle-right-small').addClass('icon-triangle-down-small');
                        $details.addClass('expanded');
                    }
                }
            },

            disableNonTruncatedExpands: function() {
                _.each(this.$('td.expands'), function(expandsTD) {
                    var $expandsTD = $(expandsTD),
                        $searchRow = $expandsTD.parent().next(),
                        $details = $searchRow.find('td.details'),
                        $testSearchRow = $searchRow.clone().css({visibility: 'hidden'}),
                        expanded = $details.hasClass('expanded'),
                        collapsedHeight, expandedHeight;
                        
                    $testSearchRow.prepend('<td></td>');
                    $testSearchRow.appendTo(this.$('tbody'));
                    
                    if (expanded) {
                        expandedHeight = parseFloat($testSearchRow.css('height'));
                        $testSearchRow.find('td.details').removeClass('expanded');
                        collapsedHeight = parseFloat($testSearchRow.css('height'));
                    } else {
                        collapsedHeight = parseFloat($testSearchRow.css('height'));
                        $testSearchRow.find('td.details').addClass('expanded');
                        expandedHeight = parseFloat($testSearchRow.css('height'));
                    }
                    
                    if (expandedHeight > collapsedHeight) {
                        $expandsTD.removeClass('disabled').find('span').replaceWith('<a href="#"><i class="icon-triangle-right-small"></i></a>');
                    } else {
                        if (expanded) {
                            this.toggleRow($expandsTD);
                        }
                        $expandsTD.addClass('disabled').find('a').replaceWith('<span><i class="icon-triangle-right-small"></i></span>');
                    }
                    
                    $testSearchRow.remove();
                }, this);
            },
            
            rowsFromCollection: function() {
                var rows = [];
                if (this.collection.jobs.length) {
                    this.collection.jobs.each(function(model, i) {
                        model.set('selected', 0);
                        rows.push(new TableRow({
                            model: {
                                job: model,
                                application: this.model.application,
                                user: this.model.user,
                                appLocal: this.model.appLocal,
                                serverInfo: this.model.serverInfo
                            },
                            attributes: {
                                'data-sid': model.get(model.idAttribute)
                            }
                        }));
                        rows.push(new MoreInfo({
                            model: {
                                job: model,
                                application: this.model.application
                            },
                            collection: {
                                apps: this.collection.apps
                            },
                            cols: 9 + this.model.user.canUseApps(),
                            attributes: {
                                'data-sid': model.get(model.idAttribute)
                            }
                        }));
                    }, this);
                } else {
                    rows.push(new EmptyTableRow({
                        collection: {
                            jobs: this.collection.jobs
                        },
                        model: {
                            state: this.model.state
                        },
                        cols: 10 + this.model.user.canUseApps()
                    }));
                }
                return rows;
            },
            
            _render: function() {
                var fragment = document.createDocumentFragment();
                _(this.children.rows).each(function(row) {
                    row.render().appendTo(fragment);
                }, this);
                this.$('.job-listings').html(fragment);
                this.disableNonTruncatedExpands();
                this.children.tableDock.update();
            },
            
            renderRows: function() {
                _(this.children.rows).each(function(row){ row.debouncedRemove({detach: true}); }, this);
                this.children.rows = this.rowsFromCollection();
                this._render();
            },
            
            render: function() {
                if (!this.el.innerHTML) {
                    this.$el.append(this.compiledTemplate({}));
                    this.children.head.render().prependTo(this.$('.table'));
                }
                this._render();
                return this;
            },

            onAddedToDocument: function() {
                BaseView.prototype.onAddedToDocument.apply(this, arguments);
                this.disableNonTruncatedExpands();
            },
            
            template: '\
                <table class="table table-fixed table-row-expanding table-chrome">\
                    <tbody class="job-listings"></tbody>\
                </table>\
            '
        });
    }
);
