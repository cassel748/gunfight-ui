import React from "react";
import PropTypes from "prop-types";
import Card from "@material-ui/core/Card";
import { makeStyles } from "@material-ui//styles";
import CardMedia from "@material-ui/core/CardMedia";
import Typography from "@material-ui/core/Typography";
import CardContent from "@material-ui/core/CardContent";
import CardActionArea from "@material-ui/core/CardActionArea";
import { CardActions } from "@material-ui/core";

const useStyles = makeStyles({
  root: {
    maxWidth: 280,
  },
  media: {
    height: 165,
    width: 280,
  },
});

const CardImage = ({ image, title, href, mt }) => {
  const classes = useStyles();

  return (
    <Card className={classes.root} style={{ marginTop: mt }}>
      <CardActionArea href={href}>
        <CardMedia className={classes.media} component="img" image={image} />
        <CardActions style={{ alignItems: "center" }}>
          <Typography gutterBottom variant="h6" component="h2" ml={1}>
            {title}
          </Typography>
        </CardActions>
      </CardActionArea>
    </Card>
  );
};

CardImage.propTypes = {
  mt: PropTypes.number,
  href: PropTypes.string,
  image: PropTypes.string,
  title: PropTypes.string,
};

export default CardImage;
