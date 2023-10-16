// hooks
import createAvatar from "src/utils/createAvatar";
import { MAvatar } from "../@material-extend";
//

// ----------------------------------------------------------------------

export default function MyAvatar({ ...other }) {
  return (
    <MAvatar
      src={
        "https://widgetwhats.com/app/uploads/2019/11/free-profile-photo-whatsapp-4.png"
      }
      alt="Pedro Daltoé"
      color={"default"}
      {...other}
    >
      {createAvatar("user.displayName")}
    </MAvatar>
  );
}
