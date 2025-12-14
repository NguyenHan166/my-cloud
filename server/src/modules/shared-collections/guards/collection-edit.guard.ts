import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { SharedCollectionsService } from '../shared-collections.service';

/**
 * Guard to ensure user can edit collection (owner OR has EDIT permission)
 */
@Injectable()
export class CollectionEditGuard implements CanActivate {
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

    const canEdit = await this.sharedCollectionsService.canUserEditCollection(
      userId,
      collectionId,
    );

    if (!canEdit) {
      throw new ForbiddenException(
        'You do not have edit permission for this collection',
      );
    }

    return true;
  }
}
