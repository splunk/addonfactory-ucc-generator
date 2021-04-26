import React, { memo, useRef, useState } from 'react';
import PropTypes from 'prop-types';

import Button from '@splunk/react-ui/Button';
import Link from '@splunk/react-ui/Link';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import { _ } from '@splunk/ui-utils/i18n';
import { useSplunkTheme } from '@splunk/themes';

import { MODE_CLONE, MODE_CREATE, MODE_EDIT } from '../constants/modes';
import { PAGE_INPUT } from '../constants/pages';
import BaseFormView from './BaseFormView';
import { SubTitleComponent } from '../pages/Input/InputPageStyle';

function EntityPage({ handleRequestClose, serviceName, mode, stanzaName, formLabel }) {
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
                        <Link onClick={handleRequestClose}>{_('Inputs')}</Link>
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
                        page={PAGE_INPUT}
                        serviceName={serviceName}
                        mode={mode}
                        stanzaName={stanzaName}
                        handleFormSubmit={handleFormSubmit}
                    />
                </ColumnLayout.Column>
                <ColumnLayout.Column span={2} />
            </ColumnLayout.Row>
            <ColumnLayout.Row>
                <ColumnLayout.Column span={7} />
                <ColumnLayout.Column span={3} style={{ textAlign: 'right' }}>
                    <Button
                        appearance="secondary"
                        onClick={handleRequestClose}
                        label={_('Cancel')}
                        disabled={isSubmitting}
                    />
                    <Button
                        appearance="primary"
                        label={isSubmitting ? <WaitSpinner /> : buttonText}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
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
};

export default memo(EntityPage);
