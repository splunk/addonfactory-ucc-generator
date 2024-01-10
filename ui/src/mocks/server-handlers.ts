// src/mocks/serverHandlers.js
import { http, HttpResponse } from 'msw';
import { MOCKED_TA_INPUT, mockServerResponse } from './server-response';

const ok = new HttpResponse(null, { status: 200 });
export const serverHandlers = [
    http.get(`/servicesNS/nobody/-/${MOCKED_TA_INPUT}`, () => ok),
    http.get(`/servicesNS/nobody/-/:endpointUrl`, () => HttpResponse.json(mockServerResponse)),
    http.get('/servicesNS/nobody/-/data/indexes', () => ok),
];
