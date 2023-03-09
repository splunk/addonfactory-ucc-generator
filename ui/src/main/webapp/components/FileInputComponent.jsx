import React, { useState } from 'react';
import File from '@splunk/react-ui/File';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import FileConstants from '../constants/constant';
import { getFormattedMessage } from '../util/messageUtil';

const FileWrapper = styled(File)`
    width: 320px !important;
    > div[class*='FileStyles__StyledHelp-'] {
        margin-bottom: 0px;
    }
`;

function isValidFile(fileType, fileSize, supportedFileTypes, maxFileSize) {
    if (!supportedFileTypes.includes(fileType)) {
        return (
            <span style={{ color: 'red' }}>
                {getFormattedMessage(supportedFileTypes.length === 1 ? 28 : 24, [
                    supportedFileTypes.join(', '),
                ])}
            </span>
        );
    }
    if (fileSize > maxFileSize) {
        return <span style={{ color: 'red' }}>{getFormattedMessage(25, [maxFileSize])}</span>;
    }
    return true;
}

function FileInputComponent(props) {
    const { field, disabled, controlOptions, handleChange } = props;
    const {
        fileSupportMessage,
        supportedFileTypes,
        maxFileSize = FileConstants.FILE_MAX_SIZE,
    } = controlOptions;

    const fileReader = new FileReader();
    const textDecoder = new TextDecoder(); // default utf-8

    const [fileName, setFileName] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const handleAddFiles = (files) => {
        if (files.length) {
            const file = files[0];

            if (fileReader.readyState === 1) {
                fileReader.abort();
            }

            fileReader.readAsArrayBuffer(file);

            fileReader.onload = () => {
                const isValid = isValidFile(
                    file.name.split('.').pop(),
                    file.size / 1024,
                    supportedFileTypes,
                    maxFileSize
                );
                if (isValid === true) {
                    setErrorMsg('');
                    try {
                        handleChange(field, textDecoder.decode(fileReader.result));
                    } catch (err) {
                        // eslint-disable-next-line no-console
                        console.log(err);
                    }
                } else {
                    setErrorMsg(isValid);
                    handleChange(field, '##INVALID_FILE##');
                }
                setFileName(file.name);
            };
        }
    };

    const handleRemoveFile = () => {
        if (fileReader.readyState === 1) {
            fileReader.abort();
        }
        setFileName(null);
        handleChange(field, '');
        setErrorMsg('');
    };

    return (
        <FileWrapper
            key={field}
            onRequestAdd={handleAddFiles}
            onRequestRemove={handleRemoveFile}
            supportsMessage={<> {fileSupportMessage} </>}
            disabled={disabled}
            help={errorMsg}
            error={!!errorMsg}
        >
            {fileName && <File.Item name={fileName} />}
        </FileWrapper>
    );
}

FileInputComponent.propTypes = {
    field: PropTypes.string,
    controlOptions: PropTypes.object,
    disabled: PropTypes.bool,
    handleChange: PropTypes.func,
};

export default FileInputComponent;
