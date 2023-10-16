### LOCAL ENV FILE

##### Create .env.local file and add the following content
<br />

```
FIREBASE_API_KEY="AIzaSyB9McK4vjr2_6XygZ3hDq_B_RoP0aTz7F4"
FIREBASE_APP_ID="1:680445451029:web:32002bdf33c41df201671c"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDt86oNb2Et/p/N\nmx0z2q5J+9bM7fj0dRlsKXxjLD1UyzRcW7p3W7ddNPMX8ZNm9hJFb4OcyIHDdptN\nAdfYIhiHhyOH6aepJm+U0haw8dOYkg5/wRlBYToed1fa6UcHYBjScol0zxZDKKMI\n8Ew1C8Kqo4eaAPZhCNs+JaBApi94ydayWVohNHo94zQv5MgovlCbphV5tCoKd9gT\nbuHKxO9cKioc3IUYOTmEI8TuAdyjZ40gczD4xXJiFz6XTKEiuw5GgNwn6XI9VNpp\nayHoyxc8O9AJBJ5XERRo+6hsqchPG94y4eQG9T5y1jub9dkFozErM0E4IeE0fWNJ\nffylu6x7AgMBAAECggEAbXyfc10bXvl4+Db2IeTuKxaYyGR7F6hF0VHpbQxvD/QM\nHK8MRl1KKrXxYMQEKezxjUd5TIupwZFydeVyNn3BwaJ5w9DMF3WbA+QDEtnCncIe\nr8Pe5glhn6EUKKMLzqX15edTvg6HVNF+6t7+ga3unWtvOnpU42Ma1iaj7PtKfo2l\nWRhBYClM0zWfbtjBhlbBonnsWzR6Uef/LgsTkv7wy3lQ0y42+STo9lcreD0SdlqZ\nl+sxtJHwkDcaVNmT3+gY1d++L8I3n8cc8PaAMivW34fAzfv6jBWX0Xksy74USMe6\n0DDHSHjdT7VRkGKf44AhqAxkFHQ7HvS/hwIQS7JquQKBgQD/wInn0gNKfGm118uW\nrCIVsSNJuA4wm08cg10ZD4xP4/52tlVTF+VrIOANCFo9Oke3Bzve+JdLyBBICw8y\nz9F+xH5O5YlntLT9V6tVzJmg/JypT7jo9Y3nNKSd2Li63nqD6JWEmO1bNZAdUwEU\n2CgKLB2py3fQ/Sy4n4sosF0rFwKBgQDuLrVsG8YvdE0ueKDix7J/jSxFzMviRYyt\nsM19U8XJohLkWuWujBlYx+56KH8Lqi276Z4QJl5yPdWZxEv1cllefWmJfFZ8u+22\n4g9iftLWf77u2SzwK4J7NISyBmF4R/ld0pD43/d84qs+GPjWxL8MvtXrXHa4/mCY\n5+zXHlvYPQKBgQC67+IdJ12ucTfXac9u54zWbC7N8JG2p57wyXggHEREFPNnlCjT\n3rCbWGFMRWGoRVQsDUaO2QfFpYt5DVRjoJGRZlConJCN1AFC+HTM9wsIJ/zeqN4Q\nsYOyjsEQe1uzg3Drv/KiBCHiPEmFlalBsim6Hbrk5EtE3/lzTXKrIBZJqwKBgQCv\n2paiWiNKOCEgFXob1ftJR28PnfROfLEwMGCXjrlydJJkPWRlKhUwwnSlhq6+awhX\nPFYycFG9IUBKxm6aqrGnHQtFsiKc95e8Nk3Ll/2M10aeTIRsUoOE+bKbSjC+wM0x\nY10cEyhD8YsjTwaycxLnkyKYIm2Zil7BpkLsVQLUtQKBgQC8i8YPpTDqi3hqSan8\nNxJkBpDwAb0rPT+NbR89j4R82fLsqlWOpLoGUYYmi8sawy9c99FoFqgAK3dVfOe7\ntYER4aXg1Hvk3eDHRPie5Ea+vq5ro7Yfq4ucYpvOHQCMxPlUhf1Phg90U+PmK0PY\nLll1OTzAMQkTspCkoqCdpS/7fA==\n-----END PRIVATE KEY-----\n"
FIREBASE_AUTH_DOMAIN="gunfight-backoffice-dev-363214.firebaseapp.com"
FIREBASE_PROJECT_ID="gunfight-backoffice-dev-363214"
FIREBASE_STORAGE_BUCKET="gunfight-backoffice-dev-363214.appspot.com"
FIREBASE_MESSAGE_SENDER_ID="680445451029"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-l2io2@gunfight-backoffice-dev-363214.iam.gserviceaccount.com"

COOKIE_SECRET_CURRENT="j66HiteF"
COOKIE_SECRET_PREVIOUS="0lBa6fFd"
COOKIE_NAME="GunfightBackofficeLocal"
COOKIE_SECURE=false
COOKIE_SIGNED=false

STORAGE_PREFIX="GunfightBackofficeLocal."

NEXT_ABSOLUTE_URL="http://localhost:3000"

ALGOLIA_ID="36CT41P6JM"
ALGOLIA_PASSWORD="cb6c37b23786c601c054fecf27343324"
PRODUCTION=false
```

### Creating new env Firebase

- Create Project on Google Cloud
- Activate Firestore as Native
- Create a Bucket in gunfight-backoffice project
- Execute Command on CloudShell to Allow new project permission to find the Bucket with data file and pick service account name

```
gsutil iam ch serviceAccount:[SERVICE_ACCOUNT_NAME_ON_ERROR]:admin gs://gunfight-backoffice.appspot.com
```

- Go to the new Project

```
gcloud config set project gunfight-backoffice-dev
```

- Go to new Project and Import the data from Created bucket

```
gcloud firestore import gs://gunfight-backoffice.appspot.com/2022-09-21T15:04:56_96520 --async
```

### Uploading indexes to new env Firebase

- Go to project folder
- Run `firebase use gunfight-backoffice-dev-363214`
- Then upload indexes only

```
firebase deploy --only firestore:indexes
```

- Then upload rules only

```
firebase deploy --only firestore:rules
```
<br />

### Creating new env Algolia

- Export data as json from every index from gunfight-backoffice env
- Export config as json from every index from gunfight-backoffice env
- Create new indexes and import json file
- Import config data from json in every index
- Remember to keep updated
<br />

### env.local - Pedro Daltoé
```
FIREBASE_API_KEY="AIzaSyB9McK4vjr2_6XygZ3hDq_B_RoP0aTz7F4"
FIREBASE_APP_ID="1:680445451029:web:32002bdf33c41df201671c"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC8CrJ2ox4jYor+\nozZp3NT7K08pcRyx09+a1QV0WI3qVp+DjbwwH3Mf15e2UwL+HOZY75pHhXAJa7QY\nKywKhFDNEsDcXcq3svtifhItvq9ngqcdf0IBZNAG6TdApbSW68aDs6xUXBKf0pXe\nxP+F3S4SSRKjlDcw4fI5yIVrVKWgj6uLelP4s2QIua4R4eujoRnvPrWkuUeiIoDy\nVPZHe/tqTFiv3XaOliD6ebg57jY5rLuLBDlceTD4VqWb35BhB1GNG3zGeSLdcWff\nQD3AC6DG3cC0h/n1UL5rmbwCFPyGY65bApUxbaaWcI/9WM9pjyTQjODEAeGH1ccx\nskgwmsqHAgMBAAECggEATPC1j/xzRvg5tjITACLnFHRmmibZnlt6eTBjYHUhcDqM\nXzgdwbUElolQ3r29kjtB9y7mug/7xScIFAGKLi1woFBlkGViHmMCIA1Eo+oLfDeF\n6HhbChX1VnaTcIS8zSng2p+oSgY4aqOwRevmP6A+CyZSFZN+N6ajxYfqK34BnR2n\nmKRW1vDdQ2icBDoOBYCOpTUdCswffiWhJj1JlMAHrRcTrlxvaXdDpIw3gtJXq/JU\nm9E/0cAwbtddrdeEgdoOr2sKLOXzsk+2VbI4kFgX+5rJLqyZyt1d3sq59yhgJXDe\nj9vx4vPWEdTqqUBFDOaVemQsYhFOCNfLEjLgjzpyWQKBgQDyg0nFPD8+6a/WyQ9N\nF2JOdkXdPLmmt0ueaVdU7X5vUzYFS+kLdgKp+LbdqIBmJ/xUSZ1CTQ8QiwVWo0G0\njWBJai+wJLuZTZ3YXb4cxmYxLoCGanRwe2fwzJlszJgDLJ/zS9OkyOHW39WjTL/i\nrscV/Hwz3VbHfYh2j578mPhYXwKBgQDGf+RNp0vVAKl46q6PGwBaZNhYjrV7MhhN\nC1jU79WqoQVCJlC1aJmGp97fcjLBwEPdvj74+qZ+W1y2OzLGTNe4PXuRNq/id8dy\n/GcV0vE9DsdyThtrC99V3Fyfq3aYCu6yF78nfAAOiKvYoDTQocqqU1cs31vKmIfY\nwoP/IHte2QKBgQDtPG+7KZ+5PMPOOqvkP17k4KCht5jptV+dHPHY2+eWofEzpznY\nA17BxdOl7QOGa9FU5xqW1GlLRqQ3R8esB61MxDrYdmaqppomIjYrUg6ASDxkwdkc\nfCyHDK9+FnsSh+IFEIV/KyB6okcM07TW3SFWqcMavYj56BzJ1t+xvTccwwKBgD9S\nz1dCdnuWAXp0i4lVmNA9eZMOu7B4c64oX4dWl3gedBn9NSQaIVgGt5/aw3xxxHS5\n20b8Vx7aMIJl8jW2j97TplbV9lgt0+/Hu28H4zOSQmghqLeGixHOAbJiNawdWLZx\nwuZqtW3thbzOpuqjoo6hlZ7YBmVkMXoh25AJIbJJAoGATWIL8+rYBVBAe2Th9jLp\n/pTJMWfdp70BIb6lFZliv0LEdTDmN2BJ0ooyX9+iWC2E+CYD/lbrgKs40WyYt50H\n7tJsiGDvp3uHdGoHFRxTN9YjMK12XrvYUWJCD9NMi6c0PcqBHUf6HpvAqz32TcRB\ndYryBBORYQTPOV7Z9Pfp+F4=\n-----END PRIVATE KEY-----\n"
FIREBASE_AUTH_DOMAIN="gunfight-backoffice-dev-363214.firebaseapp.com"
FIREBASE_PROJECT_ID="gunfight-backoffice-dev-363214"
FIREBASE_STORAGE_BUCKET="gunfight-backoffice-dev-363214.appspot.com"
FIREBASE_MESSAGE_SENDER_ID="680445451029"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-l2io2@gunfight-backoffice-dev-363214.iam.gserviceaccount.com"

COOKIE_SECRET_CURRENT="j66HiteF"
COOKIE_SECRET_PREVIOUS="0lBa6fFd"
COOKIE_NAME="GunfightBackofficeLocal"
COOKIE_SECURE=false
COOKIE_SIGNED=false

STORAGE_PREFIX="GunfightBackofficeLocal."

NEXT_ABSOLUTE_URL="http://localhost:3000"

ALGOLIA_ID="8JQYQT0YK9"
ALGOLIA_PASSWORD="2d41de0def5197cb4b596e851ef4720b"
PRODUCTION=false

```
<br />

### Set GIT user to allow auto deploy

```

git config user.name "Gunfight TI"
git config user.email "sistemagunfight@gmail.com"

```
<br />

#### Call to normalize date timestamp

##### This call use "createdDate" string field to create a new field called  "createdDateTimestamp" field with timestamp type in existing item this will allow range search in date;
<br />

```
https://gunfight.app/api/internal/normalize-date?collection=invoice-items
```
If collection is not passed we assume "invoice" as default


Test code deploy
