import { useLocation } from 'react-router-dom';

// A custom hook that builds on useLocation to parse the query string for you.
function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default useQuery;
