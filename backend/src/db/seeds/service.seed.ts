import { DataSource } from 'typeorm';
import { Service, PriceModel } from '../../modules/service/entities/service.entity';

type InitialService = Pick<
  Service,
  'name' | 'description' | 'price' | 'priceModel' | 'processingTimeHours' | 'category' | 'isActive'
>;

const initialServices: InitialService[] = [
  {
    name: 'Lavado por pieza',
    description: 'Lavado de prendas por unidad.',
    price: 90,
    priceModel: PriceModel.PER_PIECE,
    processingTimeHours: 24,
    category: 'Lavado',
    isActive: true,
  },
  {
    name: 'Lavado y secado por kg',
    description: 'Lavado y secado de prendas por kilogramo.',
    price: 60,
    priceModel: PriceModel.PER_KG,
    processingTimeHours: 24,
    category: 'Lavado',
    isActive: true,
  },
  {
    name: 'Lavado en seco',
    description: 'Limpieza especializada de prendas por unidad.',
    price: 250,
    priceModel: PriceModel.PER_PIECE,
    processingTimeHours: 72,
    category: 'Especial',
    isActive: true,
  },
  {
    name: 'Planchado',
    description: 'Planchado de prendas por unidad.',
    price: 50,
    priceModel: PriceModel.PER_PIECE,
    processingTimeHours: 24,
    category: 'Planchado',
    isActive: true,
  },
  {
    name: 'Edredón',
    description: 'Lavado de edredones por unidad.',
    price: 450,
    priceModel: PriceModel.PER_PIECE,
    processingTimeHours: 48,
    category: 'Especial',
    isActive: true,
  },
  {
    name: 'Limpieza de zapatos',
    description: 'Limpieza de calzado por par.',
    price: 300,
    priceModel: PriceModel.PER_PIECE,
    processingTimeHours: 48,
    category: 'Especial',
    isActive: true,
  },
];

export const seedServices = async (dataSource: DataSource) => {
  const serviceRepository = dataSource.getRepository(Service);

  await dataSource.query(`
    UPDATE service_categories
    SET name = 'Lavado', description = 'Servicios de lavado de prendas'
    WHERE name IN ('Wash & Fold', 'Cuci', 'Wash');

    UPDATE service_categories
    SET name = 'Planchado', description = 'Servicios de planchado de prendas'
    WHERE name IN ('Ironing', 'Setrika');

    UPDATE service_categories
    SET name = 'Especial', description = 'Servicios especiales y exprés'
    WHERE name IN ('Dry Cleaning', 'Express Service', 'Premium');
  `);

  for (const serviceData of initialServices) {
    const existingService = await serviceRepository.findOne({
      where: { name: serviceData.name },
    });

    if (existingService) {
      serviceRepository.merge(existingService, serviceData);
      await serviceRepository.save(existingService);
    } else {
      await serviceRepository.save(serviceRepository.create(serviceData));
    }
  }

  console.log('Catálogo inicial de servicios actualizado en RD$.');
};
