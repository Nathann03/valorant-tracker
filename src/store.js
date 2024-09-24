import { writable } from 'svelte/store';

// Initialize an empty object to store journal entries by date
export const journalStore = writable({});