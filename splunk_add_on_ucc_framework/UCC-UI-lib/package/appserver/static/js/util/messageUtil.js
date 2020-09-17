import _ from 'lodash';
import messageDict from 'app/constants/messageDict'

/**
 * @param code {Int} a int value.
 * @param ... {Array} arguments to format the message.
 */
export const getFormattedMessage = function(code /* , ... , args */ ) {
    var template = messageDict[code] || messageDict.__unknow__;
    template = _(template).t();
    var args = [].slice.call(arguments, 1);
    return _.template(template, {
        escape: /\{\{(.+?)\}\}/g
    })({
        args: args
    });
};
