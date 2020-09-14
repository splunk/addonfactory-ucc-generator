define([
    'underscore',
    'module',
    'uri/route',
    'views/Base',
    'views/home/gettingstarted/shared/Item',
    'views/shared/tour/ProductTours/Master'
],
function (
    _,
    module,
    route,
    BaseView,
    ItemView,
    ProductTours
) {
    return BaseView.extend({
        moduleId: module.id,
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            var hasTours = (this.collection && this.collection.tours) ? this.collection.tours.checkTours(this.model.user.serverInfo) : false;

            this.children.searchReference = new ItemView({
                url: route.docHelp(this.model.application.get("root"), this.model.application.get("locale"), "search.reference"),
                title: _("Search Manual").t(),
                icon:'\
                <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="104px" height="104px" viewBox="0 0 104 104" enable-background="new 0 0 104 104" xml:space="preserve">\
                    <circle fill="#FFFFFF" stroke="#63A543" stroke-width="2" stroke-miterlimit="10" cx="52" cy="52" r="50"/>\
                    <g transform="translate(0.5, 0.5)">\
                    	<path fill="#FFFFFF" d="M74.5,75.5c0,2.209-1.791,4-4,4h-37c-2.209,0-4-1.791-4-4v-47c0-2.209,1.791-4,4-4h37c2.209,0,4,1.791,4,4 V75.5z"/>\
                        <path fill="none" stroke="#63A543" stroke-width="2" stroke-miterlimit="10" d="M74.5,75.5c0,2.209-1.791,4-4,4h-37 c-2.209,0-4-1.791-4-4v-47c0-2.209,1.791-4,4-4h37c2.209,0,4,1.791,4,4V75.5z"/>\
                        <line fill="none" stroke="#63A543" stroke-miterlimit="10" x1="37" y1="25.5" x2="37" y2="79.5"/>\
                        <polygon fill="none" stroke="#63A543" stroke-miterlimit="10" points="56,25 56,42.5 60,37.589 64,42.5 64,25 "/>\
                    </g>\
                    <path fill="#63A744" d="M47.906,51.135c-0.554,0.932-0.824,1.946-0.824,3.027c0,2.162,1.176,4.162,3.054,5.257\
                    	c0.932,0.554,1.946,0.824,3.027,0.824c2.162,0,4.162-1.176,5.257-3.054c0.554-0.932,0.824-1.946,0.824-3.027\
                    	c0-2.162-1.176-4.162-3.054-5.257c-0.932-0.554-1.946-0.824-3.027-0.824C50.999,48.081,48.999,49.257,47.906,51.135z M60.148,58.365\
                    	l4.541,4.541C64.893,63.109,65,63.352,65,63.609c0,0.257-0.108,0.5-0.311,0.703l-1.378,1.378c-0.203,0.203-0.446,0.311-0.703,0.311\
                    	c-0.257,0-0.5-0.108-0.703-0.311l-4.541-4.541c-1.297,0.784-2.703,1.176-4.203,1.176c-2.932,0-5.595-1.581-7.054-4.081\
                    	C45.365,56.987,45,55.635,45,54.162c0-2.932,1.581-5.595,4.081-7.068c1.257-0.73,2.608-1.095,4.081-1.095\
                    	c2.932,0,5.595,1.581,7.068,4.081c0.73,1.257,1.095,2.608,1.095,4.081C61.325,55.662,60.933,57.067,60.148,58.365z"/>\
                </svg>',
                external: true,
                description: _("Use the Splunk Search Processing Language (SPL).").t()
            });
            var pivotIcon = '\
            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="104px" height="104px" viewBox="0 0 104 104" enable-background="new 0 0 104 104" xml:space="preserve">\
	            <circle fill="#FFFFFF" stroke="#63A543" stroke-width="2" stroke-miterlimit="10" cx="52" cy="52" r="50"/>\
	            <g transform="translate(0.5, 0.5)">\
	            	<path fill="#FFFFFF" d="M74.5,75.5c0,2.209-1.791,4-4,4h-37c-2.209,0-4-1.791-4-4v-47c0-2.209,1.791-4,4-4h37c2.209,0,4,1.791,4,4 V75.5z"/>\
		            <path fill="none" stroke="#63A543" stroke-width="2" stroke-miterlimit="10" d="M74.5,75.5c0,2.209-1.791,4-4,4h-37 c-2.209,0-4-1.791-4-4v-47c0-2.209,1.791-4,4-4h37c2.209,0,4,1.791,4,4V75.5z"/>\
		            <line fill="none" stroke="#63A543" stroke-miterlimit="10" x1="37" y1="25.5" x2="37" y2="79.5"/>\
		            <polygon fill="none" stroke="#63A543" stroke-miterlimit="10" points="56,25 56,42.5 60,37.589 64,42.5 64,25 "/>\
	            </g>\
	            <path transform="translate(0.5, 1)" fill="#63A543" d="M50.5,50.176v8.656l4.73-0.044l3.186,3.168L47.809,62c-0.663,0-1.309-0.454-1.309-1.1V50.5h-2.498l4.4-4.424 l4.628,4.214L50.5,50.176z M63.5,47.021V57.5h2.502l-4.4,4.284l-4.4-4.284H59.5v-8h-4.499l-3.3-3.388l10.54-0.103 C62.906,46.009,63.5,46.377,63.5,47.021z"/>\
            </svg>';

            this.children.pivotManual = new ItemView({
                url: route.docHelp(this.model.application.get("root"), this.model.application.get("locale"), "pivot.manual"),
                title: _("Pivot Manual").t(),
                icon: pivotIcon,
                external: true,
                description: _("Use Pivot to create tables and charts with SPL.").t()
            });
            var vizIcon = '\
            <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="104px" height="104px" viewBox="0 0 104 104" enable-background="new 0 0 104 104" xml:space="preserve">\
            <circle fill="#FFFFFF" stroke="#63A543" stroke-width="2" stroke-miterlimit="10" cx="52" cy="52" r="50"/>\
            <g transform="translate(0.5, 0.5)">\
            	<path fill="#FFFFFF" d="M74.5,75.5c0,2.209-1.791,4-4,4h-37c-2.209,0-4-1.791-4-4v-47c0-2.209,1.791-4,4-4h37c2.209,0,4,1.791,4,4 V75.5z"/>\
                <path fill="none" stroke="#63A543" stroke-width="2" stroke-miterlimit="10" d="M74.5,75.5c0,2.209-1.791,4-4,4h-37 c-2.209,0-4-1.791-4-4v-47c0-2.209,1.791-4,4-4h37c2.209,0,4,1.791,4,4V75.5z"/>\
                <line fill="none" stroke="#63A543" stroke-miterlimit="10" x1="37" y1="25.5" x2="37" y2="79.5"/>\
                <polygon fill="none" stroke="#63A543" stroke-miterlimit="10" points="56,25 56,42.5 60,37.589 64,42.5 64,25 "/>\
            </g>\
            <path transform="translate(0, 0.5)" fill="#63A744" d="M52,62.5h-4v-8h4V62.5z M58,62.5h-4v-12h4V62.5z M64,62.5h-4v-17h4V62.5z"/>\
            </svg>';

            this.children.dashboardVisualizations = new ItemView({
                url: route.docHelp(this.model.application.get("root"), this.model.application.get("locale"), "dashboards.visualizations"),
                title: _("Dashboards & Visualizations").t(),
                icon: vizIcon,
                external: true,
                description: _("Create and edit dashboards using interactive editors or simple XML.").t()
            });

            if (hasTours) {
                this.children.tours = new ItemView({
                    url: '#',
                    linkClass: 'product-tours',
                    title: _("Product Tours").t(),
                    icon: '\
                        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="104px" height="104px" viewBox="0 0 104 104" enable-background="new 0 0 104 104" xml:space="preserve">\
                            <circle fill="#FFFFFF" stroke="#63A543" stroke-width="1.75" stroke-miterlimit="10" cx="52.298" cy="52.239" r="50"></circle>\
                            <g>\
                                <path fill="#63A543" d="M54.794,83.568c0.575,0,1.045-0.47,1.045-1.044V21.937c0-0.574-0.47-1.044-1.045-1.044h-4.178c-0.575,0-1.045,0.47-1.045,1.044v60.588c0,0.574,0.47,1.044,1.045,1.044H54.794z"/>\
                            </g>\
                            <g>\
                                <path fill="#FFFFFF" d="M83.792,35.859c0.425,0.387,0.425,1.018,0,1.404l-6.512,5.908c-0.425,0.387-1.243,0.701-1.817,0.701H29.201c-0.574,0-1.045-0.47-1.045-1.044V30.294c0-0.575,0.471-1.045,1.045-1.045h46.262c0.574,0,1.393,0.315,1.818,0.702L83.792,35.859z" />\
                                <path fill="none" stroke="#63A543" stroke-width="2" stroke-miterlimit="10" d="M83.792,35.859c0.425,0.387,0.425,1.018,0,1.404l-6.512,5.908c-0.425,0.387-1.243,0.701-1.817,0.701H29.201c-0.574,0-1.045-0.47-1.045-1.044V30.294c0-0.575,0.471-1.045,1.045-1.045h46.262c0.574,0,1.393,0.315,1.818,0.702L83.792,35.859z"/>\
                            </g>\
                            <g>\
                                <path fill="#FFFFFF" d="M22.663,58.155c-0.425-0.387-0.425-1.018,0-1.403l6.511-5.909c0.426-0.386,1.243-0.701,1.818-0.701h46.261c0.575,0,1.045,0.47,1.045,1.044v12.535c0,0.575-0.47,1.045-1.045,1.045H30.992c-0.575,0-1.393-0.315-1.819-0.702L22.663,58.155z" />\
                                <path fill="none" stroke="#63A543" stroke-width="2" stroke-miterlimit="10" d="M22.663,58.155c-0.425-0.387-0.425-1.018,0-1.403l6.511-5.909c0.426-0.386,1.243-0.701,1.818-0.701h46.261c0.575,0,1.045,0.47,1.045,1.044v12.535c0,0.575-0.47,1.045-1.045,1.045H30.992c-0.575,0-1.393-0.315-1.819-0.702L22.663,58.155z"/>\
                            </g>\
                        </svg>\
                    ',
                    external: false,
                    description: _("New to Splunk? Take a tour to help you on your way.").t()
                });
            }
        },

        events: {
            'click .product-tours': function() {
                this.children.toursModal = new ProductTours({
                    canAddData: this.model.user.canAddData(),
                    model: {
                        application: this.model.application,
                        serverInfo: this.model.user.serverInfo
                    }
                });
                this.children.toursModal.render().el;
                this.children.toursModal.show();
            }
        },

        render: function() {
            var html = this.compiledTemplate();
            this.$el.append(html);
            if (this.children.tours) {
                this.children.tours.render().appendTo(this.$el);
            }
            this.children.searchReference.render().appendTo(this.$el);
            this.children.pivotManual.render().appendTo(this.$el);
            this.children.dashboardVisualizations.render().appendTo(this.$el);
            return this;
        },
        template: '\
        '

    });
});
