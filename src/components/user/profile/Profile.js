import { Grid } from "@material-ui/core";
import UserDataForm from "../UserDataForm";

export default function Profile({ currentUser }) {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <UserDataForm currentUser={currentUser} />
      </Grid>
    </Grid>
  );
}
