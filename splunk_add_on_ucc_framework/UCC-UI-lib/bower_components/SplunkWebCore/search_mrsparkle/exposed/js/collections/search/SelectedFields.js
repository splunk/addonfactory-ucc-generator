define(
	[
        'collections/Base',
        'models/search/SelectedField'
    ],
    function(BaseCollection, SelectedFieldModel) {
        return BaseCollection.extend({
            model: SelectedFieldModel,
            initialize: function() {
                BaseCollection.prototype.initialize.apply(this, arguments);
                this.on('reset add remove', function() {
                    delete this._names;
                }, this);
            },
            sync: function() {
                throw 'Method disabled';
            },
            valuesToJSONString: function() {
                return JSON.stringify(this.pluck('name'));
            },
            names: function() {
                if (!this._names) {
                    this._names = this.pluck('name');
                }
                return this._names;
            },
            findByName: function(name) {
                return this.find(function(model) {
                    return name === model.get('name');
                });
            }
        });
    }
);
