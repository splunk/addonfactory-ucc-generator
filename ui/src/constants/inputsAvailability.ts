/**
 * Constants used by UCC's Inputs-unavailable gate.
 *
 * The library-side gate (splunktaucclib `admin_external.AdminExternalHandler`)
 * fires on Classic Splunk Cloud Search Heads and Search Head Clusters, where
 * `inputs.conf.spec` is stripped from add-ons and modular-input schemes are
 * unregistered. In that environment the gate short-circuits every input
 * service GET to return HTTP 200 with an empty list and a single WARN
 * message whose text starts with `INPUTS_UNAVAILABLE_MARKER`.
 *
 * UCC inspects responses for that marker to decide whether to render the
 * normal Inputs UI or `<InputsUnavailable>`. Keeping the marker and the
 * full message colocated here lets both sides of the contract evolve
 * together: the library can `import` `INPUTS_UNAVAILABLE_MARKER` from its
 * own constants module and UCC can match on the same string.
 *
 * The marker is intentionally a stable, user-readable prefix of the
 * message itself (no hidden sentinel) so older UCC builds that don't gate
 * still show a sensible WARN to operators.
 */

/**
 * Stable substring that identifies a gate-fired WARN message.
 *
 * Detection is a `String.prototype.includes()` check, so any future
 * rewording of the trailing copy is safe as long as this prefix is
 * preserved verbatim.
 */
export const INPUTS_UNAVAILABLE_MARKER = 'Inputs cannot be configured on this Search Head';

/**
 * Full, user-facing message rendered on the Inputs Unavailable page.
 * The library-side WARN message must begin with `INPUTS_UNAVAILABLE_MARKER`;
 * otherwise UCC falls back to the response's WARN text verbatim.
 */
export const INPUTS_UNAVAILABLE_MESSAGE =
    `${INPUTS_UNAVAILABLE_MARKER}. ` +
    'Inputs for this add-on must be configured on the Inputs Data Manager (IDM) ' +
    'instance. For more details, refer to the Splunk Cloud documentation.';

/** Heading shown above the message. */
export const INPUTS_UNAVAILABLE_HEADING = 'Inputs unavailable on this Search Head';
