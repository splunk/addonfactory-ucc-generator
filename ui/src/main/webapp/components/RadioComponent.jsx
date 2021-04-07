import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RadioBar from '@splunk/react-ui/RadioBar';
import styled from 'styled-components';

const RadioBarWrapper = styled(RadioBar)`
    width: 300px;
`;

class RadioComponent extends Component {
    handleChange = (e, { value }) => {
        this.props.handleChange(this.props.field, value);
    };

    render() {
        return (
            <RadioBarWrapper
                inline
                onChange={this.handleChange}
                value={this.props.value}
                key={this.props.field}
            >
                {this.props.controlOptions.items.map((item) => (
                    <RadioBar.Option key={item.value} value={item.value} label={item.label} />
                ))}
            </RadioBarWrapper>
        );
    }
}

RadioComponent.propTypes = {
    value: PropTypes.string,
    handleChange: PropTypes.func.isRequired,
    field: PropTypes.string,
    controlOptions: PropTypes.object,
};

export default RadioComponent;
