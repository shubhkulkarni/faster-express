import { Schema, model, Document } from 'mongoose';

interface IUser extends Document {
  name: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  }
}, {
  timestamps: true
});

export const UserModel = model<IUser>('User', userSchema);