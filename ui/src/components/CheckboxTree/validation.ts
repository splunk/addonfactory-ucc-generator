import Validator from '../../util/Validator';
import { Row } from './types';

type MaybeError =
    | {
          errorField: string;
          errorMsg: string;
      }
    | false;

/**
 * Validate the required field has value
 * @param {string} field
 * @param {string} label
 * @param {object} [rows]
 * @returns {Error|false}
 */

export function checkValidationForRequired(field: string, label: string, rows: Row[]): MaybeError {
    let errorMessage: MaybeError = false;
    if (!rows.some((row) => row.checkbox?.defaultValue === true)) {
        errorMessage = Validator.RequiredValidator(field, label, '');
        return errorMessage;
    }
    return false;
}
