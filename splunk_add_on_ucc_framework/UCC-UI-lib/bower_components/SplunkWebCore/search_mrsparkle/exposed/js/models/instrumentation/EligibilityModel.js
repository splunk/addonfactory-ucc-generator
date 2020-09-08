/**
 * Checks Eligibility of opt in.
 */
define(
    [
        'underscore',
        'models/Base'
    ],
    function(_, BaseModel) {
        return BaseModel.extend({
            url: function() {
                return this.root + '/custom/splunk_instrumentation/instrumentation_controller/instrumentation_eligibility';
            },
            initialize: function(options) {
                BaseModel.prototype.initialize.apply(this, arguments);

                this.root = '';
                if (options && options.application) {
                    var root = options.application.get('root');
                    if (root) {
                        this.root = '/' + root;
                    }
                }
            },
            isEligible: function() {
                return this.get('is_eligible');
            }
        });
    }
);