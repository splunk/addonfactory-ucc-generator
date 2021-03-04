import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ControlGroup from '@splunk/react-ui/ControlGroup';

class CustomControl extends Component {

    componentDidMount() {
        const data = {
            "mode":this.props.mode,
            "field":this.props.field,
            "value":this.props.value
        }
        this.loadCustomControl(this.props.controlOptions.src).then((Control)=>{
            const customControl = new Control(this.el, this.setValue,data);
            customControl.render();
        })
      }

    shouldComponentUpdate() {
        return false;
      }

    componentWillUnmount() {
        // destroy el plugin to avoid memmory leak
      }

    loadCustomControl = (module)=> {
        const myPromise = new Promise((myResolve) => {
            __non_webpack_require__([`app/${this.props.appName}/js/build/custom/${module}`], (Control) => {
                myResolve(Control);
            }
          );
        })
        return myPromise;
    };

    setValue = (newValue) => {
        this.props.handleChange(this.props.id,newValue);
      }

    render(){
        return (
        this.props.display && 
        <ControlGroup 
            label={this.props.label}
            help={this.props.helptext} 
            error={this.props.error}  >
            <div ref={ (el) => {this.el = el} } />
        </ControlGroup>
        )
    }
}

CustomControl.propTypes = {
    mode:PropTypes.string,
    label:PropTypes.string,
    id:PropTypes.number,
    handleChange:PropTypes.func,
    value : PropTypes.string,
    display : PropTypes.bool,
    error : PropTypes.bool,
    helptext : PropTypes.string,
    field : PropTypes.string,
    controlOptions : PropTypes.object,
    appName:PropTypes.string
}

export default CustomControl;