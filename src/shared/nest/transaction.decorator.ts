// import { Inject } from '@nestjs/common';
// import { Sequelize } from 'sequelize-typescript';

// export const Transaction = (): ((
//   target,
//   propertyKey: string,
//   descriptor: PropertyDescriptor
// ) => void) => {
//   const Injection = Inject(Sequelize);

//   return function (
//     tagret,
//     propertyKey: string,
//     descriptor: PropertyDescriptor
//   ) {
//     Injection(tagret, 'connection');
//     const originalMethod = descriptor.value;

//     descriptor.value = function (...args) {
//       return this.connection.transaction(() => {
//         return originalMethod.apply(this, args);
//       });
//     };
//   };
// };
