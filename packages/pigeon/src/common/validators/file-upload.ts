import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { FileType } from '../types/file';
import { maxAttachmentSize } from 'src/config/files';
import { ParametersException, SystemException } from '../exceptions/system';

@Injectable()
export class FilesUploadValidationPipe implements PipeTransform {
  async transform(
    value: { attachments: FileType[] },
    metadata: ArgumentMetadata,
  ) {
    if (!value.attachments) return false;

    value.attachments.find((file) => {
      if (file.size > maxAttachmentSize)
        throw new ParametersException(
          `File size must be lower that ${maxAttachmentSize} bytes.`,
        );
    });

    return value;
  }
}
