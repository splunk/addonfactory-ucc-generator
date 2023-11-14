// src/mocks/serverHandlers.js
import { rest } from 'msw';
import { MOCKED_TA_INPUT, mockServerResponse } from './server-response';

export const serverHandlers = [
    rest.get(`/servicesNS/nobody/-/${MOCKED_TA_INPUT}`, (req, res, ctx) => res(ctx.status(200))),
    rest.get('/servicesNS/nobody/-/:endpointUrl', (req, res, ctx) =>
        res(ctx.json(mockServerResponse))
    ),
    rest.get('/servicesNS/nobody/-/data/indexes', (req, res, ctx) => res(ctx.status(200))),
];
