import { MOCKED_TA_INPUT } from '../../mocks/server-response';

export const mockUnifiedConfig = {
    meta: {
        restRoot: 'restRoot',
    },
    pages: {
        inputs: {
            title: 'Inputs',
            description: 'Create data inputs to collect data from AWS',
            table: {
                header: [
                    {
                        field: 'name',
                        label: 'Input Name',
                        customCell: {
                            src: 'CustomInputCell',
                            type: 'external',
                        },
                    },
                ],
                moreInfo: [
                    {
                        field: 'name',
                        label: 'Name',
                    },
                ],
                customRow: {
                    src: 'CustomInputRow',
                    type: 'external',
                },
                actions: ['edit', 'delete', 'clone'],
            },
            groupsMenu: [
                {
                    groupName: 'aws_billing_menu',
                    groupTitle: 'Billing',
                    groupServices: ['aws_billing_cur', 'aws_billing'],
                },
                {
                    groupName: 'aws_cloudwatch',
                    groupTitle: 'CloudWatch',
                },
            ],
            menu: {
                src: 'CustomMenu',
                type: 'external',
            },
            services: [
                {
                    name: 'aws_billing_cur',
                    title: 'Billing (Cost and Usage Report)',
                    subTitle: '(Recommended)',
                    style: 'page',
                    hook: {
                        src: 'Hook',
                        type: 'external',
                    },
                    restHandlerName: 'aws_billing_cur_inputs_rh',
                    groups: [
                        {
                            label: 'AWS Input Configuration',
                            options: {
                                isExpandable: false,
                            },
                            fields: [
                                'name',
                                'aws_account',
                                'aws_iam_role',
                                'aws_s3_region',
                                'private_endpoint_enabled',
                                's3_private_endpoint_url',
                                'sts_private_endpoint_url',
                                'bucket_name',
                                'report_prefix',
                                'report_names',
                            ],
                        },
                        {
                            label: 'Splunk-related Configuration',
                            options: {
                                isExpandable: false,
                            },
                            fields: ['start_date', 'sourcetype', 'index'],
                        },
                        {
                            label: 'Advanced Settings',
                            options: {
                                expand: false,
                                isExpandable: true,
                            },
                            fields: ['interval', 'temp_folder'],
                        },
                    ],
                    entity: [
                        {
                            field: 'name',
                            label: 'Name',
                            type: 'text',
                            required: true,
                            validators: [
                                {
                                    type: 'regex',
                                    pattern: '^[^%<>/\\^$]+$',
                                    errorMsg:
                                        'Please enter name without special characters ^%<>/\\^$',
                                },
                            ],
                        },
                        {
                            field: 'aws_account',
                            label: 'AWS Account',
                            type: 'singleSelect',
                            required: true,
                            options: {
                                placeholder: 'Select an account',
                                endpointUrl: MOCKED_TA_INPUT,
                            },
                        },
                    ],
                },
                {
                    name: 'aws_billing',
                    title: 'Billing (Legacy)',
                    style: 'page',
                    hook: {
                        src: 'Hook',
                        type: 'external',
                    },
                    restHandlerName: 'aws_billing_inputs_rh',
                    groups: [
                        {
                            label: 'AWS Input Configuration',
                            options: {
                                isExpandable: false,
                            },
                            fields: [
                                'name',
                                'aws_account',
                                'aws_iam_role',
                                'aws_s3_region',
                                'bucket_name',
                                'monthly_report_type',
                                'detail_report_type',
                            ],
                        },
                        {
                            label: 'Splunk-related Configuration',
                            options: {
                                isExpandable: false,
                            },
                            fields: ['initial_scan_datetime', 'sourcetype', 'index'],
                        },
                        {
                            label: 'Advanced Settings',
                            options: {
                                expand: false,
                                isExpandable: true,
                            },
                            fields: ['interval', 'report_file_match_reg', 'temp_folder'],
                        },
                    ],
                    entity: [
                        {
                            field: 'name',
                            label: 'Name',
                            type: 'text',
                            required: true,
                            validators: [
                                {
                                    type: 'regex',
                                    pattern: '^[^%<>/\\^$]+$',
                                    errorMsg:
                                        'Please enter name without special characters ^%<>/\\^$',
                                },
                            ],
                        },
                    ],
                },
                {
                    name: 'aws_cloudwatch',
                    title: 'CloudWatch',
                    style: 'page',
                    hook: {
                        src: 'Hook',
                        type: 'external',
                    },
                    restHandlerName: 'aws_cloudwatch_inputs_rh',
                    groups: [
                        {
                            label: 'AWS Input Configuration',
                            options: {
                                isExpandable: false,
                            },
                            fields: [
                                'name',
                                'aws_account',
                                'aws_iam_role',
                                'aws_region',
                                'private_endpoint_enabled',
                                'sts_private_endpoint_url',
                                'monitoring_private_endpoint_url',
                                'elb_private_endpoint_url',
                                'ec2_private_endpoint_url',
                                'autoscaling_private_endpoint_url',
                                'lambda_private_endpoint_url',
                                's3_private_endpoint_url',
                                'metric_namespace',
                            ],
                        },
                        {
                            label: 'Splunk-related Configuration',
                            options: {
                                isExpandable: false,
                            },
                            fields: ['sourcetype', 'index'],
                        },
                        {
                            label: 'Advanced Settings',
                            options: {
                                expand: false,
                                isExpandable: true,
                            },
                            fields: ['period'],
                        },
                    ],
                    entity: [],
                },
            ],
        },
    },
};
