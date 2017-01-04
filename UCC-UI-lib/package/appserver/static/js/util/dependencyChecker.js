import _ from 'lodash';

export function setCollectionRefCount(collection, refCollectionObjList, configModeObjlList, refTargetField) {
    collection.models.forEach(model => {
        let count = 0;

        (refCollectionObjList || []).forEach(({value: refCollection, dependencyList}) => {
            refCollection.models.forEach(d => {
                const realField = _.get(
                    _.find(dependencyList, d => d.referenceName === refTargetField),
                    'targetField'
                );
                if (realField) {
                    if (model.entry.attributes.name === d.entry.content.attributes[realField]) {
                        count++;
                    }
                }
            });
        });

        (configModeObjlList || []).forEach(({value: refModel, dependencyList}) => {
            const realField = _.get(
                _.find(dependencyList, d => d.referenceName === refTargetField),
                'targetField'
            );
            if (realField) {
                if (model.entry.attributes.name === refModel.entry.content.attributes[realField]) {
                    count++;
                }
            }
        });

        model.entry.content.attributes.refCount = count;
    });
}
