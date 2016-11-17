import TextControl from 'views/shared/controls/TextControl';
import CheckboxControl from 'views/shared/controls/SyntheticCheckboxControl';
import RadioControl from 'views/shared/controls/SyntheticRadioControl';
import SingleInputControl from 'app/views/controls/SingleInputControl';
import MultiInputControl from 'app/views/controls/MultiSelectInputControl';

export default {
    'text': TextControl,
    'password': TextControl,
    'checkbox': CheckboxControl,
    'radio': RadioControl,
    'singleSelect': SingleInputControl,
    'multipleSelect': MultiInputControl
};
