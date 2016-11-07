// The callback will only be executed if the globalConfig exsit
export function loadGlobalConfig(callback)
{
    // Adding the script tag to the head as suggested before
    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `${getBuildDirPath()}/globalConfig.js`;

    // There are several events for cross browser compatibility.
    script.onreadystatechange = callback;
    script.onload = callback;

    // Fire the loading
    head.appendChild(script);
}

export function getBuildDirPath() {
    const scripts = document.getElementsByTagName("script");

    const scriptsCount = scripts.length;
    for (let i = 0; i < scriptsCount; i++) {
        const s = scripts[i];
        if(s.src && s.src.match(/js\/build/)) {
            const lastSlashIndex = s.src.lastIndexOf('/');
            return s.src.slice(0, lastSlashIndex);
        }
    }

    return '';
}
