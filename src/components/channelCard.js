import React, { Component } from "react";
import Card from "@material-ui/core/Card";
import { Grid, Typography} from "@material-ui/core";
import { withStyles } from "@material-ui/core";
import { getDollarSubstring } from "../utils/getDollarSubstring";
import CircularProgress from "@material-ui/core/CircularProgress";


const styles = {
  card: {
    display: "flex",
    flexDirection: "row",
    flexBasis:"100%",
    width: "100%",
    height: "auto",
    marginTop: "-2%",
    justifyContent: "center",
    backgroundColor: "#282b2e",
    elevation: "0",
    square: true,
    color: "white",
    paddingTop: "25%",
    paddingBottom: "25%"
  },
  row: {
    color: "white"
  },
  pending:{
    marginBottom:"3%",
    color:"white"
  },
  clipboard: {
    cursor: "pointer"
  }
};

class ChannelCard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      depositDetected:false
    };
  }

  async checkState() {
    const { channelState } = this.props;
    try{
      if (channelState.pendingDepositWeiUser !== "0" || channelState.pendingDepositTokenUser !== "0" ) {
        console.log(``)
        return true;
      } else {
        console.log(`No deposit found :(`)
        return false;
      }
    }catch{
      console.log("No channel state found")
    }
  }

  //withRouter(async ({ history })

  poller = async () => {
    setInterval(async () => {
      var depositing = await this.checkState();
      if (depositing) {
        await this.setState({ depositDetected: true });
        //history.push("/");
      }else{
        await this.setState({ depositDetected: false })
      }
    }, 1000);
  };
  


  componentDidMount = async() => {
    this.poller();
  }


  render() {
    const { classes, channelState } = this.props
    const substr = channelState ? getDollarSubstring(channelState.balanceTokenUser) : ["0","00"]
    return (
      <Card className={classes.card} container>
      <Grid container direction="column" alignItems="center">
      <Grid item alignItems="center">
        {this.state.depositDetected ? 
                (
                  <Grid container direction="column" alignItems="center" style={{marginBottom:"10%"}}>
                  <Typography variant="h5" className={classes.pending}>Deposit Pending</Typography>
                    <CircularProgress
                    color="primary"
                    variant="indeterminate"
                    />
                  </Grid>
                )
        :
        null
        }
       </Grid>
       <Grid item>
        <span>
          <Typography inline={true} variant="h5" className={classes.row}>
            {"$ "}
          </Typography>
          <Typography inline={true} variant="h1" className={classes.row}>
            <span>{substr[0]}</span>
          </Typography>
          <Typography inline={true} variant="h3" className={classes.row}>
            <span>{"." + substr[1].substring(0, 2)}</span>
          </Typography>
        </span>
        </Grid>
        </Grid>
      </Card>
    );
  }
}

export default withStyles(styles)(ChannelCard);
