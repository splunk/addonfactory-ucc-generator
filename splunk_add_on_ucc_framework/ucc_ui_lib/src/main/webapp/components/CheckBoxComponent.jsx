import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Switch from '@splunk/react-ui/Switch';

class CheckBoxComponent extends Component {
    constructor(props) {
        super(props);
    }

    handleClick = (e) => {
        this.props.handleClick(this.props.id, e.target.value);
    };

    render() {
        return (
            <Switch
                key={this.props.field}
                value={this.props.value}
                onClick={this.handleClick}
                selected={this.props.value === 1 ? true : false}
                appearance="checkbox"
            >
                {this.props.label}
            </Switch>
        );
    }
}

CheckBoxComponent.propTypes = {
    id: PropTypes.number.isRequired,
    value: PropTypes.string,
    handleClick: PropTypes.func.isRequired,
    field: PropTypes.string,
    label: PropTypes.string,
    controlOptions: PropTypes.object,
};

export default CheckBoxComponent;
