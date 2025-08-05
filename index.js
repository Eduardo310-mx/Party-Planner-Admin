// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "2507-EduardoMaldonado"; // Make sure to change this!
const RESOURCE = "/events";
const API = `${BASE}/${COHORT}${RESOURCE}`;

// === State ===
let parties = [];
let selectedParty;
let rsvps = [];
let guests = [];

/** Updates state with all parties from the API */
async function getParties() {
  try {
    const response = await fetch(API);
    const result = await response.json();
    parties = result.data;
    render();
  } catch (error) {
    console.error(error);
  }
}

/** Updates state with a single party from the API */
async function getParty(id) {
  try {
    const response = await fetch(`${API}/${id}`);
    const result = await response.json();
    selectedParty = result.data;
    render();
  } catch (error) {
    console.error(error);
  }
}

/** Updates state with all RSVPs from the API */
async function getRsvps() {
  try {
    const response = await fetch("https://fsa-crud-2aa9294fe819.herokuapp.com/api/2507-EduardoMaldonado/rsvps");
    const result = await response.json();
    rsvps = result.data;
    render();
  } catch (error) {
    console.error(error);
  }
}

/** Updates state with all guests from the API */
async function getGuests() {
  try {
    const response = await fetch("https://fsa-crud-2aa9294fe819.herokuapp.com/api/2507-EduardoMaldonado/guests");
    const result = await response.json();
    guests = result.data;
    render();
  } catch (error) {
    console.error(error);
  }
}

//Add a new party

async function addParty(party) {
  try {
    const response = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(party)
    });

    const result = await response.json();
    console.log(result);
    await getParties(); // Refresh list
  } catch (error) {
    console.error(error);;
  }
}

//Delete the party with the given ID via the Api
async function removeParty(id) {
  try {
    const response = await fetch(`${API}/${id}`, {
      method: "DELETE"
    });
    const result = await response.json();
    console.log(result);
    selectedParty = null;
    await getParties(); // Refresh list
  } catch (error) {
    console.error(error);
  }
}

// === Components ===

/** Party name that shows more details about the party when clicked */
function PartyListItem(party) {
  const $li = document.createElement("li");

  if (party.id === selectedParty?.id) {
    $li.classList.add("selected");
  }

  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  $li.addEventListener("click", () => getParty(party.id));
  return $li;
}

/** A list of names of all parties */
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("parties");

  const $parties = parties.map(PartyListItem);
  $ul.replaceChildren(...$parties);

  return $ul;
}

/** Detailed information about the selected party */
function SelectedParty() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $party = document.createElement("section");
  $party.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <time datetime="${selectedParty.date}">
      ${selectedParty.date.slice(0, 10)}
    </time>
    <address>${selectedParty.location}</address>
    <p>${selectedParty.description}</p>
    <GuestList></GuestList>
    <button>Remove Party</button>

  `;
  $party.querySelector("GuestList").replaceWith(GuestList());

  const $button = $party.querySelector("button");
  $button.addEventListener("click", async () => {
    if (confirm("Are you sure you want to remove this party?")) {
      await removeParty(selectedParty.id);
      await getParties();
    }
  });
  return $party;
}

function NewPartyForm() {
  const $form = document.createElement("form");
  $form.id = "new-party-form";

  $form.innerHTML = `
    <label for="exampleInputEmail1">Name</label>
    <input name="name" placeholder="Name" required />

    <label for="exampleInputEmail1">Description</label>
    <textarea name="description" placeholder="Description"></textarea>

    <label>Date</label>
    <input name="date" type="date"  placeholder=" mm / dd / yyyy"  required />

    <label for="exampleInputEmail1">Time</label>
    <input name="time" type="time" required />

    <label for="exampleInputEmail1">Location</label>
    <input name="location" placeholder="Location" required />

    <button type="submit">Add Party</button>

  `;

  $form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const date = e.target.date.value;
    const time = e.target.time.value;


    const newParty = {
      name: e.target.name.value,
      description: e.target.description.value,
      date: new Date (`${date}T${time}`).toISOString(),
      location: e.target.location.value,
      
    };

    await addParty(newParty);
    $form.reset();
  });
  return $form;
}

/** List of guests attending the selected party */
function GuestList() {
  const $ul = document.createElement("ul");
  const guestsAtParty = guests.filter((guest) =>
    rsvps.find(
      (rsvp) => rsvp.guestId === guest.id && rsvp.eventId === selectedParty.id
    )
  );

  // Simple components can also be created anonymously:
  const $guests = guestsAtParty.map((guest) => {
    const $guest = document.createElement("li");
    $guest.textContent = guest.name;
    return $guest;
  });
  $ul.replaceChildren(...$guests);

  return $ul;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
        <div id="new-party-form"></div>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <SelectedParty></SelectedParty>
      </section>
    </main>
  `;


  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("#new-party-form").replaceWith(NewPartyForm());
  $app.querySelector("SelectedParty").replaceWith(SelectedParty());
}

async function init() {
  await getParties();
  await getRsvps();
  await getGuests();
  render();
}

init();
