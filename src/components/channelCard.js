import React, { Component } from "react";
import Card from "@material-ui/core/Card";
import Typography from "@material-ui/core/Typography";

class ChannelCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      balance: '',
    }
  }

  componentWillReceiveProps(){
    this.setState({balace: this.props.balanceTokenUser})
  }

  getSubstring(string) {
    let temp = parseFloat(string)
    temp = temp * Math.pow(10, -18)
    let substring = temp.toString().split(".")
    return substring
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
          {"$"+" "}
          </Typography>      
          <Typography inline={true} variant="h1" style={cardStyle.row}>
          {this.state.balance != '' ? (
            <span>{this.getSubstring(this.state.balance)[0]}</span>
          ) : (
            <span>0</span>
          )}
        </Typography>
        <Typography inline={true} variant="h3" style={cardStyle.row}>
          {this.state.balance != '' ? (
            <span>
              {"." + this.getSubstring(this.state.balance)[1].substring(0,2)}
            </span>
          ) : (
            <span>.00</span>
          )}
        </Typography>   
        </span>
      </Card>
    );
  }
}

export default ChannelCard;
