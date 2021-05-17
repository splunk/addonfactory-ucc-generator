import * as __ from 'lodash';
import { _ } from '@splunk/ui-utils/i18n';
import messageDict from '../constants/messageDict';

/**
 * @param code {Int} a int value.
 * @param ... {Array} arguments to format the message.
 */
export const getFormattedMessage = (code, msg /* , ... , args */) => {
    let template = messageDict[code] || messageDict.unknown;
    template = _(template);
    return __.template(template, {
        escape: /\{\{(.+?)\}\}/g,
    })({
        args: msg,
    });
};

export const parseErrorMsg = (err) => {
    let errorMsg = '';
    let regex;
    let matches;
    try {
        const msg = err.response.data.messages[0].text;
        regex = /.+"REST Error \[[\d]+\]:\s+.+\s+--\s+(?:b'([\s\S]*)'|([\s\S]*))"\.\s*See splunkd\.log(\/python.log)? for more details\./;
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
    } catch (e) {
        errorMsg = _('Error in processing the request');
    }
    return errorMsg;
};
