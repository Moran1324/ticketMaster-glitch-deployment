const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();

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

module.exports = app;
