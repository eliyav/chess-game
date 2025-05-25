import { DB } from "../..";
import { User } from "../entity/user";

export class UserRepository {
  static async getUsers() {
    return await DB.getRepository(User).find();
  }
  static async getUserById(id: number) {
    return await DB.getRepository(User).findOneBy({ id });
  }
  static async insertUser(user: User) {
    return await DB.getRepository(User).insert(user);
  }
  static async updateUser(user: User) {
    return await DB.getRepository(User).update(user.id, user);
  }
  static async deleteUser(id: number) {
    return await DB.getRepository(User).delete(id);
  }
}
