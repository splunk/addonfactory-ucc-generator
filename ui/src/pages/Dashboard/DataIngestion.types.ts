import type { EventType } from '@splunk/react-events-viewer/types/common-types';

export interface FieldValue {
    value: string;
    count: number;
}

export interface SearchMessage {
    type: string;
    text: string;
}

export interface SearchResponse<TResult = EventType> {
    sid?: string;
    fields: { name: string }[];
    highlighted?: unknown;
    init_offset: number;
    messages: SearchMessage[];
    preview: boolean;
    post_process_count: number;
    results: TResult[];
}
