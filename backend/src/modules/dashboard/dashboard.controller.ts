import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Consultar el resumen del panel' })
  @ApiResponse({ status: 200, description: 'Resumen del panel consultado correctamente' })
  async getSummary() {
    return this.dashboardService.getSummary();
  }

  @Get('revenue-chart')
  @ApiOperation({ summary: 'Consultar el gráfico de ingresos' })
  @ApiResponse({ status: 200, description: 'Gráfico de ingresos consultado correctamente' })
  async getRevenueChart(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('interval') interval: 'daily' | 'monthly' = 'monthly',
  ) {
    return this.dashboardService.getRevenueChart({ startDate, endDate, interval });
  }

  @Get('service-distribution')
  @ApiOperation({ summary: 'Consultar la distribución de servicios' })
  @ApiResponse({ status: 200, description: 'Distribución de servicios consultada correctamente' })
  async getServiceDistribution(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dashboardService.getServiceDistribution({ startDate, endDate });
  }

  @Get('order-status-distribution')
  @ApiOperation({ summary: 'Consultar la distribución de estados de pedidos' })
  @ApiResponse({ status: 200, description: 'Distribución de estados de pedidos consultada correctamente' })
  async getOrderStatusDistribution(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.dashboardService.getOrderStatusDistribution({ startDate, endDate });
  }

  @Get('top-customers')
  @ApiOperation({ summary: 'Consultar los clientes principales' })
  @ApiResponse({ status: 200, description: 'Clientes principales consultados correctamente' })
  async getTopCustomers(@Query('limit') limit = 5) {
    return this.dashboardService.getTopCustomers(limit);
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Consultar la actividad reciente' })
  @ApiResponse({ status: 200, description: 'Actividad reciente consultada correctamente' })
  async getRecentActivity(@Query('limit') limit = 10) {
    return this.dashboardService.getRecentActivity(limit);
  }
} 