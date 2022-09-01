import { PartialType } from '@nestjs/mapped-types';
import { NewMessageDto } from './new-message-w.dto';

export class UpdateMessageWDto extends PartialType(NewMessageDto) {
  id: number;
}
