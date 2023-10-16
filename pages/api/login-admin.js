import { decryptData } from 'src/utils/crypto';
import Firebase from 'src/utils/firebase'

const handler = async (req, res) => {
  try {
    const body = req.body;
    //const encryptedPassword = encryptData(password);
    const decryptedPassword = decryptData(body.password);
    const loginData = await Firebase.loginWithEmailAndPassword(body.email, decryptedPassword);
    const userData = await Firebase.getDataById("user-data", loginData.user.uid);

    if (userData.status === "A" && userData.accessLevel >= 4) {
      return res.status(200).json({ success: true });
    }

    return res.status(403).json({ success: false, message: "Usuário não encontrado ou está inativo." });
  } catch (e) {
    if (e.code === "auth/wrong-password") {
      return res.status(403).json({ success: false, message: "Usuário não encontrado ou está inativo." });
    }

    console.log(e);
    return res.status(500).json({ error: 'Unexpected error.', e })
  }
}

export default handler
