define(['underscore', 'jquery', 'models/Base'], function(_, $, BaseModel) {

    //     *                             (             
    //   (  `       (    )               )\ )       )  
    //   )\))(    ( )\( /((        (  ( (()/(    ( /(  
    //  ((_)()\  ))((_)\())\  (    )\))( /(_))(  )\()) 
    //  (_()((_)/((__(_))((_) )\ )((_))\(_))  )\(_))/  
    //  |  \/  (_))| | |_ (_)_(_/( (()(_| _ \((_| |_   
    //  | |\/| / -_| |  _|| | ' \)/ _` ||  _/ _ |  _|  
    //  |_|  |_\___|_|\__||_|_||_|\__, ||_| \___/\__|  
    //                            |___/                

    /**
     * @class MeltingPot model is a wrapper around 2 or more models, where models are logically layered on top of each
     * other. Consider delegates being [model1, model2]:
     *  - if an attribute is defined in model1, then the meltingpot model will return this attribute on get()
     *  - otherwise it will delegate to model2 attribute value
     */
    var MeltingPot = BaseModel.extend({
        constructor: function(options) {
            options || (options = {});
            this._delegates = [];
            this._readOnly = !!options.readOnly;
            BaseModel.prototype.constructor.call(this);
            if (options.delegates) {
                this.setDelegates(options.delegates);
            }
        },
        setDelegates: function(models, options) {
            options || (options = {});
            this.removeDelegates();
            _(models).each(function(model) {
                this.addDelegate(model, {silent: true});
            }.bind(this));
            if (!options.silent) {
                this.rebuildFromDelegates();
            }
        },
        addDelegate: function(model, options) {
            options || (options = {});
            this.listenTo(model, 'change', this.rebuildFromDelegates);
            if (options.index != null) {
                this._delegates.splice(options.index, 0, model);
            } else {
                this._delegates.push(model);
            }
            if (!options.silent) {
                this.rebuildFromDelegates();
            }
        },
        removeDelegates: function(options) {
            options || (options = {});
            _(this._delegates).each(function(model) {
                this.removeDelegate(model, {silent: true});
            }.bind(this));
            if (!options.silent) {
                this.rebuildFromDelegates();
            }
        },
        removeDelegate: function(model, options) {
            options || (options = {});
            this._delegates = _(this._delegates).without(model);
            this.stopListening(model);
            if (!options.silent) {
                this.rebuildFromDelegates();
            }
        },
        rebuildFromDelegates: function() {
            var mergedNewAttrs = MeltingPot.mergeModels(this._delegates);
            var clearAttrNames = _.difference(_.keys(this.attributes), _.keys(mergedNewAttrs));
            if (clearAttrNames.length) {
                var clearAttrs = _.object(clearAttrNames, _(clearAttrNames).map(function() { return undefined; }));
                BaseModel.prototype.set.call(this, clearAttrs, {unset: true});
            }

            BaseModel.prototype.set.call(this, mergedNewAttrs);
        },
        getDelegates: function() {
            return this._delegates.slice();
        },
        firstDelegate: function() {
            return this._delegates[0];
        },
        set: function() {
            var firstDelegate = this.firstDelegate();
            if (firstDelegate) {
                if (this._readOnly) {
                    throw new Error('Not allowed to call set() method on read-only meltingpot model');
                }
                firstDelegate.set.apply(firstDelegate, arguments);
            }
        },
        unset: function() {
            var firstDelegate = this.firstDelegate();
            if (firstDelegate) {
                if (this._readOnly) {
                    throw new Error('Not allowed to call unset() method on read-only meltingpot model');
                }
                firstDelegate.unset.apply(firstDelegate, arguments);
            }
        },
        clear: function() {
            var firstDelegate = this.firstDelegate();
            if (firstDelegate) {
                if (this._readOnly) {
                    throw new Error('Not allowed to call clear() method on read-only meltingpot model');
                }
                firstDelegate.clear.apply(firstDelegate, arguments);
            }
        },
        sync: function() {
            return $.Deferred().reject();
        }
    }, {
        mergeModels: function(models, options) {
            var newAttrs = _(models).invoke('toJSON', options);
            newAttrs.reverse();
            return _.extend.apply(_, newAttrs);
        }
    });

    return MeltingPot;
});