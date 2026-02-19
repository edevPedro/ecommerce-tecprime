import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  ParseIntPipe,
  Logger,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request as ExpressRequest } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

interface AuthenticatedRequest extends ExpressRequest {
  user: {
    userId: number;
  };
}

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  private readonly logger = new Logger(OrdersController.name);

  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  @ApiOperation({ summary: 'Create a new order' })
  @ApiResponse({ status: 201, description: 'Order successfully created.' })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(
    @Request() req: AuthenticatedRequest,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    this.logger.log(`Creating new order for user ${req.user.userId}`);
    return this.ordersService.create(createOrderDto, req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('mine')
  @ApiOperation({ summary: 'Get all orders for the current user' })
  @ApiResponse({ status: 200, description: 'Return all orders.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findMyOrders(@Request() req: AuthenticatedRequest) {
    this.logger.log(`Fetching orders for user ID ${req.user.userId}`);
    return this.ordersService.findAllByUserId(req.user.userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @ApiOperation({ summary: 'Get an order by id' })
  @ApiResponse({ status: 200, description: 'Return the order.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Not Found.' })
  findOne(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    this.logger.log(`Fetching order ${id} for user ${req.user.userId}`);
    return this.ordersService.findOne(id, req.user.userId);
  }
}
