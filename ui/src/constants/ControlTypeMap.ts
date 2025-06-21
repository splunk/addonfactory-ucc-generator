import CheckboxTree from '../components/CheckboxTree/CheckboxTree';
import HelpLinkComponent from '../components/HelpLinkComponent/HelpLinkComponent';
import TextComponent from '../components/TextComponent/TextComponent';
import TextAreaComponent from '../components/TextAreaComponent/TextAreaComponent';
import SingleInputComponent from '../components/SingleInputComponent/SingleInputComponent';
import MultiInputComponent from '../components/MultiInputComponent/MultiInputComponent';
import CheckBoxComponent from '../components/CheckBoxComponent/CheckBoxComponent';
import RadioComponent from '../components/RadioComponent/RadioComponent';
import DatePickerComponent from '../components/DatePickerComponent/DatePickerComponent';
import CustomControl from '../components/CustomControl/CustomControl';
import FileInputComponent from '../components/FileInputComponent/FileInputComponent';
import CheckboxGroup from '../components/CheckboxGroup/CheckboxGroup';

const componentsMap = {
    checkbox: CheckBoxComponent,
    checkboxGroup: CheckboxGroup,
    checkboxTree: CheckboxTree,
    custom: CustomControl,
    date: DatePickerComponent,
    file: FileInputComponent,
    helpLink: HelpLinkComponent,
    multipleSelect: MultiInputComponent,
    radio: RadioComponent,
    singleSelect: SingleInputComponent,
    text: TextComponent,
    textarea: TextAreaComponent,
};

type Keys = keyof typeof componentsMap;
export type ComponentTypes = (typeof componentsMap)[Keys];

export default componentsMap as Record<string, ComponentTypes>;
