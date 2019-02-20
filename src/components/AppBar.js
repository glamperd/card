import React from "react";
import { AppBar, Toolbar, IconButton, Typography, Button, Grid } from "@material-ui/core";
import blockies from "ethereum-blockies-png";
import SettingIcon from "@material-ui/icons/Settings";
import { Link } from "react-router-dom";

const noAddrBlocky = require("../assets/noAddress.png");
const connext = require("../assets/Connext.svg");

const AppBarComponent = props => (
  <AppBar position="sticky" elevation="0" color="secondary" style={{ paddingTop: "2%" }}>
    <Toolbar>
      <Grid container spacing={24} direction="row" justify="space-between" alignItems="center" style={{ textAlign: "center" }}>
        <Grid item xs={3}>
          <IconButton color="inherit" variant="contained" component={Link} to="/deposit">
            <img
              src={props.address ? blockies.createDataURL({ seed: props.address }) : noAddrBlocky}
              alt=""
              style={{ width: "40px", height: "40px" }}
            />
            <Typography variant="body2" noWrap style={{ width: "75px", color: "#c1c6ce" }}>
              <span>{props.address}</span>
            </Typography>
          </IconButton>
        </Grid>
        <Grid item xs={3}>
          <IconButton color="inherit" variant="contained" component={Link} to="/">
            <img src={connext} alt="" style={{ width: "40px", height: "40px" }} />
          </IconButton>
        </Grid>
        <Grid item xs={3}>
          <IconButton color="inherit" variant="contained" component={Link} to="/settings">
            <SettingIcon />
          </IconButton>
        </Grid>
      </Grid>
    </Toolbar>
  </AppBar>
);

export default AppBarComponent;
