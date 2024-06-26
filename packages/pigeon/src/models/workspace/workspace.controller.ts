import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import {
  WorkspaceAdministrationGuard,
  WorkspaceMemberGuard,
  WorkspaceModerationGuard,
} from './workspace.guard';
import { AppRequest } from 'src/common/interfaces/http';
import { UpdateUserInWorkspaceDto } from './dto/user-workspace.dto';
import { parseID } from 'src/common/utils/id';

/**
 * WorkspaceController handles all workspace-related requests
 * and requires the user to be authenticated with a JWT token.
 */
@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private workspaceService: WorkspaceService) {}

  /**
   * Creates a new workspace for the logged-in user.
   * @param req - The request object containing the user's JWT token and workspace details.
   * @returns The newly created workspace DTO.
   */
  @Post()
  async createWorkspaceForLoggedInUser(
    @Request() req: any,
    @Body() body: CreateWorkspaceDto,
  ) {
    const newWorkspace = await this.workspaceService.create(body, req.user.id);
    return { workspace: this.workspaceService.toDto(newWorkspace) };
  }

  @Get()
  async findWorkspacesForLoggedInUser(@Request() req: AppRequest) {
    const { workspaces, ...rest } = await this.workspaceService.findByUser(
      req.user!.id,
      req.query.after as string,
    );
    return {
      workspaces: workspaces.map((w) => this.workspaceService.toDto(w)),
      ...rest,
    };
  }

  @Get('/:workspaceId')
  @UseGuards(WorkspaceMemberGuard)
  async findWorkspace(@Request() req: AppRequest) {
    return { workspace: req.workspace };
  }

  @Post('/:workspaceId/user')
  @UseGuards(WorkspaceModerationGuard)
  async addUserToWorkspace(
    @Request() req: AppRequest,
    @Body() body: UpdateUserInWorkspaceDto,
  ) {
    return {
      workspace: this.workspaceService.toDto(
        await this.workspaceService.addUser(
          parseID(body.userId),
          req.workspace!,
        ),
      ),
    };
  }

  @Delete('/:workspaceId/user')
  @UseGuards(WorkspaceModerationGuard)
  async removeUserFromWorkspace(
    @Request() req: AppRequest,
    @Body() body: UpdateUserInWorkspaceDto,
  ) {
    await this.workspaceService.removeUser(
      parseID(body.userId),
      req.workspace!,
    );
  }
}
