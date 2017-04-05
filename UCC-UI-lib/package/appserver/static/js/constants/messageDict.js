export default {
    /* validation messages, range [0, 99] */
    0: 'Field "{{args[0]}}" is required',
    1: 'Field "{{args[0]}}" must be a string',
    2: '"{{args[0]}}" {{args[1]}} is already in use',
    3: '"default", ".", "..", string started with "_" and string including any one of ["*", "\\", "[", "]", "(", ")", "?", ":"] are reserved value which cannot be used for field "{{args[0]}}"',
    5: 'Field {{args[0]}} should be a positive number',
    6: 'Field {{args[0]}} is required',
    7: 'Field {{args[0]}} is not a valid regular expression',
    8: 'Field {{args[0]}} should be within the range of [{{args[1]}} and {{args[2]}}]',
    9: 'Field {{args[0]}} should be greater than or equal to {{args[1]}}',
    10: 'Field {{args[0]}} should be less than or equal to {{args[1]}}',
    11: '{{args[0]}} is not a function',
    12: '{{args[0]}} is not a valid regular expression',
    13: '{{args[0]}} is not a valid number range',
    14: '{{args[0]}} {{args[1]}} are not valid minimum and maximum values of string length',
    15: 'Field {{args[0]}} does not match regular expression {{args[1]}}',
    16: 'Field {{args[0]}} is not a number',
    17: 'Length of {{args[0]}} should be greater than or equal to {{args[1]}}',
    18: 'Length of {{args[0]}} should be less than or equal to {{args[1]}}',
    19: 'Field {{args[0]}} is not a valid {{args[1]}}',
    20: 'configuration file should be pure JSON',
    21: 'duplicate {{args[0]}} keys is not allowed',
    22: 'Field "{{args[0]}}" must be less than 1024 characters',
    23: '"name" feild must be provided for {{args[0]}} \'s entity in configuration file',

    /* general messages, range [100, 499]*/
    100: 'Create New Input',
    // Delete dialog title
    101: 'Delete Confirmation',
    102: '"{{args[0]}}" cannot be deleted because it is in use',
    103: 'Are you sure you want to delete "{{args[0]}}" {{args[1]}}?',
    // Error dialog title
    104: 'Error Message',
    // Warning dialog title
    105: 'Warning',
    // Input table filter label
    106: 'Services',
    // Configuration table count label
    107: 'Items',
    // Saving prompt message
    108: 'Saving',
    // Loading index error message
    109: 'Failed to load index',
    // Configuration file error
    110: 'Internal configuration file error. Something wrong within the package or installation step. Contact your administrator for support. Detail: {{args[0]}}',
    111: 'URL',
    112: 'email address',
    113: 'IPV4 address',
    114: 'date in ISO 8601 format',
    115: 'Loading',
    // Page title
    116: 'Inputs',
    117: 'Configuration',

    '__unknow__': 'An unknown error occurred'
}
