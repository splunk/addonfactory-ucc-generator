import { useContext } from 'react';
import PageContext from './PageContext';

export function usePageContext() {
    const pageContext = useContext(PageContext);
    if (!pageContext) {
        throw new Error('usePageContext must be used within <PageContextProvider />');
    }
    return pageContext;
}
