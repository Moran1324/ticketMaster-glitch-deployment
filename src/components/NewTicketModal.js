import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Modal, TextField, Button } from '@material-ui/core';
import SelectInput from '@material-ui/core/Select/SelectInput';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

function rand() {
  return Math.round(Math.random() * 20) - 10;
}

function getModalStyle() {
  const top = 50 + rand();
  const left = 50 + rand();

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

export default function SimpleModal(props) {
  const classes = useStyles();
  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = useState(getModalStyle);
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [titleInput, setTitleInput] = useState();
  const [contentInput, setContentInput] = useState();
  const [emailInput, setEmailInput] = useState();
  const [labelsInput, setLabelsInput] = useState();

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    props.setNewTicket(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (labelsInput === undefined) {
      const body = {
        id: uuidv4(),
        title: titleInput,
        content: contentInput,
        userEmail: emailInput,
        creationTime: `${Date.now()}`,
      };
      const res = await axios.post('/api/tickets/newticket', body);
      if (res.data === 'Submitted') {
        setSubmitted(true);
      }
    } else {
      const labelsArr = labelsInput.split(' ');
      const body = {
        id: uuidv4(),
        title: titleInput,
        content: contentInput,
        userEmail: emailInput,
        creationTime: Date.now(),
        labels: labelsArr,
      };
      const res = await axios.post('/api/tickets/newticket', body);
      if (res.data === 'Submitted') {
        setSubmitted(true);
      }
    }
  };

  const body = (
    <div style={modalStyle} className={classes.paper}>
      {!submitted
        ? (
          <>
            <form onSubmit={handleSubmit}>
              <TextField autoFocus className="newTicketInput" type="text" required onChange={(e) => setTitleInput(e.target.value)} label="Enter Ticket Title" />
              <br />
              <TextField className="newTicketInput" type="text" required onChange={(e) => setContentInput(e.target.value)} label="Enter Ticket Content" />
              <br />
              <TextField className="newTicketInput" type="email" required onChange={(e) => setEmailInput(e.target.value)} label="Enter Your Email" />
              <br />
              <TextField className="newTicketInput" type="text" onChange={(e) => setLabelsInput(e.target.value)} label="Enter Ticket Labels With Spaces in Between (Optional)" />
              <br />
              <Button
                type="submit"
                color="primary"
                variant="contained"
                style={{ marginTop: 20 }}
              >
                Submit
              </Button>
            </form>
          </>
        )
        : (
          <>
            <h1>Thank You!</h1>
            <p>Your Data has been Submitted</p>
          </>
        )}
    </div>
  );

  useEffect(() => {
    handleOpen();
    return () => {
      const getTickets = async () => {
        const { data } = await axios.get('/api/tickets');
        data.forEach((ticket) => ticket.done = false);
        props.setTickets(data);
      };
      getTickets();
    };
  }, []);

  return (
    <div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
        style={{ textAlign: 'center' }}
      >
        {body}
      </Modal>
    </div>
  );
}
