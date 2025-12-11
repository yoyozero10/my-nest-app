import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE } from 'src/decorator/customize';

interface HandlerPayload<T> {
    data?: T;
    meta?: Record<string, unknown>;
    message?: string;
}

const hasProp = (value: unknown, prop: string): boolean =>
    typeof value === 'object' && value !== null && prop in value;

export interface ResponseEnvelope<T> {
    statusCode: number;
    message?: string;
    data: T;
    meta?: Record<string, unknown>;
    path: string;
    timestamp: string;
}

@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, ResponseEnvelope<T>> {
    constructor(private reflector: Reflector) { }

    intercept(
        context: ExecutionContext,
        next: CallHandler<T>,
    ): Observable<ResponseEnvelope<T>> {
        const http = context.switchToHttp();
        const response = http.getResponse<Response>();
        const request = http.getRequest<Request>();

        return next.handle().pipe(
            map((payload: T | HandlerPayload<T>) => {
                const isHandlerPayload = (
                    value: unknown,
                ): value is HandlerPayload<T> =>
                    hasProp(value, 'data') || hasProp(value, 'meta') || hasProp(value, 'message');

                const normalized: HandlerPayload<T> = isHandlerPayload(payload)
                    ? payload
                    : { data: payload };

                const responseMessage = this.reflector.get<string>(
                    RESPONSE_MESSAGE,
                    context.getHandler(),
                ) ?? normalized.message ?? 'Success';

                return {
                    statusCode: response.statusCode,
                    message: responseMessage,
                    data: (normalized.data ?? payload) as T,
                    meta: normalized.meta,
                    path: request.originalUrl ?? request.url,
                    timestamp: new Date().toISOString(),
                };
            }),
        );
    }
}
