import React from "react";
import { AppBar, Toolbar, IconButton, Typography, Grid } from "@material-ui/core";
import blockies from "ethereum-blockies-png";
import SettingIcon from "@material-ui/icons/Settings";
import { Link } from "react-router-dom";
import SvgIcon from '@material-ui/core/SvgIcon';


const noAddrBlocky = require("../assets/noAddress.png");

function HomeIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </SvgIcon>
  );
}

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
            <Typography variant="body2" noWrap style={{ width: "75px", color: "#c1c6ce", marginLeft: "3px" }}>
              <span>{props.address}</span>
            </Typography>
          </IconButton>
        </Grid>
        <Grid item xs={3}>
          <IconButton color="inherit" variant="contained" component={Link} to="/">
            <HomeIcon alt="" style={{ width: "30px", height: "30px", cursor:"pointer" }} />
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
