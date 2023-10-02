import { rest } from 'msw';

export const serverHandlers = [
    rest.get(`/servicesNS/nobody/-/restRoot_example_input_four`, (req, res, ctx) =>
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
];
