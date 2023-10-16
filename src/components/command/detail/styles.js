import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles({
  root: {
    width: "100%",
    minHeight: 272,
    position: "relative",
    boxShadow: "0px 0px 15px 6px rgba(0, 0, 0, 0.2)",
  },
  bullet: {
    margin: "0 2px",
    transform: "scale(0.8)",
    display: "inline-block",
  },
  number: {
    fontSize: 18,
    fontWeight: "normal",
  },
  name: {
    fontSize: 16,
  },
  alcool: {
    backgroundColor: "#FDD835",
    width: 330,
    height: 25,
    borderRadius: 0,
    marginLeft: -40,
    alignItems: "center",
    justifyContent: "space-around",
    display: "flex",
    margin: 5,
  },
  value: {
    fontSize: 16,
    marginTop: 12,
  },
  container: {
    flexDirection: "column",
    flex: 1,
  },

  divTitle: {
    flexDirection: "row",
    justifyContent: "space-around",
    display: "flex",
    alignItems: "center",
    marginTop: 30,
  },
  line: {
    backgroundColor: "#fff",
    height: 1,
    width: 400,
  },
  divCommands: {
    flexDirection: "row",
    flex: 1,
    display: "flex",
    marginTop: 20,
  },
  button: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    marginLeft: -8,
  },
  nextPayment: {
    textAlign: "center",
    marginTop: 8,
  },
  eye: {
    top: 20,
    right: 16,
    width: 35,
    height: 35,
    display: "flex",
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    top: 26,
    width: 12,
    height: 12,
    borderRadius: 12,
    position: "absolute",
    animationName: "$pulse",
    animationDuration: "2s",
    backgroundColor: "#4caf50",
    animationIterationCount: "infinite",
    animationTimingFunction: "linear",
  },

  notAssociate: {
    top: 26,
    width: 12,
    height: 12,
    borderRadius: 12,
    position: "absolute",
    animationName: "$pulse",
    animationDuration: "2s",
    backgroundColor: "rgba(1, 87, 255, 3)",
    animationIterationCount: "infinite",
    animationTimingFunction: "linear",
  },
  iconFinished: {
    top: 16,
    right: 16,
    width: 12,
    height: 12,
    borderRadius: 12,
    position: "absolute",
    animationName: "$pulseFinished",
    animationDuration: "2s",
    backgroundColor: "#0d47a1",
    animationIterationCount: "infinite",
    animationTimingFunction: "linear",
  },
  cardContent: {
    paddingTop: 12,
  },
  "@keyframes pulse": {
    "0%": {
      boxShadow: "0px 0px 5px 0px rgba(76, 175, 80, .3)",
    },
    "65%": {
      boxShadow: "0px 0px 5px 6px rgba(76, 175, 80, .3)",
    },
    "90%": {
      boxShadow: "0px 0px 5px 6px rgba(0, 221, 74, 0)",
    },
  },
  "@keyframes pulseFinished": {
    "0%": {
      boxShadow: "0px 0px 5px 0px rgba(1, 87, 255, .3)",
    },
    "65%": {
      boxShadow: "0px 0px 5px 6px rgba(1, 87, 255, .3)",
    },
    "90%": {
      boxShadow: "0px 0px 5px 6px rgba(0, 221, 74, 0)",
    },
  },
  row: {
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    height: 30,
  },

  iconLegend: {
    width: 12,
    height: 12,
    marginRight: 10,
    borderRadius: 12,
    animationName: "$pulse",
    animationDuration: "2s",
    backgroundColor: "#4caf50",
    animationIterationCount: "infinite",
    animationTimingFunction: "linear",
  },
  iconLegendBlue: {
    width: 12,
    height: 12,
    marginRight: 10,
    borderRadius: 12,
    animationName: "$pulse",
    animationDuration: "2s",
    backgroundColor: "rgba(1, 87, 255, 3)",
    animationIterationCount: "infinite",
    animationTimingFunction: "linear",
  },
});

export default useStyles;
