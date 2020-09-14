define([
    'underscore',
    'module',
    'views/Base',
    'util/keyboard',
    'uri/route' 
],
function (
    _,
    module,
    BaseView,
    keyboardUtil,
    route 
) {
    return BaseView.extend({
        moduleId: module.id,
        initialize: function() {
            BaseView.prototype.initialize.apply(this, arguments);
            this.listenTo(this.model.dashboard, 'change:id', this.render);
        },
        events: {
            'click a': function(e) {
                this.trigger('showDashboardSelector');
            },
            'keyup a': function(e) {
                if (e.which === keyboardUtil.KEYS['ENTER']) {
                    this.trigger('showDashboardSelector');
                }
            }
        },
        render: function() {
            this.$el.html(this.compiledTemplate({
                _: _,  
               dashboard: this.model.dashboard, 
               isSimpleXML: !this.model.dashboard.isNew() && this.model.dashboard.isSimpleXML(), 
               isValidXML: !this.model.dashboard.isNew() && this.model.dashboard.isValidXML() 
            }));
            return this;
        },
        template: '\
            <% if (!dashboard.isNew() && (!isSimpleXML || !isValidXML)) { %>\
                <div class="alert alert-error"><i class="icon-alert"></i>Could not load dashboard.</div>\
            <%}%>\
            <a tabindex="0">\
            <svg width="379px" height="207px" viewBox="0 0 379 207" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\
                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">\
                    <path class="stroke" d="M146.236652,170.786302 L172.492732,189.834212 L204.215372,179.429908 L236.898367,122.879472" opacity="0.20"></path>\
                    <path class="stroke" d="M146.090332,198.87726 L171.67041,152.374098 L203.544922,159.249014 L236.065918,145.981269" opacity="0.20"></path>\
                    <circle opacity="0.40" cx="146" cy="199" r="8"></circle>\
                    <circle opacity="0.40" cx="236" cy="123" r="8"></circle>\
                    <circle opacity="0.40" cx="236" cy="146" r="8"></circle>\
                    <circle opacity="0.40" cx="204" cy="159" r="8"></circle>\
                    <circle opacity="0.40" cx="204" cy="179" r="8"></circle>\
                    <circle opacity="0.40" cx="172" cy="189" r="8"></circle>\
                    <circle opacity="0.40" cx="146" cy="171" r="8"></circle>\
                    <circle opacity="0.40" cx="172" cy="152" r="8"></circle>\
                    <rect rx="2" ry="2" opacity="0.90" x="0" y="31" width="11" height="41"></rect>\
                    <rect rx="2" ry="2" opacity="0.80" x="45" y="7" width="11" height="65"></rect>\
                    <rect opacity="0.87" x="143" y="0" width="93" height="8"></rect>\
                    <rect opacity="0.42" x="143" y="8" width="93" height="8"></rect>\
                    <rect rx="2" ry="2" opacity="0.90" x="291" y="117" width="81" height="11"></rect>\
                    <path d="M364,57 L350,49 L333,62 L311,55 L291,65 L291,72 L379,72 L379,45 L364,57 Z" opacity="0.60"></path>\
                    <path d="M364,57 L350,49 L333,62 L311,55 L291,65 L291,58.2509766 L311,44.5107422 L333,47.5390625 L350,30.440918 L364,37 L379,28.2216797 L379,45 L364,57 Z" opacity="0.80"></path>\
                    <path d="M364,24.0029297 L350,14.0029297 L333,38 L311,31 L291,48 L291,58.2509766 L311,44.5107422 L333,47.5390625 L350,30.440918 L364,37 L379,28.2216797 L379,3 L364,24.0029297 Z"></path>\
                    <rect rx="2" ry="2" opacity="0.61" x="291" y="132" width="51" height="11"></rect>\
                    <rect rx="2" ry="2" x="291" y="177" width="46" height="11"></rect>\
                    <rect rx="2" ry="2" opacity="0.90" x="291" y="191" width="23" height="11"></rect>\
                    <rect rx="2" ry="2" opacity="0.80" x="291" y="147" width="68" height="11"></rect>\
                    <rect rx="2" ry="2" opacity="0.62" x="291" y="162" width="16" height="11"></rect>\
                    <rect opacity="0.14" x="143" y="16" width="93" height="8"></rect>\
                    <rect opacity="0.42" x="143" y="24" width="93" height="8"></rect>\
                    <rect opacity="0.42" x="143" y="40" width="93" height="8"></rect>\
                    <rect opacity="0.14" x="143" y="48" width="93" height="8"></rect>\
                    <rect opacity="0.42" x="143" y="56" width="93" height="8"></rect>\
                    <rect opacity="0.14" x="143" y="64" width="93" height="8"></rect>\
                    <rect opacity="0.14" x="143" y="32" width="93" height="8"></rect>\
                    <rect rx="2" ry="2" opacity="0.90" x="60" y="58" width="11" height="14"></rect>\
                    <rect rx="2" ry="2" x="75" y="50" width="11" height="22"></rect>\
                    <rect rx="2" ry="2" opacity="0.5" x="15" y="53" width="11" height="19"></rect>\
                    <rect rx="2" ry="2" opacity="0.60" x="30" y="44" width="11" height="28"></rect>\
                    <rect rx="2" ry="2" opacity="0.70" x="90" y="41" width="11" height="31"></rect>\
                    <path d="M4,204 L2,204 L2,122 L6,122 L6,200 L89,200 L89,204 L4,204 Z"></path>\
                    <circle opacity="0.79" cx="37.5" cy="142.5" r="5.5"></circle>\
                    <circle cx="48.5" cy="167.5" r="5.5"></circle>\
                    <circle opacity="0.5" cx="27.5" cy="179.5" r="5.5"></circle>\
                    <circle opacity="0.70" cx="69.5" cy="169.5" r="5.5"></circle>\
                    <circle opacity="0.80" cx="72.5" cy="149.5" r="5.5"></circle>\
                    <circle cx="172" cy="152" r="4"></circle>\
                    <circle cx="146" cy="171" r="4"></circle>\
                    <circle cx="172" cy="189" r="4"></circle>\
                    <circle cx="204" cy="179" r="4"></circle>\
                    <circle cx="204" cy="159" r="4"></circle>\
                    <circle cx="236" cy="146" r="4"></circle>\
                    <circle cx="236" cy="123" r="4"></circle>\
                    <circle cx="146" cy="199" r="4"></circle>\
                </g>\
            </svg>\
            <%- _("Choose a home dashboard").t() %></a>\
        '
    });
});
