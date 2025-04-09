import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { StringUtils } from '../utils/string.utils';

export function IsCNPJ(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isCNPJ',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: {
        message: 'CNPJ deve ser válido',
        ...validationOptions,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') return false;
          return StringUtils.isValidCNPJ(value);
        },
      },
    });
  };
}
