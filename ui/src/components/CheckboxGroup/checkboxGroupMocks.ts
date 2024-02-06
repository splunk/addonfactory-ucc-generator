import { http, HttpResponse } from 'msw';

export const serverHandlers = [
    http.get(`/servicesNS/:user/-/:serviceName`, () =>
        HttpResponse.json({
            entry: [
                {
                    name: 'name',
                    content: 'content',
                    id: 0,
                },
            ],
        })
    ),
];
