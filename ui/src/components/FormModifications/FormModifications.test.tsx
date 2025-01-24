import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { setUnifiedConfig } from '../../util/util';
import {
    firstModificationField,
    firstStandardTextField,
    getConfigWithModifications,
    secondModificationField,
    secondStandardTextField,
    thirdModificationField,
} from './TestConfig';
import EntityModal, { EntityModalProps } from '../EntityModal/EntityModal';
import { EntitiesAllowingModifications } from '../../types/components/BaseFormTypes';
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
    modificationField: EntitiesAllowingModifications,
    value: string | boolean | number,
    fieldId: string
) => {
    const modification = modificationField.modifyFieldsOnValue
        ?.find((mod) => mod.fieldValue === value)
        ?.fieldsToModify.find((field: { fieldId: string }) => field.fieldId === fieldId);
    invariant(modification);
    return modification;
};

const getTextElementForField = (field: string) => {
    const componentParentElement = document.querySelector<HTMLElement>(`[data-name="${field}"]`)!;
    expect(componentParentElement).toBeInTheDocument();
    const componentInput = within(componentParentElement).getByRole('textbox');

    return [componentParentElement, componentInput];
};

beforeEach(() => {
    setUpConfigWithDefaultValue();
    renderModalWithProps(props);
});

it('render fields with modifications correctly', async () => {
    expect(screen.getByRole('textbox', { name: firstStandardTextField.label })).toBeInTheDocument();
    expect(
        screen.getByRole('textbox', { name: secondStandardTextField.label })
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: firstModificationField.label })).toBeInTheDocument();
    expect(
        screen.getByRole('textbox', { name: secondModificationField.label })
    ).toBeInTheDocument();
    expect(
        screen.getByRole('checkbox', { name: thirdModificationField.label })
    ).toBeInTheDocument();
});

it('verify modification after text components change', async () => {
    const firstValueToInput = 'a';
    const secondValueToInput = 'aa';

    const componentInput = screen.getByRole('textbox', { name: firstStandardTextField.label });
    const component2Input = screen.getByRole('textbox', { name: secondStandardTextField.label });

    const componentMakingModsTextBox1 = screen.getByRole('textbox', {
        name: firstModificationField.label,
    });

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
        input: HTMLElement,
        mods: { value?: string | number | boolean; help?: string; label?: string }
    ) => {
        expect(input).toHaveAttribute('value', mods.value);
        expect(screen.getByText(mods.help!)).toBeInTheDocument();
        expect(screen.getByText(mods.label!)).toBeInTheDocument();
    };

    expect(componentInput).toBeVisuallyDisabled();

    verifyAllProps(componentInput, mods1Field1);

    expect(component2Input).toBeVisuallyDisabled();

    verifyAllProps(component2Input, mods1Field2);

    await userEvent.type(componentMakingModsTextBox1, secondValueToInput);

    expect(component2Input).toBeVisuallyEnabled();

    verifyAllProps(componentInput, mods2Field1);

    expect(component2Input).toBeVisuallyEnabled();

    verifyAllProps(component2Input, mods2Field2);
});

it('verify markdown modifications', async () => {
    const firstValueToInput = 'a';
    const secondValueToInput = 'aa';

    const [componentParentElement] = getTextElementForField(firstStandardTextField.field);
    const [component2ParentElement] = getTextElementForField(secondStandardTextField.field);

    const componentMakingModsTextBox1 = getTextElementForField(secondModificationField.field)[1];

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
