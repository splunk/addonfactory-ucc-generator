import React, { createContext, ReactNode, useMemo } from 'react';
import { CustomElementsMap } from '../types/CustomTypes';

export type CustomComponentContextType = CustomElementsMap | undefined;

const CustomComponentContext = createContext<CustomComponentContextType>(undefined);

export function CustomComponentContextProvider({
    children,
    customComponents,
}: {
    children: ReactNode;
    customComponents: CustomComponentContextType;
}) {
    const value = useMemo(() => ({ ...customComponents }), [customComponents]);

    return (
        <CustomComponentContext.Provider value={value}>{children}</CustomComponentContext.Provider>
    );
}

export default CustomComponentContext;
