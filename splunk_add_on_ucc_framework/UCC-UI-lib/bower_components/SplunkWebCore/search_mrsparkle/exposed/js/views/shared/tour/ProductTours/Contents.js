/**
 * @extends {views.Base}
 * @description Utilizing $.Deferred(), fetches info about respective tours.
 * Returns BaseView with contents of the Product Tours Modal.
 *
 * @param {Object} options
 * @param {Boolean} options.canAddData - user permission to add data, will allow the 'Add Data Tour'.
 * @param {Model} options.model
 * @param {Application} options.model.application
 * @param {AppLocal} options.model.appLocal
 * @param {ServerInfo} options.model.serverInfo
 * @param {Collection} options.collection - OPTIONAL
 */
define(
    [
        'jquery',
        'underscore',
        'module',
        'views/Base',
        'views/shared/Icon',
        'views/shared/ModalLocalClassNames',
        'models/services/data/ui/Tour',
        'collections/services/data/ui/Tours',
        'uri/route',
        'splunk.util',
        'views/shared/tour/ProductTours/Contents.pcssm'
    ],
    function(
        $,
        _,
        module,
        BaseView,
        IconView,
        ModalView,
        TourModel,
        Tours,
        route,
        splunk_utils,
        css
    ) {
        return BaseView.extend({
            moduleId: module.id,
            css: css,
            className: ModalView.prototype.className,
            initialize: function() {
                BaseView.prototype.initialize.apply(this, arguments);

                this.toursDfd = $.Deferred();
                this.collection = this.collection || {};
                this.isLite = this.model.serverInfo.isLite();

                this.collection.tours = new Tours();
                this.collection.tours.fetch({
                    data: {
                        app: this.model.application.get('app'),
                        owner: this.model.application.get('owner'),
                        count: -1
                    },
                    success: function(collection, response) {
                        this.setTours();
                        this.toursDfd.resolve();
                    }.bind(this)
                });

                // IconViews for the links corresponding to each respective tour
                this.children.icons = {
                    lightIcon: new IconView({
                        icon: 'greater',
                        size: 3,
                        id: 'light'
                    }),
                    adddataIcon: new IconView({
                        icon: 'dataInput',
                        size: 3,
                        id: 'add-data'
                    }),
                    searchIcon: new IconView({
                        icon: 'search',
                        size: 3,
                        id: 'search'
                    }),
                    dashboardsIcon: new IconView({
                        icon: 'dashboard',
                        size: 3,
                        id: 'dashboards'
                    })
                };
            },

            events: {
                'click [data-role=light-tour]': function(e) {
                    e.preventDefault();
                    this.trigger('product-tour');
                }
            },

            setTours: function() {
                var productType = this.model.serverInfo.getProductType(),
                    instanceType = this.model.serverInfo.getInstanceType(),
                    tourIdentifier = productType + ((instanceType) ? ':' + instanceType : ''),
                    searchTourName = 'search-tour:' + tourIdentifier,
                    adddataTourName = 'adddata-tour:' + tourIdentifier,
                    dashboardsTourName = 'dashboards-tour:' + tourIdentifier,
                    lightProductTourName = 'light-product-tour';

                this.searchTour = this.collection.tours.getTourModel(searchTourName);
                this.adddataTour = this.collection.tours.getTourModel(adddataTourName);
                this.dashboardsTour = this.collection.tours.getTourModel(dashboardsTourName);
                this.lightProductTour = this.collection.tours.getTourModel(lightProductTourName);

                if (this.searchTour) {
                    this.searchLink = route.page(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        'search',
                        this.searchTour.getTourPage(),
                        { data: {tour: searchTourName} }
                    );
                }

                if (this.adddataTour) {
                    this.adddataLink = route.manager(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        'search',
                        this.adddataTour.getTourPage(),
                        {data: {tour: adddataTourName}}
                    );
                }

                if (this.dashboardsTour) {
                    this.dashboardsLink = route.page(
                        this.model.application.get('root'),
                        this.model.application.get('locale'),
                        'search',
                        this.dashboardsTour.getTourPage(),
                        {data: {tour: dashboardsTourName}}
                    );
                }
            },

            render: function() {
                $.when(this.toursDfd).then(function() {
                    var html = this.compiledTemplate({
                        css: this.css,
                        canAddData: this.options.canAddData || false,
                        isLite: this.isLite,
                        searchTour: this.searchTour,
                        adddataTour: this.adddataTour,
                        dashboardsTour: this.dashboardsTour,
                        lightProductTour: this.lightProductTour,
                        adddataLink: this.adddataLink,
                        searchLink: this.searchLink,
                        dashboardsLink: this.dashboardsLink
                    });

                    this.$el.html(html);

                    // takes each IconView and inserts the icon in the right place
                    // (e.g. right after the a tag with data-icon="adddataIcon")
                    // depends heavily on the property names in this.children.icons
                    _.forEach(this.children.icons, function(iconView, iconViewName) {
                        iconView.render().appendTo(this.$('[data-icon=' + iconView.options.id + '-icon]'));
                    });
                }.bind(this));

                return this;
            },

            template: '\
                <div class="<%= css.toursLinks %>">\
                    <% if (isLite && lightProductTour) { %>\
                        <a href="#" class="<%= css.tourLink %>" data-role="light-tour">\
                            <span class="<%= css.icon %>" data-icon="light-icon"></span>\
                            <br /> <%= _("Splunk Light Tour").t() %>\
                        </a>\
                    <% } %>\
                    <% if (canAddData && adddataTour) { %>\
                        <a href="<%= adddataLink %>" class="<%= css.tourLink %>">\
                            <span class="<%= css.icon %>" data-icon="add-data-icon"></span>\
                            <br /> <%= _("Add Data Tour").t() %>\
                        </a>\
                    <% } %>\
                    <% if (searchTour) { %>\
                        <a href="<%= searchLink %>" class="<%= css.tourLink %>">\
                            <span class="<%= css.icon %>" data-icon="search-icon"></span>\
                            <br /> <%= _("Search Tour").t() %>\
                        </a>\
                    <% } %>\
                    <% if (dashboardsTour) { %>\
                        <a href="<%= dashboardsLink %>" class="<%= css.tourLink %>">\
                            <span class="<%= css.icon %>" data-icon="dashboards-icon"></span>\
                            <br /> <%= _("Dashboards Tour").t() %>\
                        </a>\
                    <% } %>\
                </div>\
            '
        });
    }
);
