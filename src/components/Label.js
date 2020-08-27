import React from 'react';
import { Button } from '@material-ui/core';
import { v4 as uuidv4 } from 'uuid';

function Label(props) {
  return (
    <div>
      {props.labels.map((label) => (
        <span key={uuidv4()} className="label">
          <Button style={{ textTransform: 'none' }}>{label}</Button>
        </span>
      ))}
    </div>
  );
}

export default Label;
