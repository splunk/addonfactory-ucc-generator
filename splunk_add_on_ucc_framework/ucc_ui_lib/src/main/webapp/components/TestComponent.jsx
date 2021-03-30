import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '@splunk/react-ui/Button';
import { StyledContainer, StyledGreeting } from './TestComponentStyles';
import { axiosCallWrapper } from '../util/axiosCallWrapper';

class TestComponent extends Component {
    static propTypes = {
        name: PropTypes.string,
    };

    static defaultProps = {
        name: 'User',
        serviceName: 'example_input_one',
    };

    constructor(props) {
        super(props);
        this.state = { counter: 0 };
    }

    componentDidMount() {
        axiosCallWrapper(this.props.serviceName)
            .then((response) => {
                // eslint-disable-next-line no-console
                console.log(response.data);
            })
            .catch((error) => {
                // eslint-disable-next-line no-console
                console.log(error);
            });
    }

    render() {
        const { name } = this.props;
        const { counter } = this.state;

        const message =
            counter === 0
                ? 'You should try clicking the button.'
                : `You've clicked the button ${counter} time${counter > 1 ? 's' : ''}.`;

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

TestComponent.propTypes = {
    serviceName: PropTypes.string,
};
export default TestComponent;
