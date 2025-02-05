import React from 'react';
import { z } from 'zod';
import Link from '@splunk/react-ui/Link';

import { TextElementWithLinksSchema } from '../../types/globalConfig/entities';

export type TextWithLinks = z.TypeOf<typeof TextElementWithLinksSchema>;

const linkTextIntoElement = (text: string, props: TextWithLinks, i: number) => {
    const linkToReplace = props.links?.find((link) => `[[${link.slug}]]` === text);

    if (linkToReplace) {
        return (
            // i used as user can put identical slugs many times
            <Link to={linkToReplace.link} openInNewContext key={`Link${linkToReplace.slug}${i}`}>
                {linkToReplace.linkText}
            </Link>
        );
    }

    return text;
};
/**
 *
 * @param text text to be converted into array
 * @param slug exact slug that will be separated into single array element
 * @returns ordered array containing slugs and rest of text separated
 */
const textIntoArrayBySlug = (text: string, slug: string) => {
    const elements = [];
    let currentText = text;
    let idx = currentText.indexOf(slug);
    while (idx !== -1) {
        const before = currentText.slice(0, idx);
        const after = currentText.slice(idx + slug.length);
        elements.push(before);
        elements.push(slug);
        currentText = after;
        idx = currentText.indexOf(slug);
        if (idx === -1) {
            elements.push(after);
        }
    }
    if (elements.length === 0) {
        return [text];
    }
    return elements;
};

/**
 *
 * @param text text to be converted into array
 * @param props that contains all links with slugs that will be separated from text
 * @returns ordered array containing slugs and rest of text separated
 */
const textToArrayWithSlugsSeparated = (text: string, props: TextWithLinks) => {
    let elements = [text];

    props.links?.forEach((link) => {
        elements = elements.map((txt) => textIntoArrayBySlug(txt, `[[${link.slug}]]`)).flat();
    });

    return elements;
};

const changeSlugIntoLink = (text: string, props: TextWithLinks) => {
    const dividedText = textToArrayWithSlugsSeparated(text, props);
    return dividedText.map((t, i) => linkTextIntoElement(t, props, i));
};

const changeManyLinesIntoSpans = (arrayOfText: string[], props: TextWithLinks) =>
    arrayOfText // make span for each new line (\n)
        .filter(Boolean)
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
    const textSplitByLines = props.text.split('\n');
    const textWithNewLines =
        textSplitByLines.length > 1
            ? changeManyLinesIntoSpans(textSplitByLines, props) // new lines
            : changeSlugIntoLink(props.text, props); // no new lines (\n) take old text

    if (props?.link) {
        return (
            <Link to={props.link} openInNewContext>
                {textWithNewLines}
            </Link>
        );
    }

    return textWithNewLines;
};
