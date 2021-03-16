import Link from '@splunk/react-ui/Link';
import TextComponent from '../components/TextComponent';
import SingleInputComponent from '../components/SingleInputComponent';
import MultiInputComponent from '../components/MultiInputComponent';
import CheckBoxComponent from '../components/CheckBoxComponent';
import RadioComponent from '../components/RadioComponent';
import CustomControl from '../components/CustomControl';

export default {
    'text': TextComponent,
    'singleSelect': SingleInputComponent,
    'helpLink':Link,
    'multipleSelect':MultiInputComponent,
    'checkbox':CheckBoxComponent,
    'radio':RadioComponent,
    'custom':CustomControl
};
