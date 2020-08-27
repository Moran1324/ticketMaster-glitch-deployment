const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();

function checkHttps(request, response, next) {
    // Check the protocol — if http, redirect to https.
    if (request.get("X-Forwarded-Proto").indexOf("https") != -1) {
      return next();
    } else {
      response.redirect("https://" + request.hostname + request.url);
    }
  }
  
  app.all("*", checkHttps)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client/build')));

// serve html file from server
app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
})

// get all tickets or by search value
app.get('/api/tickets', async (req, res) => {
    let allTickets = await fs.readFile('./data.json', { encoding: 'utf-8' });
    allTickets = JSON.parse(allTickets);
    const searchVal = req.query.searchText;
    if (searchVal) {
        const filteredTickets = allTickets.filter(ticket =>
            ticket.title.toLowerCase().indexOf(searchVal.toLowerCase()) !== -1)
        res.send(filteredTickets);
    } else {
        res.send(allTickets);
    }
})

// mark ticket as done
app.post('/api/tickets/:ticketId/done', async (req, res) => {
    let allTickets = await fs.readFile('./data.json', { encoding: 'utf-8' });
    allTickets = JSON.parse(allTickets);
    for (let ticket of allTickets) {
        if (ticket.id === req.params.ticketId) {
            ticket.done = true;
            res.send({ updated: true });
        }
    }
    fs.writeFile('./data.json', JSON.stringify(allTickets));


})

// mark ticket as undone
app.post('/api/tickets/:ticketId/undone', async (req, res) => {
    let allTickets = await fs.readFile('./data.json', { encoding: 'utf-8' });
    allTickets = JSON.parse(allTickets);
    for (let ticket of allTickets) {
        if (ticket.id === req.params.ticketId) {
            ticket.done = false;
            res.send({ updated: true });
        }
    }
    fs.writeFile('./data.json', JSON.stringify(allTickets));
})

// reset tickets file
app.put('/api/tickets/resetdata', async (req, res) => {
    let allTickets = await fs.readFile('./initial-data.json', { encoding: 'utf-8' });
    allTickets = JSON.parse(allTickets);
    fs.writeFile('./data.json', JSON.stringify(allTickets));
    res.send('Data was Resetted')
})

// add ticket to current database
app.post('/api/tickets/newticket', async (req, res) => {
    let allTickets = await fs.readFile('./data.json', { encoding: 'utf-8' });
    allTickets = JSON.parse(allTickets);
    allTickets.push(req.body);
    fs.writeFile('./data.json', JSON.stringify(allTickets));
    res.send("Submitted");
})

// module.exports = app;

let port;
console.log("❇️ NODE_ENV is", process.env.NODE_ENV);
if (process.env.NODE_ENV === "production") {
  port = process.env.PORT || 3000;
  app.use(express.static(path.join(__dirname, "../build")));
  app.get("*", (request, response) => {
    response.sendFile(path.join(__dirname, "../build", "index.html"));
  });
} else {
  port = 3001;
  console.log("⚠️ Not seeing your changes as you develop?");
  console.log(
    "⚠️ Do you need to set 'start': 'npm run development' in package.json?"
  );
}

// Start the listener!
const listener = app.listen(port, () => {
  console.log("❇️ Express server is running on port", listener.address().port);
});
