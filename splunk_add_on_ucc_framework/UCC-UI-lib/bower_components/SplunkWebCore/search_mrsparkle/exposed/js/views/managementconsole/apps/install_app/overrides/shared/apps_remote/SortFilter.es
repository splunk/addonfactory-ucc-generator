import SortFilterView from 'views/shared/apps_remote/SortFilter';

export default SortFilterView.extend({
    moduleId: module.id,

    // In App Management, we always sort by install method.
    getSortItems() {
        return [];
    },
});