document.addEventListener("DOMContentLoaded", () => {
  const filmList = document.getElementById("films");
  const titleElement = document.getElementById("title");
  const posterImage = document.getElementById("poster");
  const filmInfoElement = document.getElementById("film-info");
  const runtimeElement = document.getElementById("runtime");
  const showtimeElement = document.getElementById("showtime");
  const ticketNumElement = document.getElementById("ticket-num");
  const buyTicketButton = document.getElementById("buy-ticket");

  // Fetching the films
  fetch("http://localhost:3000/films")
    .then((response) => response.json())
    .then((films) => {
      films.forEach(film => {
        const li = document.createElement("li");
        li.className = "film item";
        li.innerText = film.title;
        li.dataset.id = film.id;

        // Creating a delete button
        const deleteButton = document.createElement("button");
        deleteButton.className = "button delete";
        deleteButton.innerText = "Delete";

        // Appending the delete button to the film list item
        li.appendChild(deleteButton);

        // Adding an event listener for the delete button
        deleteButton.addEventListener("click", (event) => {
          event.stopPropagation(); // Prevent the click from triggering the film details display
          deleteFilm(film.id, li);
        });

        // Display film details on click
        li.addEventListener("click", () => displayFilmDetails(film));
        filmList.appendChild(li);
      });
    });

  // Function to display film details
  function displayFilmDetails(film) {
    const availableTickets = film.capacity - film.tickets_sold;
    posterImage.src = film.poster;
    titleElement.innerText = film.title;
    runtimeElement.innerText = `${film.runtime} minutes`;
    filmInfoElement.innerText = film.description;
    showtimeElement.innerText = film.showtime;
    ticketNumElement.innerText = availableTickets;

    // For disabling the buy ticket button 
    buyTicketButton.innerText = availableTickets > 0 ? "Buy Ticket" : "Sold Out";
    buyTicketButton.disabled = availableTickets === 0;

    // For purchasing tickets
    buyTicketButton.onclick = () => {
      if (availableTickets > 0) {
        buyTicket(film);
      }
    };
  }

  // Function to buy a ticket
  function buyTicket(film) {
    const newTicketsSold = film.tickets_sold + 1;

    // Updating tickets sold 
    fetch(`http://localhost:3000/films/${film.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tickets_sold: newTicketsSold }),
    })
    .then(response => response.json())
    .then(updatedFilm => {
      displayFilmDetails(updatedFilm);

      // Posting new ticket to the tickets endpoint
      fetch("http://localhost:3000/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          film_id: film.id,
          number_of_tickets: 1,
        }),
      });
    });
  }

  // Function to delete a film
  function deleteFilm(filmId, listItem) {
    fetch(`http://localhost:3000/films/${filmId}`, {
      method: "DELETE",
    })
    .then(response => {
      if (response.ok) {
        // Remove the film list item from the DOM
        filmList.removeChild(listItem);
      } else {
        console.error("Failed to delete film");
      }
    })
    .catch(error => console.error("Error:", error));
  }
});
