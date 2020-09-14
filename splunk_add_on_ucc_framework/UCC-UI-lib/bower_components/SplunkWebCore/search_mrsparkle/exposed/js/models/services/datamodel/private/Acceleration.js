/**
 * @author jszeto
 * @date 4/25/13
 *
 * Represents the acceleration specific settings for a DataModel.
 *
 *
 */
define(
    [
        'models/Base'
    ],
    function(BaseModel) {

        return BaseModel.extend({

                defaults: {
                    enabled: false

                }
        });
    }
);