import React from 'react';
import { z } from 'zod';
import Link from '@splunk/react-ui/Link';

import { TextElementWithLinksSchema } from '../types/globalConfig/entities';

export type TextWithLinks = z.TypeOf<typeof TextElementWithLinksSchema>;

const linkTextIntoElement = (text: string, props: TextWithLinks) => {
    const linkToReplace = props.links?.find((link) => link.slug === text);

    if (linkToReplace) {
        return (
            <Link to={linkToReplace.link} openInNewContext key={`Link${linkToReplace.slug}`}>
                {linkToReplace.linkText}
            </Link>
        );
    }

    return text;
};

const changeSlugIntoLink = (text: string, props: TextWithLinks) =>
    text
        ?.split(/\]\]|\[\[/)
        ?.map((splitText) => linkTextIntoElement(splitText, props))
        .flat();

const changeManyLinesIntoSpans = (arrayOfText: string[], props: TextWithLinks) =>
    arrayOfText // make span for each new line (\n)
        .filter((t) => t !== '')
        .map((t: string, i: number) => {
            const textWithLinksIncluded = changeSlugIntoLink(t, props);

            return (
                <span key={`TextWithLinks${t}`}>
                    {/* do not break for first line  */}
                    {i !== 0 && <br />}
                    {textWithLinksIncluded}
                </span>
            );
        });

export const mapTextToElements = (props: TextWithLinks) => {
    const currentText = props?.text;

    if (!currentText) {
        return null;
    }

    const textSplitByLines = currentText.split('\n');

    const textWithNewLines =
        textSplitByLines.length > 1
            ? changeManyLinesIntoSpans(textSplitByLines, props) // new lines
            : changeSlugIntoLink(currentText, props); // no new lines (\n) take old text

    if ('link' in props) {
        return (
            <Link to={props.link} openInNewContext key="HelpLink">
                {textWithNewLines}
            </Link>
        );
    }

    return textWithNewLines;
};
