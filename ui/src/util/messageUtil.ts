import * as __ from 'lodash';
import { _ } from '@splunk/ui-utils/i18n';
import messageDict from '../constants/messageDict';

/**
 * @param {number} code  a int value.
 * @param {(string|number|boolean)[]=} msg arguments to format the message.
 * @returns {string}
 */
export const getFormattedMessage = (code: number, msg?: (string | number)[] /* , ... , args */) => {
    let template = messageDict[code] || messageDict.unknown;
    template = _(template);
    return __.template(template, {
        escape: /\{\{(.+?)\}\}/g,
    })({
        args: msg,
    });
};

const tryParseByteString = (text: string) => {
    try {
        if (text.startsWith(`b'`) || text.startsWith(`b"`)) {
            // bytestring starts from b and Quotation mark (b') and ends with Quotation mark(')
            const parsedString = JSON.parse(text.slice(2, -1));
            return String(parsedString.messages[0].text);
        }
        return text;
    } catch {
        return text;
    }
};

export const tryTrimErrorMessage = (msg: string) => {
    try {
        const regex =
            /.+"REST Error \[[\d]+\]:\s+.+\s+--\s+([\s\S]*)"\.\s*See splunkd\.log(\/python.log)? for more details\./;
        const matches = regex.exec(msg);
        if (matches && matches[1]) {
            try {
                const innerMsgJSON = JSON.parse(matches[1]);
                return String(innerMsgJSON.messages[0].text);
            } catch (error) {
                return tryParseByteString(matches[1]);
            }
        }
    } catch (e) {
        return msg;
    }

    return msg;
};

export const parseErrorMsg = (err?: {
    response?: { data?: { messages?: { text?: string }[] } };
}) => {
    try {
        const msg = err?.response?.data?.messages?.[0]?.text;
        if (!msg) {
            return messageDict.unknown;
        }
        return tryTrimErrorMessage(msg);
    } catch (e) {
        return _('Error in processing the request');
    }
};
