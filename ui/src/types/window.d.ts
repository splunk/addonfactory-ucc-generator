interface Window {
    open: () => void;
    getMessage: (message: { code: string; error: unknown; state: unknown }) => void;
}
