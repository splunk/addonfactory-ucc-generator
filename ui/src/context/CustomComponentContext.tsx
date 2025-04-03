import React, { createContext, ReactNode, useMemo } from 'react';
import { CustomControlConstructor } from '../components/CustomControl/CustomControlBase';
import { CustomTabConstructor } from '../components/CustomTab/CustomTabBase';
import { CustomHookConstructor } from '../types/components/CustomHookClass';

export type CustomComponentContextType =
    | Record<string, CustomHookConstructor | CustomControlConstructor | CustomTabConstructor>
    | undefined;

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
