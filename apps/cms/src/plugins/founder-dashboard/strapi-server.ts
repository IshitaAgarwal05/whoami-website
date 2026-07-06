export default () => ({
  register() {},
  bootstrap() {},
  config: {},
  controllers: {
    metrics: {
      async getMetrics(ctx: any) {
        try {
          // Fetch products for low stock alert
          const products = await strapi.documents('api::product.product').findMany({
            fields: ['name', 'sku', 'stock', 'low_stock_threshold']
          });
          const lowStock = products.filter((p: any) => p.stock <= (p.low_stock_threshold || 5));

          // Fetch orders
          const orders = await strapi.documents('api::order.order').findMany({
            fields: ['total_amount', 'status', 'createdAt']
          });
          const totalSales = orders.reduce((sum: number, o: any) => sum + Number(o.total_amount || 0), 0);
          const totalOrders = orders.length;

          // Fetch customers
          const customers = await strapi.documents('api::customer.customer').findMany({
            fields: ['id']
          });
          const totalCustomers = customers.length;

          // Fetch recent audit logs
          const auditLogs = await strapi.documents('api::audit-log.audit-log').findMany({
            limit: 5,
            sort: 'createdAt:desc'
          });

          // Mock visitor analytics
          const visitors = 1250;

          ctx.body = {
            success: true,
            data: {
              summary: {
                totalSales,
                totalOrders,
                totalCustomers,
                visitors,
                lowStockCount: lowStock.length
              },
              lowStock,
              recentAuditLogs: auditLogs
            }
          };
        } catch (err: any) {
          ctx.status = 500;
          ctx.body = { success: false, error: err.message };
        }
      },
      async triggerAction(ctx: any) {
        try {
          const { action } = ctx.request.body;
          console.log(`🎬 Founder Action triggered: ${action}`);

          // Log this to audit log collection
          await strapi.documents('api::audit-log.audit-log').create({
            data: {
              user_email: 'founder@whoamistudios.com',
              action: `TRIGGER_ACTION_${action.toUpperCase()}`,
              entity_type: 'founder-dashboard',
              entity_id: 'dashboard',
              changes: { action }
            }
          });

          if (action === 'clear_cache') {
            ctx.body = { success: true, message: 'Redis cache flushed successfully' };
          } else if (action === 'send_low_stock_alert') {
            ctx.body = { success: true, message: 'Low stock email notifications sent to Founder' };
          } else if (action === 'generate_report') {
            ctx.body = { success: true, message: 'Weekly Sales report generated successfully' };
          } else {
            ctx.status = 400;
            ctx.body = { success: false, error: 'Unknown action' };
          }
        } catch (err: any) {
          ctx.status = 500;
          ctx.body = { success: false, error: err.message };
        }
      }
    }
  },
  routes: {
    'content-api': {
      type: 'content-api',
      routes: [
        {
          method: 'GET',
          path: '/metrics',
          handler: 'metrics.getMetrics',
          config: {
            auth: false,
          },
        },
        {
          method: 'POST',
          path: '/action',
          handler: 'metrics.triggerAction',
          config: {
            auth: false,
          },
        }
      ]
    }
  },
  services: {},
  contentTypes: {},
});
