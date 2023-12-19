/* eslint-disable react/no-array-index-key */
import React from 'react';
import styled from 'styled-components';
import { z } from 'zod';
import { variables } from '@splunk/themes';
import { SubDescriptionSchema } from '../../types/globalConfig/pages';

export const SubTitleComponent = styled.div.attrs({
    className: 'pageSubDescription',
})`
    &.pageSubDescription {
        font-size: ${variables.fontSize};
        margin-bottom: 10px;
    }
`;

type SubDescriptionProps = z.TypeOf<typeof SubDescriptionSchema>;

const mapTextToElements = (props: SubDescriptionProps) => {
    const splitedtextBySlugs: string[] | undefined = props?.text.split(/\]\]|\[\[/);

    return splitedtextBySlugs
        ?.map((text, i) => {
            const linkToReplace = props?.links?.find((link) => link.slug === text);

            if (linkToReplace) {
                return (
                    <a // using index as elements for not have unique values but are unique itself
                        key={`subDesc${linkToReplace.slug}${i}`}
                        href={linkToReplace.link}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {linkToReplace.linkText}
                    </a>
                );
            }
            return text.split('</br>').map((elem, ind) => (
                // using index as elements for not have unique values but are unique itself
                <span key={`subDesc${i}${ind}`}>
                    {ind > 0 && ind < text.length - 1 && <br />}
                    {elem}
                </span>
            ));
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
