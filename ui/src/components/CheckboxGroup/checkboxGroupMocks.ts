import { compose, rest } from 'msw';

export const serverHandlers = [
    rest.get(`/servicesNS/:user/-/:serviceName`, (req, res, ctx) =>
        res(
            ctx.json({
                entry: [
                    {
                        name: 'name',
                        content: 'content',
                        id: 0,
                    },
                ],
            })
        )
    ),
    rest.post(`/servicesNS/:user/-/:serviceName`, async (req, res, ctx) =>
        res(
            compose(
                ctx.json({
                    messages: [{ text: `Submitted body: ${decodeURIComponent(await req.text())}` }],
                }),
                ctx.status(500)
            )
        )
    ),
];
