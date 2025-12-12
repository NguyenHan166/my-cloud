import { ApiProperty } from '@nestjs/swagger';

export class AddItemsResponseDto {
    @ApiProperty({ example: true })
    success: boolean;

    @ApiProperty({
        description: 'Response data',
        example: { message: 'Items added to collection successfully', itemsAdded: 2 },
    })
    data: {
        message: string;
        itemsAdded: number;
    };

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    timestamp: string;
}
