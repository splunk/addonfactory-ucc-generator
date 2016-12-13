export default {
    /* validation messages, range [0, 99] */
    0: 'Field "Name" is required',
    1: 'Field "Name" must be a string',
    2: 'Name is already in use',
    3: '"default" is a reserved word',
    4: '. is not supported',
    5: 'Field {{args[0]}} should be a positive number',
    6: 'Field {{args[0]}} is required',
    7: 'Field {{args[0]}} is not a valid regex',
    8: 'Field {{args[0]}} should be in range [{{args[1]}}, {{args[2]}}]',
    9: 'Field {{args[0]}} should be greater than or equal to {{args[1]}}',
    10: 'Field {{args[0]}} should be less than or equal to {{args[1]}}',

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

    '__unknow__': 'An unknown error occurred.'
}
