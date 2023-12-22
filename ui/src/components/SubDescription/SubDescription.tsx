/* eslint-disable react/no-array-index-key */
import React from 'react';
import styled from 'styled-components';
import { z } from 'zod';
import { variables } from '@splunk/themes';
import Link from '@splunk/react-ui/Link';
import { SubDescriptionSchema } from '../../types/globalConfig/pages';

export const SubTitleComponent = styled.p`
    & {
        font-size: ${variables.fontSize};
        margin-bottom: 10px;
        white-space: pre-line;
    }
`;

type SubDescriptionProps = z.TypeOf<typeof SubDescriptionSchema>;

const mapTextToElements = (props: SubDescriptionProps) => {
    const splitedtextBySlugs: string[] | undefined = props?.text.split(/\]\]|\[\[/);

    return splitedtextBySlugs
        ?.map((text) => {
            const linkToReplace = props?.links?.find((link) => link.slug === text);

            if (linkToReplace) {
                return (
                    <Link to={linkToReplace.link} openInNewContext>
                        {linkToReplace.linkText}
                    </Link>
                );
            }
            return text;
        })
        .flat();
};

function SubDescription(props: SubDescriptionProps) {
    if (!props?.text) {
        return <></>;
    }

    const mappedTextWithLinks = mapTextToElements(props);
    return <SubTitleComponent>{mappedTextWithLinks}</SubTitleComponent>;
}

export default SubDescription;
