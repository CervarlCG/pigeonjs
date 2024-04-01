import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

/**
 * WorkspaceController handles all workspace-related requests
 * and requires the user to be authenticated with a JWT token.
 */
@Controller('workspace')
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
    return this.workspaceService.toDto(newWorkspace);
  }
}
