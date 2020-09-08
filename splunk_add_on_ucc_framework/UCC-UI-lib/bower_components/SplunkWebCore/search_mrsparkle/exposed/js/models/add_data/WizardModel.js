/**
 * State machine for the Add Data wizard
 *
 * Steps:
 *  0. Initial
 *  1. Select forwarder
 *  2. Select Source
 *  3. Preview
 *  4. Input Settings
 *  5. Review
 *  6. Success
 */

define(
    [
        'underscore',
        'models/Base'
    ],
    function(_, BaseModel) {
        return BaseModel.extend({
            initialize: function() {
                BaseModel.prototype.initialize.apply(this, arguments);
                this.isStepValid = false;
                this.PREVIEWABLE_INPUTS = ['file_upload', 'file_monitor', 'file_oneshot'];
                this.WINDOWS_INPUTS = ['evt_logs_local', 'evt_logs_remote', 'perfmon_local', 'perfmon_remote', 'regmon', 'admon', 'hostmon', 'netmon', 'printmon'];

                this.set({
                    currentStep: 'initial'
                }, {silent: true});


                this.on('change:currentStep', function() {
                    this.isStepValid = false;
                }, this);

                this.on('change:isDirectory change:isArchive change:isBinary change:isUNCPath change:isWildcardPath', function() {
                    this.set('previewEnabled', this.isPreviewEnabled());
                }, this);

            },

            stepForward: function(valid) {
                if (valid) {
                    this.isStepValid = true;
                }
                this.trigger('stepForward');
            },
            stepBack: function() {
                this.trigger('stepBack');
            },



            setInputMode: function(mode) {
                if ([0,1,2].indexOf(mode) == -1) {
                    throw 'unknown input mode';
                }
                this.set({inputMode: mode});
            },

            isUploadMode: function() {
                return parseInt(this.get('inputMode'),10) === 0;
            },
            isLocalMode: function() {
                return parseInt(this.get('inputMode'),10) === 1;
            },
            isForwardMode: function() {
                return parseInt(this.get('inputMode'),10) === 2;
            },

            isDirectory: function() {
                return this.get('isDirectory');
            },

            isPreviewEnabled: function() {
                if (this.get('inputMode') === 2) {
                    return false;
                }
                if (this.get('isDirectory') || this.get('isArchive') ||  this.get('isWildcardPath') || this.get('isUNCPath')|| this.get('isBinary')) {
                    return false;
                }
                return this.PREVIEWABLE_INPUTS.indexOf(this.get('inputType')) > -1;
            },
            isWindowsInput: function() {
                var inputType = this.get('inputType');
                return this.WINDOWS_INPUTS.indexOf(inputType) > -1;
            },

            resetFlags: function() {
                _.each(['previewsid','isBinary','isArchive','isDirectory','isWildcardPath','isUNCPath'], function(flag) {
                    this.unset(flag);
                }.bind(this));

            }

        });
    }
);