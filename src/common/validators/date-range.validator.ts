import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Validador personalizado para verificar se uma data é posterior a outra
 * Uso: @IsDateAfter('dataInicio')
 */
export function IsDateAfter(property: string, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isDateAfter',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: {
        message: `${propertyName} deve ser uma data posterior a ${property}`,
        ...validationOptions,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          
          if (!value || !relatedValue) return true; // Se algum valor não está preenchido, não validar
          
          const endDate = new Date(value);
          const startDate = new Date(relatedValue);
          
          return endDate > startDate;
        },
      },
    });
  };
}
