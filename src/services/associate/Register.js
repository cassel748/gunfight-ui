import Firebase from "src/utils/firebase";

class AssociateRegisterService {
  static getAssociateData() {
    return Firebase.query('associate-data', 10);
  }
}

export default AssociateRegisterService;