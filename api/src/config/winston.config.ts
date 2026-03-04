import { WinstonModuleOptions, utilities as nestWinstonUtilities } from 'nest-winston';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, errors, json } = winston.format;

const fileFormat = combine(timestamp(), errors({ stack: true }), json());

function dailyRotate(filename: string, level: string): winston.transport {
  return new winston.transports.DailyRotateFile({
    filename,
    datePattern: 'YYYY-MM-DD',
    maxFiles: '15d',
    zippedArchive: true,
    maxSize: '20m',
    level,
    format: fileFormat,
  });
}

export function createWinstonConfig(nodeEnv: string): WinstonModuleOptions {
  const isDev = nodeEnv !== 'production';

  const transports: winston.transport[] = [
    dailyRotate('logs/app-%DATE%.log', 'info'),    // tüm info+ loglar
    dailyRotate('logs/error-%DATE%.log', 'error'),  // sadece error loglar
  ];

  if (isDev) {
    transports.push(
      new winston.transports.Console({
        format: combine(
          timestamp(),
          winston.format.ms(),
          nestWinstonUtilities.format.nestLike('API', {
            prettyPrint: true,
            colors: true,
          }),
        ),
      }),
    );
  }

  return {
    transports,
    level: isDev ? 'debug' : 'info',
  };
}
