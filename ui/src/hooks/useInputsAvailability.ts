import { useEffect, useState } from 'react';

import { GlobalConfig } from '../types/globalConfig/globalConfig';
import { generateEndPointUrl, getRequest } from '../util/api';
import { INPUTS_UNAVAILABLE_MARKER } from '../constants/inputsAvailability';

/**
 * Response shape we look at — only the `messages` envelope, which Splunk's
 * EAI returns for every REST call. Anything else in the payload is ignored.
 */
interface ProbeResponse {
    messages?: Array<{ type?: string; text?: string }>;
}

export interface InputsAvailability {
    /** True until the probe has settled (loading state). */
    loading: boolean;
    /**
     * False only when the library-side gate is detected. Defaults to true
     * (fail-open) so apps using a `splunktaucclib` without the gate still
     * render normally.
     */
    available: boolean;
    /**
     * The exact WARN text returned by the library, if any. Lets callers
     * surface upstream copy changes without an UCC redeploy.
     */
    message?: string;
}

/**
 * Probes a single input service endpoint on mount to detect whether the
 * library-side Inputs-unavailable gate has fired. The probe is read-only
 * (`count=1`) and runs once per page mount; it is aborted on unmount.
 *
 * Detection contract: the response is gated when its `messages` array
 * contains an entry whose `text` includes {@link INPUTS_UNAVAILABLE_MARKER}.
 * Any HTTP / network error is treated as "available" so we never break
 * the Inputs UI on transient failures.
 */
export const useInputsAvailability = (globalConfig: GlobalConfig): InputsAvailability => {
    const [state, setState] = useState<InputsAvailability>({ loading: true, available: true });

    useEffect(() => {
        const services = globalConfig?.pages?.inputs?.services;
        if (!services || services.length === 0) {
            setState({ loading: false, available: true });
            return undefined;
        }

        const probeService = services[0];
        const controller = new AbortController();

        getRequest<ProbeResponse>({
            endpointUrl: generateEndPointUrl(probeService.name),
            params: { count: 1 },
            handleError: false,
            signal: controller.signal,
        })
            .then((data) => {
                const warn = data?.messages?.find(
                    (m) => typeof m?.text === 'string' && m.text.includes(INPUTS_UNAVAILABLE_MARKER)
                );
                setState({
                    loading: false,
                    available: !warn,
                    message: warn?.text,
                });
            })
            .catch((error: unknown) => {
                const isAborted =
                    error instanceof DOMException ||
                    (error instanceof Error && error.name === 'AbortError');
                if (isAborted) {
                    return;
                }
                setState({ loading: false, available: true });
            });

        return () => controller.abort();
    }, [globalConfig]);

    return state;
};
