import { writable } from 'svelte/store';

const sampleEntries = {
    "2024-07-10": {
      kills: 20,
      deaths: 5,
      assists: 10,
      tiltLevel: 2,
      mapSelected: ["Map A"],
      agentSelected: ["Agent 1"],
      bestGameLink: "http://example.com/game1",
      notes: "Played really well!",
      detailedNotes: "I focused on my positioning and communication.",
      mediaFiles: []
    },
    "2024-08-15": {
      kills: 15,
      deaths: 10,
      assists: 5,
      tiltLevel: 3,
      mapSelected: ["Map B"],
      agentSelected: ["Agent 2"],
      bestGameLink: "http://example.com/game2",
      notes: "Could have played better.",
      detailedNotes: "Need to work on my decision-making.",
      mediaFiles: []
    },
    "2024-09-05": {
      kills: 10,
      deaths: 2,
      assists: 8,
      tiltLevel: 1,
      mapSelected: ["Map C"],
      agentSelected: ["Agent 3"],
      bestGameLink: "http://example.com/game3",
      notes: "Great teamwork!",
      detailedNotes: "My teammates and I coordinated perfectly.",
      mediaFiles: []
    }
  };

// Initialize an empty object to store journal entries by date
export const journalStore = writable(sampleEntries);