import React, { useContext } from 'react';
import Text from '@splunk/react-ui/Text';
import PropTypes from 'prop-types';
import TableContext from '../../context/TableContext';

function TableFilter(props) {

    const { searchText } = useContext(TableContext);

    // We need to remove this function later
    const debounce = (func, wait) => {
        let timeout;

        // This is the function that is returned and will be executed many times
        // We spread (...args) to capture any number of parameters we want to pass
        return function executedFunction(...args) {
            // The callback function to be executed after
            // the debounce time has elapsed
            const later = () => {
                // null timeout to indicate the debounce ended
                timeout = null;

                // Execute the callback
                func(...args);
            };
            // This will reset the waiting every function execution.
            // This is the step that prevents the function from
            // being executed because it will never reach the
            // inside of the previous setTimeout
            clearTimeout(timeout);

            // Restart the debounce waiting period.
            // setTimeout returns a truthy value
            timeout = setTimeout(later, wait);
        };
    };

    return (
        <Text
            appearance="search"
            placeholder="filter"
            onChange={props.handleChange}
            value={searchText}
        />
    );
}

TableFilter.propTypes = {
    handleChange: PropTypes.func,
};

export default TableFilter;
