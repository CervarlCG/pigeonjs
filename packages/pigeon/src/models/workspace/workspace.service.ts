import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserRoles } from 'pigeon-types';
import {
  ResourceConflictException,
  ResourceNotFoundException,
  UnauthorizedException,
} from 'src/common/exceptions/system';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import { FindOptions } from 'src/common/interfaces/repository';
import { merge } from 'lodash';
import { workspaceUsersLimit } from 'src/config/app';
import { PaginationService } from '../pagination/pagination.service';
import { EntityID } from 'src/common/types/id';
import { User } from '../user/entities/user.entity';

/**
 * Service responsible for handling workspace-related operations.
 */
@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    private userService: UserService,
    private paginationService: PaginationService,
  ) {}

  /**
   * Find all workspaces where the given user id is member
   * @param userId Identifier of the user.
   * @returns The user's workspaces.
   */
  async findByUser(userId: EntityID, after?: string) {
    const userRelationColumns = Object.keys(
      this.userService.getRelationColums(),
    );
    const { data, next } =
      await this.paginationService.findWithCursor<Workspace>(
        (options) => {
          const query = this.workspaceRepository
            .createQueryBuilder('workspaces')
            .innerJoin('workspaces.users', 'user')
            .leftJoinAndSelect('workspaces.users', 'users')
            .leftJoinAndSelect('workspaces.owner', 'owner')
            .where('user.id = :userId', { userId });
          if (options.cursor)
            query.andWhere('workspaces.id <= :cursor', {
              cursor: options.cursor,
            });

          return query
            .take(options.limit)
            .orderBy('workspaces.id', 'DESC')
            .select([
              'workspaces',
              ...userRelationColumns.map((c) => `user.${c}`),
              ...userRelationColumns.map((c) => `owner.${c}`),
            ])
            .getMany();
        },
        { key: 'workspaces', after },
      );
    return { workspaces: data, next };
  }

  /**
   * Creates a new workspace and assigns it to the given user.
   * @param workspaceDto Data transfer object containing the workspace details.
   * @param userId Identifier of the user who will own the workspace.
   * @returns The saved workspace entity.
   */
  async create(workspaceDto: CreateWorkspaceDto, userId: EntityID) {
    const user = await this.userService.findById(userId);

    if (!user || user.role !== UserRoles.ADMIN)
      throw new UnauthorizedException(
        "User doesn't have permissions to create a workspace.",
      );

    if (await this.findByHanle(workspaceDto.handle))
      throw new ResourceConflictException('Workspace already exists.');

    const workspace = this.workspaceRepository.create({
      ...workspaceDto,
      owner: user,
      users: [user],
    });

    return this.workspaceRepository.save(workspace);
  }

  /**
   * Finds a workspace by its unique id.
   * @param id The unique id of the workspace.
   * @param options Optional find options to include deleted workspaces.
   * @returns The workspace entity if found, otherwise null.
   */
  async findById(id: EntityID, options?: FindOneOptions<Workspace>) {
    return this.workspaceRepository.findOne(
      merge(
        {
          where: { id },
          relations: {
            owner: true,
            users: true,
            channels: true,
          },
          select: {
            users: this.userService.getRelationColums(),
            owner: this.userService.getRelationColums(),
          },
        } as FindOneOptions<Workspace>,
        options,
      ),
    );
  }

  /**
   * Finds a workspace by its unique handle.
   * @param handle The unique handle of the workspace.
   * @param options Optional find options to include deleted workspaces.
   * @returns The workspace entity if found, otherwise null.
   */
  async findByHanle(handle: string, options?: FindOneOptions<Workspace>) {
    return this.workspaceRepository.findOne(
      merge(
        {
          where: { handle },
          relations: {
            owner: true,
            users: true,
          },
          select: {
            users: this.userService.getRelationColums(),
            owner: this.userService.getRelationColums(),
          },
        } as FindOneOptions<Workspace>,
        options,
      ),
    );
  }

  /**
   * Remove an entity
   * @param id The Entity ID.
   * @param soft If soft delete
   */
  async delete(id: EntityID, soft = true) {
    const workspace = await this.findById(id);
    if (!workspace) return;
    if (soft) await this.workspaceRepository.softRemove([workspace]);
    else await this.workspaceRepository.remove([workspace]);
  }

  /**
   * Adds a user to workspace.
   * @param userid The user id.
   * @param workspaceId The workspace id or workspace object
   * @returns The workspace updated.
   */
  async addUser(userId: EntityID, workspace: Workspace): Promise<Workspace>;
  async addUser(userId: EntityID, workspaceId: EntityID): Promise<Workspace>;
  async addUser(
    userId: EntityID,
    workspaceId: Workspace | EntityID,
  ): Promise<Workspace> {
    const user = await this.userService.findById(userId);
    const workspace = await this.getWorkspace(workspaceId);

    if (!user) throw new ResourceNotFoundException('User not found.');
    if (!workspace) throw new ResourceNotFoundException('Workspace not found.');

    if (workspace.users.length >= workspaceUsersLimit)
      throw new ResourceConflictException(
        'Users limit per workspace has been reached',
      );

    if (workspace.users.find((user) => user.id === userId))
      throw new ResourceConflictException('User already is on the workspace.');

    workspace.users = [...workspace.users, user];
    return this.workspaceRepository.save(workspace);
  }

  /**
   * Check if a user is member of a workspace
   * @param workspaceId The workspace id
   * @param userId The user id
   * @returns True if the user is member of the workspace
   */
  async hasUser(workspaceId: EntityID, userId: EntityID) {
    const queryResult = await this.workspaceRepository
      .createQueryBuilder('workspace')
      .leftJoinAndSelect('workspace.users', 'user')
      .where('workspace.id = :workspaceId', { workspaceId })
      .andWhere('user.id = :userId', { userId })
      .andWhere('workspace.deletedAt IS null')
      .select(['workspace.id', 'user.id'])
      .getCount();
    return queryResult > 0;
  }

  /**
   * Removes a user from a workspace.
   * @param userid The user id.
   * @param workspaceId The workspace id or workspace object
   * @returns The workspace updated.
   */
  async removeUser(
    userId: EntityID,
    workspaceId: Workspace | EntityID,
  ): Promise<Workspace> {
    const user = await this.userService.findById(userId);
    const workspace = await this.getWorkspace(workspaceId);

    if (!user) throw new ResourceNotFoundException('User not found.');
    if (!workspace) throw new ResourceNotFoundException('Workspace not found.');

    if (workspace.owner.id === user.id)
      throw new ResourceConflictException(
        "Owner can't be removed. Please transfer the ownership before.",
      );

    workspace.users = workspace.users.filter((user_) => user_.id !== user.id);
    return this.workspaceRepository.save(workspace);
  }

  /**
   * Gets a workspace
   * @param workspace The workspace or the workspace id
   * @returns The workspace.
   */
  private async getWorkspace(workspace: EntityID | Workspace) {
    if (workspace instanceof Workspace) return workspace;
    return this.findById(workspace, {
      relations: { users: true, owner: true },
      select: {
        users: { id: true, email: true, role: true },
        owner: { id: true, email: true, role: true },
      },
    });
  }

  /**
   * Check if a user can moderate workspace
   * @param workspace The workspace
   * @param user The user
   * @param roles The allowed roles, default to admin
   * @returns True if can based on roles params
   */
  async canModerateWorkspace(
    workspace: Workspace | EntityID,
    userId: EntityID,
    roles: UserRoles[] = [UserRoles.ADMIN],
  ) {
    const workspaceEntity = await this.getWorkspace(workspace);
    if (!workspaceEntity) return false;
    const workspaceUser = workspaceEntity.users.find((u) => u.id === userId);
    if (!workspaceUser) return false;
    return roles.includes(workspaceUser.role);
  }

  /**
   * Converts a workspace entity into a data transfer object.
   * @param workspace The workspace entity to convert.
   * @returns The workspace data transfer object.
   */
  toDto(workspace: Workspace) {
    const { id, name, handle, createdAt } = workspace;
    return {
      id,
      name,
      handle,
      createdAt,
      owner: this.userService.toDto(workspace.owner),
      users: workspace.users.map((user) => this.userService.toDto(user)),
    };
  }
}
