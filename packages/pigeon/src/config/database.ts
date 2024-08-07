import { Channel } from 'src/models/channels/entities/channel.entity';
import { Log } from 'src/models/logger/entities/logger.entity';
import { Message } from 'src/models/messages/entities/message.entity';
import { User } from 'src/models/user/entities/user.entity';
import { Workspace } from 'src/models/workspace/entities/workspace.entity';
import { DataSourceOptions } from 'typeorm';

export const databaseConfiguration = (): Partial<DataSourceOptions> => ({
  type: process.env.DATABASE_TYPE as any,
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT!),
  database: process.env.DATABASE_NAME,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  synchronize: false,
  entities: [User, Log, Workspace, Channel, Message],
});
