import React from 'react';
import { render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setUnifiedConfig } from '../../util/util';
import {
    firstModificationField,
    getConfigWithModifications,
    secondModificationField,
    firstStandardTextField,
    thirdModificationField,
    secondStandardTextField,
} from './TestConfig';
import EntityModal, { EntityModalProps } from '../EntityModal/EntityModal';
import { EntitiesAllowingModifications } from '../BaseFormTypes';
import { invariant } from '../../util/invariant';

const handleRequestClose = jest.fn();
const setUpConfigWithDefaultValue = () => {
    const newConfig = getConfigWithModifications();
    setUnifiedConfig(newConfig);
};

const renderModalWithProps = (props: EntityModalProps) => {
    render(<EntityModal {...props} handleRequestClose={handleRequestClose} />);
};

const props = {
    serviceName: 'account',
    mode: 'create',
    stanzaName: undefined,
    formLabel: 'formLabel',
    page: 'configuration',
    groupName: '',
    open: true,
    handleRequestClose: () => {},
} satisfies EntityModalProps;

const findMods = (
    modificationFiled: EntitiesAllowingModifications,
    value: string | boolean | number,
    fieldId: string
) => {
    const modification = modificationFiled.modifyFieldsOnValue
        ?.find((mod) => mod.fieldValue === value)
        ?.fieldsToModify.find((field: { fieldId: string }) => field.fieldId === fieldId);
    invariant(modification);
    return modification;
};

const getAndVerifyHTMLTextComponentsForField = (field: string) => {
    const componentParentElement = document.querySelector<HTMLElement>(`[data-name="${field}"]`)!;
    expect(componentParentElement).toBeInTheDocument();
    const componentInput = within(componentParentElement).getByRole('textbox');

    return [componentParentElement, componentInput];
};

const getAndVerifyHTMLCheckboxComponentsForField = (field: string) => {
    const componentParentElement = document.querySelector<HTMLElement>(`[data-name="${field}"]`)!;
    expect(componentParentElement).toBeInTheDocument();
    const componentInput = within(componentParentElement).getByRole('checkbox');

    return [componentParentElement, componentInput];
};

it('render fields with modifications correctly', async () => {
    setUpConfigWithDefaultValue();
    renderModalWithProps(props);

    getAndVerifyHTMLTextComponentsForField(firstStandardTextField.field);
    getAndVerifyHTMLTextComponentsForField(secondStandardTextField.field);
    getAndVerifyHTMLTextComponentsForField(firstModificationField.field);
    getAndVerifyHTMLTextComponentsForField(secondModificationField.field);
    getAndVerifyHTMLCheckboxComponentsForField(thirdModificationField.field);
});

it('verify modification after text components change', async () => {
    setUpConfigWithDefaultValue();
    renderModalWithProps(props);
    const firstValueToInput = 'a';
    const secondValueToInput = 'aa';

    const [componentParentElement, componentInput] = getAndVerifyHTMLTextComponentsForField(
        firstStandardTextField.field
    );
    const [component2ParentElement, component2Input] = getAndVerifyHTMLTextComponentsForField(
        secondStandardTextField.field
    );

    const componentMakingModsTextBox1 = getAndVerifyHTMLTextComponentsForField(
        firstModificationField.field
    )[1];

    const mods1Field1 = findMods(
        firstModificationField,
        firstValueToInput,
        firstStandardTextField.field
    );
    const mods1Field2 = findMods(
        firstModificationField,
        firstValueToInput,
        secondStandardTextField.field
    );

    const mods2Field1 = findMods(
        firstModificationField,
        secondValueToInput,
        firstStandardTextField.field
    );
    const mods2Field2 = findMods(
        firstModificationField,
        secondValueToInput,
        secondStandardTextField.field
    );

    await userEvent.type(componentMakingModsTextBox1, firstValueToInput);

    const verifyAllProps = (
        parentElement: Element,
        input: Element,
        mods: { value?: string | number | boolean; help?: string; label?: string }
    ) => {
        expect(input).toHaveAttribute('value', mods.value);
        invariant(typeof mods.help === 'string');
        expect(parentElement).toHaveTextContent(mods.help);
        invariant(typeof mods.label === 'string');
        expect(parentElement).toHaveTextContent(mods.label);
    };

    expect(componentInput).toBeDisabled();
    verifyAllProps(componentParentElement, componentInput, mods1Field1);

    expect(component2Input).toBeDisabled();
    verifyAllProps(component2ParentElement, component2Input, mods1Field2);

    await userEvent.type(componentMakingModsTextBox1, secondValueToInput);

    expect(componentInput).toBeEnabled();
    verifyAllProps(componentParentElement, componentInput, mods2Field1);

    expect(component2Input).toBeEnabled();
    verifyAllProps(component2ParentElement, component2Input, mods2Field2);
});

it('verify markdown modifications', async () => {
    setUpConfigWithDefaultValue();
    renderModalWithProps(props);

    const firstValueToInput = 'a';
    const secondValueToInput = 'aa';

    const [componentParentElement] = getAndVerifyHTMLTextComponentsForField(
        firstStandardTextField.field
    );
    const [component2ParentElement] = getAndVerifyHTMLTextComponentsForField(
        secondStandardTextField.field
    );

    const componentMakingModsTextBox1 = getAndVerifyHTMLTextComponentsForField(
        secondModificationField.field
    )[1];

    const firstElementOuterHTMLBeforeMods = componentParentElement.outerHTML;

    const mods1Field2 = findMods(
        secondModificationField,
        firstValueToInput,
        secondStandardTextField.field
    );

    const mods2Field1 = findMods(
        secondModificationField,
        secondValueToInput,
        firstStandardTextField.field
    );
    const mods2Field2 = findMods(
        secondModificationField,
        secondValueToInput,
        secondStandardTextField.field
    );

    await userEvent.type(componentMakingModsTextBox1, firstValueToInput);

    const firstElementOuterHTMLAfterMods = componentParentElement.outerHTML;

    // only id specified as modification so no changes should occure
    expect(firstElementOuterHTMLBeforeMods).toEqual(firstElementOuterHTMLAfterMods);

    expect(component2ParentElement.textContent).toMatchInlineSnapshot(
        `"Standard text label second fieldmarkdown message to open conf page and explain sthStandard Text help second field"`
    );

    invariant(mods1Field2.markdownMessage?.markdownType === 'hybrid');
    const a = within(component2ParentElement).getByRole('link', { name: 'conf page' });
    expect(a).toHaveAttribute('href', mods1Field2.markdownMessage.link);

    await userEvent.type(componentMakingModsTextBox1, secondValueToInput);
    invariant(typeof mods2Field1.markdownMessage?.text === 'string');
    expect(componentParentElement).toHaveTextContent(mods2Field1.markdownMessage.text);

    invariant(typeof mods2Field2.markdownMessage?.text === 'string');
    expect(component2ParentElement).toHaveTextContent(mods2Field2.markdownMessage.text);

    invariant(mods2Field1.markdownMessage.markdownType === 'link');
    const anchorElementField1 = within(componentParentElement).getByRole('link');
    expect(anchorElementField1).toHaveAttribute('href', mods1Field2.markdownMessage.link);
});
