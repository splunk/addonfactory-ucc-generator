define(
    [
        'jquery', 
        'underscore',
        'uri/route'
    ], 
    function(
        $, 
        _,
        route
    ) {
        /*
         IDs for the 3 different options of background image customization.
         */
        var BACKGROUNDOPTIONS = {
            NO_IMAGE: "none",
            DEFAULT_IMAGE: "default",
            CUSTOM_IMAGE: "custom"
        };
        
        /*
         CSS classes applied on the preview element.
         */
        var BODYCLASS = {
            DEFAULT: "body-default",
            ENTERPRISE: "body-default-enterprise",
            LITE: "body-default-lite"
        };

        var setupBackgroundImage = function(root, locale, build, option, customBgImage, isLite) {
            if (option === BACKGROUNDOPTIONS.DEFAULT_IMAGE) {
                var bodyClass = isLite ?
                    BODYCLASS.LITE:
                    BODYCLASS.ENTERPRISE;
                $(document.body).addClass(bodyClass);
            } else if (option === BACKGROUNDOPTIONS.CUSTOM_IMAGE) {
                $(document.body).addClass(BODYCLASS.DEFAULT).css('backgroundImage',
                    "url(" + decodeURIComponent(route.loginPageBackground(root, locale, build, customBgImage)) + ")");
            }
            // else do nothing, the default body CSS class apply the dark background color
        };

        return ({
            BODYCLASS: BODYCLASS,
            BACKGROUNDOPTIONS: BACKGROUNDOPTIONS,
            setupBackgroundImage: setupBackgroundImage
        });
    }
);