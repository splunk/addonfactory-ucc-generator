import { declare } from '@babel/helper-plugin-utils';
import { NodePath, PluginItem, types as t } from '@babel/core';

export default declare((api): PluginItem => {
    api.assertVersion(7);

    function getDefaultImport(
        path: NodePath<t.ImportDeclaration>
    ): t.ImportDefaultSpecifier | null {
        if (!path.node.specifiers.length) return null;

        for (const specifier of path.node.specifiers) {
            if (t.isImportDefaultSpecifier(specifier)) return specifier;
        }

        return null;
    }

    function insertResolver(path: NodePath<t.ImportDeclaration>, defaultImportId: t.Identifier) {
        const condition = t.logicalExpression(
            '&&',
            t.binaryExpression(
                '===',
                t.unaryExpression('typeof', defaultImportId),
                t.stringLiteral('object')
            ),
            t.binaryExpression('in', t.stringLiteral('default'), defaultImportId)
        );
        const ternary = t.conditionalExpression(
            condition,
            t.memberExpression(defaultImportId, t.identifier('default')),
            defaultImportId
        );

        const declaration = t.variableDeclaration('const', [
            t.variableDeclarator(t.identifier('styled'), ternary),
        ]);

        path.insertAfter(declaration);
    }

    return {
        name: '@source-web/babel-plugin-resolve-styled-components',
        visitor: {
            ImportDeclaration(path) {
                const isStyledComponentsImport = path.node.source.value === 'styled-components';

                if (isStyledComponentsImport) {
                    const defaultImport = getDefaultImport(path);

                    if (!defaultImport) return;

                    const id = path.scope.generateUidIdentifier('s');

                    defaultImport.local = id;

                    insertResolver(path, id);
                }
            },
        },
    };
});
