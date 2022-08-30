import { BadRequestException, Controller, Get } from '@nestjs/common';
import { SeedService } from './seed.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { ValidRoles } from '../auth/interfaces/validRoles';
import { ApiTags } from '@nestjs/swagger';


@ApiTags('Seed')
@Controller('seed')
export class SeedController {

  public cont = 0;

  constructor(private readonly seedService: SeedService) {
  
  }

  @Get()
  // @Auth(ValidRoles.admin)
  executeSeed() {
    this.cont = this.cont + 1;
    if (this.cont == 1) {
      return this.seedService.runSeed();
    }
    throw new BadRequestException('Only one time execute the seed')
  }

}
