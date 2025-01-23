import { AcceptableFormValueOrNullish } from '../../types/components/shareableTypes';
import { Mode } from '../../constants/modes';

export interface ControlData {
    value: AcceptableFormValueOrNullish;
    mode: Mode;
    serviceName: string;
}
