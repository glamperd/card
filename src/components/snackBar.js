import React from "react";

import { Snackbar, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

const ConfirmationSnackbar = ({ handleClick, open, text  }) => (    
      <Snackbar 
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'left',
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