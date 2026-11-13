import { DataSource } from 'typeorm';
import { ServiceCategory } from '../../modules/service-category/entities/service-category.entity';

export const seedServiceCategories = async (dataSource: DataSource) => {
  const categoryRepository = dataSource.getRepository(ServiceCategory);

  // Create categories
  const categories: Partial<ServiceCategory>[] = [
    {
      name: 'Lavado',
      description: 'Servicios de lavado de prendas'
    },
    {
      name: 'Planchado',
      description: 'Servicios de planchado de prendas'
    },
    {
      name: 'Especial',
      description: 'Servicios especiales de lavandería'
    }
  ];

  // Create category entities
  const categoryEntities = categories.map(category => categoryRepository.create(category));

  // Save all categories
  await categoryRepository.save(categoryEntities);
}; 