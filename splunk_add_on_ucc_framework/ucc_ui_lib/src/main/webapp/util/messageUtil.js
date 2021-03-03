import * as __ from 'lodash';
import { _ } from '@splunk/ui-utils/i18n';
import messageDict from '../constants/messageDict';

/**
 * @param code {Int} a int value.
 * @param ... {Array} arguments to format the message.
 */
export const getFormattedMessage = (code, msg /* , ... , args */ ) => {
    var template = messageDict[code] || messageDict.__unknow__;
    template = _(template);
    var args = [].slice.call(arguments, 1);
    return __.template(template, {
        escape: /\{\{(.+?)\}\}/g
    })({
        args: msg
    });
};
