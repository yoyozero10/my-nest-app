import { Controller, Post } from '@nestjs/common';
import { DatabasesService } from './databases.service';
import { Public, ResponseMessage } from 'src/decorator/customize';

@Controller('databases')
export class DatabasesController {
    constructor(private readonly databasesService: DatabasesService) { }

    @Post('drop')
    @Public() // Cho phép gọi mà không cần authentication (CHỈ DÙNG TRONG DEVELOPMENT!)
    @ResponseMessage('Drop and seed database')
    async dropDatabase() {
        return await this.databasesService.dropDatabase();
    }
}
