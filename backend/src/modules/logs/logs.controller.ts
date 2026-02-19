import { Controller, Get, Post, Body, Query, UnauthorizedException, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiBody } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('logs')
@Controller('logs')
export class LogsController {
  private readonly logger = new Logger(LogsController.name);
  private readonly LOG_FILE = 'logs/app.log';
  private readonly SECRET_KEY = process.env.LOGS_SECRET || 'secret'; // Fallback to 'secret' if env not set

  @Get()
  @ApiOperation({ summary: 'Get application logs (requires secret key)' })
  @ApiQuery({ name: 'key', required: true, description: 'Secret key for access' })
  @ApiQuery({ name: 'lines', required: false, description: 'Number of lines to return (default 100)' })
  getLogs(@Query('key') key: string, @Query('lines') lines = '100') {
    if (key !== this.SECRET_KEY) {
      throw new UnauthorizedException('Invalid secret key');
    }

    const logPath = path.resolve(process.cwd(), this.LOG_FILE);

    if (!fs.existsSync(logPath)) {
      throw new HttpException('Log file not found', HttpStatus.NOT_FOUND);
    }

    try {
      const content = fs.readFileSync(logPath, 'utf-8');
      if (!content.trim()) return [];
      
      const allLines = content.trim().split('\n');
      const lastLines = allLines.slice(-Number(lines)).reverse(); // Get last N lines, newest first

      return lastLines.map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return { message: line, timestamp: new Date().toISOString() };
        }
      });
    } catch (error) {
        throw new HttpException('Error reading log file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('event')
  @ApiOperation({ summary: 'Log a client-side event' })
  @ApiBody({ schema: { example: { event: 'add_to_cart', details: { productId: 1 } } } })
  logEvent(@Body() body: { event: string; details: any }) {
    this.logger.log(`[CLIENT_EVENT] ${body.event}: ${JSON.stringify(body.details)}`);
    return { success: true };
  }
}
