import { CustomControlConstructor } from '../components/CustomControl/CustomControlBase';
import { CustomTabConstructor } from '../components/CustomTab/CustomTabBase';
import { CustomHookConstructor } from './components/CustomHookClass';

// Custom menu to be added as a type
export type CustomElementsMap = Record<
    string,
    CustomHookConstructor | CustomControlConstructor | CustomTabConstructor
>;
