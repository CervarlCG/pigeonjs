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
import { getDeletedAtWhereClausule } from 'src/common/helpers/repository';
import { FindOptions } from 'src/common/interfaces/repository';
import { merge } from 'lodash';
import { workspaceUsersLimit } from 'src/config/app';

/**
 * Service responsible for handling workspace-related operations.
 */
@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    private userService: UserService,
  ) {}

  /**
   * Creates a new workspace and assigns it to the given user.
   * @param workspaceDto Data transfer object containing the workspace details.
   * @param userId Identifier of the user who will own the workspace.
   * @returns The saved workspace entity.
   */
  async create(workspaceDto: CreateWorkspaceDto, userId: number) {
    const user = await this.userService.findById(userId);

    if (!user || user.role !== UserRoles.ADMIN)
      throw new UnauthorizedException();

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
  async findById(id: number, options?: FindOneOptions<Workspace>) {
    return this.workspaceRepository.findOne(merge({ where: { id } }, options));
  }

  /**
   * Finds a workspace by its unique handle.
   * @param handle The unique handle of the workspace.
   * @param options Optional find options to include deleted workspaces.
   * @returns The workspace entity if found, otherwise null.
   */
  async findByHanle(handle: string, options: FindOptions = {}) {
    return this.workspaceRepository.findOne(
      merge({ where: { handle } }, options),
    );
  }

  /**
   * Adds a user to workspace.
   * @param handle The unique handle of the workspace.
   * @param options Optional find options to include deleted workspaces.
   * @returns The workspace entity if found, otherwise null.
   */
  async addUser(userId: number, workspace: Workspace): Promise<Workspace>;
  async addUser(userId: number, workspaceId: number): Promise<Workspace>;
  async addUser(
    userId: number,
    workspaceId: Workspace | number,
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

  private async getWorkspace(workspace: number | Workspace) {
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
    };
  }
}
