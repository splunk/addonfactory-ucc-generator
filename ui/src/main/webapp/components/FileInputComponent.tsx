import React, { ReactElement, useState } from 'react';
import File from '@splunk/react-ui/File';
import styled from 'styled-components';

import FileConstants from '../constants/fileInputConstant';
import { getFormattedMessage } from '../util/messageUtil';

const FileWrapper = styled(File)`
    width: 320px !important;
    > div[class*='FileStyles__StyledHelp-'] {
        margin-bottom: 0px;
    }
`;

interface FileInputComponentProps {
    field: string;
    controlOptions: {
        fileSupportMessage?: string;
        supportedFileTypes: string[];
        maxFileSize?: number;
    };
    disabled: boolean;
    handleChange: (field: string, data: string) => void;
    encrypted?: boolean;
    fileNameToDisplay?: string;
}

function isValidFile(
    fileType: string | undefined,
    fileSize: number,
    supportedFileTypes: string[],
    maxFileSize: number
) {
    if (!fileType || !supportedFileTypes.includes(fileType)) {
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

function FileInputComponent(props: FileInputComponentProps) {
    const { field, disabled, controlOptions, handleChange, fileNameToDisplay, encrypted } = props;
    const {
        fileSupportMessage,
        supportedFileTypes,
        maxFileSize = FileConstants.FILE_MAX_SIZE,
    } = controlOptions;

    const fileReader = new FileReader();
    const textDecoder = new TextDecoder(); // default utf-8

    /*
     use fileNameToDisplay during editing to get
     the possibility of removal previously added file
    */
    const [fileName, setFileName] = useState<string | null>(fileNameToDisplay || '');

    /* 
      if the file data is encrypted and we display its name
      then we display error message "file needs to be reuploaded"
      as there is no access to data inside due to encription
     */
    const [errorMsg, setErrorMsg] = useState<ReactElement | string>(
        fileNameToDisplay && encrypted ? FileConstants.REUPLOAD_MESSAGE : ''
    );

    const handleAddFiles = (files: File[]) => {
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
                        if (fileReader.result && typeof fileReader.result !== 'string') {
                            handleChange(field, textDecoder.decode(fileReader.result));
                        }
                    } catch (err) {
                        // eslint-disable-next-line no-console
                        console.log(err);
                    }
                } else {
                    setErrorMsg(isValid);
                    handleChange(field, FileConstants.INVALID_FILE_MESSAGE);
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

export default FileInputComponent;
