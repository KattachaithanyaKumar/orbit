import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { FoldersModule } from './folders/folders.module';
import { FilesModule } from './files/files.module';
import { User } from './users/entities/user.entity';
import { Workspace } from './workspaces/entities/workspace.entity';
import { Folder } from './folders/entities/folder.entity';
import { File } from './files/entities/file.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get('DB_USERNAME', 'root'),
        password: config.get('DB_PASSWORD', 'root'),
        database: config.get('DB_DATABASE', 'orbit'),
        entities: [User, Workspace, Folder, File],
        synchronize: true,
      }),
    }),
    UsersModule,
    AuthModule,
    WorkspacesModule,
    FoldersModule,
    FilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
