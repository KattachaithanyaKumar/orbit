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
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';

@Controller('workspaces/:workspaceId/folders/:folderId/files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post()
  create(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('folderId', ParseIntPipe) folderId: number,
    @Body() createFileDto: CreateFileDto,
    @Request() req,
  ) {
    return this.filesService.create(
      workspaceId,
      folderId,
      createFileDto,
      req.user.id,
    );
  }

  @Get()
  findAll(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('folderId', ParseIntPipe) folderId: number,
    @Request() req,
  ) {
    return this.filesService.findAll(workspaceId, folderId, req.user.id);
  }

  @Get(':id')
  findOne(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('folderId', ParseIntPipe) folderId: number,
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.filesService.findOne(
      id,
      workspaceId,
      folderId,
      req.user.id,
    );
  }

  @Patch(':id')
  update(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('folderId', ParseIntPipe) folderId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFileDto: UpdateFileDto,
    @Request() req,
  ) {
    return this.filesService.update(
      id,
      workspaceId,
      folderId,
      updateFileDto,
      req.user.id,
    );
  }

  @Delete(':id')
  remove(
    @Param('workspaceId', ParseIntPipe) workspaceId: number,
    @Param('folderId', ParseIntPipe) folderId: number,
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ) {
    return this.filesService.remove(
      id,
      workspaceId,
      folderId,
      req.user.id,
    );
  }
}
