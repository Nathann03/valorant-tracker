<script>
  import "./app.css";
  import { writable } from "svelte/store";
  import CalendarIcon from "lucide-svelte/icons/calendar";
  import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
  import { Calendar } from "$lib/components/ui/calendar/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { ScrollArea } from "$lib/components/ui/scroll-area/index.js";
  import { Separator } from "$lib/components/ui/separator/index.js";
  import * as Popover from "$lib/components/ui/popover/index.js";
  import * as Card from "$lib/components/ui/card";
  import * as RadioGroup from "$lib/components/ui/radio-group/index.js";
  import * as Select from "$lib/components/ui/select/index.js";
  import * as Dialog from "$lib/components/ui/dialog/index.js";

  import { cn } from "$lib/utils.js";
  import { journalStore } from './store.js';
  import { DateFormatter, today, getLocalTimeZone, parseDate } from "@internationalized/date";
  
  let username = "Nathan";
  let start_date = new Date("2024-07-06");


  // Function to calculate membership duration
  function calculateMembershipDuration(startDate) {
    const currentDate = new Date();
    const diffInMilliseconds = Number(currentDate) - Number(startDate);

    const years = Math.floor(diffInMilliseconds / (1000 * 60 * 60 * 24 * 365));
    const months = Math.floor((diffInMilliseconds % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
    const days = Math.floor((diffInMilliseconds % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));

    return `${years} years, ${months} months, ${days} days`;
  }

  // State for inputs
  let kills = 0;
  let deaths = 0;
  let assists = 0;
  let tiltLevel = 0;
  let mapSelected = [];
  let agentSelected = [];
  let bestGameLink = "";
  let notes = "";
  let detailedNotes = "";
  let mediaFiles = [];

  // Goals store: shared across components
  export const goalsStore = writable({ KDAgoal: 3, tiltGoal: 5 });

  export const tipsStore = writable([
    "Maintain good crosshair placement.",
    "Communicate effectively with your team.",
    "Keep an eye on the mini-map for better map awareness.",
    "Use utility at the right time to gain advantages.",
    "Control your tilt to stay focused."
  ]);

  // State for goals
  let currentTiltAvg = 5;
  let currentKDAAvg = 2.5;
  let KDAgoal = 3;
  let tiltGoal = 5;

  // Subscribe to goalsStore to keep values updated
    $: goalsStore.subscribe(value => {
    KDAgoal = value.KDAgoal;
    tiltGoal = value.tiltGoal;
  });

  // Subscribe to the journalStore to get the saved entries
  let journalEntries = {};
  journalStore.subscribe(value => {
    journalEntries = value;
  });

  // Save the current entry to the store
  function saveEntry() {
  const entry = {
    date: journalDate,  // Include the selected date
    kills,
    deaths,
    assists,
    tiltLevel,
    mapSelected,
    agentSelected,
    bestGameLink,
    notes,
    detailedNotes,
    mediaFiles,
  };

  journalStore.update(entries => {
    const updatedEntries = { ...entries };
    updatedEntries[journalDate.toString()] = entry;
    return updatedEntries;
  });

  // Add the notes to the tips list if populated
  if (notes.trim()) {
    tipsStore.update(tips => {
      const updatedTips = [...tips, notes];
      return updatedTips;
    });
  }

  console.log("Journal entry saved:", journalEntries);
  // Recalculate the overall KDA and tilt averages
  calculateOverallAverages();
}

    // Function to calculate overall KDA and tilt averages
    function calculateOverallAverages() {
    let totalKills = 0;
    let totalDeaths = 0;
    let totalAssists = 0;
    let totalTilt = 0;
    let entryCount = 0;

    for (const date in journalEntries) {
      const entry = journalEntries[date];
      totalKills += Number(entry.kills);
      totalDeaths += Number(entry.deaths);
      totalAssists += Number(entry.assists);
      totalTilt += Number(entry.tiltLevel);
      entryCount++;
    }
    console.log(`Total Kills: ${totalKills}, Total Deaths: ${totalDeaths}, Total Assists: ${totalAssists}, Total Tilt: ${totalTilt}, Entry Count: ${entryCount}`);

    // Calculate the overall KDA ratio
    if (totalDeaths === 0) {
      currentKDAAvg = totalKills + totalAssists;
    } else {
      currentKDAAvg = (totalKills + totalAssists) / totalDeaths;
    }

    // Calculate the overall tilt average
    currentTiltAvg = Number(entryCount) > 0 ? totalTilt / Number(entryCount) : 0;

    console.log(`Overall KDA Avg: ${currentKDAAvg}, Overall Tilt Avg: ${currentTiltAvg}`);
  }

  // Handle goals update and save to the store
  function updateGoals() {
    goalsStore.update(store => ({
      ...store,
      KDAgoal,
      tiltGoal
    }));
    console.log(`Goals updated: KDA = ${KDAgoal}, Tilt = ${tiltGoal}`);
  }

  // Function to handle selected items update
  function handleMapSelectionChange(items) {
    mapSelected = items?.map(item => item.value) || [];
  }

  // Function to handle selected agents
  function handleAgentSelectionChange(items) {
    agentSelected = items?.map(item => item.value) || [];
  }

    // Writable store for the journal date
    /** @type {import("@internationalized/date").DateValue | undefined} */
    export let journalDate = today(getLocalTimeZone());

// Date formatter for display purposes
const df = new DateFormatter("en-US", {
  dateStyle: "long",
});


let selectedDate = journalDate ? parseDate(journalDate.toString()) : undefined;

// Load existing entry for the selected date

  // Function to update the inputs based on the selected journal date
  function updateJournalEntry() {
    if (journalDate) {
      const entry = journalEntries[journalDate];
      if (entry) {
        // Load existing entry values
        kills = entry.kills || 0;
        deaths = entry.deaths || 0;
        assists = entry.assists || 0;
        tiltLevel = entry.tiltLevel || 0;
        mapSelected = entry.mapSelected || [];
        agentSelected = entry.agentSelected || [];
        bestGameLink = entry.bestGameLink || "";
        notes = entry.notes || "";
        detailedNotes = entry.detailedNotes || "";
        mediaFiles = entry.mediaFiles || [];
      } else {
        // Clear the inputs if no journal entry exists for the selected date
        kills = 0;
        deaths = 0;
        assists = 0;
        tiltLevel = 0;
        mapSelected = [];
        agentSelected = [];
        bestGameLink = "";
        notes = "";
        detailedNotes = "";
        mediaFiles = [];
      }
    } else {
      // Clear inputs if journalDate is undefined
      clearInputs();
    }
  }

  // Function to clear inputs
  function clearInputs() {
    kills = 0;
    deaths = 0;
    assists = 0;
    tiltLevel = 0;
    mapSelected = [];
    agentSelected = [];
    bestGameLink = "";
    notes = "";
    detailedNotes = "";
    mediaFiles = [];
  }

</script>


<body class="min-h-screen bg-slate-950 text-white">
  <div class="space-y-6 p-10">

<!-- Top Section: Flex Layout for Name on Left, Goals Centered, and Show Tips Button on Right -->
<div class="flex justify-between items-center p-8 bg-gray-900 rounded-lg shadow-xl border border-gray-700">
  
  <!-- Left Section: Title and Membership Duration -->
  <div class="flex flex-col">
    <!-- Username's Valorant Journal Title -->
    <h2 class="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-yellow-500 shadow-lg shadow-red-500/50">
      {username}'s Valorant Journal
    </h2>
    <!-- Membership Duration -->
    <p class="text-gray-400 text-lg mt-2">Journaling for {calculateMembershipDuration(start_date)}!</p>
  </div>

  <!-- Middle Section: Goals (Tilt Level and KDA Goals) -->
  <div class="flex flex-col items-center justify-center space-y-4">
    <!-- Tilt Level Display -->
    <div class="flex items-center space-x-2">
      <span class="text-lg text-gray-400">Tilt Level Goal:</span>
      <span class="text-xl font-semibold text-yellow-500">{currentTiltAvg}/{tiltGoal}</span>
    </div>

    <!-- KDA Goals Display -->
    <div class="flex items-center space-x-2">
      <span class="text-lg text-gray-400">KDA Goal:</span>
      <span class="text-xl font-semibold text-green-500">{currentKDAAvg}/{KDAgoal}</span>
    </div>
  </div>

<!-- Right Section: Show All Tips Button with Dialog -->

<!-- New Section: Show All Journal Entries Button with Dialog -->
<div class="flex flex-col space-y-4"> <!-- Stacks buttons vertically with spacing -->
  <!-- Show All Tips Button -->
  <Dialog.Root>
    <Dialog.Trigger class={buttonVariants({ variant: "blue" })}>
      Show All Tips
    </Dialog.Trigger>

    <Dialog.Content class="sm:max-w-[425px] bg-gray-900 text-white border border-gray-700 p-6 shadow-lg rounded-lg">
      <Dialog.Header>
        <Dialog.Title>Game Tips</Dialog.Title>
        <Dialog.Description>Review useful tips to improve your gameplay.</Dialog.Description>
      </Dialog.Header>

      <ScrollArea class="h-48 w-full rounded-md border border-gray-700">
        <div class="p-4">
          {#each $tipsStore as tip, index}
            <div class="text-sm">{tip}</div>
            {#if index !== $tipsStore.length - 1}
              <Separator class="my-2 bg-gray-700" />
            {/if}
          {/each}
        </div>
      </ScrollArea>

      <Dialog.Footer>
        <Dialog.Close class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">Close</Dialog.Close>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>

  <!-- Show All Journal Entries Button -->
  <Dialog.Root>
    <Dialog.Trigger class={buttonVariants({ variant: "blue" })}>
      Show All Journal Entries
    </Dialog.Trigger>

    <Dialog.Content class="sm:max-w-[425px] bg-gray-900 text-white border border-gray-700 p-6 shadow-lg rounded-lg">
      <Dialog.Header>
        <Dialog.Title>Journal Entries</Dialog.Title>
        <Dialog.Description>Review all of your saved journal entries.</Dialog.Description>
      </Dialog.Header>

      <ScrollArea class="h-48 w-full rounded-md border border-gray-700">
        <div class="p-4">
          {#each Object.entries(journalEntries) as [date, entry]}
            <div class="text-sm">
              <strong>{new Date(date).toLocaleDateString()}:</strong> 
              Kills: {entry.kills}, Deaths: {entry.deaths}, Assists: {entry.assists}, Tilt: {entry.tiltLevel}<br />
              Maps played: {entry.mapSelected.join(", ")}<br />
              Agents played: {entry.agentSelected.join(", ")}<br />
              Game Link: {entry.bestGameLink}<br />
              Detailed Notes: {entry.detailedNotes}
            </div>
            <Separator class="my-2 bg-gray-700" />
          {/each}
        </div>
      </ScrollArea>

      <Dialog.Footer>
        <Dialog.Close class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md">Close</Dialog.Close>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Root>
</div>
</div>

<Card.Root class="bg-gray-900 text-white border border-gray-700 rounded-lg shadow-lg">
  <!-- Card Header with Title and Calendar -->
  <Card.Header class="border-b border-gray-700 pb-4 flex justify-between items-center">
    <div class="flex flex-col">
      <Card.Title class="text-red-500">Today's Game Stats</Card.Title>
      <Card.Description class="text-gray-400">Record all your Valorant game details!</Card.Description>
    </div>
    
    <!-- Calendar Section -->
    <div class="flex flex-col items-center justify-center">
      <Popover.Root>
        <Popover.Trigger
          class={cn(
            buttonVariants({ variant: "outline" }),
            "w-[240px] justify-start text-left font-normal bg-gray-900 text-white border border-gray-700 hover:bg-gray-800 rounded-lg"
          )}
        >
          <CalendarIcon class="mr-2 h-4 w-4 text-white" />
          {selectedDate ? df.format(selectedDate.toDate(getLocalTimeZone())) : "Pick a date"}
        </Popover.Trigger>
        <Popover.Content class="w-auto p-0 bg-gray-900 border border-gray-700 rounded-lg shadow-md" align="start">
          <Calendar
            bind:value={selectedDate}
            class="bg-gray-900 text-white" 
            isDateDisabled={(currDate) => {
              const currDateObj = currDate.toDate(getLocalTimeZone());
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return currDateObj > today; // Disable future dates
            }}
            dayClass={(date) => {
              const baseClass = "cursor-pointer p-2 hover:bg-gray-700 rounded-lg"; // Add hover and padding for better usability
              if (date.isSelected) {
                return `${baseClass} bg-red-500 text-white`; // Highlight the selected date in red for better visibility
              } else if (date.isToday) {
                return `${baseClass} bg-gray-800 text-yellow-500`; // Highlight today's date in yellow
              }
              return baseClass;
            }}
            onValueChange={(value) => {
              if (value === undefined) {
                journalDate = undefined; // Clear journalDate if no value is selected
              } else {
                journalDate = value.toDate(getLocalTimeZone()).toISOString(); // Store selected date in ISO format
                updateJournalEntry(); // Call the function to update inputs based on the journal date
              }
            }}
          />
        </Popover.Content>
        <input hidden bind:value={journalDate} name="journal-date" />
      </Popover.Root>
      <p class="text-white bg-gray-900 border-gray-700 rounded-lg">
        Current journal date
      </p>
    </div>
  </Card.Header>

      
      <!-- Content area with improved layout -->
      <Card.Content class="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
        
        <!-- Left Side: Inputs -->
        <div class="space-y-4">
          <!-- Map Selector with scroll and multi-select -->
          <div class="grid gap-2">
            <Label for="map" class="text-white">Maps Played Today</Label>
            <Select.Root multiple={true} onSelectedChange={handleMapSelectionChange}>
              <Select.Trigger aria-label="Map" class="bg-gray-800 border border-gray-700 text-white">
                <Select.Value placeholder="Select a map" />
              </Select.Trigger>
              <Select.Content class="bg-gray-900 border border-gray-700 text-white max-h-40 overflow-y-scroll">
                {#each ["Abyss", "Ascent", "Bind", "Breeze", "Fracture", "Haven", "Icebox", "Lotus", "Pearl", "Split", "Sunset"] as map}
                  <Select.Item value={map} label={map} class="text-white hover:bg-gray-700">
                    {map}
                  </Select.Item>
                {/each}
              </Select.Content>

              <!-- Bind selected values to hidden inputs -->
              {#each mapSelected as selectedMap, i}
                <input hidden aria-hidden="true" name="mapSelected" value={selectedMap} />
              {/each}
            </Select.Root>
          </div>

          <!-- Agent Selector with scroll and multi-select -->
          <div class="grid gap-2">
            <Label for="agent" class="text-white">Agents Played Today</Label>
            <Select.Root multiple={true} onSelectedChange={handleAgentSelectionChange}>
              <Select.Trigger id="agent" aria-label="Agent" class="bg-gray-800 border border-gray-700 text-white">
                <Select.Value placeholder="Select an agent" />
              </Select.Trigger>
              <Select.Content class="bg-gray-900 border border-gray-700 text-white max-h-40 overflow-y-scroll">
                {#each [
                  "Astra",
                  "Breach",
                  "Brimstone",
                  "Chamber",
                  "Clove",
                  "Cypher",
                  "Deadlock",
                  "Fade",
                  "Gekko",
                  "Harbor",
                  "Iso",
                  "Jett",
                  "KAYO",
                  "Killjoy",
                  "Neon",
                  "Omen",
                  "Phoenix",
                  "Raze",
                  "Reyna",
                  "Sage",
                  "Skye",
                  "Sova",
                  "Vyse",
                  "Viper",
                  "Yoru"
                ] as agent}
                  <Select.Item value={agent} label={agent} class="text-white hover:bg-gray-700">
                    {agent}
                  </Select.Item>
                {/each}
              </Select.Content>

              <!-- Bind selected values to hidden inputs -->
              {#each agentSelected as selectedAgent, i}
                <input hidden aria-hidden="true" name="agentSelected" value={selectedAgent} />
              {/each}
            </Select.Root>
          </div>

    <!-- Inputs for Kills, Deaths, Assists -->
    <div class="grid grid-cols-3 gap-2">
      <div>
        <Label for="kills" class="text-white">Total Kills</Label>
        <Input id="kills" type="number" bind:value={kills} placeholder="0"  class="bg-gray-800 border border-gray-700 text-white placeholder-gray-500" />
      </div>
      <div>
        <Label for="deaths" class="text-white">Total Deaths</Label>
        <Input id="deaths" type="number" bind:value={deaths} placeholder="0"  class="bg-gray-800 border border-gray-700 text-white placeholder-gray-500" />
      </div>
      <div>
        <Label for="assists" class="text-white">Total Assists</Label>
        <Input id="assists" type="number" bind:value={assists} placeholder="0"  class="bg-gray-800 border border-gray-700 text-white placeholder-gray-500" />
      </div>
    </div>

          <!-- Best Game Link -->
          <div class="grid gap-2">
            <Label for="bestGameLink" class="text-white">Best Game Link</Label>
            <Input id="bestGameLink" type="url" bind:value={bestGameLink} placeholder="https://tracker.gg/abcd1234" class="bg-gray-800 border border-gray-700 text-white placeholder-gray-500" />
          </div>

          <!-- Tilt Level -->
          <div class="grid gap-2">
            <Label for="tilt" class="text-white">Tilt Level (0-10)</Label>
            <Input id="tilt" type="number" bind:value={tiltLevel} min="0" max="10" placeholder="0" class="bg-gray-800 border border-gray-700 text-white placeholder-gray-500" />
          </div>

          <!-- Things to Remember -->
          <div class="grid gap-2">
            <Label for="notes" class="text-white">Tips to Remember</Label>
            <Input id="notes" type="text" bind:value={notes} placeholder="Short notes..." class="bg-gray-800 border border-gray-700 text-white placeholder-gray-500" />
          </div>

          <!-- File Upload Section for Images/Videos -->
          <div class="grid gap-2">
            <Label for="media" class="text-white">Upload Images or Videos</Label>
            <div class="relative">
              <Input id="media" type="file" bind:value={mediaFiles} multiple class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
              <Button class="bg-gray-800 border border-gray-600 text-white hover:bg-gray-700 py-2 px-4 w-full">
                Choose Files
              </Button>
            </div>
            <small class="text-gray-400">Accepted formats: jpg, png, mp4 (Max 50MB)</small>
          </div>
        </div>
        
        <!-- Right Side: Textarea -->
        <div class="pl-0 md:pl-4">
          <Label for="detailedNotes" class="text-white">Detailed Game Notes</Label>
          <textarea id="detailedNotes" bind:value={detailedNotes} rows="10" placeholder="Write your detailed game notes here..." class="mt-1 w-full h-5/6 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 p-3 rounded-md resize-none mb-4"></textarea>
        </div>
      </Card.Content>

      <!-- Footer with Two Buttons -->

      <Card.Footer class="p-4 border-t border-gray-700 flex justify-between">
        <!-- Dialog Component -->
        <Dialog.Root>
          <!-- Trigger Button to Open Dialog -->
          <Dialog.Trigger class={buttonVariants({ variant: "green" })}>
            Edit Goals
          </Dialog.Trigger>

          <!-- Dialog Content -->
          <Dialog.Content class="sm:max-w-[425px]">
            <Dialog.Header>
              <Dialog.Title>Edit Goals</Dialog.Title>
              <Dialog.Description>
                Update your KDA and Tilt level goals here.
              </Dialog.Description>
            </Dialog.Header>

            <div class="grid gap-4 py-4">
              <!-- Input for KDA Goal -->
              <div class="grid grid-cols-4 items-center gap-4">
                <Label for="kdaGoal" class="text-white text-right">KDA Goal</Label>
                <Input
                  id="kdaGoal"
                  type="number"
                  min="1"
                  bind:value={KDAgoal}
                  class="col-span-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
                />
              </div>

              <!-- Input for Tilt Goal -->
              <div class="grid grid-cols-4 items-center gap-4">
                <Label for="tiltGoal" class="text-white text-right">Tilt Goal</Label>
                <Input
                  id="tiltGoal"
                  type="number"
                  min="1"
                  bind:value={tiltGoal}
                  class="col-span-3 bg-gray-800 border border-gray-700 text-white placeholder-gray-500"
                />
              </div>
            </div>

            <Dialog.Footer>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Root>
      
        <!-- Save Entry Button -->
        <Button class="bg-red-500 hover:bg-red-600 text-white" on:click={saveEntry}>
          Save Entry
        </Button>
      </Card.Footer>
    </Card.Root>
  </div>
  <div class="flex ml-8 mr-10">
  <p>Note: Upload Images or Videos does not work since stores cannot hold images. </p>
  <p>Note 2: When changing the journal date, example journal entries will not show up, but personally written ones will when selecting the date and I have no idea why.</p>
  <p>Note 3: When changing to a journal date you wrote that should change input region with populated values, multiselect will not be populated IDK why.</p>
  </div>
</body>








