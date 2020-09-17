import TextControl from 'views/shared/controls/TextControl';
import CheckboxControl from 'views/shared/controls/SyntheticCheckboxControl';
import RadioControl from 'views/shared/controls/SyntheticRadioControl';
import SingleInputControl from 'app/views/controls/SingleInputControl';
import MultiInputControl from 'app/views/controls/MultiSelectInputControl';
import PlaceholderControl from 'app/views/controls/PlaceholderControl';
import OAuthControl from 'app/views/controls/OAuthControl';
import HelpLinkControl from 'app/views/controls/HelpLinkControl';

export default {
    'text': TextControl,
    // remove password in UCC 3.0
    //'password': TextControl,
    'checkbox': CheckboxControl,
    'radio': RadioControl,
    'singleSelect': SingleInputControl,
    'multipleSelect': MultiInputControl,
    'placeholder': PlaceholderControl,
    'oauth': OAuthControl,
    'helpLink': HelpLinkControl
};
