import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

@Controller('workspaces/:workspaceId/folders')
@UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  create(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Body() createFolderDto: CreateFolderDto,
    @Request() req,
  ) {
    return this.foldersService.create(workspaceId, createFolderDto, req.user.id);
  }

  @Get()
  findAll(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Request() req,
  ) {
    return this.foldersService.findAll(workspaceId, req.user.id);
  }

  @Get(':id')
  findOne(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.foldersService.findOne(id, workspaceId, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFolderDto: UpdateFolderDto,
    @Request() req,
  ) {
    return this.foldersService.update(
      id,
      workspaceId,
      updateFolderDto,
      req.user.id,
    );
  }

  @Delete(':id')
  remove(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.foldersService.remove(id, workspaceId, req.user.id);
  }
}
