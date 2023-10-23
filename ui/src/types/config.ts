export interface UnifiedConfig {
    pages: {
        inputs: {
            services: {
                name: string;
                title: string;
                subTitle?: string;
                hasSubmenu?: boolean;
            }[];
            groupsMenu?: {
                groupName: string;
                groupTitle: string;
                groupServices?: string[]; // should exist in services.name
            }[];
            menu?: {
                src: string;
                type?: 'external' | 'internal';
            };
        };
    };
    meta: {
        app?: string;
        custom_rest?: string;
        nullStr?: string;
        stanzaPrefix?: string;
    };
}
