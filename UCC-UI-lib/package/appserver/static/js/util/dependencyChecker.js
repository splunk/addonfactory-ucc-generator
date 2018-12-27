import _ from 'lodash';

export function setCollectionRefCount(
    collection,
    refCollectionObjList,
    configModeObjlList,
    refTargetField
) {
    collection.models.forEach(model => {
        let count = 0;

        (refCollectionObjList || []).forEach(
            ({value: refCollection, dependencyList}) => {
                refCollection.models.forEach(d => {
                    const realField = _.get(
                        _.find(
                            dependencyList,
                            d => d.referenceName === refTargetField
                        ),
                        'targetField'
                    );
                    if (realField) {
                        if (model.entry.get('name') ===
                                d.entry.content.get(realField)) {
                            count++;
                        }
                    }
                });
            }
        );

        (configModeObjlList || []).forEach(
            ({value: refModel, dependencyList}) => {
                const realField = _.get(
                    _.find(
                        dependencyList,
                        d => d.referenceName === refTargetField
                    ),
                    'targetField'
                );
                if (realField) {
                    if (model.entry.get('name') ===
                            refModel.entry.content.get(realField)) {
                        count++;
                    }
                }
            }
        );
        model.entry.content.set('refCount', count);
    });
}
