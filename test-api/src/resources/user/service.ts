import { UserModel } from './model';

export class UserService {
  async findAll(): Promise<any[]> {
    return await UserModel.find();
  }

  async findById(id: string): Promise<any | null> {
    return await UserModel.findById(id);
  }

  async create(data: any): Promise<any> {
    return await UserModel.create(data);
  }

  async update(id: string, data: any): Promise<any | null> {
    return await UserModel.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }
}