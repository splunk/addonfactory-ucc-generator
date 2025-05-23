import { CustomControlConstructor } from '../components/CustomControl/CustomControlBase';
import { CustomMenuConstructor } from '../components/CustomMenu/CustomMenuBase';
import { CustomTabConstructor } from '../components/CustomTab/CustomTabBase';
import { CustomRowConstructor } from '../components/table/CustomRowBase';
import { CustomCellConstructor } from '../components/table/CustomTableCellBase';
import { CustomHookConstructor } from './components/CustomHookBase';

type CustomMenuStructure = {
    component: CustomMenuConstructor;
    type: 'menu';
};

type CustomTabStructure = {
    component: CustomTabConstructor;
    type: 'tab';
};

type CustomControlStructure = {
    component: CustomControlConstructor;
    type: 'control';
};

type CustomRowStructure = {
    component: CustomRowConstructor;
    type: 'row';
};

type CustomCellStructure = {
    component: CustomCellConstructor;
    type: 'cell';
};

type CustomHookStructure = {
    component: CustomHookConstructor;
    type: 'hook';
};

export type CustomElementsMap = Record<
    string,
    | CustomHookStructure
    | CustomControlStructure
    | CustomRowStructure
    | CustomCellStructure
    | CustomMenuStructure
    | CustomTabStructure
>;
