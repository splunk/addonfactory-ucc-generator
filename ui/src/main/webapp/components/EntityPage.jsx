import React, { memo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import Link from '@splunk/react-ui/Link';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import { _ } from '@splunk/ui-utils/i18n';
import { useSplunkTheme } from '@splunk/themes';

import { MODE_CLONE, MODE_CREATE, MODE_EDIT } from '../constants/modes';
import BaseFormView from './BaseFormView';
import { SubTitleComponent } from '../pages/Input/InputPageStyle';
import { PAGE_INPUT } from '../constants/pages';
import { StyledButton } from '../pages/EntryPageStyle';

function EntityPage({
    handleRequestClose,
    serviceName,
    mode,
    stanzaName,
    formLabel,
    page,
    groupName,
}) {
    // Ref is used here to call submit method of form only
    const form = useRef(); // nosemgrep: typescript.react.security.audit.react-no-refs.react-no-refs
    const [isSubmitting, setIsSubmitting] = useState(false);
    let buttonText = _('Submit');

    if (mode === MODE_CREATE) {
        buttonText = _('Add');
    } else if (mode === MODE_CLONE) {
        buttonText = _('Clone Input');
    } else if (mode === MODE_EDIT) {
        buttonText = _('Update');
    }

    const { embossShadow } = useSplunkTheme();
    const colStyle = {
        boxShadow: embossShadow,
        padding: '1%',
        backgroundColor: 'white',
    };

    const handleSubmit = () => {
        const result = form.current.handleSubmit();
        if (result) {
            handleRequestClose();
        }
    };

    const handleFormSubmit = (set, close) => {
        setIsSubmitting(set);
        if (close) {
            handleRequestClose();
        }
    };
    return (
        <ColumnLayout gutter={8}>
            <ColumnLayout.Row style={{ padding: '5px 0px' }}>
                <ColumnLayout.Column>
                    <SubTitleComponent>
                        <Link onClick={handleRequestClose}>
                            {page === PAGE_INPUT ? _('Inputs') : _('Configuration')}
                        </Link>
                        {' > '}
                        {_(formLabel)}
                    </SubTitleComponent>
                </ColumnLayout.Column>
            </ColumnLayout.Row>
            <ColumnLayout.Row>
                <ColumnLayout.Column span={2} />
                <ColumnLayout.Column span={8} style={colStyle}>
                    <BaseFormView // nosemgrep: typescript.react.security.audit.react-no-refs.react-no-refs
                        ref={form}
                        page={page}
                        serviceName={serviceName}
                        mode={mode}
                        stanzaName={stanzaName}
                        handleFormSubmit={handleFormSubmit}
                        groupName={groupName}
                    />
                </ColumnLayout.Column>
                <ColumnLayout.Column span={2} />
            </ColumnLayout.Row>
            <ColumnLayout.Row>
                <ColumnLayout.Column span={7} />
                <ColumnLayout.Column span={3} style={{ textAlign: 'right' }}>
                    <StyledButton
                        appearance="secondary"
                        onClick={handleRequestClose}
                        label={_('Cancel')}
                        disabled={isSubmitting}
                        style={{ width: '80px' }}
                    />
                    <StyledButton
                        appearance="primary"
                        label={isSubmitting ? <WaitSpinner /> : buttonText}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        style={{ width: '80px' }}
                    />
                </ColumnLayout.Column>
                <ColumnLayout.Column span={2} />
            </ColumnLayout.Row>
        </ColumnLayout>
    );
}

EntityPage.propTypes = {
    handleRequestClose: PropTypes.func,
    serviceName: PropTypes.string,
    mode: PropTypes.string,
    stanzaName: PropTypes.string,
    formLabel: PropTypes.string,
    page: PropTypes.string,
    groupName: PropTypes.string,
};

export default memo(EntityPage);
