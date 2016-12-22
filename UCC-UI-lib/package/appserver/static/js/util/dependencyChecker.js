export function setCollectionRefCount(collection, refCollectionList, configModelList, refTargetField) {
    collection.models.forEach(model => {
        let count = 0;
        refCollectionList.forEach(collection => {
            collection.models.forEach(d => {
                if (model.entry.attributes.name === d.entry.content.attributes[refTargetField]) {
                    count++;
                }
            });
        });
        model.entry.content.attributes.refCount = count;
    });
}
