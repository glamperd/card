import React, { Component } from "react";
import Card from "@material-ui/core/Card";
import HelpIcon from "@material-ui/icons/Help";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Popover from "@material-ui/core/Popover";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Tooltip from "@material-ui/core/Tooltip";

class ChannelCard extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const cardStyle = {
      card: {
        display: "flex",
        flexDirection: "row",
        width: "100%",
        height: "auto",
        marginTop: "-2%",
        justifyContent: "center",
        backgroundColor: "#282b2e",
        elevation: "0",
        square: true,
        color: "white",
        paddingTop: "25%",
        paddingBottom: "25%",
      },
      row: {
        color: "white",
      },
      clipboard: {
        cursor: "pointer"
      },
    };

    return (
      <Card style={cardStyle.card}>
        <span>  
          <Typography inline={true} variant="h5" style={cardStyle.row}>
          $
          </Typography>      
          <Typography inline={true} variant="h1" style={cardStyle.row}>
          {this.props.channelState ? (
            <span>{this.props.channelState.balanceTokenUser}</span>
          ) : (
            <span> 0</span>
          )}
        </Typography>
        <Typography inline={true} variant="h3" style={cardStyle.row}>
          {this.props.channelState ? (
            <span>{this.props.channelState.balanceTokenUser}</span>
          ) : (
            <span> .00</span>
          )}
        </Typography>   
        </span>
      </Card>
    );
  }
}

export default ChannelCard;
