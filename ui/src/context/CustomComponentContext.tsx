import React, { createContext, ReactNode, useMemo } from 'react';
import { CustomElementsMap } from '../types/CustomTypes';

const CustomComponentContext = createContext<CustomElementsMap | undefined>(undefined);

export function CustomComponentContextProvider({
    children,
    customComponents,
}: {
    children: ReactNode;
    customComponents?: CustomElementsMap;
}) {
    const value = useMemo(() => ({ ...customComponents }), [customComponents]);

    return (
        <CustomComponentContext.Provider value={value}>{children}</CustomComponentContext.Provider>
    );
}

export default CustomComponentContext;
