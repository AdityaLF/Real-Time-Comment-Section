# Real Time Comment Section

This is a real-time comment and reply system project built with Vanilla JavaScript and Firebase Realtime Database. This project is designed to be deployed as a static site on modern platforms like Vercel or Netlify, with secure configuration management using Environment Variables.

👉 [View Live Preview](https://real-time-comment-section.vercel.app/)  

## ✨ Key Features

* **Real-Time Comments:** Comments, replies, and view counts appear instantly without needing to refresh the page, powered by Firebase.
* **Nested Replies:** Users can reply to any comment or other replies to create threaded conversations.
* **Owner Verification Badge:** A special badge will appear next to the site owner's name to signify authenticity.
* **Spam Prevention:** A 24-hour cooldown prevents the same user from posting many comments in a short period.

## 🛠️ Tech Stack

* **Frontend:** HTML, CSS, Vanilla JavaScript
* **Database:** Firebase Realtime Database

## 🚀 Setup and Local Installation

To run this project on your local machine, follow these steps:

**Clone the Repository**
```bash
git clone https://github.com/AdityaLF/Real-Time-Comment-Section.git
cd Real-Time-Comment-Section
```

#### Set Up Firebase
* Create a new project in the [Firebase Console](https://console.firebase.google.com/).
* Create a **Realtime Database**.
* Copy your project credentials from **Project settings > General**. You will need them for the next step.

#### Deploy to Vercel
1.  Log in to **Vercel** and create a new project by connecting your Git repository.
2.  **Configure Build Settings**: Still in **Settings**, go to **General** and configure the following:
    * **FRAMEWORK PRESET**: `Other`
    * **BUILD COMMAND**: `bash build.sh`
    * **PUBLISH DIRECTORY**: `public`

3.  **Configure Environment Variables**: Go to **Settings > Environment Variables**. Add all of the following variables with the values from your Firebase project.

    | Variable Name          | Example Value                 |
    | :--------------------- | :---------------------------- |
    | `FIREBASE_API_KEY`     | `AIza...`                     |
    | `FIREBASE_AUTH_DOMAIN` | `your-project.firebaseapp.com`  |
    | `FIREBASE_DATABASE_URL`| `https://your-project...`       |
    | `FIREBASE_PROJECT_ID`  | `your-project-id`             |
    | `FIREBASE_STORAGE_BUCKET`| `your-project.appspot.com`    |
    | `FIREBASE_MESSAGING_SENDER_ID`| `1234567890`                  |
    | `FIREBASE_APP_ID`      | `1:12345...`                  |
    | `FIREBASE_MEASUREMENT_ID`| `G-ABCDE...`                  |
    | `SPECIAL_USERNAME`     | `YourSecretUsername`          |
    | `OWNER_DISPLAY_NAME`   | `YourDisplayName`             |

4.  Click **Save**, and Vercel will automatically start the build and deployment process.

## 💻 Local Development

The code in this repository uses placeholders (e.g., `__API_KEY__`) that are only replaced during the build process on Vercel. To run and test the code on your local machine:
1.  Create a new file named `public/local-test.js`.
2.  Copy the entire contents of `public/script.js` into `public/local-test.js`.
3.  Inside `local-test.js`, manually replace all placeholders with your actual API keys.
4.  Temporarily change the `index.html` file to load `<script src="local-test.js"></script>`.
5.  Ensure `public/local-test.js` is added to your `.gitignore` so it doesn't get uploaded.

---

## 👤 Author

* **GitHub**: [@AdityaLF](https://github.com/AdityaLF)
* **Discord**: [@05.07am](https://discordapp.com/users/786163564205047839)
* **Support Me**: [ko-fi.com/AdityaLF](https://ko-fi.com/adityalf)

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
