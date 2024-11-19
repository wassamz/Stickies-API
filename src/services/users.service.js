import User from "../models/User.js";

async function saveUser(userData) {
  try {
    console.info("User Create: " + userData?.email);
    let user = new User(userData);
    user = await user.save(); //save will encrypt the password
    return user;
  } catch (error) {
    console.error("Unable to create user: ", error);
    return { error: "Unable to create user" };
  }
}

async function getUser(email) {
  console.info("User Retrieve: " + email);
  try {
    let user = await User.findOne({ email: email });
    return user;
  } catch (error) {
    console.error("Unable to find user: ", error);
    return { error: "Unable to find user" };
  }
}

async function validateUser(email, password) {
  console.info("User Validate: " + email);
  try {
    let user = await User.findOne({ email: email });
    if (!user) return false;

    let isMatch = await user.comparePassword(password);
    console.log(JSON.stringify(user) + "password match?" + isMatch);

    return isMatch ? user : null;
  } catch (error) {
    console.error("Unable to validate user: ", error);
    return false;
  }
}

export default { saveUser, getUser, validateUser };
