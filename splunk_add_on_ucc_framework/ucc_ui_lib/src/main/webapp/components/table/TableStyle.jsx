import styled from 'styled-components';
import Button from '@splunk/react-ui/Button';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';

export const ActionButtonComponent = styled(Button)`
    margin: 0px 5px;
`;

export const WaitSpinnerWrapper = styled(WaitSpinner)`
    position: fixed;
    top: 50%;
    left: 50%;
`;
