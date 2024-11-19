import bcryptjs from "bcryptjs";
import { model, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      match: /.+@.+\..+/,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Encrypt password so it is not stored in the clear within the DB
// Function called when signing up user
UserSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    try {
      const salt = await bcryptjs.genSalt(10);
      this.password = await bcryptjs.hash(this.password, salt);
    } catch (error) {
      return next(error);
    }
  }
  next();
});

UserSchema.methods.comparePassword = async function (password) {
  return await bcryptjs.compare(password, this.password);
};
const User = model("User", UserSchema);

export default User;
