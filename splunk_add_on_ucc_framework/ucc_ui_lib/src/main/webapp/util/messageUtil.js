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

export const parseErrorMsg = (msg) => {
    let errorMsg = ''; let regex; let matches;
    try {
        regex = /.+"REST Error \[[\d]+\]:\s+.+\s+--\s+([\s\S]*)"\.\s*See splunkd\.log(\/python.log)? for more details\./;
        matches = regex.exec(msg);
        if (matches && matches[1]) {
            try {
                const innerMsgJSON = JSON.parse(matches[1]);
                errorMsg = String(innerMsgJSON.messages[0].text);
            } catch (error) {
                // eslint-disable-next-line prefer-destructuring
                errorMsg = matches[1];
            }
        } else {
            errorMsg = msg;
        }
    } catch (err) {
        errorMsg = _('Error in processing the request');
    }
    return errorMsg;
}