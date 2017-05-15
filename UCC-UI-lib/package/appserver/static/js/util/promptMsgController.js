import $ from 'jquery';
import _ from 'lodash';
import ErrorMsgTemplate from 'app/templates/messages/ErrorMsg.html';
import SavingMsgTemplate from 'app/templates/messages/LoadingMsg.html';

// TODO: add UT
export function addErrorMsg(containerSelector, text, needParse = false) {
    if(needParse) {
        text = parseErrorMsg(text);
    }
    if ($(containerSelector + ' .msg-error').length) {
        $(containerSelector + ' .msg-text').text(text);
    } else {
        $(containerSelector + ' .modal-body')
            .prepend(_.template(ErrorMsgTemplate)({msg: _.unescape(text)}));
    }
}

export function removeErrorMsg(containerSelector) {
    if ($(containerSelector + ' .msg-error').length) {
        $(containerSelector + ' .msg-error').remove();
    }
}

export function addSavingMsg(containerSelector, text) {
    if ($(containerSelector + ' .msg-loading').length) {
        $(containerSelector + ' .msg-text').text(text);
    } else {
        $(containerSelector + ' .modal-body')
            .prepend(_.template(SavingMsgTemplate)({msg: _.unescape(text)}));
    }
}

export function removeSavingMsg(containerSelector) {
    if ($(containerSelector + ' .msg-loading').length) {
        $(containerSelector + ' .msg-loading').remove();
    }
}

export function displayValidationError(containerSelector, error) {
    const {validationError} = error;
    let errorMsg;
    if (typeof validationError === 'object' &&
            Object.values(validationError).length > 0) {
        errorMsg = Object.values(validationError)[0];
    } else {
        errorMsg = validationError;
    }
    removeSavingMsg(containerSelector);
    if ($(containerSelector + ' .msg-text').length) {
        $(containerSelector + ' .msg-text').text(errorMsg);
    } else {
        $(containerSelector + ' .modal-body').prepend(
            _.template(ErrorMsgTemplate)({msg: _.unescape(errorMsg)})
        );
    }
}

export function parseErrorMsg(data) {
    var error_msg = '', rsp, regex, msg, matches;
    try {
        rsp = JSON.parse(data.responseText);
        regex = /.+"REST Error \[[\d]+\]:\s+.+\s+--\s+([\s\S]*)"\.\s*See splunkd\.log for more details\./;
        msg = String(rsp.messages[0].text);
        matches = regex.exec(msg);
        if (matches && matches[1]) {
            try {
                let innerMsgJSON = JSON.parse(matches[1]);
                error_msg = String(innerMsgJSON.messages[0].text);
            } catch (error) {
                error_msg = matches[1];
            }
        } else {
            error_msg = msg;
        }
    } catch (err) {
        error_msg = 'Error in processing the request';
    }
    return error_msg;
}
