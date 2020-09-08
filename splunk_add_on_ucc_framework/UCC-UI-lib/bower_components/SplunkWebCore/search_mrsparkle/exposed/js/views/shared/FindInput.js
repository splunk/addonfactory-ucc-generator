define(
    [
        'module',
        'underscore',
        'models/Base',
        'views/Base',
        'util/splunkd_utils',
        'util/keyboard',
        'views/shared/controls/TextControl'
    ],
    function(
        module,
        _,
        BaseModel,
        BaseView,
        splunkdUtils,
        keyboardUtil,
        TextControl
    )
    {
        return TextControl.extend({
            moduleId: module.id,
            // manually setting all classNames so subclassed views still work.
            className: 'control shared-controls-textcontrol shared-findinput',
            initialize: function() {
                var defaults = {
                    canClear: true,
                    style: 'search',
                    placeholder: _('filter').t(),
                    key: 'name',
                    updateOnKeyUp: true,
                    updateOnAutofill: true,
                    fetchDataFilter: false
                };
                this.rawSearch = this.options.rawSearch || new BaseModel({});
                this.conditions = this.options.conditions || {};
                _.defaults(this.options, defaults);
                TextControl.prototype.initialize.apply(this, arguments);
            },
           events: _.extend({}, TextControl.prototype.events, {
                'submit': function(e) {
                    return false;
                }
            }),
            setValueFromModel: function(render) {
                this._setValue(this.rawSearch.get('rawSearch'), render);
                return this;
            },
            isEmpty: function() {
                return this.$input ? this.$input.val() === '' : true;
            },
            updateModel: _.debounce(function() {
                var value = this._value;
                if(this.options.fetchDataFilter && !value && this.model.get('filter')) {
                    this.model.unset('filter');
                } else {
                    var keys = _.isArray(this.options.key) ? this.options.key : this.options.key.split(' ');
                    if(this.options.fetchDataFilter) {
                        var newVal = splunkdUtils.createSearchFilterObj(value, keys);
                        var oldVal = this.model.get('filter');
                        if (this.hasNotChanged(newVal, oldVal)) {
                            return;
                        }
                        this.model.set('filter', newVal);
                    } else {
                        //in the future, consumers of the shared input should refactor away
                        //from passing fetch data as the state model
                        newVal = splunkdUtils.createSearchFilterString(value, keys, {coditions: this.conditions});
                        oldVal = this.model.get('search');
                        if (this.hasNotChanged(newVal, oldVal)) {
                            return;
                        }
                        this.model.set('search', newVal);
                    }
                }
                this.model.set({'offset': '0'});
                this.rawSearch.set('rawSearch', this._value);
            }, 250),
            hasNotChanged: function(newVal, oldVal) {
                oldVal = oldVal || (!_.isObject(oldVal) && "search=*");
                newVal = newVal || (!_.isObject(newVal) && "search=*");
                return _.isEqual(newVal, oldVal);
            }
        });
    }
);
