import CONFIGURATION_PAGE_MAP from 'app/constants/configurationViewMap';
import CustomizedTabView from 'app/views/Configuration/CustomizedTabView'

export function generateTabView(tab) {
    let view = CONFIGURATION_PAGE_MAP[tab.name];
    return view ? view : CustomizedTabView;
}
