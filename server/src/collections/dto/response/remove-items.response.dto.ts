import { ApiProperty } from '@nestjs/swagger';

export class RemoveItemsResponseDto {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({
        description: 'Response data',
        example: { message: 'Items removed from collection successfully', itemsRemoved: 2 },
    })
    data: {
        message: string;
        itemsRemoved: number;
    };

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    timestamp: string;
}
