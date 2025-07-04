import { beforeEach, expect, it, vi } from 'vitest';
import React from 'react';
import { screen, render, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { z } from 'zod';

import { setUnifiedConfig } from '../../util/util';
import {
    firstModificationField,
    firstStandardTextField,
    getConfigWithModifications,
    regexpModificationField,
    secondModificationField,
    secondStandardTextField,
    thirdModificationField,
} from './TestConfig';
import EntityModal, { EntityModalProps } from '../EntityModal/EntityModal';
import { EntitiesAllowingModifications } from '../../types/components/BaseFormTypes';
import { invariant } from '../../util/invariant';
import { StringOrTextWithLinks } from '../../types/globalConfig/baseSchemas';

const handleRequestClose = vi.fn();
const setUpConfigWithDefaultValue = () => {
    const newConfig = getConfigWithModifications();
    setUnifiedConfig(newConfig);
};

const renderModalWithProps = (props: EntityModalProps) => {
    render(<EntityModal {...props} handleRequestClose={handleRequestClose} />);
};

type StringOrTextWithLinksType = z.TypeOf<typeof StringOrTextWithLinks>;

const props = {
    serviceName: 'account',
    mode: 'create',
    stanzaName: undefined,
    formLabel: 'formLabel',
    page: 'configuration',
    groupName: '',
    open: true,
    handleRequestClose: () => {},
    returnFocus: () => {},
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

const verifyAllProps = (
    parentElement: Element,
    input: Element,
    mods: {
        value?: string | number | boolean;
        help?: StringOrTextWithLinksType;
        label?: string;
    }
) => {
    expect(input).toHaveAttribute('value', mods.value);
    invariant(typeof mods.help === 'string', 'Help is not a string');
    expect(parentElement).toHaveTextContent(mods.help);
    invariant(typeof mods.label === 'string', 'Label is not a string');
    expect(parentElement).toHaveTextContent(mods.label);
};

const getTextElementForField = (field: string) => {
    const componentParentElement = screen
        .getAllByTestId('control-group')
        .find((el) => el.getAttribute('data-name') === field);

    expect(componentParentElement).toBeInTheDocument();

    if (!componentParentElement) {
        return [];
    }

    const componentInput = within(componentParentElement).getByRole('textbox');

    return [componentParentElement, componentInput];
};

beforeEach(() => {
    setUpConfigWithDefaultValue();
});

it('render fields with modifications correctly', async () => {
    renderModalWithProps(props);

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
    renderModalWithProps(props);

    const firstValueToInput = 'a';
    const secondValueToInput = 'aa';
    const [componentParentElement, componentInput] = getTextElementForField(
        firstStandardTextField.field
    );
    const [component2ParentElement, component2Input] = getTextElementForField(
        secondStandardTextField.field
    );

    const [, componentMakingModsTextBox1] = getTextElementForField(firstModificationField.field);

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

    expect(componentInput).toBeVisuallyDisabled();

    verifyAllProps(componentParentElement, componentInput, mods1Field1);

    expect(component2Input).toBeVisuallyDisabled();

    verifyAllProps(component2ParentElement, component2Input, mods1Field2);

    await userEvent.type(componentMakingModsTextBox1, secondValueToInput);

    expect(component2Input).toBeVisuallyEnabled();

    verifyAllProps(componentParentElement, componentInput, mods2Field1);

    expect(component2Input).toBeVisuallyEnabled();

    verifyAllProps(component2ParentElement, component2Input, mods2Field2);
});

it('verify markdown modifications', async () => {
    renderModalWithProps(props);

    const firstValueToInput = 'a';
    const secondValueToInput = 'aa';

    const [componentParentElement] = getTextElementForField(firstStandardTextField.field);
    const [component2ParentElement] = getTextElementForField(secondStandardTextField.field);

    const [, componentMakingModsTextBox1] = getTextElementForField(secondModificationField.field);

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

const findModsWithRegexp = (
    modificationFiled: EntitiesAllowingModifications,
    regexp: string,
    fieldId: string
) => {
    const modification = modificationFiled.modifyFieldsOnValue
        ?.find((mod) => typeof mod.fieldValue === 'object' && mod.fieldValue?.pattern === regexp)
        ?.fieldsToModify.find((field: { fieldId: string }) => field.fieldId === fieldId);
    invariant(modification);
    return modification;
};

it('verify regexp modification after text components change', async () => {
    renderModalWithProps(props);
    const firstPattern = regexpModificationField.modifyFieldsOnValue?.[0].fieldValue?.pattern;
    const secondPattern = regexpModificationField.modifyFieldsOnValue?.[1].fieldValue?.pattern;
    const firstValueToInput = 'verifying regexp example value';
    const secondValueToInput = '1a2b';
    const [componentParentElement, componentInput] = getTextElementForField(
        firstStandardTextField.field
    );

    const [, componentMakingRegexpMods] = getTextElementForField(regexpModificationField.field);

    const mods1Field1 = findModsWithRegexp(
        regexpModificationField,
        firstPattern,
        firstStandardTextField.field
    );

    const mods2Field1 = findModsWithRegexp(
        regexpModificationField,
        secondPattern,
        firstStandardTextField.field
    );

    await userEvent.type(componentMakingRegexpMods, firstValueToInput);

    verifyAllProps(componentParentElement, componentInput, mods1Field1);

    await userEvent.clear(componentMakingRegexpMods);
    await userEvent.type(componentMakingRegexpMods, secondValueToInput);

    verifyAllProps(componentParentElement, componentInput, mods2Field1);
});

it('verify no modifications', async () => {
    renderModalWithProps(props);
    const firstValueToInput = 'example value';
    const secondValueToInput = 'aaa111';
    const [componentParentElement, componentInput] = getTextElementForField(
        firstStandardTextField.field
    );

    const [, componentMakingRegexpMods] = getTextElementForField(regexpModificationField.field);

    await userEvent.type(componentMakingRegexpMods, firstValueToInput);

    verifyAllProps(componentParentElement, componentInput, firstStandardTextField);

    await userEvent.clear(componentMakingRegexpMods);
    await userEvent.type(componentMakingRegexpMods, secondValueToInput);

    verifyAllProps(componentParentElement, componentInput, firstStandardTextField);
});
