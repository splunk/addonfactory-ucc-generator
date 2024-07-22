import { AcceptableFormRecord } from '../../types/components/shareableTypes';
import { isTrue } from '../../util/considerFalseAndTruthy';

export function isReadonlyRow(readonlyFieldId: string | undefined, row: AcceptableFormRecord) {
    // !isFalse is a wider and more lose than isTrue
    return Boolean(readonlyFieldId && readonlyFieldId in row && isTrue(row[readonlyFieldId]));
}
