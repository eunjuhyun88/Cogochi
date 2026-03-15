const familyDefinitions = [
  {
    id: "dino",
    label: "Imported Dinos",
    rosterMeta: "Imported pack mapped into Cogochi roles. Click a companion to inspect and train it.",
    partyMeta: "External pixel pack translated into a clean four-role squad.",
  },
  {
    id: "coglet",
    label: "Original Coglets",
    rosterMeta: "Cogochi-native mascot family expanded into four role silhouettes.",
    partyMeta: "Original mascot set showing how one base silhouette can cover the full squad.",
  },
];

const agents = [
  {
    id: "doux",
    family: "dino",
    name: "Doux",
    role: "SCOUT",
    specialty: "breakout scout",
    mood: "restless",
    focus: "trend timing",
    bond: "71",
    memory: "clean",
    timing: "early but patient",
    risk: "light feet",
    fantasy: "Runs slightly ahead of the squad, tests the slope, and calls whether the lane is safe to press.",
    lesson: "Last replay: bailed out before a fake breakout snapped back into the range box.",
    status: "Ready to rehearse a cleaner breakout entry.",
    sheet: "../assets/dino/dino-doux.png",
    squadNote: "Leads path checks and flags thin support before the team commits.",
    isActive: true,
  },
  {
    id: "mort",
    family: "dino",
    name: "Mort",
    role: "ANALYST",
    specialty: "memory reader",
    mood: "quiet",
    focus: "retrieval quality",
    bond: "66",
    memory: "layered",
    timing: "measured",
    risk: "balanced",
    fantasy: "Pulls prior failures into the current slice and explains why this setup looks familiar.",
    lesson: "Last replay: recognized a repeated wick trap and slowed the team before a bad long.",
    status: "Ready to compact old notes into a sharper doctrine cue.",
    sheet: "../assets/dino/dino-mort.png",
    squadNote: "Turns noisy chart history into usable field notes for the whole squad.",
    isActive: true,
  },
  {
    id: "tard",
    family: "dino",
    name: "Tard",
    role: "RISK",
    specialty: "trap guard",
    mood: "watchful",
    focus: "hazard filtering",
    bond: "74",
    memory: "strict",
    timing: "late by design",
    risk: "defensive",
    fantasy: "Stays close, warns around danger lines, and keeps the squad from overstaying a weak thesis.",
    lesson: "Last replay: forced a retreat when liquidation pressure kept stacking above the wall.",
    status: "Ready to harden the squad against overextension.",
    sheet: "../assets/dino/dino-tard.png",
    squadNote: "Protects the party when volatility spikes or the support shelf starts to crack.",
    isActive: true,
  },
  {
    id: "vita",
    family: "dino",
    name: "Vita",
    role: "EXECUTOR",
    specialty: "commit finisher",
    mood: "fired up",
    focus: "pressure conversion",
    bond: "69",
    memory: "punchy",
    timing: "decisive",
    risk: "high conviction",
    fantasy: "Turns a prepared read into a visible upward shove once the squad has enough confirmation.",
    lesson: "Last replay: converted a defended support shelf into a fast upward claim after the second retest.",
    status: "Ready to punch through the next resistance wall with better formation support.",
    sheet: "../assets/dino/dino-vita.png",
    squadNote: "Cashes in the squad's setup by committing once the read is clean enough.",
    isActive: true,
  },
  {
    id: "coglet-scout",
    family: "coglet",
    name: "Coglet Scout",
    role: "SCOUT",
    specialty: "lane listener",
    mood: "eager",
    focus: "entry scouting",
    bond: "61",
    memory: "fresh",
    timing: "ahead of curve",
    risk: "nimble",
    fantasy: "Antenna-first variant that darts ahead, samples the lane, and marks whether the slope is ready for a clean push.",
    lesson: "Last replay: called out a weak breakout shelf before the main squad overcommitted into it.",
    status: "Ready to rejoin the route preview and map the first clean path upward.",
    sheet: "../assets/original/coglet-scout-sheet.svg",
    squadNote: "Checks the lane early and returns with clearer pathing for the squad.",
    isActive: true,
  },
  {
    id: "coglet-analyst",
    family: "coglet",
    name: "Coglet Analyst",
    role: "ANALYST",
    specialty: "signal whisperer",
    mood: "curious",
    focus: "prompt phrasing",
    bond: "58",
    memory: "forming",
    timing: "observant",
    risk: "experimental",
    fantasy: "Lens-eyed variant that watches the squad, mirrors trainer intent, and turns abstract prompt edits into something emotionally ownable.",
    lesson: "Last replay: spotted that the team understood the chart, but not the trainer's wording, and flagged a prompt rewrite instead of another spar.",
    status: "Ready to translate one more trainer note into better pattern recognition.",
    sheet: "../assets/original/coglet-analyst-sheet.svg",
    squadNote: "Turns fuzzy trainer language into reusable field logic for the whole family.",
    isActive: true,
  },
  {
    id: "coglet-risk",
    family: "coglet",
    name: "Coglet Risk",
    role: "RISK",
    specialty: "guard rail",
    mood: "stern",
    focus: "hazard refusal",
    bond: "64",
    memory: "disciplined",
    timing: "deliberately late",
    risk: "protective",
    fantasy: "Broader, lower variant built to say no. It braces around traps and forces the trainer to earn every risky commit.",
    lesson: "Last replay: cancelled a flashy long because the support shelf still had no second confirmation.",
    status: "Ready to harden the family against false confidence and liquidation bait.",
    sheet: "../assets/original/coglet-risk-sheet.svg",
    squadNote: "Acts like a rolling guard rail that blocks the family from bad commitments.",
    isActive: true,
  },
  {
    id: "coglet-executor",
    family: "coglet",
    name: "Coglet Executor",
    role: "EXECUTOR",
    specialty: "thesis finisher",
    mood: "charged",
    focus: "conversion pressure",
    bond: "67",
    memory: "forceful",
    timing: "on signal",
    risk: "assertive",
    fantasy: "Forward-driving variant that only wakes up when the read is clear, then turns the family setup into visible vertical pressure.",
    lesson: "Last replay: converted a slow family setup into one clean push through the wall after the second hold.",
    status: "Ready to turn disciplined setup into a stronger, cleaner break.",
    sheet: "../assets/original/coglet-executor-sheet.svg",
    squadNote: "Waits for the family read to lock, then turns it into action without dithering.",
    isActive: true,
  },
];

const actions = [
  {
    id: "doctrine",
    label: "Tune doctrine",
    shortLabel: "doctrine tune",
    summary: "Sharpen what the agent treats as confirmation before it commits.",
    projection:
      "The selected agent becomes more deliberate on resistance taps and carries its role identity more clearly into the next chart clash.",
    memory:
      "Writes a new doctrine note into the agent journal so future reflections can compare old and new commit rules.",
    scenario:
      "Best for breakout gates, repeated retests, and scenarios where patience matters more than speed.",
  },
  {
    id: "memory",
    label: "Curate memory",
    shortLabel: "memory curate",
    summary: "Compact noisy notes and keep only the lessons that should survive into the next run.",
    projection:
      "The selected agent repeats fewer failed lines and recovers faster after rejection because the wrong memories stop dominating retrieval.",
    memory:
      "Failure cases are merged into one cleaner playbook, improving clarity without bloating the memory bank.",
    scenario:
      "Best for choppy ranges, wick-heavy slices, and any setup polluted by too many old examples.",
  },
  {
    id: "signals",
    label: "Bind signals",
    shortLabel: "signal bind",
    summary: "Change which market cues the agent weights first when the chart starts to move.",
    projection:
      "The selected agent notices the active support shelf and pressure lane sooner, making the team feel more chart-aware without hiding the chart itself.",
    memory:
      "Adds a new retrieval hint that ties the current scenario to the right structural cues.",
    scenario:
      "Best for early trend continuation, shallow pullbacks, and zones where structure matters more than spectacle.",
  },
  {
    id: "spar",
    label: "Run chart spar",
    shortLabel: "chart spar",
    summary: "Let the agent rehearse against one short controlled battle slice before the real run.",
    projection:
      "The selected agent shows stronger timing in the next live match because it already rehearsed one version of the same chart grammar.",
    memory:
      "Stores a fresh match summary tagged to this training run so the writeback loop has something concrete to compare against.",
    scenario:
      "Best when the squad needs one more confidence pass before committing into an important chart slice.",
  },
];

const familySwitch = document.getElementById("familySwitch");
const rosterGrid = document.getElementById("rosterGrid");
const actionGrid = document.getElementById("actionGrid");
const partyStrip = document.getElementById("partyStrip");
const rosterMeta = document.getElementById("rosterMeta");
const partyMeta = document.getElementById("partyMeta");

const focusName = document.getElementById("focusName");
const focusRole = document.getElementById("focusRole");
const focusFantasy = document.getElementById("focusFantasy");
const focusBond = document.getElementById("focusBond");
const focusSpecialty = document.getElementById("focusSpecialty");
const focusMood = document.getElementById("focusMood");
const focusFocus = document.getElementById("focusFocus");
const focusMemory = document.getElementById("focusMemory");
const focusTiming = document.getElementById("focusTiming");
const focusRisk = document.getElementById("focusRisk");
const focusLesson = document.getElementById("focusLesson");
const selectedStatus = document.getElementById("selectedStatus");
const heroSprite = document.getElementById("heroSprite");
const displayReadout = document.getElementById("displayReadout");
const displayScreen = document.getElementById("displayScreen");
const focusModeLabel = document.getElementById("focusModeLabel");
const battleProjection = document.getElementById("battleProjection");
const memoryProjection = document.getElementById("memoryProjection");
const scenarioProjection = document.getElementById("scenarioProjection");

const params = new URLSearchParams(window.location.search);
const selectedAgentFromParams = agents.find((item) => item.id === params.get("agent"));

let selectedFamilyId =
  params.get("family") && familyDefinitions.some((item) => item.id === params.get("family"))
    ? params.get("family")
    : selectedAgentFromParams?.family || familyDefinitions[0].id;

let selectedActionId =
  params.get("action") && actions.some((item) => item.id === params.get("action")) ? params.get("action") : actions[0].id;

let selectedAgentId = selectedAgentFromParams?.family === selectedFamilyId
  ? selectedAgentFromParams.id
  : agents.find((item) => item.family === selectedFamilyId)?.id;

const roleClassMap = {
  SCOUT: "is-scout",
  ANALYST: "is-analyst",
  RISK: "is-risk",
  EXECUTOR: "is-executor",
};

function agentsForFamily() {
  return agents.filter((item) => item.family === selectedFamilyId);
}

function ensureSelectedAgentInFamily() {
  if (!agentsForFamily().some((item) => item.id === selectedAgentId)) {
    selectedAgentId = agentsForFamily()[0]?.id;
  }
}

function spriteMarkup(kind, sheet) {
  return `
    <div class="${kind === "party" ? "party-stage" : "mini-stage"}">
      <div class="sprite-shadow ${kind === "party" ? "sprite-shadow-party" : "sprite-shadow-mini"}"></div>
      <div class="sprite ${kind === "party" ? "sprite-party" : "sprite-mini"}" style="--sheet-url: url('${sheet}')"></div>
    </div>
  `;
}

function renderFamilySwitch() {
  familySwitch.innerHTML = familyDefinitions
    .map((family) => {
      const selectedClass = family.id === selectedFamilyId ? "is-selected" : "";
      return `
        <button class="family-pill ${selectedClass}" type="button" data-family-id="${family.id}">
          <span>${family.label}</span>
        </button>
      `;
    })
    .join("");
}

function renderRoster() {
  rosterGrid.innerHTML = agentsForFamily()
    .map((agent) => {
      const roleClass = roleClassMap[agent.role];
      const selectedClass = agent.id === selectedAgentId ? "is-selected" : "";
      return `
        <button class="roster-card ${roleClass} ${selectedClass}" type="button" data-agent-id="${agent.id}">
          ${spriteMarkup("mini", agent.sheet)}
          <div class="roster-copy">
            <div class="roster-topline">
              <strong>${agent.name}</strong>
              <span class="role-tag">${agent.role}</span>
            </div>
            <div class="chip-row">
              <span class="chip">${agent.specialty}</span>
              <span class="chip">${agent.isActive ? "active squad" : "bench slot"}</span>
            </div>
            <p class="roster-note">${agent.lesson}</p>
          </div>
        </button>
      `;
    })
    .join("");
}

function renderParty() {
  partyStrip.innerHTML = agentsForFamily()
    .filter((agent) => agent.isActive)
    .map(
      (agent) => `
        <article class="party-card ${roleClassMap[agent.role]}">
          ${spriteMarkup("party", agent.sheet)}
          <div class="party-topline">
            <strong>${agent.name}</strong>
            <span>${agent.role}</span>
          </div>
          <p class="party-note">${agent.squadNote}</p>
        </article>
      `,
    )
    .join("");
}

function renderActions() {
  actionGrid.innerHTML = actions
    .map((action) => {
      const selectedClass = action.id === selectedActionId ? "is-selected" : "";
      return `
        <button class="action-card ${selectedClass}" type="button" data-action-id="${action.id}">
          <span>${action.shortLabel}</span>
          <strong>${action.label}</strong>
          <p>${action.summary}</p>
        </button>
      `;
    })
    .join("");
}

function renderFocus() {
  const family = familyDefinitions.find((item) => item.id === selectedFamilyId);
  const agent = agents.find((item) => item.id === selectedAgentId);
  const action = actions.find((item) => item.id === selectedActionId);
  if (!agent || !action || !family) return;

  rosterMeta.textContent = family.rosterMeta;
  partyMeta.textContent = family.partyMeta;

  focusName.textContent = agent.name;
  focusRole.textContent = agent.role;
  focusFantasy.textContent = agent.fantasy;
  focusBond.textContent = agent.bond;
  focusSpecialty.textContent = agent.specialty;
  focusMood.textContent = `mood: ${agent.mood}`;
  focusFocus.textContent = `focus: ${agent.focus}`;
  focusMemory.textContent = agent.memory;
  focusTiming.textContent = agent.timing;
  focusRisk.textContent = agent.risk;
  focusLesson.textContent = agent.lesson;
  selectedStatus.textContent = agent.status;

  heroSprite.style.setProperty("--sheet-url", `url('${agent.sheet}')`);
  displayReadout.textContent = `${agent.name} / ${action.shortLabel} / projected next battle carryover`;
  focusModeLabel.textContent = action.shortLabel;
  battleProjection.textContent = action.projection;
  memoryProjection.textContent = action.memory;
  scenarioProjection.textContent = action.scenario;

  displayScreen.className = `display-screen ${roleClassMap[agent.role]}`;
  const nextUrl = new URL(window.location.href);
  nextUrl.searchParams.set("family", selectedFamilyId);
  nextUrl.searchParams.set("agent", agent.id);
  nextUrl.searchParams.set("action", action.id);
  window.history.replaceState({}, "", nextUrl);
}

function renderAll() {
  ensureSelectedAgentInFamily();
  renderFamilySwitch();
  renderRoster();
  renderParty();
  renderActions();
  renderFocus();
}

function bindEvents() {
  familySwitch.addEventListener("click", (event) => {
    const button = event.target.closest("[data-family-id]");
    if (!button) return;
    selectedFamilyId = button.dataset.familyId;
    selectedAgentId = agents.find((item) => item.family === selectedFamilyId)?.id;
    renderAll();
  });

  rosterGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-agent-id]");
    if (!button) return;
    selectedAgentId = button.dataset.agentId;
    renderRoster();
    renderFocus();
  });

  actionGrid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-action-id]");
    if (!button) return;
    selectedActionId = button.dataset.actionId;
    renderActions();
    renderFocus();
  });
}

renderAll();
bindEvents();
