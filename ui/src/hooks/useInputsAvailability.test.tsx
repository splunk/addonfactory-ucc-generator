import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '../mocks/server';
import { setUnifiedConfig } from '../util/util';
// eslint-disable-next-line jest/no-mocks-import
import { mockUnifiedConfig } from '../util/__mocks__/mockUnifiedConfig';
import { useInputsAvailability } from './useInputsAvailability';
import { INPUTS_UNAVAILABLE_MARKER } from '../constants/inputsAvailability';
import { GlobalConfig } from '../types/globalConfig/globalConfig';

const config = mockUnifiedConfig as unknown as GlobalConfig;

beforeEach(() => {
    setUnifiedConfig(config);
});

describe('useInputsAvailability', () => {
    it('marks inputs available when no gate WARN is present', async () => {
        const { result } = renderHook(() => useInputsAvailability(config));

        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.available).toBe(true);
        expect(result.current.message).toBeUndefined();
    });

    it('marks inputs unavailable when WARN contains the gate marker', async () => {
        const warnText = `${INPUTS_UNAVAILABLE_MARKER}. Please use the IDM instance.`;
        server.use(
            http.get('/servicesNS/nobody/-/:endpointUrl', () =>
                HttpResponse.json({ entry: [], messages: [{ type: 'WARN', text: warnText }] })
            )
        );

        const { result } = renderHook(() => useInputsAvailability(config));

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.available).toBe(false);
        expect(result.current.message).toBe(warnText);
    });

    it('ignores unrelated WARN messages', async () => {
        server.use(
            http.get('/servicesNS/nobody/-/:endpointUrl', () =>
                HttpResponse.json({
                    entry: [],
                    messages: [{ type: 'WARN', text: 'Some unrelated deprecation notice.' }],
                })
            )
        );

        const { result } = renderHook(() => useInputsAvailability(config));

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.available).toBe(true);
    });

    it('fails open on HTTP errors so existing TAs keep working', async () => {
        server.use(
            http.get('/servicesNS/nobody/-/:endpointUrl', () =>
                HttpResponse.json({ messages: [] }, { status: 500 })
            )
        );

        const { result } = renderHook(() => useInputsAvailability(config));

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.available).toBe(true);
    });

    it('skips probing when no input services are configured', async () => {
        const noInputs = {
            ...config,
            pages: { ...config.pages, inputs: undefined },
        } as unknown as GlobalConfig;

        const { result } = renderHook(() => useInputsAvailability(noInputs));

        await waitFor(() => expect(result.current.loading).toBe(false));
        expect(result.current.available).toBe(true);
    });
});
