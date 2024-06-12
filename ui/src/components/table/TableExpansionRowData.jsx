import React from 'react';
import DL from '@splunk/react-ui/DefinitionList';
import { _ } from '@splunk/ui-utils/i18n';

export function getExpansionRowData(row, moreInfo) {
    const DefinitionLists = [];

    if (moreInfo?.length) {
        moreInfo.forEach((val) => {
            const label = _(val.label);
            // remove extra rows which are empty in moreInfo
            if (val.field in row && row[val.field] !== null && row[val.field] !== '') {
                DefinitionLists.push(<DL.Term key={val.field}>{label}</DL.Term>);
                DefinitionLists.push(
                    <DL.Description key={`${val.field}_decr`}>
                        {val.mapping && val.mapping[row[val.field]]
                            ? val.mapping[row[val.field]]
                            : String(row[val.field])}
                    </DL.Description>
                );
            }
        });
    }
    return DefinitionLists;
}
