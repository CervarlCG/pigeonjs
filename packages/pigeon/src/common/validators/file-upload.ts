import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { FileType } from '../types/file';
import {
  maxAttachmentSize,
  imageMimeTypeRegex,
  audioMimeTypeRegex,
  videoMimeTypeRegex,
  documentMimeTypeRegex,
} from 'src/config/files';
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

      if (
        !imageMimeTypeRegex.test(file.mimetype) &&
        !audioMimeTypeRegex.test(file.mimetype) &&
        !videoMimeTypeRegex.test(file.mimetype) &&
        !documentMimeTypeRegex.test(file.mimetype)
      )
        throw new ParametersException(`File mimetype is not valid.`);
    });

    return value;
  }
}
