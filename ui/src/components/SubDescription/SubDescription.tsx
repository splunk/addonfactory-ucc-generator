import React from 'react';
import styled from 'styled-components';
import { z } from 'zod';
import { variables } from '@splunk/themes';
import { SubDescriptionSchema } from '../../types/globalConfig/pages';
import { mapTextToElements } from '../../util/textutils/textUtils';

export const SubTitleComponent = styled.p`
    & {
        font-size: ${variables.fontSize};
        margin-bottom: 10px;
        white-space: pre-line;
    }
`;

type SubDescriptionProps = z.TypeOf<typeof SubDescriptionSchema>;

function SubDescription(props: SubDescriptionProps) {
    if (!props?.text) {
        return null;
    }

    const mappedTextWithLinks = mapTextToElements(props);
    return <SubTitleComponent>{mappedTextWithLinks}</SubTitleComponent>;
}

export default SubDescription;
