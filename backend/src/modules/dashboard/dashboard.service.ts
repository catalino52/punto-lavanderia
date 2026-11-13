import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, getRepository } from 'typeorm';
import { Order, OrderStatus } from '../order/entities/order.entity';
import { Payment } from '../payment/entities/payment.entity';
import { Customer } from '../customer/entities/customer.entity';
import { Service } from '../service/entities/service.entity';
import { OrderItem } from '../order/entities/order-item.entity';
import { formatISO, subMonths, startOfMonth, endOfMonth, format, parseISO } from 'date-fns';

// Define Activity types
type ActivityType = 'order' | 'payment' | 'customer' | 'service';

// Interface untuk filter yang digunakan di berbagai fungsi
export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  interval?: 'daily' | 'monthly';
}

// Interface untuk data ringkasan dashboard
export interface DashboardSummary {
  totalPendapatan: number;
  totalPesanan: number;
  pesananSelesai: number;
  pelangganAktif: number;
}

// Interface untuk data grafik pendapatan
export interface RevenueChartData {
  tanggal: string;
  pendapatan: number;
}

// Interface untuk data distribusi layanan
export interface ServiceDistribution {
  layanan: string;
  jumlah: number;
  persentase: number;
}

// Interface untuk data distribusi status pesanan
export interface OrderStatusDistribution {
  status: string;
  jumlah: number;
  persentase: number;
}

// Interface untuk data pelanggan teratas
export interface TopCustomer {
  id: string;
  nama: string;
  totalPesanan: number;
  totalNilai: number;
}

// Interface untuk data aktivitas terbaru
export interface RecentActivity {
  id: number;
  type: ActivityType;
  text: string;
  time: string;
}

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);
  
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>
  ) {}

  /**
   * Utility method to calculate order total - matches the calculation in report service
   * This ensures consistent revenue calculations across the application
   */
  private calculateOrderTotal(order: Order): number {
    try {
      if (!order.items || !Array.isArray(order.items)) {
        return 0;
      }
      
      return order.items.reduce((sum, item) => {
        // Handle possible undefined or null values
        if (!item) return sum;
        
        // Use subtotal if available (already calculated), otherwise calculate from price * quantity
        const itemValue = item.subtotal || (item.price * item.quantity) || 0;
        return sum + Number(itemValue);
      }, 0);
    } catch (error) {
      this.logger.warn(`Error calculating order total for order ${order.id}: ${error.message}`);
      return 0;
    }
  }

  /**
   * Get dashboard summary with total revenue, orders, completed orders, and active customers
   */
  async getSummary(): Promise<DashboardSummary> {
    try {
      // Get total orders count
      const totalOrders = await this.orderRepository.count();
      
      // Get completed orders count - we'll use DELIVERED status since that indicates completion
      const completedOrders = await this.orderRepository.count({
        where: { status: OrderStatus.DELIVERED }
      });
      
      // Get total revenue from order items - using the same calculation method as reports
      const orders = await this.orderRepository.find({
        relations: ['items']
      });
      
      let totalRevenue = 0;
      
      // Process each order using the same calculation as reports
      orders.forEach(order => {
        if (!order.items || !Array.isArray(order.items)) return;
        
        const orderTotal = this.calculateOrderTotal(order);
        
        totalRevenue += isNaN(orderTotal) ? 0 : orderTotal;
      });
      
      // Get active customers (customers with at least one order)
      const activeCustomers = await this.customerRepository
        .createQueryBuilder('customer')
        .innerJoin('customer.orders', 'order')
        .groupBy('customer.id')
        .getCount();
      
      return {
        totalPendapatan: totalRevenue,
        totalPesanan: totalOrders,
        pesananSelesai: completedOrders,
        pelangganAktif: activeCustomers
      };
    } catch (error) {
      this.logger.error(
        'No se pudo cargar el resumen del panel.',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * Get revenue chart data with optional filters for date range and interval
   */
  async getRevenueChart(filters: DashboardFilters): Promise<RevenueChartData[]> {
    try {
      const { startDate, endDate, interval = 'monthly' } = filters;
      
      // Default date range is last 6 months if not specified
      const today = new Date();
      const queryStartDate = startDate ? parseISO(startDate) : subMonths(today, 6);
      const queryEndDate = endDate ? parseISO(endDate) : today;
      
      // Get orders in date range with their items
      const orders = await this.orderRepository.find({
        where: {
          createdAt: Between(
            new Date(queryStartDate),
            new Date(queryEndDate)
          )
        },
        relations: ['items'],
        order: {
          createdAt: 'ASC'
        }
      });
      
      // Group orders by date and calculate revenue
      const dateFormat = interval === 'daily' ? 'yyyy-MM-dd' : 'yyyy-MM';
      const revenueByDate = new Map<string, number>();
      
      // Initialize all dates in range with 0 revenue
      let currentDate = new Date(queryStartDate);
      while (currentDate <= queryEndDate) {
        const dateKey = format(currentDate, dateFormat);
        revenueByDate.set(dateKey, 0);
        
        // Increment date based on interval
        if (interval === 'daily') {
          currentDate.setDate(currentDate.getDate() + 1);
        } else {
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      }
      
      // Calculate revenue for each order and add to appropriate date
      orders.forEach(order => {
        if (!order.createdAt) return;
        
        // Calculate order total using the same method as in reports and summary
        let orderTotal = this.calculateOrderTotal(order);
        
        if (isNaN(orderTotal) || orderTotal <= 0) return;
        
        // Add to appropriate date bucket
        const dateKey = format(new Date(order.createdAt), dateFormat);
        if (revenueByDate.has(dateKey)) {
          revenueByDate.set(dateKey, revenueByDate.get(dateKey) + orderTotal);
        }
      });
      
      // Convert map to array of chart data
      return Array.from(revenueByDate.entries())
        .map(([tanggal, pendapatan]) => ({ tanggal, pendapatan }))
        .sort((a, b) => a.tanggal.localeCompare(b.tanggal));
    } catch (error) {
      this.logger.error(
        'No se pudo cargar el gráfico de ingresos.',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * Get service distribution data with optional date filters
   */
  async getServiceDistribution(filters: DashboardFilters): Promise<ServiceDistribution[]> {
    try {
      const { startDate, endDate } = filters;
      
      // Set up date filters if provided
      const dateFilter: any = {};
      if (startDate) {
        dateFilter.created_at = { $gte: new Date(startDate) };
      }
      if (endDate) {
        dateFilter.created_at = { ...dateFilter.created_at, $lte: new Date(endDate) };
      }
      
      // Build query to get service counts
      const query = this.orderItemRepository
        .createQueryBuilder('orderItem')
        .innerJoin('orderItem.service', 'service')
        .innerJoin('orderItem.order', 'order')
        .select('service.name', 'serviceName')
        .addSelect('COUNT(orderItem.id)', 'count')
        .groupBy('service.id');
      
      // Apply date filters if provided
      if (startDate) {
        query.andWhere('order.created_at >= :startDate', { startDate });
      }
      if (endDate) {
        query.andWhere('order.created_at <= :endDate', { endDate });
      }
      
      const results = await query.getRawMany();
      
      // Calculate total count for percentages
      const totalCount = results.reduce((sum, item) => sum + Number(item.count), 0);
      
      // Format the results with percentages
      return results.map(item => ({
        layanan: item.serviceName,
        jumlah: Number(item.count),
        persentase: totalCount > 0 ? Number(((Number(item.count) / totalCount) * 100).toFixed(1)) : 0
      }));
    } catch (error) {
      this.logger.error(
        'No se pudo cargar la distribución de servicios.',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * Get order status distribution with optional date filters
   */
  async getOrderStatusDistribution(filters: DashboardFilters): Promise<OrderStatusDistribution[]> {
    try {
      const { startDate, endDate } = filters;
      
      // Build query to get order status counts
      const query = this.orderRepository
        .createQueryBuilder('order')
        .select('order.status', 'status')
        .addSelect('COUNT(order.id)', 'count')
        .groupBy('order.status');
      
      // Apply date filters if provided
      if (startDate) {
        query.andWhere('order.created_at >= :startDate', { startDate });
      }
      if (endDate) {
        query.andWhere('order.created_at <= :endDate', { endDate });
      }
      
      const results = await query.getRawMany();
      
      // Calculate total count for percentages
      const totalCount = results.reduce((sum, item) => sum + Number(item.count), 0);
      
      // Format the results with translated status names and percentages
      return results.map(item => {
        let statusSpanish = 'Otro';
        switch (item.status) {
          case 'new': statusSpanish = 'Nuevo'; break;
          case 'pending': statusSpanish = 'Pendiente'; break;
          case 'processing': statusSpanish = 'En proceso'; break;
          case 'washing': statusSpanish = 'En lavado'; break;
          case 'drying': statusSpanish = 'En secado'; break;
          case 'folding': statusSpanish = 'En planchado'; break;
          case 'ready': statusSpanish = 'Listo para entregar'; break;
          case 'delivered': statusSpanish = 'Entregado'; break;
          case 'cancelled': statusSpanish = 'Cancelado'; break;
          default: statusSpanish = 'Otro';
        }
        
        return {
          status: statusSpanish,
          jumlah: Number(item.count),
          persentase: totalCount > 0 ? Number(((Number(item.count) / totalCount) * 100).toFixed(1)) : 0
        };
      });
    } catch (error) {
      this.logger.error(
        'No se pudo cargar la distribución de estados de pedidos.',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  /**
   * Get top customers by order value
   */
  async getTopCustomers(limit: number): Promise<TopCustomer[]> {
    try {
      // Query to get top customers by total order value
      const results = await this.customerRepository
        .createQueryBuilder('customer')
        .leftJoin('customer.orders', 'order')
        .select('customer.id', 'id')
        .addSelect('customer.name', 'name')
        .addSelect('COUNT(order.id)', 'orderCount')
        .addSelect('SUM(order.total)', 'totalValue')
        .groupBy('customer.id')
        .orderBy('totalValue', 'DESC')
        .limit(limit)
        .getRawMany();
      
      // Format the results
      return results.map(item => ({
        id: item.id,
        nama: item.name,
        totalPesanan: Number(item.orderCount) || 0,
        totalNilai: Number(item.totalValue) || 0
      }));
    } catch (error) {
      this.logger.error(
        'No se pudo cargar la lista de clientes principales.',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
  
  /**
   * Get recent activity data from orders, payments, customers and services
   */
  async getRecentActivity(limit: number): Promise<RecentActivity[]> {
    try {
      // Get recent orders - include status changes
      const recentOrders = await this.orderRepository
        .createQueryBuilder('order')
        .innerJoin('order.customer', 'customer')
        .select('order.id', 'id')
        .addSelect('\'order\'', 'type')
        .addSelect(`CONCAT('Pedido #', order.order_number, ' creado para ', customer.name)`, 'text')
        .addSelect('order.created_at', 'time')
        .orderBy('order.created_at', 'DESC')
        .limit(limit)
        .getRawMany();
      
      // Get status updates for orders (completed, delivered, etc.)
      const orderStatusUpdates = await this.orderRepository
        .createQueryBuilder('order')
        .innerJoin('order.customer', 'customer')
        .select('order.id', 'id')
        .addSelect('\'order_status\'', 'type')
        .addSelect('order.order_number', 'orderNumber')
        .addSelect('order.status', 'status')
        .addSelect('order.updated_at', 'time')
        .where('order.updated_at > order.created_at') // Only get orders that have been updated
        .andWhere('order.status != :newStatus', { newStatus: 'new' }) // Exclude new status, since that's covered by order creation
        .orderBy('order.updated_at', 'DESC')
        .limit(limit)
        .getRawMany();
      
      // Get recent payments - improved text formatting
      const recentPayments = await this.paymentRepository
        .createQueryBuilder('payment')
        .innerJoin('payment.order', 'order')
        .select('payment.id', 'id')
        .addSelect('\'payment\'', 'type')
        .addSelect('payment.amount', 'amount')
        .addSelect('order.order_number', 'orderNumber')
        .addSelect('payment.created_at', 'time')
        .orderBy('payment.created_at', 'DESC')
        .limit(limit)
        .getRawMany();
      
      // Get recent customers
      const recentCustomers = await this.customerRepository
        .createQueryBuilder('customer')
        .select('customer.id', 'id')
        .addSelect('\'customer\'', 'type')
        .addSelect(`CONCAT('Nuevo cliente registrado: ', customer.name)`, 'text')
        .addSelect('customer.created_at', 'time')
        .orderBy('customer.created_at', 'DESC')
        .limit(limit)
        .getRawMany();
      
      // Process raw results into typed arrays
      const typedOrders = recentOrders.map(item => ({
        id: Number(item.id),
        type: 'order' as ActivityType,
        text: item.text,
        time: item.time
      }));
      
      const typedStatusUpdates = orderStatusUpdates.map(item => ({
        id: Number(item.id),
        type: 'order' as ActivityType,
        text: `El pedido #${item.orderNumber} cambió al estado ${({
          new: 'nuevo',
          pending: 'pendiente',
          processing: 'en proceso',
          washing: 'en lavado',
          drying: 'en secado',
          folding: 'en planchado',
          ready: 'listo para entregar',
          delivered: 'entregado',
          cancelled: 'cancelado'
        } as Record<string, string>)[String(item.status).toLowerCase()] || 'actualizado'}.`,
        time: item.time
      }));
      
      const typedPayments = recentPayments.map(item => ({
        id: Number(item.id),
        type: 'payment' as ActivityType,
        text: `Se recibió un pago de ${new Intl.NumberFormat('es-DO', {
          style: 'currency',
          currency: 'DOP'
        }).format(Number(item.amount))} para el pedido #${item.orderNumber}.`,
        time: item.time
      }));
      
      const typedCustomers = recentCustomers.map(item => ({
        id: Number(item.id),
        type: 'customer' as ActivityType,
        text: item.text,
        time: item.time
      }));
      
      // Combine all activities
      const allActivities = [
        ...typedOrders, 
        ...typedStatusUpdates, 
        ...typedPayments, 
        ...typedCustomers
      ];
      
      // Sort by time (newest first) and limit results
      const sortedActivities = allActivities
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, limit)
        .map((activity, index) => ({
          ...activity,
          id: index + 1 // Reassign sequential IDs
        })) as RecentActivity[];
      
      // Debug log the number of activities found
      this.logger.log(`Found ${sortedActivities.length} recent activities`);
      
      return sortedActivities;
    } catch (error) {
      this.logger.error(
        'No se pudo cargar la actividad reciente.',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
} 