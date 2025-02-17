import { mapTextToElements } from '../../util/textutils/textUtils';

interface Props {
    controlOptions: {
        text: string;
        link?: string;
        links?: {
            slug: string;
            link: string;
            linkText: string;
        }[];
    };
}

function HelpLinkComponent(props: Props) {
    const elements = mapTextToElements(props.controlOptions);

    return elements;
}

export default HelpLinkComponent;
