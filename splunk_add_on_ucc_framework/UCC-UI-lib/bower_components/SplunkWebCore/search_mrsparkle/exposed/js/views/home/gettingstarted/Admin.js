define([
    'underscore',
    'module',
    'uri/route',
    'views/Base',
    'views/home/gettingstarted/shared/Item',
    'views/shared/tour/ProductTours/Master',
    'splunk.util'
],
function (
    _,
    module,
    route,
    BaseView,
    ItemView,
    ProductTours,
    splunkUtil
) {
    return BaseView.extend({
        moduleId: module.id,
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            var showDocsButton = true;

            var showAddDataButton = this.collection.managers.findByEntryName('adddata') && this.model.user.canAddData(),
                showExploreDataButton =  this.collection.managers.findByEntryName('explore_data') && this.model.user.canExploreData(),
                hasTours = (this.collection && this.collection.tours) ? this.collection.tours.checkTours(this.model.user.serverInfo) : false;

            // For layout reasons remove docs when showing explore and adddata.
            if(showAddDataButton && showExploreDataButton) {
                showDocsButton = false;
            }

            if (showAddDataButton) {
                var extractFieldsUrl = route.page(this.model.application.get('root'), this.model.application.get('locale'), 'search', 'field_extractor'),
                    extractFieldsLink = "<a href='" + extractFieldsUrl + "'>" + _("extract fields").t() + "</a>";
                this.children.addData = new ItemView({
                    url: route.addData(this.model.application.get('root'), this.model.application.get('locale')),
                    title: _("Add Data").t(),
                    icon: '\
                        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\
                            width="104px" height="104px" viewBox="0 0 104 104" enable-background="new 0 0 104 104" xml:space="preserve">\
                            <circle fill="#FFFFFF" stroke="#63A543" stroke-width="1.75" stroke-miterlimit="10" cx="52.298" cy="52.239" r="50"/>\
                            <path fill="#63A543" d="M73.733,32.54c0,2.709-9.731,4.905-21.734,4.905s-21.734-2.196-21.734-4.905S39.997,27.634,52,27.634\
                                S73.733,29.832,73.733,32.54z M52,26c-12.978,0-23.5,2.928-23.5,6.54s10.521,6.54,23.5,6.54s23.499-2.928,23.499-6.54\
                                S64.979,26,52,26z"/>\
                            <path fill="#63A543" d="M61.357,54.496c0.19,0.193,0.19,0.511,0,0.704l-9.01,9.155c-0.19,0.193-0.503,0.193-0.693,0l-9.011-9.17\
                                c-0.19-0.194-0.19-0.51,0.002-0.703l1.296-1.307c0.191-0.193,0.504-0.192,0.694,0.001l5.619,5.709\
                                c0.19,0.193,0.347,0.129,0.347-0.145l0.015-20.741c0-0.274,0.221-0.498,0.49-0.498h1.818c0.27,0,0.49,0.224,0.49,0.498\
                                L53.399,58.74c0,0.274,0.156,0.34,0.346,0.145l5.619-5.709c0.19-0.193,0.503-0.193,0.693,0L61.357,54.496z"/>\
                            <rect x="28.5" y="32.205" fill="#63A543" width="1.644" height="39.784"/>\
                            <rect x="73.869" y="32.54" fill="#63A543" width="1.63" height="39.449"/>\
                            <defs>\
                                <rect id="SVGID_1_" x="28.5" y="71.566" width="47" height="8.434"/>\
                            </defs>\
                            <clipPath id="SVGID_2_">\
                                <use xlink:href="#SVGID_1_"  overflow="visible"/>\
                            </clipPath>\
                            <path clip-path="url(#SVGID_2_)" fill="#63A543" d="M73.733,71.565c0,3.494-9.731,6.326-21.734,6.326s-21.734-2.832-21.734-6.326\
                                S39.997,65.239,52,65.239S73.733,68.072,73.733,71.565z M52,63.132c-12.978,0-23.5,3.776-23.5,8.434s10.521,8.434,23.5,8.434\
                                s23.499-3.776,23.499-8.434S64.979,63.132,52,63.132z"/>\
                        </svg>\
                    ',
                    external: false,
                    description: splunkUtil.sprintf(_("Add or forward data to %s. Afterwards, you may %s.").t(), this.getProductName(), extractFieldsLink)
                });
            }
            if (showExploreDataButton) {
                this.children.exploreData = new ItemView({
                    url: route.exploreData(this.model.application.get('root'), this.model.application.get('locale')),
                    title: _("Explore Data").t(),
                    icon: '\
                        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\
                            width="104px" height="104px" viewBox="0 0 104 104" enable-background="new 0 0 104 104" xml:space="preserve">\
                            <circle fill="#FFFFFF" stroke="#63A543" stroke-width="1.75" stroke-miterlimit="10" cx="52.298" cy="52.239" r="50"/>\
                            <path fill="#63A543" d="M73.733,32.54c0,2.709-9.731,4.905-21.734,4.905s-21.734-2.196-21.734-4.905S39.997,27.634,52,27.634\
                                S73.733,29.832,73.733,32.54z M52,26c-12.978,0-23.5,2.928-23.5,6.54s10.521,6.54,23.5,6.54s23.499-2.928,23.499-6.54\
                                S64.979,26,52,26z"/>\
                            <path transform="translate(28.3,39)" d="M17.6647917,10.838 C16.0805,10.709 14.4981667,10.526 12.9226875,10.287\
                                L12.9226875,13.166 C14.4981667,13.404 16.0805,13.588 17.6647917,13.717 L17.6647917,10.838 L17.6647917,10.838\
                                Z M3.56479167,15.392 C2.53764583,15.086 1.51539583,14.755 0.5,14.4 L0.5,17.28 C1.51539583,17.636 2.53764583,17.966\
                                3.56479167,18.272 L3.56479167,15.392 L3.56479167,15.392 Z M12.9226875,17.486 C11.3472083,17.247 9.77760417,16.953\
                                8.2168125,16.605 L8.2168125,19.485 C9.77760417,19.834 11.3472083,20.128 12.9226875,20.367 L12.9226875,17.486\
                                L12.9226875,17.486 Z M36.6616042,16.935 C30.3959167,18.184 24.0048958,18.552 17.6647917,18.037 L17.6647917,20.918\
                                C24.0048958,21.432 30.3959167,21.065 36.6616042,19.816 L36.6616042,16.935 L36.6616042,16.935 Z M45.9421458,14.4\
                                C44.4185625,14.933 42.8812708,15.41 41.3332083,15.833 L41.3332083,18.713 C42.8812708,18.291 44.4185625,17.813\
                                45.9421458,17.28 L45.9421458,14.4 L45.9421458,14.4 Z M45.9421458,7.201 C43.4031667,8.088 40.826,8.823\
                                38.2243542,9.405 L38.2243542,12.284 C40.826,11.702 43.4031667,10.967 45.9421458,10.08 L45.9421458,7.201\
                                L45.9421458,7.201 Z M33.5184792,10.287 C29.8426875,10.844 26.1336042,11.101 22.4264792,11.058 L22.4264792,13.937\
                                C26.1336042,13.98 29.8426875,13.723 33.5184792,13.166 L33.5184792,10.287 L33.5184792,10.287 Z M45.9421458,28.802\
                                C42.3867917,30.045 38.7589792,30.988 35.092,31.631 L35.092,34.511 C38.7589792,33.868 42.3867917,32.925\
                                45.9421458,31.682 L45.9421458,28.802 L45.9421458,28.802 Z M30.3606667,32.292 C20.3388958,33.339 10.1496875,32.176\
                                0.5,28.802 L0.5,31.682 C10.1496875,35.056 20.3388958,36.22 30.3606667,35.173 L30.3606667,32.292 L30.3606667,32.292\
                                Z M45.9421458,0 C42.3867917,1.243 38.7589792,2.186 35.092,2.829 L35.092,5.709 C38.7589792,5.066 42.3867917,4.123\
                                45.9421458,2.88 L45.9421458,0 L45.9421458,0 Z M30.3606667,3.49 C27.7227917,3.765 25.0741458,3.888 22.4264792,3.857\
                                L22.4264792,6.738 C25.0741458,6.768 27.7227917,6.646 30.3606667,6.37 L30.3606667,3.49 L30.3606667,3.49\
                                Z M17.6647917,3.637 C11.8534375,3.165 6.08614583,1.953 0.5,0 L0.5,2.88 C6.08614583,4.833 11.8534375,6.046\
                                17.6647917,6.517 L17.6647917,3.637 L17.6647917,3.637 Z M8.2168125,9.405 C5.61614583,8.823 3.03897917,8.088\
                                0.5,7.201 L0.5,10.08 C3.03897917,10.968 5.61614583,11.702 8.2168125,12.284 L8.2168125,9.405 L8.2168125,9.405\
                                Z M11.3491667,24.43 C7.68316667,23.787 4.05535417,22.844 0.5,21.601 L0.5,24.482 C4.05535417,25.724 7.68316667,26.668\
                                11.3491667,27.31 L11.3491667,24.43 L11.3491667,24.43 Z M24.0156667,25.459 C21.368,25.489 18.718375,25.367\
                                16.0814792,25.091 L16.0814792,27.972 C18.718375,28.247 21.368,28.37 24.0156667,28.339 L24.0156667,25.459\
                                L24.0156667,25.459 Z M45.9421458,24.482 C40.3550208,26.435 34.5877292,27.647 28.776375,28.119 L28.776375,25.238\
                                C34.5877292,24.767 40.3550208,23.554 45.9421458,21.601 L45.9421458,24.482 L45.9421458,24.482 Z"\
                                id="Imported-Layers" fill="#63A543" sketch:type="MSShapeGroup">\
                            </path>\
                            <rect x="28.5" y="32.205" fill="#63A543" width="1.644" height="39.784"/>\
                            <rect x="73.869" y="32.54" fill="#63A543" width="1.63" height="39.449"/>\
                            <defs>\
                                <rect id="SVGID_1_" x="28.5" y="71.566" width="47" height="8.434"/>\
                            </defs>\
                            <clipPath id="SVGID_2_">\
                                <use xlink:href="#SVGID_1_"  overflow="visible"/>\
                            </clipPath>\
                            <path clip-path="url(#SVGID_2_)" fill="#63A543" d="M73.733,71.565c0,3.494-9.731,6.326-21.734,6.326s-21.734-2.832-21.734-6.326\
                                S39.997,65.239,52,65.239S73.733,68.072,73.733,71.565z M52,63.132c-12.978,0-23.5,3.776-23.5,8.434s10.521,8.434,23.5,8.434\
                                s23.499-3.776,23.499-8.434S64.979,63.132,52,63.132z"/>\
                        </svg>\
                    ',
                    external: false,
                    description: _("Explore data and define how Hunk parses that data.").t()
                });
            }
            if (this.model.user.canViewRemoteApps()) {
              this.children.apps = new ItemView({
                  url: route.manager(this.model.application.get('root'), this.model.application.get('locale'), 'system', 'appsremote'),
                  title: _("Splunk Apps").t(),
                  icon: '\
                      <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\
                      width="104px" height="104px" viewBox="0 0 104 104" enable-background="new 0 0 104 104" xml:space="preserve">\
                          <circle fill="#FFFFFF" stroke="#63A543" stroke-width="2" stroke-miterlimit="10" cx="52" cy="52" r="50"/>\
                          <path fill="#63A543" d="M52.001,43.229c-3.506,0-6.348-2.81-6.348-6.277s2.842-6.277,6.348-6.277c3.504,0,6.348,2.81,6.348,6.277\
                              C58.35,40.418,55.506,43.229,52.001,43.229 M65.602,38.563v-3.227l-3.609-0.974c-0.243-0.913-0.604-1.774-1.076-2.568l1.856-3.214\
                              l-2.309-2.284l-3.248,1.836c-0.803-0.464-1.674-0.823-2.597-1.062l-0.985-3.573h-3.264l-0.985,3.573\
                              c-0.952,0.246-1.85,0.62-2.673,1.108l-3.174-1.881l-2.309,2.282l1.904,3.139c-0.508,0.841-0.896,1.756-1.144,2.73l-3.589,0.888\
                              v3.227l3.589,0.888c0.248,0.974,0.636,1.892,1.144,2.732l-1.903,3.139l2.307,2.284l3.174-1.883c0.851,0.502,1.775,0.886,2.761,1.131\
                              l0.898,3.549h3.264l0.898-3.549c0.954-0.239,1.856-0.606,2.684-1.085l3.248,1.836l2.309-2.284l-1.856-3.214\
                              c0.472-0.794,0.832-1.657,1.076-2.568L65.602,38.563z M80.185,53.618c-0.013,0.063-0.095,0.156-0.282,0.234l-18.417,7.586\
                              c-0.582,0.243-1.52,0.058-1.966-0.384l-5.597-5.534c-0.111-0.109-0.234-0.201-0.357-0.287l20.587-8.143l5.871,6.203\
                              C80.163,53.439,80.198,53.557,80.185,53.618 M72.858,70.131c0,0.253-0.305,0.698-0.542,0.794l-19.304,7.635\
                              c-0.09,0.036-0.23,0.074-0.406,0.1V56.766c0.011,0.009,0.027,0.013,0.036,0.022l5.597,5.534c0.656,0.649,1.674,1.013,2.653,1.013\
                              c0.453,0,0.896-0.078,1.293-0.241l10.672-4.398L72.858,70.131L72.858,70.131z M50.99,78.561l-19.302-7.635\
                              c-0.239-0.096-0.544-0.542-0.544-0.794V58.698l10.674,4.398c1.252,0.515,2.986,0.178,3.945-0.773l5.597-5.534\
                              c0.011-0.009,0.025-0.013,0.038-0.023v21.897C51.22,78.634,51.082,78.597,50.99,78.561 M23.818,53.618\
                              c-0.014-0.061,0.022-0.179,0.16-0.326l5.874-6.201l20.58,8.141c-0.124,0.086-0.245,0.178-0.356,0.287l-5.597,5.534\
                              c-0.446,0.441-1.384,0.624-1.966,0.384l-18.417-7.587C23.912,53.775,23.83,53.681,23.818,53.618 M81.349,52.067l-6.252-6.604\
                              l3.954-6.513c0.381-0.629,0.472-1.37,0.245-2.028c-0.228-0.66-0.756-1.193-1.449-1.46l-13.863-5.362l-0.909,1.573l14.111,5.46\
                              c0.196,0.076,0.336,0.207,0.392,0.37c0.054,0.16,0.025,0.346-0.083,0.526l-4.012,6.613c-0.158-0.114-0.321-0.215-0.496-0.285\
                              l-8.905-3.522l-0.729,0.197l-0.406,0.974l0.232,0.404l8.964,3.546l-20.141,7.967l-20.144-7.968l9.043-3.576l0.19-0.317l-0.456-1.093\
                              l-0.647-0.161l-8.973,3.549c-0.174,0.07-0.339,0.172-0.497,0.285l-4.012-6.613c-0.109-0.179-0.138-0.366-0.083-0.526\
                              c0.058-0.163,0.196-0.294,0.392-0.37l14.163-5.479l-0.947-1.561l-13.877,5.369c-0.693,0.267-1.218,0.8-1.446,1.46\
                              c-0.228,0.658-0.14,1.399,0.243,2.028l3.952,6.516l-6.252,6.6c-0.532,0.562-0.753,1.265-0.607,1.928\
                              c0.144,0.665,0.638,1.216,1.355,1.512l5.931,2.443v12.181c0,0.984,0.758,2.093,1.685,2.459l19.302,7.635\
                              c0.464,0.185,1.074,0.274,1.685,0.274c0.611,0,1.22-0.089,1.685-0.274l19.302-7.635c0.927-0.366,1.683-1.474,1.683-2.459V57.95\
                              l5.931-2.443c0.717-0.296,1.209-0.847,1.355-1.512C82.102,53.331,81.879,52.628,81.349,52.067"/>\
                      </svg>\
                  ',
                  external: true,
                  description: splunkUtil.sprintf(_("Apps and add-ons extend the capabilities of %s.").t(), this.getProductName())
              });
            }

            if (showDocsButton) {
                this.children.docs = new ItemView({
                    url: route.docHelp(this.model.application.get("root"), this.model.application.get("locale"), "docs.help"),
                    title: _("Splunk Docs").t(),
                    icon: '\
                    <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\
                        width="104px" height="104px" viewBox="0 0 104 104" enable-background="new 0 0 104 104" xml:space="preserve">\
                        <g transform="translate(0.5,0.5)">\
                            <circle fill="#FFFFFF" stroke="#63A543" stroke-width="2" stroke-miterlimit="10" cx="52" cy="52" r="50"/>\
                            <path fill="#FFFFFF" d="M79.5,65.5c0,2.209-1.791,4-4,4h-27c-2.209,0-4-1.791-4-4v-36c0-2.209,1.791-4,4-4h27c2.209,0,4,1.791,4,4\
                                V65.5z"/>\
                            <path fill="none" stroke="#63A543" stroke-width="2" stroke-miterlimit="10" d="M79.5,65.5c0,2.209-1.791,4-4,4h-27\
                                c-2.209,0-4-1.791-4-4v-36c0-2.209,1.791-4,4-4h27c2.209,0,4,1.791,4,4V65.5z"/>\
                            <line fill="none" stroke="#63A543" stroke-miterlimit="10" x1="50" y1="25.5" x2="50" y2="31.5"/>\
                            <polygon fill="#63A543" points="63.5,24.5 63.5,40 67,35.493 70.5,40 70.5,24.5   "/>\
                                <path fill="#FFFFFF" d="M72.5,71.5c0,2.209-1.791,4-4,4h-27c-2.209,0-4-1.791-4-4v-36c0-2.209,1.791-4,4-4h27c2.209,0,4,1.791,4,4\
                                V71.5z"/>\
                            <path fill="none" stroke="#63A543" stroke-width="2" stroke-miterlimit="10" d="M72.5,71.5c0,2.209-1.791,4-4,4h-27\
                                c-2.209,0-4-1.791-4-4v-36c0-2.209,1.791-4,4-4h27c2.209,0,4,1.791,4,4V71.5z"/>\
                            <polygon fill="#63A543" points="55.5,30.5 55.5,46 59,41.424 62.5,46 62.5,30.5   "/>\
                            <line fill="none" stroke="#63A543" stroke-miterlimit="10" x1="43" y1="30.5" x2="43" y2="35.5"/>\
                            <path fill="#FFFFFF" d="M64.5,76.5c0,2.209-1.791,4-4,4h-27c-2.209,0-4-1.791-4-4v-36c0-2.209,1.791-4,4-4h27c2.209,0,4,1.791,4,4\
                                V76.5z"/>\
                            <path fill="none" stroke="#63A543" stroke-width="2" stroke-miterlimit="10" d="M64.5,76.5c0,2.209-1.791,4-4,4h-27\
                                c-2.209,0-4-1.791-4-4v-36c0-2.209,1.791-4,4-4h27c2.209,0,4,1.791,4,4V76.5z"/>\
                            <line fill="none" stroke="#63A543" stroke-miterlimit="10" x1="35" y1="36.5" x2="35" y2="80.5"/>\
                            <polygon fill="#63A543" points="48.5,36.5 48.5,52 52,47.482 55.5,52 55.5,36.5   "/>\
                        </g>\
                   </svg>\
                ',
                    external: true,
                    description: splunkUtil.sprintf(_("Comprehensive documentation for %s and for all other Splunk products.").t(), this.getProductName())
                });
            }

            if (hasTours) {
                this.children.tours = new ItemView({
                    url: '#',
                    linkClass: 'product-tours',
                    title: _("Product Tours").t(),
                    icon: '\
                        <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"\
                            width="104px" height="104px" viewBox="0 0 104 104" enable-background="new 0 0 104 104" xml:space="preserve">\
                            <circle fill="#FFFFFF" stroke="#63A543" stroke-width="1.75" stroke-miterlimit="10" cx="52.298" cy="52.239" r="50"></circle>\
                            <g>\
                                <path fill="#63A543" d="M54.794,83.568c0.575,0,1.045-0.47,1.045-1.044V21.937c0-0.574-0.47-1.044-1.045-1.044\
                                    h-4.178c-0.575,0-1.045,0.47-1.045,1.044v60.588c0,0.574,0.47,1.044,1.045,1.044H54.794z"/>\
                            </g>\
                            <g>\
                                <path fill="#FFFFFF" d="M83.792,35.859c0.425,0.387,0.425,1.018,0,1.404l-6.512,5.908c-0.425,0.387-1.243,0.701-1.817,0.701\
                                    H29.201c-0.574,0-1.045-0.47-1.045-1.044V30.294c0-0.575,0.471-1.045,1.045-1.045h46.262c0.574,0,1.393,0.315,1.818,0.702\
                                    L83.792,35.859z" />\
                                <path fill="none" stroke="#63A543" stroke-width="2" stroke-miterlimit="10" d="M83.792,35.859c0.425,0.387,0.425,1.018,0,1.404\
                                    l-6.512,5.908c-0.425,0.387-1.243,0.701-1.817,0.701H29.201c-0.574,0-1.045-0.47-1.045-1.044V30.294\
                                    c0-0.575,0.471-1.045,1.045-1.045h46.262c0.574,0,1.393,0.315,1.818,0.702L83.792,35.859z"/>\
                            </g>\
                            <g>\
                                <path fill="#FFFFFF" d="M22.663,58.155c-0.425-0.387-0.425-1.018,0-1.403l6.511-5.909c0.426-0.386,1.243-0.701,1.818-0.701\
                                    h46.261c0.575,0,1.045,0.47,1.045,1.044v12.535c0,0.575-0.47,1.045-1.045,1.045H30.992c-0.575,0-1.393-0.315-1.819-0.702\
                                    L22.663,58.155z" />\
                                <path fill="none" stroke="#63A543" stroke-width="2" stroke-miterlimit="10" d="M22.663,58.155c-0.425-0.387-0.425-1.018,0-1.403\
                                    l6.511-5.909c0.426-0.386,1.243-0.701,1.818-0.701h46.261c0.575,0,1.045,0.47,1.045,1.044v12.535\
                                    c0,0.575-0.47,1.045-1.045,1.045H30.992c-0.575,0-1.393-0.315-1.819-0.702L22.663,58.155z"/>\
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
        getProductName: function(){
            if (this.model.user && this.model.user.serverInfo){
                return this.model.user.serverInfo.getProductName();
            }
            return "Splunk";
        },
        render: function() {
            this.$el.html(this.template);
            if (this.children.tours) {
                this.children.tours.render().appendTo(this.$el);
            }
            if (this.children.addData) {
                this.children.addData.render().appendTo(this.$el);
            }
            if (this.children.exploreData) {
                this.children.exploreData.render().appendTo(this.$el);
            }
            if (this.children.apps) {
              this.children.apps.render().appendTo(this.$el);
            }
            if (this.children.docs) {
                this.children.docs.render().appendTo(this.$el);
            }
            return this;
        },
        template: '\
        '
    });
});
