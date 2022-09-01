import { WebSocketGateway, SubscribeMessage, MessageBody, OnGatewayConnection, OnGatewayDisconnect, WebSocketServer } from '@nestjs/websockets';
import { MessageWsService } from './message-ws.service';
// import { CreateMessageWDto } from './dto/create-message-w.dto';
// import { UpdateMessageWDto } from './dto/update-message-w.dto';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dto/new-message-w.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

// @WebSocketGateway({ cors: true, namespace: 'sala de chat/ habitacion' si no se especifica ninguno apunta a namespace root /, cualquier cliente va a conectarse o cualquier cliente que se conecte va a caer en el namespace / })// controller/ Socket
@WebSocketGateway({ cors: true })// controller/ Socket
export class MessageWsGateway implements OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer() wsServer: Server

  constructor(private readonly messageWsService: MessageWsService, private readonly jwtService: JwtService) { }

  async handleConnection(client: Socket) {
    // console.log('cliente conectado: ', client);
    const token = client.handshake.headers.autentication as string;
    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify(token);
      await this.messageWsService.registerClient(client, payload.id);
      // console.log({ payload });
    } catch (error) {
      client.disconnect();
      return
    }
    // console.log({ token });
   
    // console.log({ conectado: this.messageWsService.getConecteClients() });
    // this.wsServer.emit('nameEvent', payload) ////emitir a todos los q esten conectados
    // console.log(this.messageWsService.getConecteClients());
    // client.join('room') // unir a una sala
    // this.wsServer.to('ventas').emit('event') // envia mensajes a todos los q esten en la sala de ventas 
    this.wsServer.emit('clients-update', this.messageWsService.getConecteClients()) ////emitir a todos los q esten conectados
  }

  handleDisconnect(client: Socket) {
    // console.log('cliente desconectado: ', client.id);
    this.messageWsService.removeClient(client);
    this.wsServer.emit('clients-update', this.messageWsService.getConecteClients()) ////emitir a todos los q esten conectados
    // console.log({ conectado: this.messageWsService.getConecteClients() });
  }

  @SubscribeMessage('message-from-client')// nombre del evento q nosotros queremos estar escuchando
  onMessageFromClient(client: Socket, payload: NewMessageDto) { // al usar SubscribeMessage tenemos acceso inmediato al client: Socket el socket q esta emitiendo el evento y payload: any
    // console.log({ id: client.id, payload });
    
    //! Emite unicamente al cliente que manda el mensaje (quien emite el mensaje)
    // client.emit('message-from-server', { fullName: 'soy yo', message: payload.message || 'no hay message' });

    //! Emite  a todos menos, al cliente inicial (quien emite el mensaje)
    // client.broadcast.emit('message-from-server', { fullName: 'soy yo', message: payload.message || 'no hay message' });


    // this.wsServer.to()// todas las personas q esten unidas a cierta sala

    //! Emite  a todos incluyendo a quien envia el mensaje
    this.wsServer.emit('message-from-server', { fullName: this.messageWsService.getUserByFullName(client.id), message: payload.message || 'no hay message' });
  }
  

  // @SubscribeMessage('createMessageW')
  // create(@MessageBody() createMessageWDto: CreateMessageWDto) {
  //   return this.messageWsService.create(createMessageWDto);
  // }

  // @SubscribeMessage('findAllMessageWs')
  // findAll() {
  //   return this.messageWsService.findAll();
  // }

  // @SubscribeMessage('findOneMessageW')
  // findOne(@MessageBody() id: number) {
  //   return this.messageWsService.findOne(id);
  // }

  // @SubscribeMessage('updateMessageW')
  // update(@MessageBody() updateMessageWDto: UpdateMessageWDto) {
  //   return this.messageWsService.update(updateMessageWDto.id, updateMessageWDto);
  // }

  // @SubscribeMessage('removeMessageW')
  // remove(@MessageBody() id: number) {
  //   return this.messageWsService.remove(id);
  // }
}
