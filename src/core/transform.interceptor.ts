import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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

                return {
                    statusCode: response.statusCode,
                    message: normalized.message ?? 'Success',
                    data: (normalized.data ?? payload) as T,
                    meta: normalized.meta,
                    path: request.originalUrl ?? request.url,
                    timestamp: new Date().toISOString(),
                };
            }),
        );
    }
}
