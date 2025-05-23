import { createGlobalStyle } from 'styled-components';
import variables from '@splunk/themes/variables';
import pick from '@splunk/themes/pick';

export const GlobalDashboardStyle = createGlobalStyle`
    body {
        background-color: ${pick({
            enterprise: {
                light: variables.gray96,
                dark: variables.gray20,
            },
            prisma: variables.backgroundColorSection,
        })};
    }

    #dashboardTable [data-test='tab-bar'] {
        margin-bottom: 15px;

        button {
            min-width: 115px;
        }
    }

    [data-input-id='overview_input'] {
        grid-column: 5 / 5;
        grid-row: 3;
    }

    #overview_main_label_viz {
        grid-column: 1 / span 4;
        grid-row: 3;
        height: fit-content;
    }

    #main_page_description_viz {
        margin-top: 40px;
    }

    #overview_timerange_label_start_viz {
        grid-row: 3;
        margin-top: 28px;
    }

    #overview_timerange_label_end_viz {
        grid-row: 3;
        margin-left: 145px;
        margin-top: 28px;
        display: flex;
    }

    /* data ingestion */

    [data-input-id='data_ingestion_input'] {
        grid-column: 8 / 9;
        grid-row: 2;
    }

    #data_ingestion_description_viz {
        margin-top: 32px;
        width: 600px;
    }

    #data_ingestion_timerange_label_start_viz {
        grid-row: 2;
        margin-top: 12px;
    }

    #data_ingestion_timerange_label_end_viz {
        grid-row: 2;
        margin-left: 145px;
        display: flex;
        margin-top: 12px;
    }

    #data_ingestion_table_viz {
        grid-column: 1 / 9;
        height: 100%;
        max-height: 500px;
        grid-row: 6;
        margin-top: 100px;

        [data-test='viz-waiting-for-input'] {
            min-height: 100px;
        }
    }

    #data_ingestion_data_volume_viz {
        grid-row: 3 / 6;
        margin-top: 20px;
        grid-column: 1 / 5;
    }

    #data_ingestion_events_count_viz {
        grid-row: 3 / 6;
        margin-top: 20px;
        grid-column: 5 / 9;
    }

    #data_ingestion_search {
        grid-row: 6;
        width: 150px;
        grid-column: 1;
        margin-top: 16px;
    }

    #data_ingestion_search_label {
        margin-bottom: 4px;
    }

    [data-input-id='data_ingestion_table_input'] {
        width: 200px;
        margin-left: 150px;
        grid-row: 6;
        grid-column: 1;
        margin-top: 21px;
        [data-test='input-title'] {
            font-size: 14px;
        }
    }

    #switch_hide_no_traffic_wrapper {
        grid-column: 1;
        grid-row: 6;
        width: 200px;
        margin: 32px 350px;
    }

    /* error tab */

    [data-input-id='errors_tab_input'] {
        grid-column: 2;
        grid-row: 1;
    }

    #errors_tab_description_viz {
        grid-column: 1 / 3;
        grid-row: 1;
        height: 20px;
        margin-top: 32px;
        width: 600px;
    }

    #errors_tab_timerange_label_start_viz {
        grid-column: 1;
        grid-row: 1;
        margin-top: 37px;
    }

    #errors_tab_timerange_label_end_viz {
        grid-column: 1;
        grid-row: 1;
        margin-left: 145px;
        display: flex;
        margin-top: 37px;
    }

    [data-test='status-icon-container'] {
        z-index: 1;
    }

    .invisible_before_moving {
        display: none;
    }

    #errors_tab_errors_list_viz {
        margin-top: 8px;
        height: fit-content;
        grid-row: 5;
        grid-column: 1 / 3;
    }

    #errors_tab_errors_count_viz {
        grid-row: 2;
        height: 400px;
        grid-column: 1 / 3;
        margin-top: 16px;
    }

    [data-input-id='errors_type_input'] {
        grid-column: 1;
        grid-row: 4;
    }

    #errors_tab_errors_list_viz div {
        height: fit-content;
    }

    [data-test-panel-id='errorsTabPanel'] [data-test='grid-layout-canvas'] {
        grid-template-columns: 94.5% 5%;
        grid-template-rows: auto auto auto auto auto;
        height: fit-content;
        overflow-x: hidden;
    }

    #errors_tab_label_viz {
        grid-column: 1;
        grid-row: 1;
    }

    /* resource tab */

    #resource_tab_label_viz {
        min-width: 450px;
    }

    [data-input-id='resource_tab_input'] {
        grid-column: 6;
        grid-row: 1;
        margin-top: 32px;
    }

    #resource_tab_description_viz {
        margin-top: 32px;
        width: 600px;
    }

    #resource_tab_timerange_label_start_viz {
        grid-row: 1;
        margin-top: 35px;
    }

    #resource_tab_timerange_label_end_viz {
        grid-row: 1;
        margin-left: 145px;
        display: flex;
        margin-top: 35px;
    }

    #resource_tab_cpu_consumption_viz,
    #resource_tab_memory_consumption_viz {
        grid-row: 2 / 6;
        margin-top: 20px;
        height: 300px;
    }

    /* data ingestion table modal */

    #data_ingestion_modal_dropdown {
        grid-row: 1;
        grid-column: 1;
        align-content: center;
        margin-left: 2px;
        width: 160px;
    }

    [data-input-id='data_ingestion_modal_time_window'] {
        grid-row: 1;
        grid-column: 1;
        margin-left: 170px;
    }

    #data_ingestion_dropdown_label {
        margin: 0;
        margin-bottom: 5px;
    }

    #data_ingestion_modal_timerange_label_end_viz {
        margin-left: 145px;
        display: flex;
    }

    /* shared styles for time labels */
    #overview_timerange_label_start_viz,
    #overview_timerange_label_end_viz,
    #data_ingestion_timerange_label_start_viz,
    #data_ingestion_timerange_label_end_viz,
    #errors_tab_timerange_label_start_viz,
    #errors_tab_timerange_label_end_viz,
    #resource_tab_timerange_label_start_viz,
    #resource_tab_timerange_label_end_viz,
    #data_ingestion_modal_timerange_label_start_viz,
    #data_ingestion_modal_timerange_label_end_viz {
        inline-size: fit-content;
        grid-column: 1;
        width: 145px;

        [data-test='majorValue'] {
            font-size: 14px;
            line-height: 14px;
            font-family: 'Splunk Platform Sans', 'Splunk Platform Sans', 'Proxima Nova', Roboto, Droid,
            'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-weight: 400;
            color: var(--muted-text-color);
        }
        [data-test='action-menu-wrapper'] {
            display: none;
        }
    }

    /* shared styles page grid titles */
    #main_page_label_viz,
    #main_page_description_viz,
    #data_ingestion_description_viz,
    #data_ingestion_label_viz,
    #errors_tab_description_viz,
    #resource_tab_description_viz {
        grid-column: 1 / span 4;
        grid-row: 1;
        height: fit-content;
    }

    /* data input shared styles  */
    [data-input-id='overview_input'],
    [data-input-id='data_ingestion_input'],
    [data-input-id='errors_tab_input'],
    [data-input-id='resource_tab_input'] {
        align-content: flex-end;
        place-self: end;

        [data-test='input-container'] {
            display: inline-flex;
            padding: 0;
        }
        /* Time selector */
        [data-test='input-title'] {
            margin: 5px;
            font-size: 14px;
        }
    }

    /* mark between dates  */

    #overview_timerange_label_end_viz::before,
    #data_ingestion_timerange_label_end_viz::before,
    #errors_tab_timerange_label_end_viz::before,
    #resource_tab_timerange_label_end_viz::before,
    #data_ingestion_modal_timerange_label_end_viz::before {
        content: '- ';
        margin: auto;
        color: var(--muted-text-color);
    }

    #errors_tab_errors_list_viz svg[data-test='placeholder-icon'] {
        max-height: 100px;
    }

    [data-test-panel-id='dataIngestionTabPanel'] [data-test='grid-layout-canvas'] {
        grid-template-columns: repeat(8, 12%);
        overflow-x: hidden;
    }

    [data-test-panel-id='dataIngestionModalDefTabPanel'] [data-test='input-layout-container'],
    [data-test-panel-id='dataIngestionModalDefTabPanel'] [data-test='grid-layout-canvas'] {
        background-color: var(--muted-text-color);
        padding: 0px;
        display: grid;
    }

    /* muted color */
    #main_page_description_viz p,
    #data_ingestion_description_viz p,
    #errors_tab_description_viz p {
        color: var(--muted-text-color);
    }

    #data_ingestion_table_viz [data-test='table-container'] td:first-child {
        cursor: pointer;
        color: #006eaa !important;
    }

    #data_ingestion_table_viz [data-test='table-container'] td:first-child:hover {
        text-decoration: underline;
    }

    .dropdown_menu_item {
        padding: 6px 16px;
        min-width: 200px;
    }

`;
