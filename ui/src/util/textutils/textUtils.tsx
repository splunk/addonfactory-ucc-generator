import React from 'react';
import { z } from 'zod';
import Link from '@splunk/react-ui/Link';
import { TextElementWithLinksSchema } from '../../types/globalConfig/baseSchemas';

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
const textIntoArrayBySlug = (text: string, slug: string): string[] => {
    if (!text.includes(slug)) {
        return [text];
    } // No slug, return original text as array

    return text
        .split(slug)
        .flatMap((part, index, arr) => (index < arr.length - 1 ? [part, slug] : [part]));
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
    if (!props.text) {
        return null;
    }

    const textSplitByLines = props.text.split('\n');
    const textWithNewLines =
        textSplitByLines.length > 1
            ? changeManyLinesIntoSpans(textSplitByLines, props) // new lines
            : changeSlugIntoLink(props.text, props); // no new lines (\n) take old text

    if (props.link) {
        return (
            <Link to={props.link} openInNewContext>
                {textWithNewLines}
            </Link>
        );
    }

    return <span>{textWithNewLines}</span>;
};
