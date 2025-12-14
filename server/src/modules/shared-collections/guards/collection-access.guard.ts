import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SharedCollectionsService } from '../shared-collections.service';

/**
 * Guard to ensure user can access collection (owner OR has active share)
 */
@Injectable()
export class CollectionAccessGuard implements CanActivate {
  constructor(
    private readonly sharedCollectionsService: SharedCollectionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.id;
    const collectionId = request.params?.id;

    console.log(userId, collectionId);

    if (!userId || !collectionId) {
      throw new ForbiddenException('Missing user or collection ID');
    }

    const canAccess =
      await this.sharedCollectionsService.canUserAccessCollection(
        userId,
        collectionId,
      );

    if (!canAccess) {
      throw new NotFoundException('Collection not found or access denied');
    }

    return true;
  }
}
