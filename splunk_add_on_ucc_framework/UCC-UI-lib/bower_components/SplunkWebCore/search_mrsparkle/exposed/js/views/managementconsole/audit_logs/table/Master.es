import _ from 'underscore';
import DeployTableView from 'views/managementconsole/deploy/table/Master';

export default DeployTableView.extend({
    moduleId: module.id,

    getEntityColumns() {
        return [
            { label: _('App Name').t(), sortKey: 'key.name', className: 'col-entity-name' },
        ];
    },

    getDeployColumns() {
        return [
            { label: _('Deploy Time').t(), sortKey: 'deployedOn', className: 'col-deployed-on' },
            { label: _('User').t(), sortKey: 'deployedBy', className: 'col-deployed-by' },
        ];
    },
});