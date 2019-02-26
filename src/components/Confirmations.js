import React, { Component } from "react";
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Button from '@material-ui/core/Button';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';
import red from '@material-ui/core/colors/red'
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import HourglassIcon from '@material-ui/icons/HourglassFull';
import { withStyles } from '@material-ui/core/styles';

const variantIcon = {
  success: CheckCircleIcon,
  warning: HourglassIcon,
  error: ErrorIcon,
  info: InfoIcon,
};

const styles1 = theme => ({
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: red[600],
  },
  warning: {
    backgroundColor: amber[700],
  },
  icon: {
    fontSize: 20,
  },
  iconVariant: {
    opacity: 0.9,
    marginRight: theme.spacing.unit,
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
});

function MySnackbarContent(props) {
  const { classes, className, message, onClose, variant, ...other } = props;
  const Icon = variantIcon[variant];

  return (
    <SnackbarContent
      className={classNames(classes[variant], className)}
      aria-describedby="client-snackbar"
      message={
        <span id="client-snackbar" className={classes.message}>
          <Icon className={classNames(classes.icon, classes.iconVariant)} />
          {message}
        </span>
      }
      action={[
        <IconButton
          key="close"
          aria-label="Close"
          color="inherit"
          className={classes.close}
          onClick={onClose}
        >
          <CloseIcon className={classes.icon} />
        </IconButton>,
      ]}
      {...other}
    />
  );
}

MySnackbarContent.propTypes = {
  classes: PropTypes.object.isRequired,
  className: PropTypes.string,
  message: PropTypes.node,
  onClose: PropTypes.func,
  variant: PropTypes.oneOf(['success', 'warning', 'error']).isRequired,
};

const MySnackbarContentWrapper = withStyles(styles1)(MySnackbarContent);

const styles2 = theme => ({
  margin: {
    margin: theme.spacing.unit,
  },
});

class Confirmations extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { deposit, withdraw, payment } = this.props.status;
    return (
      <div>
        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'middle',
          }}
          open={deposit === "PENDING"}
          autoHideDuration={4000}
          onClose={() => this.props.closeConfirmations()}
        >
          <MySnackbarContentWrapper
            onClose={this.handleClose}
            variant="warning"
            message="Processing deposit, we'll let you know when it's done."
          />
        </Snackbar>
        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'middle',
          }}
          open={withdraw === "PENDING"}
          autoHideDuration={4000}
          onClose={() => this.props.closeConfirmations()}
        >
          <MySnackbarContentWrapper
            onClose={this.handleClose}
            variant="warning"
            message="Processing withdrawal, we'll let you know when it's done."
          />
        </Snackbar>
        <Snackbar
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'middle',
          }}
          open={withdraw === "SUCCESS"}
          autoHideDuration={4000}
          onClose={() => this.props.closeConfirmations()}
        >
          <MySnackbarContentWrapper
            onClose={this.handleClose}
            variant="success"
            message="Pending transaction confirmed!"
          />
        </Snackbar>
      </div>
    );
  }
}

Confirmations.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles2)(Confirmations);
