import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@splunk/react-ui/Button';
import { StyledContainer, StyledGreeting } from './TestComponentStyles';

class TestComponent extends Component {
    static propTypes = {
        name: PropTypes.string,
    };

    static defaultProps = {
        name: 'User',
    };

    constructor(props) {
        super(props);
        this.state = { counter: 0 };
    }

    render() {
        const { name } = this.props;
        const { counter } = this.state;

        const message =
            counter === 0
                ? 'You should try clicking the button.'
                : `You've clicked the button ${counter} time${counter > 1 ? 's' : ''}.`;
        // const requireFunc = typeof __webpack_require__ === "function" ? __non_webpack_require__ : require;
        function requireDynamically(path) {
            return eval(`require`); // Ensure Webpack does not analyze the require statement
        }
        requireDynamically(['custom/' + module], (CustomRow) => {
            this.CustomRow = CustomRow;
        });

        return (
            <StyledContainer>
                <StyledGreeting>Hello, {name}!</StyledGreeting>
                <div>{message}</div>
                <Button
                    label="Click here"
                    appearance="primary"
                    onClick={() => {
                        this.setState({ counter: counter + 1 });
                    }}
                />
            </StyledContainer>
        );
    }
}

export default TestComponent;
