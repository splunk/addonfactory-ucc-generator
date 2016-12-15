import $ from 'jquery';
import _ from 'lodash';
import ErrorMsgTemplate from 'app/templates/messages/ErrorMsg.html';
import SavingMsgTemplate from 'app/templates/messages/LoadingMsg.html';
import WarningMsgTemplate from 'app/templates/messages/WarningMsg.html';

// TODO: add UT
export function addErrorMsg(containerSelector, text, needParse = false) {
    if(needParse) {
        text = parseErrorMsg(text);
    }
    if ($(containerSelector + ' .msg-error').length) {
        $(containerSelector + ' .msg-text').text(text);
    } else {
        $(containerSelector + '.modal-body')
            .prepend(_.template(ErrorMsgTemplate)({msg: text}));
    }
};

export function removeErrorMsg(containerSelector) {
    if ($(containerSelector + ' .msg-error').length) {
        $(containerSelector + ' .msg-error').remove();
    }
};

export function addSavingMsg(containerSelector, text) {
    if ($(containerSelector + ' .msg-loading').length) {
        $(containerSelector + ' .msg-text').text(text);
    } else {
        $(containerSelector + '.modal-body')
            .prepend(_.template(SavingMsgTemplate)({msg: text}));
    }
};

export function removeSavingMsg(containerSelector) {
    if ($(containerSelector + ' .msg-loading').length) {
        $(containerSelector + ' .msg-loading').remove();
    }
};

export function addWarningMsg(containerSelector) {
    if ($(containerSelector + ' .msg-warning').length) {
        $(containerSelector + ' .msg-text').text(text);
    } else {
        $(containerSelector + '.modal-body')
            .prepend(_.template(WarningMsgTemplate)({msg: text}));
    }
};

export function removeWarningMsg(containerSelector) {
    if ($(containerSelector + ' .msg-warning').length) {
        $(containerSelector + ' .msg-warning').remove();
    }
};

export function displayValidationError(containerSelector, {validationError}) {
    removeSavingMsg(containerSelector);
    if ($(containerSelector + ' .msg-text').length) {
        $(containerSelector + ' .msg-text').text(validationError);
    } else {
        $(containerSelector).prepend(_.template(ErrorMsgTemplate)({msg: validationError}));
    }
};

export function addClickListener(containerSelector, type) {
    $(containerSelector + ' .' + type + ' .close').on("click", () => {
        if ($(containerSelector + ' .' + type).length) {
            $(containerSelector + ' .' + type).remove();
        }
    });
}

function parseErrorMsg(data) {
    var error_msg = '', rsp, regex, msg, matches;
    try {
        rsp = JSON.parse(data.responseText);
        regex = /In handler.+and output:\s+\'([\s\S]*)\'\.\s+See splunkd\.log for stderr output\./;
        msg = String(rsp.messages[0].text);
        matches = regex.exec(msg);
        if (!matches || !matches[1]) {
            // try to extract another one
            regex = /In handler[^:]+:\s+(.*)/;
            matches = regex.exec(msg);
            if (!matches || !matches[1]) {
                matches = [msg];
            }
        }
        error_msg = matches[1];
    } catch (err) {
        error_msg = 'ERROR in processing the request';
    }
    return (error_msg || '').replace(/Splunk Add-on REST Handler ERROR\[\d{1,6}\]\: /, '');
}
