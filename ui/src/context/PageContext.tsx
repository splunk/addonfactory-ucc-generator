import React, { createContext, ReactNode } from 'react';

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
    return (
        <PageContext.Provider
            value={{
                platform,
            }}
        >
            {children}
        </PageContext.Provider>
    );
}

export default PageContext;
