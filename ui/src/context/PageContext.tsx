import React, { createContext, ReactNode, useMemo } from 'react';

import { Platforms } from '../types/globalConfig/pages';

export type PageContextProviderType = {
    platform: Platforms;
};

const PageContext = createContext<PageContextProviderType | undefined>(undefined);

export function PageContextProvider({
    children,
    platform,
}: {
    children: ReactNode;
    platform: Platforms;
}) {
    const value = useMemo(() => ({ platform }), [platform]);

    return <PageContext.Provider value={value}>{children}</PageContext.Provider>;
}

export default PageContext;
