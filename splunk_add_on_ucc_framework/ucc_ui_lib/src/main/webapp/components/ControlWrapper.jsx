import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import CONTROL_TYPE_MAP from '../constants/ControlTypeMap';

class ControlWrapper extends React.PureComponent {

    constructor(props){
        super(props);
        this.controlType = _.isString(props.type) ? CONTROL_TYPE_MAP[props.type] : props.type;
    }

    render(){
        const isDisable = this.props.mode ==="EDIT" ? this.props.controlOptions.disableonEdit : false;
        const rowView = this.controlType ? (
            React.createElement(this.controlType,
                { 
                    handleChange:this.props.handleChange,
                    helptext:this.props.helptext ,
                    key:this.props.id,
                    id:this.props.id,
                    value:this.props.value,
                    field:this.props.field,
                    disable:isDisable,
                    controlOptions:this.props.controlOptions,
                })): `No View Found for ${this.props.type} type`;

        return (
        this.props.display && 
        <ControlGroup 
            label={this.props.label}
            help={this.props.helptext} 
            error={this.props.error}  >
            {rowView}
        </ControlGroup>
        )
    }
}

ControlWrapper.propTypes = {
    mode:PropTypes.string,
    label:PropTypes.string,
    id:PropTypes.number,
    handleChange:PropTypes.func,
    value : PropTypes.string,
    display : PropTypes.bool,
    error : PropTypes.bool,
    helptext : PropTypes.string,
    field : PropTypes.string,
    type : PropTypes.string,
    controlOptions : PropTypes.object
}

export default ControlWrapper;