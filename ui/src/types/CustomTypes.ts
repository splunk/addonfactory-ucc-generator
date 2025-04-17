import { CustomControlConstructor } from '../components/CustomControl/CustomControlBase';
import { CustomMenuConstructor } from '../components/CustomMenu/CustomMenuBase';
import { CustomTabConstructor } from '../components/CustomTab/CustomTabBase';
import { CustomRowConstructor } from '../components/table/CustomRowBase';
import { CustomCellConstructor } from '../components/table/CustomTableCellBase';
import { CustomHookConstructor } from './components/CustomHookClass';

export type CustomElementsMap = Record<
    string,
    | CustomHookConstructor
    | CustomControlConstructor
    | CustomRowConstructor
    | CustomCellConstructor
    | CustomMenuConstructor
    | CustomTabConstructor
>;
