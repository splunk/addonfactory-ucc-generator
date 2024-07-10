export const MOCK_OVERVIEW_DEFINITION_JSON = {
    visualizations: {
        main_page_label_viz: {
            type: 'splunk.markdown',
            options: {
                markdown: '# Monitoring dashboard',
                fontSize: 'large',
            },
        },
        main_page_description_viz: {
            type: 'splunk.markdown',
            options: {
                markdown: 'Use the Monitoring dashboard to track behaviors for your add-on.',
                customFontSize: 12,
            },
        },
        overview_main_label_viz: {
            type: 'splunk.markdown',
            options: {
                markdown: '## Overview',
                fontSize: 'large',
            },
        },
        overview_timerange_label_start_viz: {
            type: 'splunk.singlevalue',
            options: {
                majorFontSize: 12,
                backgroundColor: 'transparent',
                majorColor: '#9fa4af',
            },
            dataSources: {
                primary: 'overview_data_time_label_start_ds',
            },
        },
        overview_timerange_label_end_viz: {
            type: 'splunk.singlevalue',
            options: {
                majorFontSize: 12,
                backgroundColor: 'transparent',
                majorColor: '#9fa4af',
            },
            context: {},
            dataSources: {
                primary: 'overview_data_time_label_end_ds',
            },
        },
        overview_data_volume_viz: {
            type: 'splunk.column',
            options: {
                xAxisVisibility: 'hide',
                seriesColors: ['#A870EF', '#029ceb'],
                yAxisTitleText: 'Volume (bytes)',
                overlayFields: 'Number of events',
                y2AxisTitleText: 'Number of events',
                xAxisTitleText: 'Time',
                y2AxisLineVisibility: 'show',
                showRoundedY2AxisLabels: true,
                showOverlayY2Axis: true,
            },
            title: 'Data ingestion',
            dataSources: {
                primary: 'overview_data_volume_ds',
            },
        },
        overview_errors_viz: {
            type: 'splunk.line',
            options: {
                xAxisVisibility: 'hide',
                xAxisTitleText: 'Time',
                seriesColors: ['#A870EF'],
                yAxisTitleText: 'Error count',
            },
            title: 'Errors',
            dataSources: {
                primary: 'overview_errors_count_ds',
            },
        },
    },
    dataSources: {
        overview_data_time_label_start_ds: {
            type: 'ds.search',
            options: {
                query: '| makeresults | addinfo | eval StartDate = strftime(info_min_time, "%e %b %Y %I:%M%p") | table StartDate',
                queryParameters: {
                    earliest: '$overview_time.earliest$',
                    latest: '$overview_time.latest$',
                },
            },
        },
        overview_data_time_label_end_ds: {
            type: 'ds.search',
            options: {
                query: '| makeresults | addinfo | eval EndDate = strftime(info_max_time, "%e %b %Y %I:%M%p") | table EndDate',
                queryParameters: {
                    earliest: '$overview_time.earliest$',
                    latest: '$overview_time.latest$',
                },
            },
        },
        overview_data_volume_ds: {
            type: 'ds.search',
            options: {
                query: 'index=_internal source=*license_usage.log type=Usage (s IN (example_input_one*,example_input_two*,example_input_three*,example_input_four*)) | timechart sum(b) as Usage | rename Usage as "Data volume" | join _time [search index=_internal source=*splunk_ta_uccexample* action=events_ingested | timechart sum(n_events) as "Number of events" ]',
                queryParameters: {
                    earliest: '$overview_time.earliest$',
                    latest: '$overview_time.latest$',
                },
            },
        },
        overview_errors_count_ds: {
            type: 'ds.search',
            options: {
                query: 'index=_internal source=*splunk_ta_uccexample* ERROR | timechart count as Errors',
                queryParameters: {
                    earliest: '$overview_time.earliest$',
                    latest: '$overview_time.latest$',
                },
            },
        },
    },
    defaults: {},
    inputs: {
        overview_input: {
            options: {
                defaultValue: '-7d,now',
                token: 'overview_time',
            },
            title: 'Time',
            type: 'input.timerange',
        },
    },
    layout: {
        type: 'grid',
        globalInputs: ['overview_input'],
        structure: [
            {
                item: 'main_page_label_viz',
                position: {
                    x: 20,
                    y: 20,
                    w: 500,
                    h: 200,
                },
            },
            {
                item: 'main_page_description_viz',
                position: {
                    x: 20,
                    y: 50,
                    w: 500,
                    h: 200,
                },
            },
            {
                item: 'overview_main_label_viz',
                position: {
                    x: 20,
                    y: 100,
                    w: 500,
                    h: 200,
                },
            },
            {
                item: 'overview_timerange_label_start_viz',
                position: {
                    x: 20,
                    y: 130,
                    w: 100,
                    h: 20,
                },
            },
            {
                item: 'overview_timerange_label_end_viz',
                position: {
                    x: 120,
                    y: 130,
                    w: 100,
                    h: 20,
                },
            },
            {
                item: 'overview_data_volume_viz',
                position: {
                    x: 20,
                    y: 150,
                    w: 620,
                    h: 300,
                },
            },
            {
                item: 'overview_errors_viz',
                position: {
                    x: 640,
                    y: 150,
                    w: 620,
                    h: 300,
                },
            },
        ],
    },
    description: '',
    title: 'Custom Components Dashboard',
};

export const MOCK_DATA_INGESTION_TAB_TAB_DEFINITION = {
    visualizations: {
        data_ingestion_label_viz: {
            type: 'splunk.markdown',
            options: {
                markdown: '## Data Ingestion',
                fontSize: 'large',
            },
        },
        data_ingestion_description_viz: {
            type: 'splunk.markdown',
            options: {
                markdown: 'View your add-on ingestion by data volume and number of events.',
                customFontSize: 12,
            },
        },
        data_ingestion_timerange_label_start_viz: {
            type: 'splunk.singlevalue',
            options: {
                majorFontSize: 12,
                backgroundColor: 'transparent',
                majorColor: '#9fa4af',
            },
            dataSources: {
                primary: 'data_ingestion_data_time_label_start_ds',
            },
        },
        data_ingestion_timerange_label_end_viz: {
            type: 'splunk.singlevalue',
            options: {
                majorFontSize: 12,
                backgroundColor: 'transparent',
                majorColor: '#9fa4af',
            },
            dataSources: {
                primary: 'data_ingestion_data_time_label_end_ds',
            },
        },
        data_ingestion_data_volume_viz: {
            type: 'splunk.line',
            options: {
                xAxisVisibility: 'hide',
                seriesColors: ['#A870EF'],
                yAxisTitleText: 'Volume (bytes)',
                xAxisTitleText: 'Time',
            },
            title: 'Data volume',
            dataSources: {
                primary: 'data_ingestion_data_volume_ds',
            },
        },
        data_ingestion_events_count_viz: {
            type: 'splunk.line',
            options: {
                xAxisVisibility: 'hide',
                xAxisTitleText: 'Time',
                seriesColors: ['#A870EF'],
                yAxisTitleText: 'Number of events',
            },
            title: 'Number of events',
            dataSources: {
                primary: 'data_ingestion_events_count_ds',
            },
        },
        data_ingestion_table_viz: {
            type: 'splunk.table',
            context: {
                formattedVolume: {
                    number: {
                        output: 'byte',
                        base: 'decimal',
                        mantissa: 2,
                        spaceSeparated: true,
                    },
                },
                formattedEvent: {
                    number: {
                        trimMantissa: true,
                        average: true,
                        mantissa: 2,
                        spaceSeparated: false,
                    },
                },
            },
            dataSources: {
                primary: 'data_ingestion_table_ds',
            },
            options: {
                tableFormat: {
                    rowBackgroundColors:
                        '> table | seriesByIndex(0) | pick(tableAltRowBackgroundColorsByBackgroundColor)',
                    headerBackgroundColor:
                        '> backgroundColor | setColorChannel(tableHeaderBackgroundColorConfig)',
                    rowColors: '> rowBackgroundColors | maxContrast(tableRowColorMaxContrast)',
                    headerColor: '> headerBackgroundColor | maxContrast(tableRowColorMaxContrast)',
                },
                columnFormat: {
                    'Data volume': {
                        data: '> table | seriesByName("Data volume") | formatByType(formattedVolume)',
                    },
                    'Number of events': {
                        data: '> table | seriesByName("Number of events") | formatByType(formattedEvent)',
                    },
                },
                count: 10,
            },
        },
    },
    dataSources: {
        data_ingestion_data_time_label_start_ds: {
            type: 'ds.search',
            options: {
                query: '| makeresults | addinfo | eval StartDate = strftime(info_min_time, "%e %b %Y %I:%M%p") | table StartDate',
                queryParameters: {
                    earliest: '$data_ingestion_time.earliest$',
                    latest: '$data_ingestion_time.latest$',
                },
            },
        },
        data_ingestion_data_time_label_end_ds: {
            type: 'ds.search',
            options: {
                query: '| makeresults | addinfo | eval EndDate = strftime(info_max_time, "%e %b %Y %I:%M%p") | table EndDate',
                queryParameters: {
                    earliest: '$data_ingestion_time.earliest$',
                    latest: '$data_ingestion_time.latest$',
                },
            },
        },
        data_ingestion_data_volume_ds: {
            type: 'ds.search',
            options: {
                query: 'index=_internal source=*license_usage.log type=Usage (s IN (example_input_one*,example_input_two*,example_input_three*,example_input_four*)) | timechart sum(b) as Usage | rename Usage as "Data volume"',
                queryParameters: {
                    earliest: '$data_ingestion_time.earliest$',
                    latest: '$data_ingestion_time.latest$',
                },
            },
        },
        data_ingestion_events_count_ds: {
            type: 'ds.search',
            options: {
                query: 'index=_internal source=*splunk_ta_uccexample* action=events_ingested | timechart sum(n_events) as "Number of events"',
                queryParameters: {
                    earliest: '$data_ingestion_time.earliest$',
                    latest: '$data_ingestion_time.latest$',
                },
            },
        },
        data_ingestion_table_ds: {
            type: 'ds.search',
            options: {
                query: '$table_view_by$',
                queryParameters: {
                    earliest: '$data_ingestion_time.earliest$',
                    latest: '$data_ingestion_time.latest$',
                },
            },
        },
    },
    defaults: {},
    inputs: {
        data_ingestion_input: {
            options: {
                defaultValue: '-7d,now',
                token: 'data_ingestion_time',
            },
            title: 'Time',
            type: 'input.timerange',
        },
        data_ingestion_table_input: {
            type: 'input.dropdown',
            options: {
                items: [
                    {
                        label: 'Source type',
                        value: 'index=_internal source=*license_usage.log type=Usage (s IN (example_input_one*,example_input_two*,example_input_three*,example_input_four*)) | stats sparkline(sum(b)) as sparkvolume, sum(b) as Bytes by st | join type=left st [search index = _internal source=*splunk_ta_uccexample* action=events_ingested | stats latest(_time) AS le, sparkline(sum(n_events)) as sparkevent, sum(n_events) as events by sourcetype_ingested | rename sourcetype_ingested as st ] | makemv delim="," sparkevent | eval "Last event" = strftime(le, "%e %b %Y %I:%M%p") | table st, Bytes, sparkvolume, events, sparkevent, "Last event" | rename st as "Source type", Bytes as "Data volume", events as "Number of events", sparkvolume as "Volume trendline (Bytes)", sparkevent as "Event trendline"',
                    },
                    {
                        label: 'Source',
                        value: 'index=_internal source=*license_usage.log type=Usage (s IN (example_input_one*,example_input_two*,example_input_three*,example_input_four*)) | stats sparkline(sum(b)) as sparkvolume, sum(b) as Bytes by s | join type=left s [search index = _internal source=*splunk_ta_uccexample* action=events_ingested | stats latest(_time) AS le, sparkline(sum(n_events)) as sparkevent, sum(n_events) as events by modular_input_name | rename modular_input_name as s ] | makemv delim="," sparkevent | eval "Last event" = strftime(le, "%e %b %Y %I:%M%p") | table s, Bytes, sparkvolume, events, sparkevent, "Last event" | rename s as "Source", Bytes as "Data volume", events as "Number of events", sparkvolume as "Volume trendline (Bytes)", sparkevent as "Event trendline"',
                    },
                    {
                        label: 'Host',
                        value: 'index=_internal source=*license_usage.log type=Usage (s IN (example_input_one*,example_input_two*,example_input_three*,example_input_four*)) | stats sparkline(sum(b)) as sparkvolume, sum(b) as Bytes by h | table h, Bytes, sparkvolume | rename h as "Host", Bytes as "Data volume", sparkvolume as "Volume trendline (Bytes)"',
                    },
                    {
                        label: 'Index',
                        value: 'index=_internal source=*license_usage.log type=Usage (s IN (example_input_one*,example_input_two*,example_input_three*,example_input_four*)) | stats sparkline(sum(b)) as sparkvolume, sum(b) as Bytes by idx | join type=left idx [search index = _internal source=*splunk_ta_uccexample* action=events_ingested | stats latest(_time) AS le, sparkline(sum(n_events)) as sparkevent, sum(n_events) as events by event_index | rename event_index as idx ] | makemv delim="," sparkevent | eval "Last event" = strftime(le, "%e %b %Y %I:%M%p") | table idx, Bytes, sparkvolume, events, sparkevent, "Last event" | rename idx as "Index", Bytes as "Data volume", events as "Number of events", sparkvolume as "Volume trendline (Bytes)", sparkevent as "Event trendline"',
                    },
                    {
                        label: 'Account',
                        value: 'index = _internal source=*splunk_ta_uccexample* action=events_ingested | stats latest(_time) as le, sparkline(sum(n_events)) as sparkevent, sum(n_events) as events by event_account | eval "Last event" = strftime(le, "%e %b %Y %I:%M%p") | table event_account, events, sparkevent, "Last event" | rename event_account as "Account", events as "Number of events", sparkevent as "Event trendline"',
                    },
                    {
                        label: 'Input',
                        value: 'index = _internal source=*splunk_ta_uccexample* action=events_ingested | stats latest(_time) as le, sparkline(sum(n_events)) as sparkevent, sum(n_events) as events by event_input | eval "Last event" = strftime(le, "%e %b %Y %I:%M%p") | table event_input, events, sparkevent, "Last event" | rename event_input as "Input", events as "Number of events", sparkevent as "Event trendline"',
                    },
                ],
                defaultValue:
                    'index=_internal source=*license_usage.log type=Usage (s IN (example_input_one*,example_input_two*,example_input_three*,example_input_four*)) | stats sparkline(sum(b)) as sparkvolume, sum(b) as Bytes by st | join type=left st [search index = _internal source=*splunk_ta_uccexample* action=events_ingested | stats latest(_time) AS le, sparkline(sum(n_events)) as sparkevent, sum(n_events) as events by sourcetype_ingested | rename sourcetype_ingested as st ] | makemv delim="," sparkevent | eval "Last event" = strftime(le, "%e %b %Y %I:%M%p") | table st, Bytes, sparkvolume, events, sparkevent, "Last event" | rename st as "Source type", Bytes as "Data volume", events as "Number of events", sparkvolume as "Volume trendline (Bytes)", sparkevent as "Event trendline"',
                token: 'table_view_by',
            },
            title: 'View by',
        },
    },
    layout: {
        type: 'grid',
        globalInputs: ['data_ingestion_input', 'data_ingestion_table_input'],
        structure: [
            {
                item: 'data_ingestion_label_viz',
                position: {
                    x: 20,
                    y: 500,
                    w: 300,
                    h: 20,
                },
            },
            {
                item: 'data_ingestion_description_viz',
                position: {
                    x: 20,
                    y: 520,
                    w: 500,
                    h: 50,
                },
            },
            {
                item: 'data_ingestion_timerange_label_start_viz',
                position: {
                    x: 20,
                    y: 530,
                    w: 100,
                    h: 20,
                },
            },
            {
                item: 'data_ingestion_timerange_label_end_viz',
                position: {
                    x: 120,
                    y: 530,
                    w: 100,
                    h: 20,
                },
            },
            {
                item: 'data_ingestion_data_volume_viz',
                position: {
                    x: 20,
                    y: 550,
                    w: 620,
                    h: 150,
                },
            },
            {
                item: 'data_ingestion_events_count_viz',
                position: {
                    x: 640,
                    y: 550,
                    w: 620,
                    h: 150,
                },
            },
            {
                item: 'data_ingestion_table_viz',
                position: {
                    x: 20,
                    y: 710,
                    w: 1220,
                    h: 300,
                },
            },
        ],
    },
};

export const MOCK_ERROR_TAB_DEFINITION = {
    visualizations: {
        errors_tab_label_viz: {
            type: 'splunk.markdown',
            options: {
                markdown: '## Errors',
                fontSize: 'large',
            },
        },
        errors_tab_description_viz: {
            type: 'splunk.markdown',
            options: {
                markdown: 'View error messages for your add-on within the selected time range.',
                customFontSize: 12,
            },
        },
        errors_tab_timerange_label_start_viz: {
            type: 'splunk.singlevalue',
            options: {
                majorFontSize: 12,
                backgroundColor: 'transparent',
                majorColor: '#9fa4af',
            },
            dataSources: {
                primary: 'errors_tab_data_time_label_start_ds',
            },
        },
        errors_tab_timerange_label_end_viz: {
            type: 'splunk.singlevalue',
            options: {
                majorFontSize: 12,
                backgroundColor: 'transparent',
                majorColor: '#9fa4af',
            },
            dataSources: {
                primary: 'errors_tab_data_time_label_end_ds',
            },
        },
        errors_tab_errors_count_viz: {
            type: 'splunk.line',
            options: {
                xAxisVisibility: 'hide',
                xAxisTitleText: 'Time',
                seriesColors: ['#A870EF'],
                yAxisTitleText: 'Errors count',
            },
            title: 'Errors count',
            dataSources: {
                primary: 'errors_tab_errors_count_ds',
            },
        },
        errors_tab_errors_list_viz: {
            type: 'splunk.events',
            options: {},
            dataSources: {
                primary: 'errors_tab_errors_list_ds',
            },
        },
    },
    dataSources: {
        errors_tab_data_time_label_start_ds: {
            type: 'ds.search',
            options: {
                query: '| makeresults | addinfo | eval StartDate = strftime(info_min_time, "%e %b %Y %I:%M%p") | table StartDate',
                queryParameters: {
                    earliest: '$errors_tab_time.earliest$',
                    latest: '$errors_tab_time.latest$',
                },
            },
        },
        errors_tab_data_time_label_end_ds: {
            type: 'ds.search',
            options: {
                query: '| makeresults | addinfo | eval EndDate = strftime(info_max_time, "%e %b %Y %I:%M%p") | table EndDate',
                queryParameters: {
                    earliest: '$errors_tab_time.earliest$',
                    latest: '$errors_tab_time.latest$',
                },
            },
        },
        errors_tab_errors_count_ds: {
            type: 'ds.search',
            options: {
                query: 'index=_internal source=*splunk_ta_uccexample* ERROR | timechart count as Errors',
                queryParameters: {
                    earliest: '$errors_tab_time.earliest$',
                    latest: '$errors_tab_time.latest$',
                },
            },
        },
        errors_tab_errors_list_ds: {
            type: 'ds.search',
            options: {
                query: 'index=_internal source=*splunk_ta_uccexample* ERROR',
                queryParameters: {
                    earliest: '$errors_tab_time.earliest$',
                    latest: '$errors_tab_time.latest$',
                },
            },
        },
    },
    defaults: {},
    inputs: {
        errors_tab_input: {
            options: {
                defaultValue: '-7d,now',
                token: 'errors_tab_time',
            },
            title: 'Time',
            type: 'input.timerange',
        },
    },
    layout: {
        type: 'grid',
        globalInputs: ['errors_tab_input'],
        structure: [
            {
                item: 'errors_tab_label_viz',
                position: {
                    x: 20,
                    y: 500,
                    w: 300,
                    h: 50,
                },
            },
            {
                item: 'errors_tab_description_viz',
                position: {
                    x: 20,
                    y: 520,
                    w: 500,
                    h: 50,
                },
            },
            {
                item: 'errors_tab_timerange_label_start_viz',
                position: {
                    x: 20,
                    y: 530,
                    w: 100,
                    h: 20,
                },
            },
            {
                item: 'errors_tab_timerange_label_end_viz',
                position: {
                    x: 120,
                    y: 530,
                    w: 100,
                    h: 20,
                },
            },
            {
                item: 'errors_tab_errors_count_viz',
                position: {
                    x: 20,
                    y: 550,
                    w: 1220,
                    h: 150,
                },
            },
            {
                item: 'errors_tab_errors_list_viz',
                position: {
                    x: 20,
                    y: 710,
                    w: 1220,
                    h: 600,
                },
            },
        ],
    },
};

export const CURRENT_CONTEXT_RESPONSE = {
    entry: [
        {
            content: {
                capabilities: [],
            },
        },
    ],
};

export const SEARCH_JOB_RESULT = {
    entry: [
        {
            content: {},
        },
    ],
};
