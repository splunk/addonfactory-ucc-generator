/**
 * Placeholder that splunktaucclib's REST handler writes to .conf files in place
 * of encrypted values (RestCredentials.PASSWORD). The real value is stored in
 * passwords.conf and can be retrieved through the add-on endpoint with the
 * `--cred--=1` query parameter by users whose role allows it.
 */
export const ENCRYPTED_FIELD_PLACEHOLDER = '******';
