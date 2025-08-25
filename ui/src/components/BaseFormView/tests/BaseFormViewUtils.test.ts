import { describe, it, expect } from 'vitest';
import { mapEntityIntoBaseForViewEntityObject } from '../BaseFormViewUtils';
import { MODE_EDIT, MODE_CONFIG } from '../../../constants/modes';
import { BaseFormProps } from '../../../types/components/BaseFormTypes';

describe('BaseFormViewUtils - Password Placeholder Fix', () => {
    const mockProps: BaseFormProps = {
        mode: MODE_EDIT,
        currentServiceState: {},
        serviceName: 'account',
        page: 'configuration',
        stanzaName: 'test',
        handleFormSubmit: () => {},
    };

    it('should preserve masked password values in edit mode', () => {
        const entity = {
            field: 'password',
            label: 'Password',
            type: 'text' as const,
            encrypted: true,
        };
        
        const currentInput = {
            password: '******',
        };

        const result = mapEntityIntoBaseForViewEntityObject(
            entity,
            currentInput,
            mockProps
        );

        expect(result.value).toBe('******');
    });

    it('should show empty string for encrypted fields with no value in edit mode', () => {
        const entity = {
            field: 'password',
            label: 'Password',
            type: 'text' as const,
            encrypted: true,
        };
        
        const currentInput = {};

        const result = mapEntityIntoBaseForViewEntityObject(
            entity,
            currentInput,
            mockProps
        );

        expect(result.value).toBe('');
    });

    it('should show empty string for encrypted fields with empty value in edit mode', () => {
        const entity = {
            field: 'password',
            label: 'Password',
            type: 'text' as const,
            encrypted: true,
        };
        
        const currentInput = {
            password: '',
        };

        const result = mapEntityIntoBaseForViewEntityObject(
            entity,
            currentInput,
            mockProps
        );

        expect(result.value).toBe('');
    });

    it('should preserve non-encrypted field values in edit mode', () => {
        const entity = {
            field: 'username',
            label: 'Username',
            type: 'text' as const,
            encrypted: false,
        };
        
        const currentInput = {
            username: 'testuser',
        };

        const result = mapEntityIntoBaseForViewEntityObject(
            entity,
            currentInput,
            mockProps
        );

        expect(result.value).toBe('testuser');
    });

    it('should work the same way in config mode', () => {
        const configProps: BaseFormProps = { ...mockProps, mode: MODE_CONFIG };
        
        const entity = {
            field: 'password',
            label: 'Password',
            type: 'text' as const,
            encrypted: true,
        };
        
        const currentInput = {
            password: '******',
        };

        const result = mapEntityIntoBaseForViewEntityObject(
            entity,
            currentInput,
            configProps
        );

        expect(result.value).toBe('******');
    });
});
