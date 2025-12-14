import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SharedCollectionsService } from '../shared-collections.service';

/**
 * Guard to ensure user is the collection owner
 * Blocks shared users even with EDIT permission
 */
@Injectable()
export class CollectionOwnerGuard implements CanActivate {
  constructor(
    private readonly sharedCollectionsService: SharedCollectionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    const collectionId = request.params?.collectionId;

    if (!userId || !collectionId) {
      throw new ForbiddenException('Missing user or collection ID');
    }

    const isOwner = await this.sharedCollectionsService.isCollectionOwner(
      userId,
      collectionId,
    );

    if (!isOwner) {
      throw new ForbiddenException(
        'Only the collection owner can perform this action',
      );
    }

    return true;
  }
}
