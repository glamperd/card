import React from "react";
import { AppBar, Toolbar, IconButton, Typography, Grid, Button } from "@material-ui/core";
import blockies from "ethereum-blockies-png";
import SettingIcon from "@material-ui/icons/Settings";
import { Link } from "react-router-dom";

const noAddrBlocky = require("../assets/noAddress.png");

const AppBarComponent = props => (
  <AppBar position="sticky" color="secondary" style={{ paddingTop: "2%" }}>
    <Toolbar>
      <Grid container spacing={24} direction="row" justify="space-between" alignItems="center" style={{ textAlign: "center" }}>
        <Grid item xs={3}>
          <IconButton color="inherit" variant="contained" component={Link} to="/deposit">
            <img
              src={props.address ? blockies.createDataURL({ seed: props.address }) : noAddrBlocky}
              alt=""
              style={{ width: "40px", height: "40px" }}
            />
            <Typography variant="body2" noWrap style={{ width: "75px", color: "#c1c6ce", marginLeft: "3px" }}>
              <span>{props.address}</span>
            </Typography>
          </IconButton>
        </Grid>
        <Grid item xs={5}>
          <Button size="small" variant="outlined" style={{ color: "#c1c6ce", borderColor: "#c1c6ce", fontSize: "small"}} component={Link} to="/settings">
            {localStorage.getItem("rpc")}
            <SettingIcon style={{marginLeft:"3px"}}/>
          </Button>
          {/* <IconButton color="inherit" variant="contained" component={Link} to="/settings">

          </IconButton> */}
        </Grid>
      </Grid>
    </Toolbar>
  </AppBar>
);

export default AppBarComponent;
