export const normalEscape = field =>
    field.replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const mappingServiceName = field => {
    return field.indexOf('ta_crowdstrike_falcon_host_inputs') > -1 ?
        "Falcon Host" : "Unknown";
};
