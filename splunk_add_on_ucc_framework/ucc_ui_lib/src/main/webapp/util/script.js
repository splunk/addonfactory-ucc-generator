// NOTE: if bundle script is put some dir instead of js/build, this function will broken.
export function getBuildDirPath() {
    const scripts = document.getElementsByTagName('script');
    const scriptsCount = scripts.length;
    for (let i = 0; i < scriptsCount; i+=1) {
        const s = scripts[i];
        if(s.src && s.src.match(/js\/build/)) {
            const lastSlashIndex = s.src.lastIndexOf('/');
            return s.src.slice(0, lastSlashIndex);
        }
    }
    return '';
}

// NOTE: The resolve will only be executed if the globalConfig exist
export function loadGlobalConfig() {
    // Get the configuraiton json file in sync mode
    return new Promise((resolve, reject) => {
        fetch(`${getBuildDirPath()}/globalConfig.json`).then((res) => {
            return res.json();     
        }).then((json) => {
            // window.__globalConfig = json;
            resolve(json);
        }).catch((err) => {
            reject(err);
        });
    });
}


