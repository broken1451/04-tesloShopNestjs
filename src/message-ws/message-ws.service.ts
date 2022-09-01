import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Socket } from 'socket.io';
import { Repository } from 'typeorm';
// import { CreateMessageWDto } from './dto/create-message-w.dto';
// import { UpdateMessageWDto } from './dto/update-message-w.dto';
import { User } from '../auth/entities/auth.entity';


// export interface ConectedClient {
//   [id: string]: Socket;
//   user?: User | any;
// }
export interface ConectedClient {
  [id: string]: {
    socket: Socket,
    user: User
  };
}

// {
//   "636555244ydhhds": socket,
//   "434rfdfwdfdfdfd": socket,
//   "cfdfdfd44343434": socket,
//   "344dfsf3343443": socket,
// }



@Injectable()
export class MessageWsService {

  private conectedClient: ConectedClient = {}

  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) { }


  async registerClient(client: Socket, id: string) {
    const user = await this.userRepository.findOneBy({ id });
    //  console.log({client});
    if (!user) {
      throw new Error('user not found');
    }
    if (!user.isActive) {
      throw new Error('user not Active');
    }

    this.checkUserConection(user);

    this.conectedClient[client.id] = { socket: client, user }
    //  console.log( this.conectedClient);
  }

  removeClient(client: Socket) {
    // removeClient(idCleint: string) {
    delete this.conectedClient[client.id]
  }


  getConecteClients(): number | string[] {
    // console.log(this.conectedClient);
    return Object.keys(this.conectedClient);
  }

  getUserByFullName(id: string) {
    return this.conectedClient[id].user.fullName;
  }


  private checkUserConection(user: User) {

    for (const clientId of Object.keys(this.conectedClient)) {
      const clientsConected = this.conectedClient[clientId];
      // console.log({ clientId: Object.keys(this.conectedClient), user: clientsConected.user.id });
      if (clientsConected.user.id === user.id) {
        clientsConected.socket.disconnect();
        break;
      }
    }
  }

  // create(createMessageWDto: CreateMessageWDto) {
  //   return 'This action adds a new messageW';
  // }

  // findAll() {
  //   return `This action returns all messageWs`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} messageW`;
  // }

  // update(id: number, updateMessageWDto: UpdateMessageWDto) {
  //   return `This action updates a #${id} messageW`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} messageW`;
  // }
}
