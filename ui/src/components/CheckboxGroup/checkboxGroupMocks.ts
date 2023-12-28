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
    http.post(`/servicesNS/:user/-/:serviceName`, async ({ request }) =>
        HttpResponse.json(
            {
                messages: [{ text: `Submitted body: ${decodeURIComponent(await request.text())}` }],
            },
            { status: 500 }
        )
    ),
];
