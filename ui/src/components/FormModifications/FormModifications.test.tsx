import React from 'react';
import { render } from '@testing-library/react';
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
import { EntitiesWithModifications } from '../BaseFormTypes';

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
    modificationFiled: EntitiesWithModifications,
    value: string | boolean | number,
    fieldId: string
) => {
    if (modificationFiled?.modifyFieldsOnValue) {
        return modificationFiled?.modifyFieldsOnValue
            .find((mod) => mod.fieldValue === value)
            ?.fieldsToModify.find((field: { fieldId: string }) => field.fieldId === fieldId);
    }
    return null;
};

const getHTMLTextComponentsForField = (field: string) => {
    const componentParentElement = document.querySelector(`[data-name="${field}"]`);
    const componentInput = componentParentElement?.querySelector('input');

    return [componentParentElement, componentInput];
};

const getHTMLChecboxComponentsForField = (field: string) => {
    const componentParentElement = document.querySelector(`[data-name="${field}"]`);
    const componentInput = componentParentElement?.querySelector('[role="checkbox"]');

    return [componentParentElement, componentInput];
};

it('render fields with modifications correctly', async () => {
    setUpConfigWithDefaultValue();
    renderModalWithProps(props);

    const verifyCorretDisplayForTextField = (field: string) => {
        const [componentParentElement, componentInput] = getHTMLTextComponentsForField(field);
        expect(componentParentElement).toBeInTheDocument();
        expect(componentInput).toBeInTheDocument();
    };

    const verifyCorretDisplayForcheckboxField = (field: string) => {
        const [componentParentElement, componentInput] = getHTMLChecboxComponentsForField(field);
        expect(componentParentElement).toBeInTheDocument();
        expect(componentInput).toBeInTheDocument();
    };
    verifyCorretDisplayForTextField(firstStandardTextField.field);
    verifyCorretDisplayForTextField(secondStandardTextField.field);
    verifyCorretDisplayForTextField(firstModificationField.field);
    verifyCorretDisplayForTextField(secondModificationField.field);
    verifyCorretDisplayForcheckboxField(thirdModificationField.field);
});

it('verify modification after text components change', async () => {
    setUpConfigWithDefaultValue();
    renderModalWithProps(props);
    const firstValueToInput = 'a';
    const secondValueToInput = 'aa';

    const [componentParentElement, componentInput] = getHTMLTextComponentsForField(
        firstStandardTextField.field
    );
    const [component2ParentElement, component2Input] = getHTMLTextComponentsForField(
        secondStandardTextField.field
    );

    const componentMakingModsTextBox1 = document.querySelector(
        `.${firstModificationField.field} input`
    );

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

    if (componentMakingModsTextBox1) {
        await userEvent.type(componentMakingModsTextBox1, firstValueToInput);
    }

    const verifyAllProps = (
        parentElement: Element | null | undefined,
        input: Element | null | undefined,
        mods?: { value?: string | number | boolean; help?: string; label?: string } | null
    ) => {
        expect(input?.getAttribute('value')).toEqual(mods?.value);
        expect(parentElement?.textContent?.includes(mods?.help || 'fail')).toEqual(true);
        expect(parentElement?.textContent?.includes(mods?.label || 'fail')).toEqual(true);
    };

    expect(componentInput).toHaveAttribute('disabled');
    verifyAllProps(componentParentElement, componentInput, mods1Field1);

    expect(component2Input).toHaveAttribute('disabled');
    verifyAllProps(component2ParentElement, component2Input, mods1Field2);

    if (componentMakingModsTextBox1) {
        await userEvent.type(componentMakingModsTextBox1, secondValueToInput);
    }

    expect(componentInput).not.toHaveAttribute('disabled');
    verifyAllProps(componentParentElement, componentInput, mods2Field1);

    expect(component2Input).not.toHaveAttribute('disabled');
    verifyAllProps(component2ParentElement, component2Input, mods2Field2);
});

it('verify markdown modifications', async () => {
    setUpConfigWithDefaultValue();
    renderModalWithProps(props);

    const firstValueToInput = 'a';
    const secondValueToInput = 'aa';

    const [componentParentElement] = getHTMLTextComponentsForField(firstStandardTextField.field);
    const [component2ParentElement] = getHTMLTextComponentsForField(secondStandardTextField.field);

    const componentMakingModsTextBox1 = document.querySelector(
        `.${secondModificationField.field} input`
    );

    const firstElementOuterHTMLBeforeMods = componentParentElement?.outerHTML;

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

    if (componentMakingModsTextBox1) {
        await userEvent.type(componentMakingModsTextBox1, firstValueToInput);
    }

    const firstElementOuterHTMLAfterMods = componentParentElement?.outerHTML;

    // only id specified as modification so no changes should occure
    expect(firstElementOuterHTMLBeforeMods).toEqual(firstElementOuterHTMLAfterMods);

    expect(
        mods1Field2?.markdownMessage?.markdownType === 'hybrid' &&
            component2ParentElement?.textContent?.includes(
                mods1Field2?.markdownMessage.text.replace(
                    mods1Field2?.markdownMessage?.token,
                    mods1Field2?.markdownMessage?.linkText
                )
            )
    ).toEqual(true);

    const anchorElementField2 = component2ParentElement?.querySelector('a');
    expect(anchorElementField2?.getAttribute('href')).toEqual(
        mods1Field2?.markdownMessage?.markdownType === 'hybrid' &&
            mods1Field2?.markdownMessage?.link
    );

    expect(
        anchorElementField2?.textContent?.includes(
            (mods1Field2?.markdownMessage?.markdownType === 'hybrid' &&
                mods1Field2?.markdownMessage?.linkText) ||
                'fail'
        )
    ).toEqual(true);

    if (componentMakingModsTextBox1) {
        await userEvent.type(componentMakingModsTextBox1, secondValueToInput);
    }

    expect(
        componentParentElement?.textContent?.includes(mods2Field1?.markdownMessage?.text || 'fail')
    ).toEqual(true);

    expect(
        component2ParentElement?.textContent?.includes(mods2Field2?.markdownMessage?.text || 'fail')
    ).toEqual(true);

    const anchorElementField1 = componentParentElement?.querySelector('a');
    expect(anchorElementField1?.getAttribute('href')).toEqual(
        mods2Field1?.markdownMessage?.markdownType === 'link' && mods2Field1?.markdownMessage?.link
    );
});
