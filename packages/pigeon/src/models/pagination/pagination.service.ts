import { Injectable } from '@nestjs/common';
import { BaseEntity } from 'src/common/database/base-entity';
import { EntityTarget } from 'typeorm';

interface CursorProps {
  after?: string;
  before?: string;
  first?: number;
  last?: number;
}

interface FindCursorOptions {
  cursor: number;
  limit: number;
}

interface FindWithCursorOptions {
  key?: string;
  after?: string;
  limit?: number;
}

@Injectable()
export class PaginationService {
  async findWithCursor<T>(
    findMany: (options: FindCursorOptions) => Promise<BaseEntity[]>,
    options: FindWithCursorOptions,
  ): Promise<{ data: T[]; next: string | null }> {
    console.log(
      options.after,
      this.decodeCursor(options.after || this.encodeCursor(0)),
    );
    const limit = (options.limit || 10) + 1;
    const results = await findMany({
      cursor: this.decodeCursor(options.after || this.encodeCursor(0)),
      limit,
    });
    const hasNext = results.length === limit;
    return {
      data: (hasNext ? results.slice(0, results.length - 1) : results) as T[],
      next: hasNext ? this.encodeCursor(results[results.length - 1].id) : null,
    };
  }

  decodeCursor(cursor: string): number {
    const decoded = parseInt(Buffer.from(cursor, 'base64').toString('utf-8'));
    return !isNaN(decoded) ? decoded : 0;
  }

  encodeCursor(cursor: number): string {
    return Buffer.from(cursor.toString()).toString('base64');
  }
}
