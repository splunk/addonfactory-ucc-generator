define(
    [
        'underscore',
        'module',
        'views/Base',
        'uri/route'
    ],
    function(_, module, Base, route) {

        /**
         * @constructor
         * @param options {Object} {
         *     model: {
         *        report: <models.search.Report>
         *        appLocal: <models.services.AppLocal>
         *        application: <models.shared.Application>
         *        summary: <models.search.Summary>
         *    }
         * }
         */

        return Base.extend({
            moduleId: module.id,
            className:'no-stats-wrapper',
            events: {
                'click .view-fields': function(e) {
                    e.preventDefault();
                    this.model.report.set('openFirstFieldInfo', true);

                    this.model.report.entry.content.set({
                        'display.page.search.tab': 'events',
                        'display.page.search.showFields': '1'
                    });
                },
                'click .open-in-pivot-button': function(e) {
                    e.preventDefault();
                    this.model.report.trigger('openInPivot');
                }
            },
            activate: function() {
                if(this.active) {
                    return Base.prototype.activate.apply(this, arguments);
                }
                Base.prototype.activate.apply(this, arguments);
                this.render();
                return this;
            },
            startListening: function() {
                Base.prototype.startListening.apply(this, arguments);
                this.listenTo(this.model.summary, 'sync', this.render);
            },
            render: function() {
                var hasFieldSummary = this.model.summary.fields && this.model.summary.fields.length > 0,
                    userCanPivot = this.model.user.canPivot();

                this.$el.html(this.compiledTemplate({
                    showOpenInPivot: hasFieldSummary && userCanPivot,
                    moreDocRoute: route.docHelp(this.model.application.get("root"),
                        this.model.application.get("locale"),
                        'learnmore.search.transforming')
                }));
                return this;
            },
            template: '\
                    <div class="alert alert-info">\
                        <i class="icon-alert"></i>\
                        <%- _("Your search isn\'t generating any statistic or visualization results. Here are some possible ways to get results.").t() %>\
                    </div>\
                    <div class="no-stats">\
		                    <% if(showOpenInPivot) { %>\
		                        <div class="no-stats-column">\
	                            	<a href="" class="no-stats-link open-in-pivot-button">\
		                                <svg width="102px" height="102px" viewBox="0 0 102 102" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\
		                                    <g transform="translate(-23.000000, 0.000000)">\
		                                        <circle class="circle-main" cx="74" cy="51" r="50"></circle>\
		                                        <path stroke-linecap="round" d="M93,60 L99,60 L89,70 L79,60 L85,60 L85,40 L74,40 L66,32 L90,32 C91.5584826,32 92.6364594,33.0748175 93,35 L93,60 Z M63,62 L74,62 L82,70 L58,70 C56.4067439,70 55.3287671,68.9242009 55,67 L55,42 L49,42 L59,32 L69,42 L63,42 L63,62 Z"></path>\
		                                    </g>\
		                                </svg>\
	                                    <h3><%- _("Pivot").t() %></h3>\
		                            </a>\
		                             <span>\
		                               <%- _("Build tables and visualizations using multiple fields and metrics without writing searches.").t() %>\
		                            </span>\
	                            </div>\
	                        <% } %>\
	                        <div class="no-stats-column">\
	                            <a href="" class="no-stats-link view-fields">\
	                            	<svg width="102px" height="102px" viewBox="0 0 102 102" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">\
	                                    <g transform="translate(-21.000000, 0.000000)">\
	                                        <circle class="circle-main" cx="72" cy="51" r="50"></circle>\
	                                        <g transform="translate(50.000000, 29.000000)" >\
	                                            <rect stroke-width="2" x="0" y="0" rx="2" ry="2" width="40" height="40"></rect>\
	                                            <rect class="stroke-thin" x="13.5" y="0" width="14" height="40"></rect>\
	                                            <rect class="stroke-thin" x="0" y="13.5" width="40" height="14"></rect>\
	                                        </g>\
	                                        <path class="fill-inverse" d="M90.2590371,53.4462684 C89.6295664,53.2273902 89.4578926,52.5707554 89.686791,52.0235598 L94.8370056,39.0550236 C95.5809255,37.1945584 94.2933718,36.2916857 92.9199813,37.6596747 L79.0716265,56.127527 C78.8713404,56.6473628 79.1002388,57.1671987 79.6438725,57.3860769 L88.2275635,60.6692506 C88.7711973,60.8881289 89.028708,61.4079647 88.8284219,61.9278006 L83.6209827,75.4708922 C83.3062474,76.2643259 83.7354319,77.00304 84.5365764,77.00304 C84.8226994,77.00304 85.0802102,76.8662411 85.251884,76.6473628 L98.7855034,58.1521508 C99.2433003,57.5502356 99.0144019,56.8115215 98.270482,56.5105639 L90.2590371,53.4462684 Z" stroke-linecap="square"></path>\
	                                    </g>\
	                            	</svg>\
	                            	<h3><%- _("Quick Reports").t() %></h3>\
	                            </a>\
	                            <span>\
	                               <%- _("Click on any field in the events tab for a list of quick reports like \'Top Referrers\' and \'Top Referrers by time\'.").t() %>\
	                            </span>\
                            </div>\
	                        <div class="no-stats-column">\
			                    <a href="<%- moreDocRoute %>" class="no-stats-link" target="_blank" title="<%- _("Splunk transforming commands documentation").t() %>">\
				                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="102px" height="102px" >\
						                <circle class="circle-main" cx="51" cy="51" r="50"></circle>\
						                <g transform="translate(-2.000000, 0.000000)">\
						                    <rect stroke-width="2" x="30" y="24" rx="4" ry="4" width="46" height="56"></rect>\
				                    		<line class="stroke-thin" stroke-miterlimit="10" x1="37.5" y1="25" x2="37.5" y2="79"/>\
				                    		<polygon class="stroke-thin bookmark" stroke-miterlimit="10" points="56.5,24 56.5,42 60.5,37.175 64.5,42 64.5,24"/>\
				                    		<path class="stroke-none fill" d="M48.4,50.8c-0.6,0.9-0.8,1.9-0.8,3c0,2.2,1.2,4.2,3.1,5.3c0.9,0.6,1.9,0.8,3,0.8c2.2,0,4.2-1.2,5.3-3.1\
				                    			c0.6-0.9,0.8-1.9,0.8-3c0-2.2-1.2-4.2-3.1-5.3c-0.9-0.6-1.9-0.8-3-0.8C51.5,47.7,49.5,48.9,48.4,50.8z M60.7,58l4.5,4.5\
				                    			c0.2,0.2,0.3,0.4,0.3,0.7s-0.1,0.5-0.3,0.7l-1.4,1.4c-0.2,0.2-0.4,0.3-0.7,0.3s-0.5-0.1-0.7-0.3l-4.5-4.5\
				                    			c-1.3,0.8-2.7,1.2-4.2,1.2c-2.9,0-5.6-1.6-7.1-4.1c-0.7-1.3-1.1-2.6-1.1-4.1c0-2.9,1.6-5.6,4.1-7.1c1.3-0.7,2.6-1.1,4.1-1.1\
				                    			c2.9,0,5.6,1.6,7.1,4.1c0.7,1.3,1.1,2.6,1.1,4.1C61.8,55.3,61.4,56.7,60.7,58z"/>\
				                    	</g>\
				                    </svg>\
			                        <h3><%- _("Search Commands").t() %> <i class="icon-external"></i></h3>\
		                        </a>\
		                        <span><%- _("Use a transforming search command, like timechart or stats, to summarize the data.").t() %></span>\
		                    </div>\
                    </div>\
            '
        });
    }
);
