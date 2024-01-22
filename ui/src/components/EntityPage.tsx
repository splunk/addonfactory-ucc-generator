import React, { memo, useRef, useState } from 'react';

import Link from '@splunk/react-ui/Link';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import ColumnLayout from '@splunk/react-ui/ColumnLayout';
import { _ } from '@splunk/ui-utils/i18n';
import { variables } from '@splunk/themes';

import Heading from '@splunk/react-ui/Heading';
import styled from 'styled-components';
import { MODE_CLONE, MODE_CREATE, MODE_EDIT, Mode } from '../constants/modes';
import BaseFormView from './BaseFormView';
import { SubTitleComponent } from '../pages/Input/InputPageStyle';
import { PAGE_INPUT } from '../constants/pages';
import { StyledButton } from '../pages/EntryPageStyle';

interface EntityPageProps {
    handleRequestClose: () => void;
    serviceName: string;
    mode: Mode;
    page: string;
    stanzaName?: string;
    formLabel?: string;
    groupName?: string;
}

const ShadowedDiv = styled.div`
    box-shadow: ${variables.embossShadow};
    padding: ${variables.spacing};
`;

const ButtonRow = styled.div`
    margin-top: ${variables.spacingHalf};
    text-align: right;
`;
function EntityPage({
    handleRequestClose,
    serviceName,
    mode,
    stanzaName,
    formLabel,
    page,
    groupName,
}: EntityPageProps) {
    // Ref is used here to call submit method of form only
    const form = useRef<BaseFormView>(null); // nosemgrep: typescript.react.security.audit.react-no-refs.react-no-refs
    const [isSubmitting, setIsSubmitting] = useState(false);
    let buttonText = _('Submit');

    if (mode === MODE_CREATE) {
        buttonText = _('Add');
    } else if (mode === MODE_CLONE) {
        buttonText = _('Clone Input');
    } else if (mode === MODE_EDIT) {
        buttonText = _('Update');
    }

    const handleSubmit = () => {
        const result = form.current?.handleSubmit();
        if (result) {
            handleRequestClose();
        }
    };

    const handleFormSubmit = (set: boolean, close: boolean) => {
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
                <ColumnLayout.Column span={8} style={{ maxWidth: '800px' }}>
                    <ShadowedDiv>
                        <Heading style={{ paddingLeft: '30px' }} level={3}>
                            {_(formLabel)}
                        </Heading>
                        <BaseFormView // nosemgrep: typescript.react.security.audit.react-no-refs.react-no-refs
                            ref={form}
                            page={page}
                            serviceName={serviceName}
                            mode={mode}
                            stanzaName={stanzaName || ''}
                            handleFormSubmit={handleFormSubmit}
                            groupName={groupName}
                        />
                    </ShadowedDiv>
                    <ButtonRow>
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
                    </ButtonRow>
                </ColumnLayout.Column>
                <ColumnLayout.Column span={2} />
            </ColumnLayout.Row>
        </ColumnLayout>
    );
}

export default memo(EntityPage);
