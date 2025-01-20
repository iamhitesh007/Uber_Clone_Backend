import User from "../Model/user.model.js";

export const registerUser = async ({
  firstName,
  lastName,
  email,
  password,
  gender,
}) => {
  if (!firstName || !email || !password) {
    throw new Error("Please fill in all fields");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error("Email already in use");
  }

  const user = await User.create({
    fullName: {
      firstName,
      lastName,
    },
    email,
    password,
    gender,
  });

  if (!user) {
    throw new Error("Failed to create user");
  }

  return user;
};

export const UpdateUser = async (id, data) => {
  const user = await User.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true,
  });

  return user;
};
