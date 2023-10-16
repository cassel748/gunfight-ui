import { AuthAction, withAuthUser } from "next-firebase-auth";
import { handleProfileData } from "src/components/user/profile/ProfileInfoParent";
import { withAuthLevel } from "src/utils/auth";
import dynamic from "next/dynamic";

const ProfileInfoParent = dynamic(
  () => import("src/components/user/profile/ProfileInfoParent"),
  { ssr: false }
)

function History({ currentUser }) {
  return (<ProfileInfoParent currentUser={currentUser} initialTab="Histórico" />)
}

export const getServerSideProps = withAuthLevel((req, data, token) => {
  return handleProfileData(req, data, token);
});

export default withAuthUser({
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
})(History);
