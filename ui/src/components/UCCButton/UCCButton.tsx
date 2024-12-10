import React, { ComponentProps } from 'react';

import Button from '@splunk/react-ui/Button';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import styled from 'styled-components';

const StyledButton = styled(Button)`
    min-width: 80px;
`;

type Props = {
    label: string;
    appearance?: 'default' | 'secondary' | 'primary' | 'destructive' | 'pill' | 'toggle' | 'flat';
    disabled?: boolean;
    loading?: boolean;
} & Partial<ComponentProps<typeof Button>>;

export const UCCButton = React.forwardRef<HTMLButtonElement, Props>(
    ({ disabled, loading, appearance, ...rest }, ref) => (
        <StyledButton
            {...rest}
            elementRef={ref}
            icon={loading ? <WaitSpinner /> : rest.icon}
            label={loading ? '' : rest.label} // do not display text nor icon when loading
            appearance={appearance || 'primary'}
            disabled={(disabled || loading) && 'dimmed'}
        /> // disable when loading
    )
);
