define(
    [
        'underscore',
        'jquery',
        'module',
        'views/shared/PopTart',
        'highcharts',
        'splunk.i18n',
        'contrib/text!views/datapreview/eventsummary/Master.html'
    ],
    function(
        _,
        $,
        module,
        PopTart,
        Highcharts,
        i18n,
        template
    ){
        return PopTart.extend({
            moduleId: module.id,
            template: template,
            initialize: function(options) {
                PopTart.prototype.initialize.apply(this, arguments);
                this.model.eventSummaryModel.on('change', this.render.bind(this));
            },
            render: function() {
                if(!this.model.eventSummaryModel.get('buckets')) {return;}

                this.$el.html(PopTart.prototype.template);
                // ghetto hack to override default padding on poptart
                this.$('.popdown-dialog-body').removeClass('popdown-dialog-padded');
                this.$('.popdown-dialog-body').append(this.compiledTemplate({pageModel:this.model.eventSummaryModel}));
                this.addChart.call(this);
                this.addLineCountTable.call(this);
                return this;
            },
            addLineCountTable: function(){
                var linecounts = $('.linecountDistributionTable tbody').html('');
                var lines = this.model.eventSummaryModel.get('lineCountCollection');
                lines.each(function(row){
                    linecounts.append($('<tr/>')
                        .append($('<td/>').text(i18n.format_number(row.get('linecount'))))
                        .append($('<td/>').text(i18n.format_number(row.get('count'))))
                        .append($('<td/>').text(i18n.format_percent(row.get('perc'))))
                    );
                });
            },
            addChart: function(){
                var buckets = this.model.timelineResults.get('buckets');
                var timeline_data = [];
                var timeline_dates = [];
                var max_count = 0;
                var earliestTime = (buckets[0] || {}).earliest_time;
                var latestTime = (buckets[buckets.length-1] || {}).earliest_time;

                $.each(buckets, function(idx, bucket) {
                    timeline_data.push((bucket.total_count == 0 ? null : bucket.total_count));
                    timeline_dates.push(i18n.format_datetime(bucket.earliest_time, 'short'));
                    max_count = Math.max(max_count, bucket.total_count);
                });

                if (parseInt((buckets[0]|| {}).duration, 10) >= 2419200) {
                    // buckets longer than a month should only display month and year
                    earliestTime = i18n.format_date(earliestTime, 'M/yyyy');
                    latestTime = i18n.format_date(latestTime, 'M/yyyy');
                }else{
                    earliestTime = i18n.format_datetime(earliestTime, 'short');
                    latestTime = i18n.format_datetime(latestTime, 'short');
                }

                this.createChart(timeline_dates, max_count, timeline_data);

                $('.chartRangePlaceholder').empty()
                    .append($('<span class="start_time"/>').text(earliestTime))
                    .append($('<span class="pull-right end_time" />').text(latestTime));

            },
            createChart: function(timeline_dates, max_count, timeline_data){
                var chartColors = (this.model.serverInfo.isLite()) ?
                    [[0, '#F58220'],[1, '#D66700']] : [[0, '#6FAA1A'],[1, '#447800']];
                this.chart = new Highcharts.Chart({
                    chart: {
                        renderTo: this.$('.chartPlaceholder')[0],
                        type: 'column',
                        height: 75,
                        width: 320,
                        animation: false,
                        spacingTop: 10,
                        spacingRight: 5,
                        spacingBottom: 10,
                        spacingLeft: 1,
                        backgroundColor: '#edede7'
                    },
                    credits: {
                        enabled: false
                    },
                    title: {
                        text: null
                    },
                    legend: {
                        enabled: false
                    },
                    plotOptions: {
                        column: {
                            animation: false,
                            shadow: false,
                            groupPadding: 0,
                            pointPadding: 0,
                            borderWidth: 0,
                            minPointLength: 2
                        }
                    },
                    xAxis: {
                        title: null,
                        categories: timeline_dates,
                        labels: {enabled: false},
                        lineWidth: 1,
                        lineColor: '#999'
                    },
                    yAxis: {
                        title: null,
                        gridLineWidth: 0,
                        lineWidth: 1,
                        lineColor: '#999',
                        /* tickPixelInterval: 200, */
                        max: max_count,
                        labels: {
                            style: {
                                fontSize: '9px',
                                color: '#333'
                            }
                        }
                    },
                    tooltip: {
                        borderWidth: 1,
                        formatter: function() {
                            return (this.x + ": <b>" + this.y + "</b>");
                        },
                        style: {
                            padding: '3px'
                        }
                    },
                    series: [{
                        name: _('Event count'),
                        data: timeline_data
                    }],
                    colors: [
                        {linearGradient: [0, 0, 0, 500], stops: chartColors}
                    ]
                });
            },
            checkStatus: function(){
                //TODO
                /*
                if (!results.file.isComplete) {
                    var note;
                    if (results.file.isCompressed) {
                        note = _('Only a portion of your compressed file used for preview.');
                    } else {
                        note = sprintf(
                            _('Only the first %sB used for preview.'),
                           format_number(results.file.read)
                        );
                    }
                    $('#preview_truncate_note').text(note).show();
                } else {
                    $('#preview_truncate_note').hide();
                }
                */
            }
        });

    }
);
