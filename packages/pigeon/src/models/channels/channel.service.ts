import { Injectable } from '@nestjs/common';
import { EntityID } from 'src/common/types/id';
import { Entity, FindOneOptions, JoinTable, LessThanOrEqual, Repository } from 'typeorm';
import { Channel, CHANNEL_TO_USERS_TABLE } from './entities/channel.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateChannelDto } from './dto/create-channel.dto';
import {
  ForbiddenException,
  ResourceConflictException,
  ResourceNotFoundException,
} from 'src/common/exceptions/system';
import { WorkspaceService } from '../workspace/workspace.service';
import { Privacy } from 'src/common/constants/private';
import { parseID } from 'src/common/utils/id';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { UserService } from '../user/user.service';
import { UserRoles } from 'pigeon-types';
import { PaginationService } from '../pagination/pagination.service';
import { User } from '../user/entities/user.entity';
import { DeleteOptions, RemoveOptions } from 'src/common/interfaces/repository';
import { defaultRemoveOptions } from 'src/common/constants/repository';
import { merge } from 'lodash';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    private workspaceService: WorkspaceService,
    private userService: UserService,
    private paginationService: PaginationService,
  ) {}

  async findById(id: EntityID, options?: FindOneOptions<Channel>) {
    return this.channelRepository.findOne(merge({
      where: { id },
      relations: { users: true, workspace: true },
      select: {
        users: this.userService.getRelationColums(),
        workspace: { id: true },
      },
    }, options));
  }

  async findByHandle(handle: string, options?: FindOneOptions<Channel>) {
    return this.channelRepository.findOne(merge({
      where: { handle },
      relations: { users: true, workspace: true },
      select: {
        users: this.userService.getRelationColums(),
        workspace: { id: true },
      },
    }, options));
  }

  async listByUser(userId: EntityID, after?: string) {
    const userRelationColumns = Object.keys(
      this.userService.getRelationColums(),
    );
    const { data, next } = await this.paginationService.findWithCursor<Channel>(
      (options) => {
        const query = this.channelRepository
          .createQueryBuilder('channels')
          .innerJoin('channels.users', 'user')
          .leftJoinAndSelect('channels.users', 'users')
          .where('user.id = :userId', { userId });
        if (options.cursor)
          query.andWhere('channels.id <= :cursor', {
            cursor: options.cursor,
          });

        return query
          .take(options.limit)
          .orderBy('channels.id', 'DESC')
          .select(['channels', ...userRelationColumns.map((c) => `user.${c}`)])
          .getMany();
      },
      { key: 'channels', after },
    );
    return { channels: data, next };
  }

  async addUser(channelId: Channel | EntityID, userId: EntityID) {
    const channel = await this.getChannel(channelId);
    if (!channel) throw new ResourceNotFoundException('Channel not found');

    const user = await this.userService.findById(userId);
    if (!user) throw new ResourceNotFoundException('User not found.');

    if (!(await this.workspaceService.hasUser(channel.workspace.id, userId)))
      throw new ForbiddenException('User is not member of the workspace');

    if (channel.users.find((u) => u.id === userId)) return channel;

    await this.channelRepository
      .createQueryBuilder('channel')
      .insert()
      .into(CHANNEL_TO_USERS_TABLE)
      .values([{ channelId: channel.id, userId: user.id }])
      .execute();

    return (await this.findById(channel.id)) as Channel;
  }

  /**
   * Gets a workspace
   * @param workspace The workspace or the workspace id
   * @returns The workspace.
   */
  private async getChannel(channel: EntityID | Channel) {
    if (channel instanceof Channel) return channel;
    return this.findById(channel);
  }

  async create(channelData: CreateChannelDto, userId: EntityID) {
    if (await this.findByHandle(channelData.handle))
      throw new ResourceConflictException(
        'Channel with the given handle already exists',
      );

    const workspace = await this.workspaceService.findById(
      parseID(channelData.workspaceId),
    );
    if (!workspace)
      throw new ResourceNotFoundException("Workspace doesn't exist.");

    const user = await this.userService.findById(userId);
    if (!user) throw new ResourceNotFoundException('User not found.');

    const channel = this.channelRepository.create({
      ...channelData,
      privacy: channelData.isDM ? Privacy.PRIVATE : channelData.privacy,
    });
    channel.workspace = workspace;
    channel.users = [user];

    return this.channelRepository.save(channel);
  }

  async update(data: UpdateChannelDto, channelId: EntityID | Channel) {
    const channel = await this.getChannel(channelId);

    if (!channel) throw new ResourceNotFoundException(`Channel was not found`);

    channel.name = data.name || channel.name;
    channel.privacy = data.privacy || channel.privacy;

    return this.channelRepository.save(channel);
  }

  /**
   * Remove an entity
   * @param id The Entity ID.
   * @param options The Remove options
   */
  async remove(id: EntityID | Channel, options_: RemoveOptions = {}) {
    const options = merge(defaultRemoveOptions, options_);
    const channel = await this.getChannel(id);
    if (!channel) return;
    if (options.soft) await this.channelRepository.softRemove([channel]);
    else await this.channelRepository.remove([channel]);
  }

  async canModerateChannel(
    channel: Channel | EntityID,
    userId: EntityID,
    roles: UserRoles[] = [UserRoles.ADMIN],
  ) {
    const channelEntity = await this.getChannel(channel);
    if (!channelEntity) return false;
    const channelUser = channelEntity.users.find((u) => u.id === userId);
    if (!channelUser) return false;
    return roles.includes(channelUser.role);
  }

  async hasUser(channelId: EntityID, userId: EntityID) {
    const relation = this.channelRepository.metadata.manyToManyRelations.find(
      (r) => r.joinTableName === CHANNEL_TO_USERS_TABLE,
    );
    const result = await this.channelRepository.query(
      `SELECT COUNT(*) as count FROM ${relation!.joinTableName} WHERE channelId = ? and userId = ? LIMIT 1`,
      [channelId, userId],
    );
    return parseInt(result[0].count) === 1;
  }

  /**
   * Retrieve most necessary user columns to avoid select unnecessary columns
   */
  getRelationColums() {
    return {
      id: true,
      name: true,
      handle: true,
      privacy: true,
      isDM: true,
      createdAt: true,
    };
  }

  toDto(channel: Channel) {
    return {
      id: channel.id,
      name: channel.name,
      handle: channel.handle,
      privacy: channel.privacy,
      isDM: channel.isDM,
      workspaceId: channel.workspace.id,
      createdAt: channel.createdAt,
      users: channel.users.map((user) => this.userService.toDto(user)),
    };
  }
}
