import mongoose, { Document } from "mongoose";
import { IUser } from "../types/user.types";
import bcrypt from "bcrypt";

interface UserDocument extends Omit<IUser, "_id">, Document {
  comparePassword: (password: string) => boolean;
}

const userSchema = new mongoose.Schema <UserDocument>({
    name: {
        type: String,
        trim: true,
        required: [true, "Name is required"],
    },
    email: {
        type: String,
        trim: true,
        required: [true, "Email is required"],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        minlength: [6, "Password must be at least 6 characters long"]
    },
    mobile: {
        type: String,
        trim: true,
        minlength: [10, "Mobile number must be at least 10 characters long"],
        maxlength: [10, "max 10 characters required"]
    },

},{
    timestamps: true,
})



userSchema.pre("save",  function (): void {
    if (!this.isModified("password")) return;
        this.password = bcrypt.hashSync(this.password, 10);
});

userSchema.methods.comparePassword = function (password: string): boolean {
    return bcrypt.compareSync(password, this.password);
}

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
