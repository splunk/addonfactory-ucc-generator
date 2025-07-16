import React, { ReactElement, useCallback, useContext, useState } from 'react';

import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import Switch from '@splunk/react-ui/Switch';
import Table from '@splunk/react-ui/Table';
import ButtonGroup from '@splunk/react-ui/ButtonGroup';
import Tooltip from '@splunk/react-ui/Tooltip';
import Pencil from '@splunk/react-icons/Pencil';
import Magnifier from '@splunk/react-icons/Magnifier';
import Clone from '@splunk/react-icons/enterprise/Clone';
import Trash from '@splunk/react-icons/enterprise/Trash';
import styled from 'styled-components';
import { _ } from '@splunk/ui-utils/i18n';

import { ActionButtonComponent } from './CustomTableStyle';
import { getTableCellValue } from './table.utils';
import AcceptModal from '../AcceptModal/AcceptModal';
import { RowDataFields } from '../../context/TableContext';
import CustomTableCell from './CustomTableCell';
import CustomComponentContext from '../../context/CustomComponentContext';

const TableCellWrapper = styled(Table.Cell)`
    padding: 2px;
`;

const SwitchWrapper = styled.div`
    display: flex;

    .toggle_switch {
        padding: 0;
        margin-right: 10px;
    }
`;

interface CustomTableRowProps {
    row: RowDataFields;
    readonly?: boolean;
    columns: Array<{ customCell?: { src?: string; type?: string }; field: string }>;
    rowActions: string[];
    headerMapping: Record<string, Record<string, string> | undefined>;
    handleToggleActionClick: (row: RowDataFields) => void;
    handleEditActionClick: (row: RowDataFields) => void;
    handleCloneActionClick: (row: RowDataFields) => void;
    handleDeleteActionClick: (row: RowDataFields) => void;
    useInputToggleConfirmation?: boolean;
}

interface CellHeader {
    field: string;
    customCell?: { src?: string; type?: string };
}

function CustomTableRow(props: CustomTableRowProps) {
    const {
        row,
        columns,
        rowActions,
        headerMapping,
        handleToggleActionClick,
        handleEditActionClick,
        handleCloneActionClick,
        handleDeleteActionClick,
        useInputToggleConfirmation,
    } = props;

    const [displayAcceptToggling, setDisplayAcceptToggling] = useState(false);
    const componentContext = useContext(CustomComponentContext);

    const toggleRef = React.createRef<HTMLDivElement>();

    const getCustomCell = (customRow: RowDataFields, header: CellHeader) => {
        return (
            header.customCell?.src &&
            React.createElement(CustomTableCell, {
                serviceName: row.serviceName,
                field: header.field,
                row: customRow,
                fileName: header.customCell.src,
                type: header.customCell.type,
                customComponentContext: componentContext,
            })
        );
    };

    const rowActionsPrimaryButton = useCallback(
        (selectedRow: RowDataFields, header: CellHeader) => (
            <TableCellWrapper data-column="actions" key={header.field}>
                <ButtonGroup>
                    {!props.readonly && rowActions.includes('edit') && (
                        <Tooltip content={_('Edit')}>
                            <ActionButtonComponent
                                aria-label={_('Edit')}
                                icon={<Pencil />}
                                onClick={() => handleEditActionClick(selectedRow)}
                                className="editBtn"
                            />
                        </Tooltip>
                    )}
                    {rowActions.includes('clone') && (
                        <Tooltip content={_('Clone')}>
                            <ActionButtonComponent
                                aria-label={_('Clone')}
                                icon={<Clone size={1} />}
                                onClick={() => handleCloneActionClick(selectedRow)}
                                className="cloneBtn"
                            />
                        </Tooltip>
                    )}
                    {rowActions.includes('search') && (
                        <Tooltip
                            content={_(
                                `Go to search for events associated with ${selectedRow.name}`
                            )}
                        >
                            <ActionButtonComponent
                                aria-label={_(
                                    `Go to search for events associated with ${selectedRow.name}`
                                )}
                                icon={<Magnifier />}
                                to={`/app/search/search?q=search%20index%3D_internal%20source%3D*${selectedRow.name}*`}
                                className="searchBtn"
                                inline={false}
                                target="_blank"
                            />
                        </Tooltip>
                    )}
                    {!props.readonly && rowActions.includes('delete') && (
                        <Tooltip content={_('Delete')}>
                            <ActionButtonComponent
                                aria-label={_('Delete')}
                                icon={<Trash size={1} />}
                                onClick={() => handleDeleteActionClick(selectedRow)}
                                className="deleteBtn"
                            />
                        </Tooltip>
                    )}
                </ButtonGroup>
            </TableCellWrapper>
        ),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [handleEditActionClick, handleCloneActionClick, handleDeleteActionClick]
    );

    const handleAcceptModal = (accepted: boolean) => {
        if (accepted) {
            handleToggleActionClick(row);
        }
        setDisplayAcceptToggling(false);
    };

    const verifyToggleActionClick = () => {
        setDisplayAcceptToggling(true);
    };

    let statusContent: string | ReactElement = row.disabled ? 'Inactive' : 'Active';
    // eslint-disable-next-line no-underscore-dangle
    if (row.__toggleShowSpinner) {
        statusContent = <WaitSpinner />;
    } else if (headerMapping.disabled?.[String(row.disabled)]) {
        statusContent = headerMapping.disabled[String(row.disabled)];
    }

    const returnFocus = () => {
        if (toggleRef.current?.firstChild instanceof HTMLButtonElement) {
            toggleRef.current.firstChild.focus();
        }
    };

    // Fix set of props are passed to Table.Row element
    return (
        <Table.Row // nosemgrep: typescript.react.security.audit.react-props-injection.react-props-injection, typescript.react.best-practice.react-props-spreading.react-props-spreading
            key={row.name || row.id}
            {...props}
            aria-label={`row-${row.name || row.id}`}
        >
            {columns &&
                columns.length &&
                columns.map((header) => {
                    let cellHTML: string | ReactElement = '';
                    if (header.customCell && header.customCell.src) {
                        cellHTML = (
                            <Table.Cell data-column={header.field} key={header.field}>
                                {header.customCell && getCustomCell(row, header)}
                            </Table.Cell>
                        );
                    } else if (header.field === 'disabled') {
                        const activeText = headerMapping?.disabled?.false
                            ? headerMapping.disabled.false
                            : 'Active';

                        const inactiveText = headerMapping?.disabled?.true
                            ? headerMapping.disabled.true
                            : 'Inactive';

                        cellHTML = (
                            <Table.Cell data-column={header.field} key={header.field}>
                                <SwitchWrapper>
                                    {/* TODO: use toggleRef from SUI 5 instead of elementRef */}
                                    <Switch
                                        elementRef={toggleRef}
                                        key={row.name}
                                        value={row.disabled}
                                        onClick={() =>
                                            useInputToggleConfirmation
                                                ? verifyToggleActionClick()
                                                : handleToggleActionClick(row)
                                        }
                                        selected={!row.disabled}
                                        disabled={
                                            // eslint-disable-next-line no-underscore-dangle
                                            Boolean(row.__toggleShowSpinner) || props.readonly
                                        }
                                        appearance="toggle"
                                        className="toggle_switch"
                                        selectedLabel={_(
                                            headerMapping?.disabled?.false
                                                ? headerMapping.disabled.false
                                                : 'Active'
                                        )}
                                        unselectedLabel={_(
                                            headerMapping?.disabled?.true
                                                ? headerMapping.disabled.true
                                                : 'Inactive'
                                        )}
                                    />
                                    <span data-test="status">{statusContent}</span>
                                    {useInputToggleConfirmation && (
                                        <AcceptModal
                                            returnFocus={returnFocus}
                                            message={`Do you want to make ${row.name} input ${
                                                row.disabled ? activeText : inactiveText
                                            }?`}
                                            open={displayAcceptToggling}
                                            handleRequestClose={handleAcceptModal}
                                            title={`Make input ${
                                                row.disabled ? activeText : inactiveText
                                            }?`}
                                            declineBtnLabel="No"
                                            acceptBtnLabel="Yes"
                                        />
                                    )}
                                </SwitchWrapper>
                            </Table.Cell>
                        );
                    } else if (header.field === 'actions') {
                        cellHTML = rowActionsPrimaryButton(row, header);
                    } else {
                        cellHTML = (
                            <Table.Cell
                                style={{ wordBreak: 'break-word' }}
                                data-column={header.field}
                                key={header.field}
                            >
                                {getTableCellValue(row, header.field, headerMapping[header.field])}
                            </Table.Cell>
                        );
                    }
                    return cellHTML;
                })}
        </Table.Row>
    );
}

export default React.memo(CustomTableRow);
