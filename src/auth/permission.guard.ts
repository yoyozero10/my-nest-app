import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorator/customize';

@Injectable()
export class PermissionGuard implements CanActivate {
    private readonly logger = new Logger(PermissionGuard.name);

    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // Skip nếu là public route
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) {
            return true;
        }

        // Skip nếu có @SkipPermission decorator
        const skipPermission = this.reflector.getAllAndOverride<boolean>('skipPermission', [
            context.getHandler(),
            context.getClass(),
        ]);
        if (skipPermission) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // Nếu chưa login (không có user), JWT Guard sẽ xử lý
        if (!user) {
            this.logger.warn('No user in request, skipping permission check');
            return true;
        }

        // Lấy thông tin request
        const method = request.method; // GET, POST, PATCH, DELETE

        // Kiểm tra xem request.route có tồn tại không
        if (!request.route || !request.route.path) {
            this.logger.error('request.route or request.route.path is undefined!');
            this.logger.error(`Request URL: ${request.url}`);
            this.logger.error(`Request method: ${method}`);
            // Fallback: dùng request.url
            const urlPath = request.url.split('?')[0]; // Remove query params
            const apiPath = this.normalizePath(urlPath);

            const hasPermission = user.permissions?.some(
                (p) => p.apiPath === apiPath && p.method === method
            );

            if (!hasPermission) {
                throw new ForbiddenException(
                    `Bạn không có quyền ${method} ${apiPath}`
                );
            }
            return true;
        }

        const routePath = request.route.path; // /api/v1/jobs, /api/v1/jobs/:id (đã có prefix)

        // Normalize path (remove :id, :slug, etc.)
        const apiPath = this.normalizePath(routePath);

        // DEBUG: Log để kiểm tra
        this.logger.log('=== PERMISSION CHECK ===');
        this.logger.log(`Method: ${method}`);
        this.logger.log(`Route Path: ${routePath}`);
        this.logger.log(`Normalized Path: ${apiPath}`);
        this.logger.log(`User Permissions: ${JSON.stringify(user.permissions?.map(p => `${p.method} ${p.apiPath}`))}`);

        // Kiểm tra permission
        const hasPermission = user.permissions?.some(
            (p) => p.apiPath === apiPath && p.method === method
        );

        this.logger.log(`Has Permission: ${hasPermission}`);
        this.logger.log('========================\n');

        if (!hasPermission) {
            throw new ForbiddenException(
                `Bạn không có quyền ${method} ${apiPath}`
            );
        }

        return true;
    }

    private normalizePath(path: string): string {
        // Chuyển /api/v1/users/:id → /api/v1/users
        // Chuyển /api/v1/companies/:id/jobs → /api/v1/companies/:id/jobs (giữ nguyên nếu có nested)
        // Chỉ remove param cuối cùng
        return path.replace(/\/:[^/]+$/, '');
    }
}
