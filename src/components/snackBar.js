import React from "react";

import { Snackbar, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

const ConfirmationSnackbar = ({ handleClick, open, text, classes  }) => (    
      <Snackbar 
      classes={classes}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'center',
      }}
      message={<span id="message-id">{text}</span>}
      autoHideDuration={6000}
      onClose={handleClick}
      open={open}
      action={[
        <IconButton
          key="close"
          aria-label="Close"
          color="inherit"
          onClick={handleClick}
        >
          <CloseIcon />
        </IconButton>,
      ]}
    >
      
    </Snackbar>
  );
  
  export default ConfirmationSnackbar;