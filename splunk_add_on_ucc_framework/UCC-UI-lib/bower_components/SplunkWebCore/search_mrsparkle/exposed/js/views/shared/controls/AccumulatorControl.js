define([
        'jquery',
        'underscore',
        'module',
        'views/shared/controls/Control'
    ],
    function (
        $,
        _,
        module,
        Control
        ) {
        return Control.extend({
            moduleId: module.id,
            initialize: function() {
                var defaults = {
                    itemName: _('item(s)').t()
                };

                _.defaults(this.options, defaults);

                Control.prototype.initialize.apply(this, arguments);
            },
            events: {
                'click a.addAllLink': function(e) {
                    this._addAll();
                    e.preventDefault();
                },
                'click a.removeAllLink': function(e) {
                    this._removeAll();
                    e.preventDefault();
                },
                'click .availableOptions li': function(e) {
                    var li = e.currentTarget;
                    this._addToSelected([li]);
                    e.preventDefault();
                },
                'click .selectedOptions li': function(e) {
                    var li = e.currentTarget;
                    this._removeFromSelected([li]);
                    e.preventDefault();
                }
            },

            render: function () {
                if (!this.el.innerHTML) {
                    this.$el.html(this.compiledTemplate({ options: this.options }));
                    this._populateAvailableOptions();
                    this._addPreSelected();
                    this.$('.availableOptionsHeader').text(_('Available ').t() + this.options.itemName);
                    this.$('.selectedOptionsHeader').text(_('Selected ').t() + this.options.itemName);
                }
                return this;
            },

            onInputChange: function() {
                // collect selected values and update the model
                var $selectedOptions = this.$('.selectedOptions li');
                var selectedValues = [];
                $.each($selectedOptions, function(ix, option) {
                    selectedValues.push($(option).data('id'));
                });
                this.setValue(selectedValues, false);

                // sort alphabetically
                $selectedOptions.sort(function(a,b){
                    var keyA = $(a).text();
                    var keyB = $(b).text();

                    if (keyA < keyB) return -1;
                    if (keyA > keyB) return 1;
                    return 0;
                });
                var selItemsUl = this.$('.selectedOptions');
                $.each($selectedOptions, function(i, li){
                    selItemsUl.append(li);
                });
            },

            _populateAvailableOptions: function(options) {
                var $availableOptions = this.$('.availableOptions');
                for (var i = 0, len = this.options.availableItems.length; i < len; i++) {
                    var item = this.options.availableItems[i],
                        iconClass = item['icon'],
                        $row = $('<div>').text(item['label']).append($('<span class="icon-class">').text(iconClass)),
                        opt = $('<li>').data({
                            id: item['value'],
                            label: item['label'],
                            'icon-class': iconClass
                        }).html($row);
                    $availableOptions.append(opt);
                }
            },

            _addToSelected: function(liArray) {
                var $selectedOptions = this.$('.selectedOptions');
                $.each(liArray, function(ix, li) {
                    if (!$(li).hasClass('selected')) {
                        var id = $(li).data('id'),
                            iconClass = $(li).data('icon-class'),
                            label = $(li).data('label'),
                            $row = $('<div>').text(label).append($('<span class="icon-class">').text(iconClass));
                        var newLi = $('<li>').data('id',id).html($row);
                        $selectedOptions.append(newLi);
                        $(li).addClass('selected');
                    } else {
                        this._removeFromSelected(liArray);
                    }
                }.bind(this));
                this.onInputChange();
            },
            _removeFromSelected: function(liArray) {
                $.each(liArray, function(ix, li) {
                    var id = $(li).data('id');
                    this.$('.availableOptions li').filter(function(ix,item) {
                        return $(item).data('id') == id;
                    }).removeClass("selected");
                    this.$('.selectedOptions li').filter(function(ix,item) {
                        return $(item).data('id') == id;
                    }).remove();
                }.bind(this));
                this.onInputChange();
            },
            _addAll: function() {
                var liArray = this.$('.availableOptions').find('li').not('.selected').get();
                this._addToSelected(liArray);
                this.onInputChange();
            },
            _removeAll: function() {
                this.$('.selectedOptions').find('li').remove();
                this.$('.availableOptions li.selected').removeClass("selected");
                this.onInputChange();
            },
            _addPreSelected: function() {
                if (this.options.selectedItems instanceof Array && this.options.selectedItems.length > 0) {
                    var liArray = this.$('.availableOptions li').filter(function(ix, item) {
                        return this.options.selectedItems.indexOf($(item).data('id')) > -1;
                    }.bind(this));
                    this._addToSelected(liArray);
                    this.onInputChange();
                }
            },
            remove: function () {
                return Control.prototype.remove.apply(this, arguments);
            },
            template: '\
                <div class="accumulator">\
                    <div class="availableOptionsContainer">\
                        <a class="addAllLink"><%= _("add all").t() %> &raquo;</a>\
                        <span class="availableOptionsHeader"></span>\
                        <ul class="availableOptions"></ul>\
                    </div>\
                    \
                    <div class="selectedOptionsContainer">\
                        <a class="removeAllLink">&laquo; <%= _("remove all").t() %></a>\
                        <span class="selectedOptionsHeader"></span>\
                        <ul class="selectedOptions"></ul> \
                    </div>\
                    <div class="clearfix"></div>\
                </div>'
        });
    });
