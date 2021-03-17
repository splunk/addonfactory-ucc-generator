import React from 'react';
import PropTypes from 'prop-types';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import CONTROL_TYPE_MAP from '../constants/ControlTypeMap';

class ControlWrapper extends React.PureComponent {

    constructor(props){
        super(props);
        this.controlType = this.isString(props.entity.type) ? CONTROL_TYPE_MAP[props.entity.type] : props.entity.type;        
    }

    isString = (str)=>{
        return !!((typeof str === 'string' || str instanceof String));
    }

    render(){

        const {field, options, type,label,tooltip, helptext,encrypted=false} = this.props.entity;
        const {handleChange, addCustomValidator, utilCustomFunctions} = this.props.utilityFuncts;

        let rowView;
        if(this.props.entity.type==="custom"){

            const data = {
                value:this.props.value,
                mode:this.props.mode,
                serviceName:this.props.serviceName
            }
            
            rowView = this.controlType ? (
                    React.createElement(this.controlType,
                        { 
                            data,
                            field,
                            handleChange,
                            addCustomValidator,
                            utilCustomFunctions,
                            controlOptions:options
                        })
                    ): `No View Found for ${type} type`;
            }
        else{
            rowView = this.controlType ? (
                React.createElement(this.controlType,
                    { 
                        handleChange,
                        value:this.props.value,
                        field,
                        controlOptions:options,
                        error:this.props.error,
                        disabled:this.props.disabled,
                        encrypted
                    })
                ): `No View Found for ${type} type`;
        }

        return (
        this.props.display && 
            <ControlGroup 
                label={label}
                help={helptext}
                tooltip={tooltip}
                error={this.props.error}  >
                {rowView}
            </ControlGroup>
        )
    }
}

ControlWrapper.propTypes = {
    mode:PropTypes.string,
    utilityFuncts:PropTypes.object,
    value : PropTypes.any,
    display : PropTypes.bool,
    error : PropTypes.bool,
    entity : PropTypes.object,
    disabled : PropTypes.bool,
    serviceName: PropTypes.string
}

export default ControlWrapper;