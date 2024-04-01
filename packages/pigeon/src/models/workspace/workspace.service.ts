import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserRoles } from 'pigeon-types';
import {
  ResourceConflictException,
  UnauthorizedException,
} from 'src/common/exceptions/system';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Workspace } from './entities/workspace.entity';
import { getDeletedAtWhereClausule } from 'src/common/helpers/repository';
import { FindOptions } from 'src/common/interfaces/repository';

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
    });

    return this.workspaceRepository.save(workspace);
  }

  /**
   * Finds a workspace by its unique handle.
   * @param handle The unique handle of the workspace.
   * @param options Optional find options to include deleted workspaces.
   * @returns The workspace entity if found, otherwise null.
   */
  async findByHanle(handle: string, options: FindOptions = {}) {
    return this.workspaceRepository.findOne({
      where: {
        handle,
        ...getDeletedAtWhereClausule(options.allowDeleted),
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
