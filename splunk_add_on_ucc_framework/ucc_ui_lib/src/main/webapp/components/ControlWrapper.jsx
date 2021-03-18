import React from 'react';
import PropTypes from 'prop-types';
import ControlGroup from '@splunk/react-ui/ControlGroup';
import styled from 'styled-components';

import CONTROL_TYPE_MAP from '../constants/ControlTypeMap';

const CustomElement = styled.div`
    margin-left: 30px;
    div {
        width: 100% !important;
    }
`;

const ControlGroupWrapper = styled(ControlGroup)`
    > * {
        &:first-child {
            width: 170px !important;
        }
        &:nth-child(3) {
            margin-left: 200px !important;
        }
    }
`;

class ControlWrapper extends React.PureComponent {

    constructor(props){
        super(props);
        this.controlType = this.isString(props.entity.type) ? CONTROL_TYPE_MAP[props.entity.type] : props.entity.type;        
    }

    isString = (str)=>{
        return !!((typeof str === 'string' || str instanceof String));
    }

    render(){

        const { field, options, type, label, tooltip, help, encrypted = false } = this.props.entity;

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
                            controlOptions:options,
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
                        encrypted,
                        dependencyValues:this.props.dependencyValues,
                    })
                ): `No View Found for ${type} type`;
        }

        return (
            this.props.display &&
            <ControlGroupWrapper
                label={label}
                help={help}
                tooltip={tooltip}
                error={this.props.error}>
                <CustomElement>
                    {rowView}
                </CustomElement>
            </ControlGroupWrapper>
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