define(
    [
        'underscore',
        'jquery',
        'module',
        'views/Base',
        'prettify',
        'views/shared/timerangepicker/Master',
        'views/shared/jobstatus/SearchMode',
        'views/shared/eventsviewer/Master',
        'views/shared/searchbar/Master',
        'views/shared/vizcontrols/Master',
        'views/search/results/eventspane/controls/Master',
        'contrib/text!./Master.html',
        'contrib/google-code-prettify/prettify.css',
        './Master.pcss',
        'views/style_guide/Buttons/Master',
        'views/style_guide/Forms/Master',
        'views/style_guide/Navigation/Master',
        'views/style_guide/TimePicker/Master'
    ],
    function(
        _,
        $,
        module,
        BaseView,
        prettyPrint,
        TimeRangePicker,
        JobStatus,
        SearchMode,
        EventsViewer,
        SearchBar,
        VizControls,
        template,
        cssPrettify,
        css,
        ButtonsView,
        FormsView,
        NavigationView,
        TimePickerView
    ) {
        return BaseView.extend({
            moduleId: module.id,
            events: {
                'click .content a': function(e) {
                    e.preventDefault();
                }
            },
            onAddedToDocument: function() {
                prettyPrint();
                var that = this;

                this.$('.color-list li').each(function(index, el){
                    var $el = $(el);

                    $el.html('<span>' + $el.attr('class') +  '<br>' + that.convertRGB($el.css('backgroundColor')) + '<span>');
                });

                $(document.location.hash).show();
            },
            convertRGB: function rgb2hex(rgb) {
                var rgbparse = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
                function hex(x) {
                    return ("0" + parseInt(x, 10).toString(16)).slice(-2);
                }
                if (rgbparse && rgbparse[1]) {
                    return "#" + hex(rgbparse[1]) + hex(rgbparse[2]) + hex(rgbparse[3]);
                }
                return rgb;
            },
            initialize: function() {
                 BaseView.prototype.initialize.apply(this,arguments);
                 this.formsView = new FormsView();
                 this.buttonsView = new ButtonsView();
                 this.navigationView = new NavigationView();
                 this.timePickerView = new TimePickerView();
            },
            render: function() {
                this.$el.html(template);

                if (document.location.pathname.slice(-9) === 'lite.html') {
                    this.$('[data-nav=lite]').addClass('active');
                } else {
                    this.$('[data-nav=enterprise]').addClass('active');
                }

                this.formsView.render().appendTo(this.$('#form_template'));
                this.buttonsView.render().appendTo(this.$('#button_template'));
                this.navigationView.render().appendTo(this.$('#navigation_template'));
                this.timePickerView.render().appendTo(this.$('#time_template'));
                return this;
            }
        });
    }
);
