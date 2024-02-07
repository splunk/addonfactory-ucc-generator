import HelpLinkComponent from '../components/HelpLinkComponent/HelpLinkComponent';
import TextComponent from '../components/TextComponent/TextComponent';
import TextAreaComponent from '../components/TextAreaComponent/TextAreaComponent';
import SingleInputComponent from '../components/SingleInputComponent/SingleInputComponent';
import MultiInputComponent from '../components/MultiInputComponent/MultiInputComponent';
import CheckBoxComponent from '../components/CheckBoxComponent/CheckBoxComponent';
import RadioComponent from '../components/RadioComponent/RadioComponent';
import PlaceholderComponent from '../components/PlaceholderComponent/PlaceholderComponent';
import CustomControl from '../components/CustomControl';
import FileInputComponent from '../components/FileInputComponent/FileInputComponent';
import CheckboxGroup from '../components/CheckboxGroup/CheckboxGroup';

const componentsMap = {
    checkbox: CheckBoxComponent,
    checkboxGroup: CheckboxGroup,
    custom: CustomControl,
    file: FileInputComponent,
    helpLink: HelpLinkComponent,
    multipleSelect: MultiInputComponent,
    placeholder: PlaceholderComponent,
    radio: RadioComponent,
    singleSelect: SingleInputComponent,
    text: TextComponent,
    textarea: TextAreaComponent,
};

type Keys = keyof typeof componentsMap;
export type ComponentTypes = (typeof componentsMap)[Keys];

export default componentsMap as Record<string, ComponentTypes>;
