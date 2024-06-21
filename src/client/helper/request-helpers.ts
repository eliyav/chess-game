import { User } from "@auth0/auth0-react";

export const getUserInfo = (user: User) =>
  JSON.stringify({
    user: {
      email: user?.email,
      sub: user?.sub,
      created: new Date(user?.updated_at!),
      lastLogin: new Date(user?.updated_at!),
      picture: user?.picture,
      name: user?.nickname,
    },
  });
