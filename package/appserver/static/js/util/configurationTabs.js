import CONFIGURATION_PAGE_MAP from 'app/constants/configurationViewMap';

export function generateTabView(tab) {
    let view = CONFIGURATION_PAGE_MAP[tab.name];
    if(view) return view;
    // TODO return customized view
}
