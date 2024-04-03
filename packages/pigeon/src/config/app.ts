export const appConfiguration = () => ({
  port: parseInt(process.env.PORT!, 10) || 8080,
});

export const workspaceUsersLimit = 50;
