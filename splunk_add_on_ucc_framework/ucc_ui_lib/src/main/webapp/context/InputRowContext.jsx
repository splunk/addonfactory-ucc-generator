import React, { createContext } from 'react';
import PropTypes from 'prop-types';

const InputRowContext = createContext({
    rowData: {},
    setRowData: () => {},
});

export class InputRowContextProvider extends React.PureComponent {
    constructor() {
        super();
        this.state = {
            rowData: {},
        };
        this.setState = this.setState.bind(this);
    }

    render() {
        return (
            <InputRowContext.Provider
                value={{ rowData: this.state.rowData, setRowData: this.setState }}
            >
                {this.props.children}
            </InputRowContext.Provider>
        );
    }
}

InputRowContextProvider.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node
    ]).isRequired
};

export default InputRowContext;
