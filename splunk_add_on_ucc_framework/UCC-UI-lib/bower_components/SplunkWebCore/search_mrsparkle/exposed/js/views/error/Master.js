define(
    [
        'underscore',
        'jquery',
        'views/Base',
        'models/shared/Error',
        'uri/route',
        './Master.pcss'
    ],
    function(
        _,
        $,
        Base,
        ErrorModel,
        route,
        css
    ) {
        return Base.extend({
            render: function() {
                var root = this.model.application.get("root"),
                    locale = this.model.application.get("locale"),
                    home = route.page(root, locale, "search"),
                    back = document.referrer;
                this.$el.html(this.compiledTemplate({
                    _:_,
                    status: (this.model.error.get("status")) ? _(this.model.error.get("status")).t() : "",
                    message: (this.model.error.get("message")) ? _(this.model.error.get("message")).t() : "",
                    returnMsg: (back) ? _("Back").t() : _("Go to Home").t(),
                    returnRoute: back || home
                }));

                if (back) {
                    this.$(".return-link a").prepend('<i class="icon-chevron-left"/>');
                }
                return this;
            },
            template: '\
                <div class="error-page-container"> \
                    <div class="error-header section-header"> \
                        <h1 class="error-title">Oops!</h1> \
                        <h2 class="error-description"><%= status %></h2> \
                    </div> \
                    <div class="error-body"> \
                        <h3><%= message %></h3> \
                        <h3 class="return-link"> \
                            <a href="<%= returnRoute %>"> <%= returnMsg %> </a> \
                        </h3> \
                    </div> \
                </div> \
            '
        });
    }
);
